import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { connection } from "next/server";
import { exemple } from "./exemple";
import type { Base, Contact, Devis } from "./types";

/*
 * Stockage provisoire dans un fichier JSON local (data/aboun.json, ignoré par git).
 * Il sera remplacé par Supabase (voir supabase/migrations) sans changer les pages :
 * seules les fonctions de ce fichier parlent au stockage.
 */
const FICHIER = path.join(process.cwd(), "data", "aboun.json");

async function lire(): Promise<Base> {
  await connection();
  try {
    return JSON.parse(await fs.readFile(FICHIER, "utf8")) as Base;
  } catch {
    const base = exemple();
    await ecrire(base);
    return base;
  }
}

async function ecrire(base: Base) {
  await fs.mkdir(path.dirname(FICHIER), { recursive: true });
  await fs.writeFile(FICHIER, JSON.stringify(base, null, 2));
}

export const nouvelId = () => crypto.randomUUID();

export async function listerContacts(recherche = "") {
  const { contacts } = await lire();
  const q = recherche.trim().toLowerCase();
  const tries = [...contacts].sort((a, b) =>
    (a.societe || a.nom).localeCompare(b.societe || b.nom, "fr"),
  );
  if (!q) return tries;
  return tries.filter((c) =>
    [c.nom, c.societe, c.email, c.telephone, c.siret]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q)),
  );
}

export async function trouverContact(id: string) {
  const { contacts } = await lire();
  return contacts.find((c) => c.id === id);
}

export async function enregistrerContact(contact: Contact) {
  const base = await lire();
  const i = base.contacts.findIndex((c) => c.id === contact.id);
  if (i >= 0) base.contacts[i] = contact;
  else base.contacts.push(contact);
  await ecrire(base);
}

export async function listerDevis() {
  const { devis, contacts } = await lire();
  return [...devis]
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe))
    .map((d) => ({ devis: d, contact: contacts.find((c) => c.id === d.contactId) }));
}

export async function trouverDevis(id: string) {
  const { devis, contacts } = await lire();
  const d = devis.find((x) => x.id === id);
  if (!d) return undefined;
  return { devis: d, contact: contacts.find((c) => c.id === d.contactId) };
}

export async function creerDevis(champs: Omit<Devis, "id" | "numero" | "creeLe">) {
  const base = await lire();
  const devis: Devis = {
    ...champs,
    id: nouvelId(),
    numero: "DV" + String(base.prochainNumero).padStart(7, "0"),
    creeLe: new Date().toISOString(),
  };
  base.prochainNumero += 1;
  base.devis.push(devis);
  await ecrire(base);
  return devis;
}

export async function modifierDevis(id: string, modifier: (d: Devis) => Devis) {
  const base = await lire();
  const i = base.devis.findIndex((d) => d.id === id);
  if (i < 0) throw new Error("Devis introuvable");
  base.devis[i] = modifier(base.devis[i]);
  await ecrire(base);
}

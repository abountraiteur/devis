"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  creerDevis,
  enregistrerContact,
  modifierDevis,
  nouvelId,
  trouverContact,
} from "@/lib/store";
import { ETAPES, type Contact, type Etape, type TypeContact } from "@/lib/types";

// TODO connexion : vérifier l'utilisateur et son profil dans chaque action
// quand l'authentification Supabase sera en place.

const texte = (f: FormData, cle: string) => String(f.get(cle) ?? "").trim();
const nombre = (f: FormData, cle: string) => {
  const n = Number(texte(f, cle).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export async function enregistrerContactAction(form: FormData) {
  const id = texte(form, "id") || nouvelId();
  const existant = await trouverContact(id);
  const contact: Contact = {
    id,
    type: (texte(form, "type") || "particulier") as TypeContact,
    nom: texte(form, "nom"),
    societe: texte(form, "societe") || undefined,
    email: texte(form, "email"),
    telephone: texte(form, "telephone"),
    adresse: texte(form, "adresse"),
    siret: texte(form, "siret").replace(/\s/g, "") || undefined,
    acompte: form.get("acompte") === "on",
    emailFacturation: texte(form, "emailFacturation") || undefined,
    notes: texte(form, "notes") || undefined,
    creeLe: existant?.creeLe ?? new Date().toISOString(),
  };
  if (!contact.nom) throw new Error("Le nom est obligatoire");
  await enregistrerContact(contact);
  revalidatePath("/contacts");
  redirect(`/contacts/${id}`);
}

export async function creerDevisAction(form: FormData) {
  const contactId = texte(form, "contactId");
  if (!contactId) throw new Error("Choisissez un contact");
  const devis = await creerDevis({
    contactId,
    titre: texte(form, "titre") || "Nouvel événement",
    dateEvenement: texte(form, "dateEvenement"),
    heure: texte(form, "heure"),
    lieu: texte(form, "lieu"),
    invites: nombre(form, "invites"),
    formule: texte(form, "formule"),
    regimes: "",
    deroule: "",
    etape: "nouvelle",
    acomptePct: 20,
    lignes: [],
  });
  revalidatePath("/devis");
  redirect(`/devis/${devis.id}`);
}

export async function modifierInfosDevisAction(form: FormData) {
  const id = texte(form, "id");
  await modifierDevis(id, (d) => ({
    ...d,
    titre: texte(form, "titre"),
    dateEvenement: texte(form, "dateEvenement"),
    heure: texte(form, "heure"),
    lieu: texte(form, "lieu"),
    invites: nombre(form, "invites"),
    formule: texte(form, "formule"),
    regimes: texte(form, "regimes"),
    deroule: texte(form, "deroule"),
    numeroCommande: texte(form, "numeroCommande") || undefined,
  }));
  revalidatePath(`/devis/${id}`);
}

export async function ajouterLigneAction(form: FormData) {
  const id = texte(form, "id");
  await modifierDevis(id, (d) => ({
    ...d,
    lignes: [
      ...d.lignes,
      {
        id: nouvelId(),
        chapitre: texte(form, "chapitre") || "Restauration",
        designation: texte(form, "designation"),
        quantite: nombre(form, "quantite"),
        prixUnitaireHT: nombre(form, "prixUnitaireHT"),
        tva: nombre(form, "tva") || 10,
      },
    ],
  }));
  revalidatePath(`/devis/${id}`);
}

export async function supprimerLigneAction(form: FormData) {
  const id = texte(form, "id");
  const ligneId = texte(form, "ligneId");
  await modifierDevis(id, (d) => ({
    ...d,
    lignes: d.lignes.filter((l) => l.id !== ligneId),
  }));
  revalidatePath(`/devis/${id}`);
}

export async function changerEtapeAction(form: FormData) {
  const id = texte(form, "id");
  const etape = texte(form, "etape") as Etape;
  if (!ETAPES.some((e) => e.id === etape)) throw new Error("Étape inconnue");
  await modifierDevis(id, (d) => ({ ...d, etape }));
  revalidatePath("/pipeline");
  revalidatePath("/devis");
  revalidatePath(`/devis/${id}`);
}

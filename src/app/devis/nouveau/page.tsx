import type { Metadata } from "next";
import Link from "next/link";
import { creerDevisAction } from "@/app/actions";
import { listerContacts } from "@/lib/store";

export const metadata: Metadata = { title: "Nouveau devis" };

export default async function NouveauDevis({ searchParams }: PageProps<"/devis/nouveau">) {
  const { contact } = await searchParams;
  const contacts = await listerContacts();

  return (
    <>
      <h1>Nouveau devis</h1>
      <form action={creerDevisAction} className="carte">
        <div className="formulaire">
          <label className="champ large">
            Client
            <select
              className="saisie"
              name="contactId"
              required
              defaultValue={typeof contact === "string" ? contact : ""}
            >
              <option value="" disabled>Choisir un contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.societe ? `${c.societe} (${c.nom})` : c.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="champ">
            Événement
            <input className="saisie" name="titre" placeholder="Mariage, réunion, anniversaire…" />
          </label>
          <label className="champ">
            Formule
            <input className="saisie" name="formule" placeholder="Cocktail 6 pièces, plancha…" />
          </label>
          <label className="champ">
            Date
            <input className="saisie" type="date" name="dateEvenement" />
          </label>
          <label className="champ">
            Heure
            <input className="saisie" type="time" name="heure" />
          </label>
          <label className="champ">
            Nombre d&apos;invités
            <input className="saisie" type="number" min="0" name="invites" />
          </label>
          <label className="champ">
            Lieu
            <input className="saisie" name="lieu" />
          </label>
        </div>
        <div className="ligne">
          <button className="bouton principal" type="submit">Créer le devis</button>
          <Link className="bouton" href="/contacts/nouveau">Le client n&apos;existe pas encore</Link>
        </div>
      </form>
    </>
  );
}

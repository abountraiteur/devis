import type { Metadata } from "next";
import Link from "next/link";
import { listerContacts } from "@/lib/store";

export const metadata: Metadata = { title: "Contacts" };

const TYPES = { particulier: "Particulier", entreprise: "Entreprise", collectivite: "Collectivité" };

export default async function Contacts({ searchParams }: PageProps<"/contacts">) {
  const { q } = await searchParams;
  const recherche = typeof q === "string" ? q : "";
  const contacts = await listerContacts(recherche);

  return (
    <>
      <div className="entete">
        <h1>Contacts</h1>
        <Link className="bouton principal" href="/contacts/nouveau">+ Nouveau contact</Link>
      </div>
      <section className="carte">
        <form className="ligne" role="search">
          <input
            className="saisie"
            style={{ flex: 1, minWidth: 0 }}
            name="q"
            placeholder="Nom, société, e-mail, téléphone, SIRET"
            defaultValue={recherche}
            aria-label="Rechercher un contact"
          />
          <button className="bouton" type="submit">Rechercher</button>
        </form>
        <ul className="liste">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link href={`/contacts/${c.id}`}>
                <span>
                  <b>{c.societe || c.nom}</b>
                  <br />
                  <span className="discret">
                    {c.societe ? `${c.nom} · ` : ""}
                    {c.telephone}
                  </span>
                </span>
                <span className="ligne">
                  {!c.acompte && <span className="pastille ok">sans acompte</span>}
                  <span className="pastille">{TYPES[c.type]}</span>
                </span>
              </Link>
            </li>
          ))}
          {contacts.length === 0 && <li className="discret">Aucun contact trouvé.</li>}
        </ul>
      </section>
    </>
  );
}

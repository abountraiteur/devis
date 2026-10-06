import Link from "next/link";
import { notFound } from "next/navigation";
import { FormulaireContact } from "@/components/FormulaireContact";
import { formatDate } from "@/lib/calculs";
import { listerDevis, trouverContact } from "@/lib/store";
import { ETAPES } from "@/lib/types";

export default async function FicheContact({ params }: PageProps<"/contacts/[id]">) {
  const { id } = await params;
  const contact = await trouverContact(id);
  if (!contact) notFound();
  const devis = (await listerDevis()).filter((x) => x.devis.contactId === id);

  return (
    <>
      <div className="entete">
        <h1>{contact.societe || contact.nom}</h1>
        <Link className="bouton principal" href={`/devis/nouveau?contact=${id}`}>
          + Nouveau devis pour ce contact
        </Link>
      </div>
      <section className="carte">
        <span className="etiquette">Devis</span>
        <ul className="liste">
          {devis.map(({ devis: d }) => (
            <li key={d.id}>
              <Link href={`/devis/${d.id}`}>
                <span>
                  <b>{d.titre}</b> <span className="discret">{d.numero}</span>
                  <br />
                  <span className="discret">{formatDate(d.dateEvenement)}</span>
                </span>
                <span className="pastille">{ETAPES.find((e) => e.id === d.etape)?.label}</span>
              </Link>
            </li>
          ))}
          {devis.length === 0 && <li className="discret">Pas encore de devis.</li>}
        </ul>
      </section>
      <FormulaireContact contact={contact} />
    </>
  );
}

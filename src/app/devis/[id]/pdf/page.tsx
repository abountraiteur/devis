import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoutonImprimer } from "@/components/BoutonImprimer";
import { formatDate, formatEuros, totalLigneHT, totaux } from "@/lib/calculs";
import { CONDITIONS_VENTE, ENTREPRISE } from "@/lib/entreprise";
import { trouverDevis } from "@/lib/store";
import type { Ligne } from "@/lib/types";

export default async function DevisPdf({ params }: PageProps<"/devis/[id]/pdf">) {
  const { id } = await params;
  const trouve = await trouverDevis(id);
  if (!trouve) notFound();
  const { devis: d, contact } = trouve;
  const t = totaux(d, contact);
  const emis = new Date(d.creeLe);
  const valable = new Date(emis.getTime() + ENTREPRISE.validiteJours * 86400000);
  const parChapitre = d.lignes.reduce<Record<string, Ligne[]>>((acc, l) => {
    (acc[l.chapitre] ??= []).push(l);
    return acc;
  }, {});

  return (
    <>
      <div className="ligne pas-imprime">
        <Link className="bouton" href={`/devis/${d.id}`}>← Retour au devis</Link>
        <BoutonImprimer />
      </div>

      <article className="feuille">
        <header className="pdf-entete">
          <div className="pdf-societe">
            <Image src="/logo-aboun.png" alt="Aboun Traiteur – La Guinguette" width={110} height={110} />
            <b>{ENTREPRISE.nom}</b>
            <span>{ENTREPRISE.adresse}</span>
            <span>{ENTREPRISE.contact}</span>
          </div>
          {contact && (
            <div className="pdf-client">
              <span className="etiquette">Client</span>
              <b>{contact.societe || contact.nom}</b>
              {contact.societe && <span>{contact.nom}</span>}
              <span>{contact.adresse}</span>
              <span>{contact.emailFacturation || contact.email}</span>
              {contact.siret && <span>SIRET {contact.siret}</span>}
              {d.numeroCommande && (
                <span><b>N° de commande</b> : {d.numeroCommande}</span>
              )}
            </div>
          )}
        </header>

        <div className="pdf-titre">
          <div>
            <b>DEVIS N° {d.numero}</b>
            <span>
              Objet : <b>{d.titre} – {formatDate(d.dateEvenement)} – {d.invites} invités</b>
            </span>
          </div>
          <span className="discret">
            Émis le {emis.toLocaleDateString("fr-FR")}
            <br />
            Valable jusqu&apos;au {valable.toLocaleDateString("fr-FR")}
          </span>
        </div>

        <div className="pdf-infos">
          <div><span className="etiquette">Événement</span><b>{d.titre}</b></div>
          <div><span className="etiquette">Date et heure</span><b>{formatDate(d.dateEvenement)}{d.heure && `, ${d.heure.replace(":", " h ")}`}</b></div>
          <div><span className="etiquette">Invités</span><b>{d.invites}</b></div>
          <div><span className="etiquette">Formule</span><b>{d.formule}</b></div>
          <div><span className="etiquette">Lieu</span><b>{d.lieu}</b></div>
        </div>

        {d.regimes && (
          <div className="regimes">
            <b>Régimes spéciaux et allergies</b>
            <br />
            <b style={{ color: "inherit" }}>{d.regimes}</b>
          </div>
        )}

        {d.deroule && (
          <div>
            <span className="etiquette">Déroulé de l&apos;événement</span>
            <p style={{ whiteSpace: "pre-line", margin: "4px 0 0" }}>{d.deroule}</p>
          </div>
        )}

        <table className="tableau">
          <thead>
            <tr>
              <th>Qté</th>
              <th>Désignation</th>
              <th className="nombre">TVA</th>
              <th className="nombre">PU HT</th>
              <th className="nombre">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(parChapitre).map(([chapitre, lignes]) => [
              <tr key={chapitre}>
                <td colSpan={5} className="pdf-chapitre">{chapitre.toUpperCase()}</td>
              </tr>,
              ...lignes.map((l) => (
                <tr key={l.id}>
                  <td>{l.quantite}</td>
                  <td>{l.designation}</td>
                  <td className="nombre">{l.tva} %</td>
                  <td className="nombre">{formatEuros(l.prixUnitaireHT)}</td>
                  <td className="nombre">{formatEuros(totalLigneHT(l))}</td>
                </tr>
              )),
            ])}
          </tbody>
        </table>

        <div className="pdf-totaux totaux">
          <div><span>Total HT</span><b>{formatEuros(t.ht)}</b></div>
          <div><span>TVA</span><span>{formatEuros(t.tva)}</span></div>
          <div className="ttc"><span>Total TTC</span><span>{formatEuros(t.ttc)}</span></div>
          <div className="discret"><span>Soit par invité</span><span>{formatEuros(t.parInviteHT)} HT</span></div>
          {t.avecAcompte && (
            <div><span>Acompte à la signature ({d.acomptePct} %)</span><b>{formatEuros(t.acompte)}</b></div>
          )}
        </div>

        <section>
          <span className="etiquette">Conditions de vente</span>
          <ul className="pdf-cgv">
            {CONDITIONS_VENTE.map((c) => (
              <li key={c.titre}><b>{c.titre}</b> : {c.texte}</li>
            ))}
          </ul>
        </section>

        <div className="pdf-accord">
          <b>Bon pour accord</b>
          <span>Date :</span>
          <span>Nom et qualité du signataire :</span>
          <span className="pdf-signature">
            Signature précédée de « Bon pour accord » (et cachet pour les professionnels)
          </span>
        </div>

        <footer className="pdf-pied">{ENTREPRISE.mentions}</footer>
      </article>
    </>
  );
}

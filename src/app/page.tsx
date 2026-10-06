import Link from "next/link";
import { formatDate, formatEuros, totaux } from "@/lib/calculs";
import { listerDevis } from "@/lib/store";
import { ETAPES } from "@/lib/types";

export default async function Accueil() {
  const tous = await listerDevis();
  const aSuivre = tous.filter(({ devis }) =>
    ["nouvelle", "infos", "predevis"].includes(devis.etape),
  );
  const signes = tous
    .filter(({ devis }) => devis.etape === "signe")
    .sort((a, b) => a.devis.dateEvenement.localeCompare(b.devis.dateEvenement));
  const caSigne = signes.reduce((s, x) => s + totaux(x.devis, x.contact).ht, 0);

  return (
    <>
      <h1>Bonjour</h1>
      <div className="grille">
        <section className="carte">
          <span className="etiquette">Devis à traiter</span>
          <span className="chiffre">{aSuivre.length}</span>
          <ul className="liste">
            {aSuivre.map(({ devis, contact }) => (
              <li key={devis.id}>
                <Link href={`/devis/${devis.id}`}>
                  <span>
                    <b>{devis.titre}</b>
                    <br />
                    <span className="discret">{contact?.societe || contact?.nom}</span>
                  </span>
                  <span className="pastille alerte">
                    {ETAPES.find((e) => e.id === devis.etape)?.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="carte">
          <span className="etiquette">Prestations signées à venir</span>
          <span className="chiffre">{formatEuros(caSigne)} HT</span>
          <ul className="liste">
            {signes.map(({ devis }) => (
              <li key={devis.id}>
                <Link href={`/devis/${devis.id}`}>
                  <span>
                    <b>{devis.titre}</b>
                    <br />
                    <span className="discret">
                      {formatDate(devis.dateEvenement)} · {devis.invites} pers.
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="ligne">
        <Link className="bouton principal" href="/devis/nouveau">+ Nouveau devis</Link>
        <Link className="bouton" href="/pipeline">Voir le pipeline</Link>
      </div>
    </>
  );
}

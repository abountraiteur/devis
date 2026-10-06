import type { Metadata } from "next";
import Link from "next/link";
import { changerEtapeAction } from "@/app/actions";
import { formatDate, formatEuros, totaux } from "@/lib/calculs";
import { listerDevis } from "@/lib/store";
import { ETAPES } from "@/lib/types";

export const metadata: Metadata = { title: "Pipeline" };

export default async function Pipeline() {
  const devis = await listerDevis();
  return (
    <>
      <h1>Pipeline</h1>
      <div className="colonnes">
        {ETAPES.map((etape) => {
          const ici = devis.filter((x) => x.devis.etape === etape.id);
          const total = ici.reduce((s, x) => s + totaux(x.devis, x.contact).ht, 0);
          return (
            <section key={etape.id} className="colonne" aria-label={etape.label}>
              <h2>
                <span>{etape.label}</span>
                <span className="discret">{ici.length}</span>
              </h2>
              {total > 0 && <span className="discret">{formatEuros(total)} HT</span>}
              {ici.map(({ devis: d, contact }) => (
                <article key={d.id} className="fiche">
                  <Link href={`/devis/${d.id}`}>{d.titre}</Link>
                  <span className="discret">
                    {contact?.societe || contact?.nom} · {formatDate(d.dateEvenement)} · {d.invites} pers.
                  </span>
                  <form action={changerEtapeAction} className="ligne">
                    <input type="hidden" name="id" value={d.id} />
                    <select name="etape" defaultValue={d.etape} aria-label="Déplacer vers">
                      {ETAPES.map((e) => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </select>
                    <button className="bouton petit" type="submit">OK</button>
                  </form>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, formatEuros, totaux } from "@/lib/calculs";
import { listerDevis } from "@/lib/store";
import { ETAPES } from "@/lib/types";

export const metadata: Metadata = { title: "Devis" };

export default async function ListeDevis() {
  const devis = await listerDevis();
  return (
    <>
      <div className="entete">
        <h1>Devis</h1>
        <Link className="bouton principal" href="/devis/nouveau">+ Nouveau devis</Link>
      </div>
      <section className="carte defile">
        <table className="tableau">
          <thead>
            <tr>
              <th>N°</th>
              <th>Événement</th>
              <th>Client</th>
              <th>Date</th>
              <th className="nombre">Total HT</th>
              <th>Où en est le devis</th>
            </tr>
          </thead>
          <tbody>
            {devis.map(({ devis: d, contact }) => (
              <tr key={d.id}>
                <td><Link href={`/devis/${d.id}`}>{d.numero}</Link></td>
                <td><Link href={`/devis/${d.id}`}><b>{d.titre}</b></Link></td>
                <td>{contact?.societe || contact?.nom}</td>
                <td>{formatDate(d.dateEvenement)}</td>
                <td className="nombre">{formatEuros(totaux(d, contact).ht)}</td>
                <td><span className="pastille">{ETAPES.find((e) => e.id === d.etape)?.label}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

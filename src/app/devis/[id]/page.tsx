import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ajouterLigneAction,
  changerEtapeAction,
  modifierInfosDevisAction,
  supprimerLigneAction,
} from "@/app/actions";
import { formatEuros, totalLigneHT, totaux } from "@/lib/calculs";
import { trouverDevis } from "@/lib/store";
import { ETAPES } from "@/lib/types";

export default async function FicheDevis({ params }: PageProps<"/devis/[id]">) {
  const { id } = await params;
  const trouve = await trouverDevis(id);
  if (!trouve) notFound();
  const { devis: d, contact } = trouve;
  const t = totaux(d, contact);

  return (
    <>
      <div className="entete">
        <div>
          <span className="discret">Devis {d.numero}</span>
          <h1>{d.titre}</h1>
          {contact && (
            <Link className="discret" href={`/contacts/${contact.id}`}>
              {contact.societe ? `${contact.societe} · ${contact.nom}` : contact.nom}
            </Link>
          )}
        </div>
        <div className="ligne" style={{ alignItems: "flex-end" }}>
        <Link className="bouton" href={`/devis/${d.id}/pdf`}>Voir le PDF</Link>
        <form action={changerEtapeAction} className="ligne">
          <input type="hidden" name="id" value={d.id} />
          <label className="champ">
            Où en est le devis
            <select className="saisie" name="etape" defaultValue={d.etape}>
              {ETAPES.map((e) => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </select>
          </label>
          <button className="bouton" type="submit" style={{ alignSelf: "flex-end" }}>Changer</button>
        </form>
        </div>
      </div>

      {d.regimes && (
        <div className="regimes">
          <b>Régimes spéciaux et allergies</b>
          <br />
          {d.regimes}
        </div>
      )}

      <div className="grille" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <section className="carte">
          <span className="etiquette">Lignes du devis</span>
          <div className="defile">
            <table className="tableau">
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th className="nombre">Qté</th>
                  <th className="nombre">PU HT</th>
                  <th className="nombre">TVA</th>
                  <th className="nombre">Total HT</th>
                  <th><span className="sr-only">Supprimer</span></th>
                </tr>
              </thead>
              <tbody>
                {d.lignes.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.designation}
                      <br />
                      <span className="discret">{l.chapitre}</span>
                    </td>
                    <td className="nombre">{l.quantite}</td>
                    <td className="nombre">{formatEuros(l.prixUnitaireHT)}</td>
                    <td className="nombre">{l.tva} %</td>
                    <td className="nombre">{formatEuros(totalLigneHT(l))}</td>
                    <td>
                      <form action={supprimerLigneAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="ligneId" value={l.id} />
                        <button className="bouton petit" type="submit" aria-label={`Supprimer ${l.designation}`}>×</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {d.lignes.length === 0 && (
                  <tr><td colSpan={6} className="discret">Aucune ligne pour l&apos;instant.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <form action={ajouterLigneAction} className="formulaire">
            <input type="hidden" name="id" value={d.id} />
            <label className="champ large">
              Désignation
              <input className="saisie" name="designation" required />
            </label>
            <label className="champ">
              Chapitre
              <select className="saisie" name="chapitre" defaultValue="Restauration">
                <option>Restauration</option>
                <option>Boissons</option>
                <option>Service</option>
                <option>Logistique</option>
              </select>
            </label>
            <label className="champ">
              Quantité
              <input className="saisie" name="quantite" inputMode="decimal" required />
            </label>
            <label className="champ">
              Prix unitaire HT
              <input className="saisie" name="prixUnitaireHT" inputMode="decimal" required />
            </label>
            <label className="champ">
              TVA
              <select className="saisie" name="tva" defaultValue="10">
                <option value="10">10 % (restauration)</option>
                <option value="20">20 % (boissons alcoolisées, livraison, location)</option>
                <option value="5.5">5,5 %</option>
              </select>
            </label>
            <div className="large">
              <button className="bouton" type="submit">+ Ajouter la ligne</button>
            </div>
          </form>
        </section>

        <section className="carte">
          <span className="etiquette">Montant</span>
          <div className="totaux">
            <div><span>Total HT</span><b>{formatEuros(t.ht)}</b></div>
            <div><span>TVA</span><span>{formatEuros(t.tva)}</span></div>
            <div className="ttc"><span>Total TTC</span><span>{formatEuros(t.ttc)}</span></div>
            <div className="discret"><span>Soit par invité</span><span>{formatEuros(t.parInviteHT)} HT</span></div>
            <div>
              <span>Acompte à la signature</span>
              <b>{t.avecAcompte ? `${formatEuros(t.acompte)} (${d.acomptePct} %)` : "aucun (client habituel)"}</b>
            </div>
          </div>
        </section>
      </div>

      <form action={modifierInfosDevisAction} className="carte">
        <input type="hidden" name="id" value={d.id} />
        <span className="etiquette">Événement</span>
        <div className="formulaire">
          <label className="champ">Événement<input className="saisie" name="titre" defaultValue={d.titre} /></label>
          <label className="champ">Formule<input className="saisie" name="formule" defaultValue={d.formule} /></label>
          <label className="champ">Date<input className="saisie" type="date" name="dateEvenement" defaultValue={d.dateEvenement} /></label>
          <label className="champ">Heure<input className="saisie" type="time" name="heure" defaultValue={d.heure} /></label>
          <label className="champ">Nombre d&apos;invités<input className="saisie" type="number" min="0" name="invites" defaultValue={d.invites} /></label>
          <label className="champ">N° de commande (entreprises, collectivités)<input className="saisie" name="numeroCommande" defaultValue={d.numeroCommande} /></label>
          <label className="champ large">Lieu<input className="saisie" name="lieu" defaultValue={d.lieu} /></label>
          <label className="champ large">Régimes spéciaux et allergies<input className="saisie" name="regimes" defaultValue={d.regimes} placeholder="Végétariens, allergies, sans gluten…" /></label>
          <label className="champ large">Déroulé de l&apos;événement<textarea className="saisie" name="deroule" defaultValue={d.deroule} /></label>
        </div>
        <div className="ligne"><button className="bouton principal" type="submit">Enregistrer</button></div>
      </form>
    </>
  );
}

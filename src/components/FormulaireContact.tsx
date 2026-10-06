import { enregistrerContactAction } from "@/app/actions";
import type { Contact } from "@/lib/types";

export function FormulaireContact({ contact }: { contact?: Contact }) {
  return (
    <form action={enregistrerContactAction} className="carte">
      {contact && <input type="hidden" name="id" value={contact.id} />}
      <div className="formulaire">
        <label className="champ">
          Type
          <select className="saisie" name="type" defaultValue={contact?.type ?? "particulier"}>
            <option value="particulier">Particulier</option>
            <option value="entreprise">Entreprise</option>
            <option value="collectivite">Collectivité</option>
          </select>
        </label>
        <label className="champ">
          Nom et prénom
          <input className="saisie" name="nom" required defaultValue={contact?.nom} />
        </label>
        <label className="champ">
          Société ou organisme
          <input className="saisie" name="societe" defaultValue={contact?.societe} />
        </label>
        <label className="champ">
          SIRET
          <input className="saisie" name="siret" inputMode="numeric" defaultValue={contact?.siret} />
        </label>
        <label className="champ">
          E-mail
          <input className="saisie" type="email" name="email" defaultValue={contact?.email} />
        </label>
        <label className="champ">
          Téléphone
          <input className="saisie" type="tel" name="telephone" defaultValue={contact?.telephone} />
        </label>
        <label className="champ large">
          Adresse
          <input className="saisie" name="adresse" defaultValue={contact?.adresse} />
        </label>
        <label className="champ">
          E-mail de facturation (si différent)
          <input className="saisie" type="email" name="emailFacturation" defaultValue={contact?.emailFacturation} />
        </label>
        <label className="case">
          <input type="checkbox" name="acompte" defaultChecked={contact?.acompte ?? true} />
          Demander un acompte (décocher pour un client habituel)
        </label>
        <label className="champ large">
          Notes
          <textarea className="saisie" name="notes" defaultValue={contact?.notes} />
        </label>
      </div>
      <div className="ligne">
        <button className="bouton principal" type="submit">Enregistrer</button>
      </div>
    </form>
  );
}

import type { Contact, Devis, Ligne } from "./types";

const arrondi = (n: number) => Math.round(n * 100) / 100;

export function totalLigneHT(l: Ligne) {
  return arrondi(l.quantite * l.prixUnitaireHT);
}

export function totaux(devis: Devis, contact?: Contact) {
  const ht = arrondi(devis.lignes.reduce((s, l) => s + totalLigneHT(l), 0));
  const tva = arrondi(
    devis.lignes.reduce((s, l) => s + totalLigneHT(l) * (l.tva / 100), 0),
  );
  const ttc = arrondi(ht + tva);
  const avecAcompte = contact ? contact.acompte : true;
  const acompte = avecAcompte ? arrondi((ttc * devis.acomptePct) / 100) : 0;
  const parInviteHT = devis.invites > 0 ? arrondi(ht / devis.invites) : 0;
  return { ht, tva, ttc, acompte, avecAcompte, parInviteHT };
}

/** Livraison : forfait 30 € HT jusqu'à 15 km, puis 0,85 € du km aller-retour. */
export function prixLivraisonHT(distanceKm: number) {
  if (distanceKm <= 15) return 30;
  return arrondi(30 + (distanceKm - 15) * 2 * 0.85);
}

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});
export const formatEuros = (n: number) => euros.format(n);

export function formatDate(iso: string) {
  if (!iso) return "date à définir";
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

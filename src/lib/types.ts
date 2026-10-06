export type TypeContact = "particulier" | "entreprise" | "collectivite";

export type Contact = {
  id: string;
  type: TypeContact;
  nom: string;
  societe?: string;
  email: string;
  telephone: string;
  adresse: string;
  siret?: string;
  /** false = client habituel, pas d'acompte demandé */
  acompte: boolean;
  emailFacturation?: string;
  notes?: string;
  creeLe: string;
};

export const ETAPES = [
  { id: "nouvelle", label: "Nouvelle demande" },
  { id: "infos", label: "Infos manquantes" },
  { id: "predevis", label: "Pré-devis à valider" },
  { id: "envoye", label: "Devis envoyé" },
  { id: "signe", label: "Signé – acompte reçu" },
  { id: "realise", label: "Réalisé – à facturer" },
  { id: "facture", label: "Facturé" },
  { id: "perdu", label: "Perdu" },
] as const;

export type Etape = (typeof ETAPES)[number]["id"];

export type Ligne = {
  id: string;
  chapitre: string;
  designation: string;
  quantite: number;
  prixUnitaireHT: number;
  /** taux de TVA en %, par exemple 10 ou 20 */
  tva: number;
};

export type Devis = {
  id: string;
  numero: string;
  contactId: string;
  titre: string;
  dateEvenement: string;
  heure: string;
  lieu: string;
  invites: number;
  formule: string;
  regimes: string;
  deroule: string;
  numeroCommande?: string;
  etape: Etape;
  acomptePct: number;
  lignes: Ligne[];
  creeLe: string;
};

export type Base = {
  contacts: Contact[];
  devis: Devis[];
  prochainNumero: number;
};

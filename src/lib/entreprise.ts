/** Informations d'Aboun Traiteur reprises sur les devis (modifiables plus tard dans Paramètres). */
export const ENTREPRISE = {
  nom: "Aboun Traiteur – SAS",
  adresse: "5 rue Frédéric Sauvage, 76600 Le Havre",
  contact: "02 44 84 94 48 · abountraiteur@gmail.com · abountraiteur.fr",
  iban: "FR76 3002 7160 2000 0208 9800 314",
  bic: "CMCIFRPP (CIC)",
  mentions:
    "ABOUN TRAITEUR – SAS au capital de 3 000 € – 5 rue Frédéric Sauvage, 76600 Le Havre – SIREN 913 585 766 – SIRET 913 585 766 00037 – TVA FR00913585766 – APE 5621Z",
  validiteJours: 30,
};

export const CONDITIONS_VENTE: { titre: string; texte: string }[] = [
  {
    titre: "Validité",
    texte: `devis valable ${ENTREPRISE.validiteJours} jours. Pas d'acompte pour les organismes publics. Le nombre d'invités peut être ajusté jusqu'à J-7 ; la facture suit le nombre confirmé.`,
  },
  {
    titre: "Règlement",
    texte: `carte bancaire, virement ou chèque. Virement : IBAN ${ENTREPRISE.iban} – BIC ${ENTREPRISE.bic}.`,
  },
  {
    titre: "Confirmation",
    texte: "la réservation est ferme à réception du devis signé et de l'acompte.",
  },
  {
    titre: "Allergies et régimes",
    texte: "à nous signaler au plus tard à J-7 ; la liste des allergènes est disponible sur demande.",
  },
  {
    titre: "Annulation",
    texte:
      "toute annulation se fait par écrit. L'acompte versé reste acquis à Aboun Traiteur et n'est jamais remboursé. Le client reste en outre redevable, acompte compris, de 50 % du montant TTC si l'annulation intervient entre 30 et 15 jours avant l'événement, et de 100 % à moins de 15 jours. Les produits commandés spécialement pour l'événement restent dus. Si Aboun Traiteur annule (hors force majeure), toutes les sommes versées sont remboursées.",
  },
  {
    titre: "Report",
    texte:
      "possible une fois, sur demande écrite au moins 60 jours avant, pour une date dans les 12 mois selon nos disponibilités ; l'acompte est reporté sur la nouvelle date.",
  },
  {
    titre: "Retard de paiement",
    texte:
      "pénalités au taux légal en vigueur ; indemnité forfaitaire de 40 € pour frais de recouvrement (clients professionnels).",
  },
  {
    titre: "Médiation",
    texte:
      "en cas de litige, le client particulier peut saisir gratuitement le médiateur de la consommation CM2C (www.cm2c.net).",
  },
];

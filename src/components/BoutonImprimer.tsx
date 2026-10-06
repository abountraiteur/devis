"use client";

export function BoutonImprimer() {
  return (
    <button className="bouton principal" type="button" onClick={() => window.print()}>
      Télécharger en PDF
    </button>
  );
}

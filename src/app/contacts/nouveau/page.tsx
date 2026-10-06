import type { Metadata } from "next";
import { FormulaireContact } from "@/components/FormulaireContact";

export const metadata: Metadata = { title: "Nouveau contact" };

export default function NouveauContact() {
  return (
    <>
      <h1>Nouveau contact</h1>
      <FormulaireContact />
    </>
  );
}

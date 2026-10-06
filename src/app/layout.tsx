import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--police" });

export const metadata: Metadata = {
  title: { default: "Aboun Connect", template: "%s · Aboun Connect" },
  description: "Devis, contacts et suivi des prestations d'Aboun Traiteur",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#4A2C1D" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <body>
        <div className="app">
          <Navigation />
          <main className="contenu">{children}</main>
        </div>
      </body>
    </html>
  );
}

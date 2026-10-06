"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/", label: "Accueil" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/contacts", label: "Contacts" },
  { href: "/devis", label: "Devis" },
];

export function Navigation() {
  const chemin = usePathname();
  const actif = (href: string) =>
    href === "/" ? chemin === "/" : chemin.startsWith(href);

  return (
    <nav className="nav" aria-label="Menu">
      <Link href="/" className="nav-marque">
        <Image src="/bonhomme-aboun.png" alt="" width={26} height={45} priority />
        <span>Aboun Connect</span>
      </Link>
      <ul>
        {LIENS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={actif(l.href) ? "nav-lien actif" : "nav-lien"}
              aria-current={actif(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

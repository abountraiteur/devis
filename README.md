# Aboun Connect

Application d'Aboun Traiteur : devis, contacts et pipeline (premiers modules).

## Lancer sur un ordinateur

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000. Au premier lancement, des données d'exemple (fictives) sont créées dans `data/aboun.json`.

## Où en est-on

- Fait : Accueil, Contacts (recherche, fiche, sans acompte), Devis (création, lignes, totaux, acompte, régimes), Pipeline (8 étapes).
- Provisoire : les données sont dans un fichier JSON local. Elles passeront dans Supabase (`supabase/migrations`).
- À venir : connexion et profils, PDF du devis, envoi Gmail, page client avec signature, Axonaut, puis Planning, Production, RH, Communication.

Maquettes de référence : https://claude.ai/artifact/LCuNZLCKd9tHPjeGcSxr4g

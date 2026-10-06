-- Schéma cible pour Supabase (remplacera data/aboun.json).
create type type_contact as enum ('particulier', 'entreprise', 'collectivite');
create type etape_devis as enum ('nouvelle', 'infos', 'predevis', 'envoye', 'signe', 'realise', 'facture', 'perdu');

create table contacts (
  id uuid primary key default gen_random_uuid(),
  type type_contact not null default 'particulier',
  nom text not null,
  societe text,
  email text,
  telephone text,
  adresse text,
  siret text,
  acompte boolean not null default true,
  email_facturation text,
  notes text,
  cree_le timestamptz not null default now()
);

create sequence numero_devis start 26;

create table devis (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique default 'DV' || lpad(nextval('numero_devis')::text, 7, '0'),
  contact_id uuid not null references contacts (id),
  titre text not null,
  date_evenement date,
  heure time,
  lieu text,
  invites integer not null default 0,
  formule text,
  regimes text,
  deroule text,
  numero_commande text,
  etape etape_devis not null default 'nouvelle',
  acompte_pct numeric(5, 2) not null default 20,
  cree_le timestamptz not null default now()
);

create table devis_lignes (
  id uuid primary key default gen_random_uuid(),
  devis_id uuid not null references devis (id) on delete cascade,
  position integer not null default 0,
  chapitre text not null default 'Restauration',
  designation text not null,
  quantite numeric(10, 2) not null,
  prix_unitaire_ht numeric(10, 2) not null,
  tva numeric(4, 2) not null default 10
);

-- Accès réservé aux comptes connectés ; les profils (Admin, Administratif…) viendront ensuite.
alter table contacts enable row level security;
alter table devis enable row level security;
alter table devis_lignes enable row level security;
create policy "connectes" on contacts for all to authenticated using (true) with check (true);
create policy "connectes" on devis for all to authenticated using (true) with check (true);
create policy "connectes" on devis_lignes for all to authenticated using (true) with check (true);

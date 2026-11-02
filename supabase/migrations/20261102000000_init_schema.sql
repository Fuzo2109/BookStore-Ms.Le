-- =====================================================================
-- Ms. Le Bookstore – Release 1.0 schema
-- Covers F1 (accounts & roles), F2 (books, categories, authors),
-- F3/F5 (catalogue view) and CR-04 (cover image + thumbnail paths).
-- Run once in Supabase → SQL Editor (or `supabase db push`).
-- =====================================================================

-- ---------- F1: roles & profiles ------------------------------------
create type public.user_role as enum ('admin', 'customer');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        public.user_role not null default 'customer',
  is_locked   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Passwords are never stored here: Supabase Auth keeps them as bcrypt hashes
-- in auth.users (NFR: "passwords stored as hashes").

-- Helper used by RLS policies. SECURITY DEFINER so it can read profiles
-- without recursing into the profiles policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_locked = false
  );
$$;

-- Every new auth user gets a 'customer' profile automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- F2: categories, authors, books ---------------------------
create table public.categories (
  id          bigint generated always as identity primary key,
  name        text not null unique check (char_length(trim(name)) between 1 and 100),
  created_at  timestamptz not null default now()
);

create table public.authors (
  id          bigint generated always as identity primary key,
  name        text not null unique check (char_length(trim(name)) between 1 and 150),
  created_at  timestamptz not null default now()
);

create table public.books (
  id              bigint generated always as identity primary key,
  title           text not null check (char_length(trim(title)) between 1 and 255),
  author_id       bigint not null references public.authors (id) on delete restrict,
  category_id     bigint not null references public.categories (id) on delete restrict,
  price           numeric(12, 0) not null check (price > 0),          -- VND, must be > 0
  description     text not null default '',
  stock           integer not null default 0 check (stock >= 0),
  -- CR-04: original image (F4) and generated thumbnail (F3), stored in Supabase Storage.
  cover_path      text,
  thumbnail_path  text,
  deleted_at      timestamptz,                                         -- soft delete (no hard delete)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index books_created_at_idx on public.books (created_at desc) where deleted_at is null;
create index books_category_idx   on public.books (category_id)      where deleted_at is null;
create index books_price_idx      on public.books (price)            where deleted_at is null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger books_touch_updated_at
  before update on public.books
  for each row execute function public.touch_updated_at();

-- ---------- F3/F5: catalogue view ------------------------------------
-- One flat row per visible book so the list page can search title OR author
-- and filter by category / price in a single paginated query.
create view public.book_catalog
with (security_invoker = true) as
select
  b.id,
  b.title,
  b.price,
  b.stock,
  b.description,
  b.cover_path,
  b.thumbnail_path,
  b.created_at,
  b.author_id,
  a.name  as author_name,
  b.category_id,
  c.name  as category_name
from public.books b
join public.authors a    on a.id = b.author_id
join public.categories c on c.id = b.category_id
where b.deleted_at is null;

-- ---------- Row Level Security --------------------------------------
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.authors    enable row level security;
alter table public.books      enable row level security;

-- profiles: a user reads their own row; admins read/update everyone.
create policy "profiles: read own"   on public.profiles for select using (id = auth.uid());
create policy "profiles: admin read" on public.profiles for select using (public.is_admin());
create policy "profiles: admin update" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- categories & authors: public read, admin write.
create policy "categories: public read" on public.categories for select using (true);
create policy "categories: admin insert" on public.categories for insert with check (public.is_admin());
create policy "categories: admin update" on public.categories for update using (public.is_admin()) with check (public.is_admin());
create policy "categories: admin delete" on public.categories for delete using (public.is_admin());

create policy "authors: public read" on public.authors for select using (true);
create policy "authors: admin insert" on public.authors for insert with check (public.is_admin());
create policy "authors: admin update" on public.authors for update using (public.is_admin()) with check (public.is_admin());
create policy "authors: admin delete" on public.authors for delete using (public.is_admin());

-- books: everyone sees non-deleted books; admins see all and can insert/update.
-- There is deliberately NO delete policy: books are only soft-deleted.
create policy "books: public read" on public.books for select using (deleted_at is null or public.is_admin());
create policy "books: admin insert" on public.books for insert with check (public.is_admin());
create policy "books: admin update" on public.books for update using (public.is_admin()) with check (public.is_admin());

grant select on public.book_catalog to anon, authenticated;

-- ---------- CR-04: storage bucket for covers -------------------------
-- Public read so thumbnails load fast on the list page. Uploads happen on the
-- server with the service-role key after an admin check, so no write policy is needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('book-covers', 'book-covers', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

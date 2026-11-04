-- F2/F4: product details shown on the book detail page (requested by the PO on 04/11/2026).
-- All optional: books without a value simply do not show that row.
alter table public.books
  add column if not exists format              text,
  add column if not exists language            text,
  add column if not exists publisher           text,
  add column if not exists publication_date    date,
  add column if not exists isbn13              text,
  add column if not exists isbn10              text,
  add column if not exists dimensions          text,
  add column if not exists shipping_weight_lbs numeric(6, 2);

alter table public.books
  drop constraint if exists books_isbn13_format,
  add constraint books_isbn13_format check (isbn13 is null or isbn13 ~ '^[0-9]{13}$'),
  drop constraint if exists books_isbn10_format,
  add constraint books_isbn10_format check (isbn10 is null or isbn10 ~ '^[0-9]{9}[0-9X]$'),
  drop constraint if exists books_weight_positive,
  add constraint books_weight_positive check (shipping_weight_lbs is null or shipping_weight_lbs > 0),
  drop constraint if exists books_text_lengths,
  add constraint books_text_lengths check (
    coalesce(char_length(format), 0) <= 50 and coalesce(char_length(language), 0) <= 50 and
    coalesce(char_length(publisher), 0) <= 150 and coalesce(char_length(dimensions), 0) <= 60);

-- One record per edition: the same ISBN cannot belong to two visible books.
create unique index if not exists books_isbn13_unique on public.books (isbn13) where isbn13 is not null and deleted_at is null;

-- Expose the new columns in the catalogue view (columns appended at the end).
create or replace view public.book_catalog
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
  c.name  as category_name,
  b.format,
  b.language,
  b.publisher,
  b.publication_date,
  b.isbn13,
  b.isbn10,
  b.dimensions,
  b.shipping_weight_lbs
from public.books b
join public.authors a    on a.id = b.author_id
join public.categories c on c.id = b.category_id
where b.deleted_at is null;

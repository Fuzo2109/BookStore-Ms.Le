-- Authors are now typed in the book form (with suggestions) and created on the fly.
-- Block duplicates that differ only by letter case or extra spaces,
-- e.g. "J.R.R. Tolkien" vs "j.r.r.  tolkien".
create unique index if not exists authors_name_ci_unique
  on public.authors (lower(regexp_replace(trim(name), '\s+', ' ', 'g')));

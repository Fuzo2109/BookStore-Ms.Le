"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { saveBook } from "./actions";
import { FieldError, FormAlert } from "@/components/FormBits";
import { COVER_ACCEPT_ATTR, validateCoverFile } from "@/lib/cover-rules";
import { MAX_PRICE, MAX_STOCK, nameKey, normalizeName } from "@/lib/validation";
import type { Author, Category, FormState } from "@/lib/types";

export interface BookFormValues {
  id?: number;
  title: string;
  authorName: string;
  categoryId: string;
  price: string;
  stock: string;
  description: string;
  coverUrl: string;
  format?: string;
  language?: string;
  publisher?: string;
  publicationDate?: string;
  isbn13?: string;
  isbn10?: string;
  dimensions?: string;
  shippingWeight?: string;
}

/** Optional "Product details" shown on the book page (F4). */
const DETAIL_INPUTS: {
  name: keyof BookFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  list?: string;
  inputMode?: "numeric" | "decimal";
}[] = [
  { name: "format", label: "Format", placeholder: "Paperback", maxLength: 50, list: "format-options" },
  { name: "language", label: "Language", placeholder: "English", maxLength: 50, list: "language-options" },
  { name: "publisher", label: "Publisher", placeholder: "HarperCollins Publishers", maxLength: 150 },
  { name: "publicationDate", label: "Publication date", type: "date" },
  { name: "isbn13", label: "ISBN-13", placeholder: "9780060935467", maxLength: 17, inputMode: "numeric" },
  { name: "isbn10", label: "ISBN-10", placeholder: "0060935464", maxLength: 13 },
  { name: "dimensions", label: "Dimensions", placeholder: "5.30 × 8.00 × 0.82 inches", maxLength: 60 },
  { name: "shippingWeight", label: "Shipping weight (lbs)", placeholder: "0.55", inputMode: "decimal", maxLength: 7 },
];

/** F2 add/edit form with CR-04 cover upload (checked in the browser and again on the server). */
export function BookForm({
  book,
  authors,
  categories,
}: {
  book: BookFormValues;
  authors: Author[];
  categories: Category[];
}) {
  const [state, action, isPending] = useActionState(saveBook.bind(null, book.id), {} as FormState);

  // Submit through onSubmit instead of <form action>: React 19 resets a form after an
  // action-based submit, which cleared the category <select> and the chosen cover file
  // whenever the server returned a validation error (e.g. a wrong ISBN-13).
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  }
  const [coverError, setCoverError] = useState<string>();
  const [preview, setPreview] = useState(book.coverUrl);
  const fe = { ...(state.fieldErrors ?? {}) };
  if (coverError) fe.cover = coverError;
  const v = (key: keyof BookFormValues) => state.values?.[key] ?? String(book[key] ?? "");

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setCoverError(undefined);
      setPreview(book.coverUrl);
      return;
    }
    const err = validateCoverFile(file);
    setCoverError(err ?? undefined);
    if (err) {
      e.target.value = ""; // do not submit an invalid file
      setPreview(book.coverUrl);
    } else {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_280px]" aria-busy={isPending}>
      <div className="card space-y-5 p-6">
        <FormAlert error={state.error} />

        <div>
          <label htmlFor="title" className="label">
            Title *
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={255}
            defaultValue={v("title")}
            aria-invalid={Boolean(fe.title)}
            aria-describedby="title-error"
            className="input"
          />
          <FieldError id="title-error" message={fe.title} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <AuthorInput
              authors={authors}
              defaultValue={v("authorName")}
              error={fe.authorName}
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="label">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={v("categoryId")}
              aria-invalid={Boolean(fe.categoryId)}
              aria-describedby="categoryId-error"
              className="input"
            >
              <option value="">Choose a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError id="categoryId-error" message={fe.categoryId} />
            <Link href="/admin/categories" className="mt-1 inline-block text-xs text-brand-600 hover:underline">
              Manage categories
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="label">
              Price (VND) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min={1}
              max={MAX_PRICE}
              step={1}
              inputMode="numeric"
              defaultValue={v("price")}
              aria-invalid={Boolean(fe.price)}
              aria-describedby="price-error"
              className="input"
            />
            <FieldError id="price-error" message={fe.price} />
          </div>
          <div>
            <label htmlFor="stock" className="label">
              Stock *
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              required
              min={0}
              max={MAX_STOCK}
              step={1}
              inputMode="numeric"
              defaultValue={v("stock") || "0"}
              aria-invalid={Boolean(fe.stock)}
              aria-describedby="stock-error"
              className="input"
            />
            <FieldError id="stock-error" message={fe.stock} />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={5000}
            defaultValue={v("description")}
            aria-invalid={Boolean(fe.description)}
            aria-describedby="description-error"
            className="input"
          />
          <FieldError id="description-error" message={fe.description} />
        </div>

        <fieldset className="rounded-lg border border-stone-200 p-4">
          <legend className="px-1 text-sm font-semibold text-stone-800">Product details (optional)</legend>
          <p className="mb-3 text-xs text-stone-500">Shown under the description on the book page. Leave blank if unknown.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {DETAIL_INPUTS.map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="label">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type ?? "text"}
                  list={f.list}
                  inputMode={f.inputMode}
                  maxLength={f.maxLength}
                  placeholder={f.placeholder}
                  defaultValue={v(f.name)}
                  aria-invalid={Boolean(fe[f.name])}
                  aria-describedby={`${f.name}-error`}
                  className="input"
                />
                <FieldError id={`${f.name}-error`} message={fe[f.name]} />
              </div>
            ))}
          </div>
          <datalist id="format-options">
            <option value="Paperback" />
            <option value="Hardcover" />
            <option value="Mass Market Paperback" />
            <option value="Board Book" />
          </datalist>
          <datalist id="language-options">
            <option value="English" />
            <option value="Vietnamese" />
          </datalist>
        </fieldset>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={isPending} aria-disabled={isPending}>
            {isPending ? "Saving…" : book.id ? "Save changes" : "Add book"}
          </button>
          <Link href="/admin/books" className="btn-outline">
            Cancel
          </Link>
        </div>
      </div>

      <div className="card h-fit space-y-3 p-6">
        <p className="label">Cover image</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Cover preview" className="aspect-[2/3] w-full rounded-md bg-stone-100 object-cover" />
        <label htmlFor="cover" className="btn-outline w-full cursor-pointer">
          {book.coverUrl.includes("default-cover") ? "Upload cover" : "Replace cover"}
        </label>
        <input
          id="cover"
          name="cover"
          type="file"
          accept={COVER_ACCEPT_ATTR}
          onChange={onCoverChange}
          aria-invalid={Boolean(fe.cover)}
          aria-describedby="cover-help cover-error"
          className="sr-only"
        />
        <p id="cover-help" className="text-xs text-stone-500">
          JPG or PNG, maximum 2 MB. A thumbnail is generated automatically for the book list.
        </p>
        <FieldError id="cover-error" message={fe.cover} />
      </div>
    </form>
  );
}

/**
 * Author field: type freely with suggestions from existing authors (datalist).
 * Matching ignores case and extra spaces; an unknown name is created on save.
 */
function AuthorInput({
  authors,
  defaultValue,
  error,
}: {
  authors: Author[];
  defaultValue: string;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const typed = normalizeName(value);
  const match = typed ? authors.find((a) => nameKey(a.name) === nameKey(typed)) : undefined;
  const isNew = Boolean(typed) && !match;

  return (
    <div>
      <label htmlFor="authorName" className="label">
        Author *
      </label>
      <input
        id="authorName"
        name="authorName"
        list="author-options"
        required
        maxLength={150}
        autoComplete="off"
        placeholder="Start typing a name…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby="authorName-hint authorName-error"
        className="input"
      />
      <datalist id="author-options">
        {authors.map((a) => (
          <option key={a.id} value={a.name} />
        ))}
      </datalist>
      <p id="authorName-hint" className="mt-1 text-xs" aria-live="polite">
        {isNew ? (
          <span className="font-medium text-accent-600">New author “{typed}” will be created when you save.</span>
        ) : match ? (
          <span className="text-brand-600">Existing author: {match.name}</span>
        ) : (
          <span className="text-stone-500">Pick a suggestion or type a new name.</span>
        )}
      </p>
      <FieldError id="authorName-error" message={error} />
      <Link href="/admin/authors" className="mt-1 inline-block text-xs text-brand-600 hover:underline">
        Manage authors
      </Link>
    </div>
  );
}

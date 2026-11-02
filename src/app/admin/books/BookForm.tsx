"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveBook } from "./actions";
import { FieldError, FormAlert, SubmitButton } from "@/components/FormBits";
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
}

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
  const [state, action] = useActionState(saveBook.bind(null, book.id), {} as FormState);
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
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_280px]">
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
              key={state.values?.authorName ?? "initial"}
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

        <div className="flex gap-3">
          <SubmitButton>{book.id ? "Save changes" : "Add book"}</SubmitButton>
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

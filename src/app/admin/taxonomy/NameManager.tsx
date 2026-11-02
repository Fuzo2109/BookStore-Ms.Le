"use client";

import { useActionState } from "react";
import { addName, deleteName, renameName, type Taxonomy } from "./actions";
import { FieldError, FormAlert, SubmitButton } from "@/components/FormBits";
import type { FormState } from "@/lib/types";

interface Item {
  id: number;
  name: string;
  books: number;
}

const initial: FormState = {};

/** F2 – add / rename / delete categories or authors. */
export function NameManager({ table, label, items }: { table: Taxonomy; label: string; items: Item[] }) {
  const [state, action] = useActionState(addName.bind(null, table), initial);

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <form action={action} className="card h-fit space-y-3 p-5">
        <h2 className="font-sans text-base font-semibold">Add {label}</h2>
        <FormAlert error={state.error} success={state.success} />
        <div>
          <label htmlFor="new-name" className="label">
            Name
          </label>
          <input
            id="new-name"
            name="name"
            required
            maxLength={100}
            key={state.success ?? "new"}
            defaultValue={state.values?.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby="new-name-error"
            className="input"
          />
          <FieldError id="new-name-error" message={state.fieldErrors?.name} />
        </div>
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="card divide-y divide-stone-100">
        {items.length === 0 && <p className="p-5 text-stone-500">Nothing here yet.</p>}
        {items.map((item) => (
          <Row key={item.id} table={table} item={item} />
        ))}
      </div>
    </div>
  );
}

function Row({ table, item }: { table: Taxonomy; item: Item }) {
  const [renameState, rename] = useActionState(renameName.bind(null, table, item.id), initial);
  const [deleteState, remove] = useActionState(deleteName.bind(null, table, item.id), initial);
  const error = renameState.error ?? renameState.fieldErrors?.name ?? deleteState.error;

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <form action={rename} className="flex flex-1 gap-2">
          <label htmlFor={`name-${item.id}`} className="sr-only">
            Name
          </label>
          <input id={`name-${item.id}`} name="name" required maxLength={100} defaultValue={item.name} className="input" />
          <SubmitButton className="btn-outline">Save</SubmitButton>
        </form>
        <span className="w-20 text-right text-xs text-stone-500">
          {item.books} {item.books === 1 ? "book" : "books"}
        </span>
        <form
          action={remove}
          onSubmit={(e) => {
            if (!window.confirm(`Delete “${item.name}”?`)) e.preventDefault();
          }}
        >
          <SubmitButton className="btn-danger" pendingText="…">
            Delete
          </SubmitButton>
        </form>
      </div>
      {error && <p className="field-error">{error}</p>}
      {renameState.success && !error && <p className="mt-1 text-xs text-brand-600">{renameState.success}</p>}
    </div>
  );
}

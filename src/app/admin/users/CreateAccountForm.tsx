"use client";

import { useActionState } from "react";
import { createAccount } from "./actions";
import { FieldError, FormAlert, SubmitButton } from "@/components/FormBits";
import type { FormState } from "@/lib/types";

export function CreateAccountForm() {
  const [state, action] = useActionState(createAccount, {} as FormState);
  const fe = state.fieldErrors ?? {};
  // Re-mount the inputs after a success so the form is cleared.
  const key = state.success ?? "form";

  return (
    <form action={action} className="card h-fit space-y-4 p-5" key={key}>
      <h2 className="font-sans text-base font-semibold">Create an account</h2>
      <FormAlert error={state.error} success={state.success} />
      <div>
        <label htmlFor="u-name" className="label">
          Full name
        </label>
        <input id="u-name" name="fullName" required minLength={2} maxLength={100} defaultValue={state.values?.fullName} className="input" aria-invalid={Boolean(fe.fullName)} aria-describedby="u-name-error" />
        <FieldError id="u-name-error" message={fe.fullName} />
      </div>
      <div>
        <label htmlFor="u-email" className="label">
          Email
        </label>
        <input id="u-email" name="email" type="email" required defaultValue={state.values?.email} className="input" aria-invalid={Boolean(fe.email)} aria-describedby="u-email-error" />
        <FieldError id="u-email-error" message={fe.email} />
      </div>
      <div>
        <label htmlFor="u-password" className="label">
          Temporary password
        </label>
        <input id="u-password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="input" aria-invalid={Boolean(fe.password)} aria-describedby="u-password-error" />
        <FieldError id="u-password-error" message={fe.password} />
      </div>
      <div>
        <label htmlFor="u-role" className="label">
          Role
        </label>
        <select id="u-role" name="role" required defaultValue={state.values?.role || "customer"} className="input">
          <option value="customer">Customer</option>
          <option value="admin">Administrator</option>
        </select>
        <FieldError id="u-role-error" message={fe.role} />
      </div>
      <SubmitButton pendingText="Creating…">Create account</SubmitButton>
    </form>
  );
}

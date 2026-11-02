"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "./actions";
import { FieldError, FormAlert, SubmitButton } from "@/components/FormBits";
import type { FormState } from "@/lib/types";

const initial: FormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, initial);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4">
      <FormAlert error={state.error} />
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(fe.email)}
          aria-describedby="email-error"
          className="input"
        />
        <FieldError id="email-error" message={fe.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fe.password)}
          aria-describedby="password-error"
          className="input"
        />
        <FieldError id="password-error" message={fe.password} />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Logging in…">
        Log in
      </SubmitButton>
      <p className="text-center text-sm text-stone-600">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(register, initial);
  const fe = state.fieldErrors ?? {};

  if (state.success) return <FormAlert success={state.success} />;

  return (
    <form action={action} className="space-y-4">
      <FormAlert error={state.error} />
      <div>
        <label htmlFor="fullName" className="label">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={state.values?.fullName}
          aria-invalid={Boolean(fe.fullName)}
          aria-describedby="fullName-error"
          className="input"
        />
        <FieldError id="fullName-error" message={fe.fullName} />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(fe.email)}
          aria-describedby="email-error"
          className="input"
        />
        <FieldError id="email-error" message={fe.email} />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password <span className="font-normal text-stone-500">(at least 8 characters)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          aria-invalid={Boolean(fe.password)}
          aria-describedby="password-error"
          className="input"
        />
        <FieldError id="password-error" message={fe.password} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          aria-invalid={Boolean(fe.confirmPassword)}
          aria-describedby="confirmPassword-error"
          className="input"
        />
        <FieldError id="confirmPassword-error" message={fe.confirmPassword} />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

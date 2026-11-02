"use client";

import { useFormStatus } from "react-dom";

/** Submit button that asks for confirmation first (used for delete / lock). */
export function ConfirmButton({
  message,
  children,
  className = "btn-danger px-3 py-1",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}

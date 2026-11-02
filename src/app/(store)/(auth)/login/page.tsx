import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/validation";
import { LoginForm } from "../AuthForms";

export const metadata: Metadata = { title: "Log in" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const next = safeRedirectPath((await searchParams).next, "/");
  const user = await getCurrentUser();
  if (user) redirect(next === "/" && user.role === "admin" ? "/admin" : next);

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">Log in</h1>
        <LoginForm next={next} />
      </div>
    </div>
  );
}

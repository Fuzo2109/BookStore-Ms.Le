import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { setLocked } from "./actions";
import { CreateAccountForm } from "./CreateAccountForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Manage accounts" };

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "customer";
  is_locked: boolean;
  created_at: string;
}

export default async function UsersPage() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_locked, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const users = (data ?? []) as unknown as ProfileRow[];

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Create Administrator or Customer accounts and lock accounts that should no longer sign in."
        crumbs={[{ href: "/admin", label: "Dashboard" }]}
      />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <CreateAccountForm />

        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-medium">{u.full_name || "—"}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-accent-400/20 text-accent-600" : "bg-stone-100 text-stone-600"}`}
                    >
                      {u.role === "admin" ? "Administrator" : "Customer"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {u.is_locked ? (
                      <span className="font-semibold text-red-600">Locked</span>
                    ) : (
                      <span className="text-brand-600">Active</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(u.created_at)}</td>
                  <td className="px-3 py-2 text-right">
                    {u.id === me.id ? (
                      <span className="text-xs text-stone-400">You</span>
                    ) : (
                      <form action={setLocked.bind(null, u.id, !u.is_locked)}>
                        <ConfirmButton
                          message={u.is_locked ? `Unlock ${u.email}?` : `Lock ${u.email}? They will not be able to log in.`}
                          className={u.is_locked ? "btn-outline px-3 py-1" : "btn-danger px-3 py-1"}
                        >
                          {u.is_locked ? "Unlock" : "Lock"}
                        </ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

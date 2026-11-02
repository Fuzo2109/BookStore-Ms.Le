import Link from "next/link";

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { href: string; label: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1 text-xs text-stone-500">
            {crumbs.map((c) => (
              <span key={c.href}>
                <Link href={c.href} className="hover:text-brand-600 hover:underline">
                  {c.label}
                </Link>
                <span className="mx-1.5">/</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

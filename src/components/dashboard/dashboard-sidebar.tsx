"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Anggota", href: "/dashboard/users" },
  { label: "Iuran", href: "/dashboard/payments" },
  { label: "Pembiayaan", href: "/dashboard/financing" },
  { label: "Pengeluaran", href: "/dashboard/expenses" },
  { label: "Simpanan", href: "/dashboard/savings" },
  { label: "Winding Kiosk", href: "/dashboard/kiosk" },
  { label: "SLA Queue", href: "/dashboard/sla" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-white">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Winding Treasury
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition bg-slate-900 text-white"
                    : "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

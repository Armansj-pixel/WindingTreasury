import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { ExpenseCreateDialog } from "@/components/dashboard/expenses/expense-create-dialog";

export const dynamic = "force-dynamic";

function formatCurrency(value?: number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status?: string | null) {
  const value = (status || "PAID").toUpperCase();

  if (value === "PAID") {
    return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (value === "PENDING") {
    return "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700";
  }

  return "inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700";
}

type SearchParams = {
  q?: string;
  status?: string;
  category?: string;
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const q = (params.q || "").trim().toLowerCase();
  const statusFilter = (params.status || "ALL").toUpperCase();
  const categoryFilter = (params.category || "ALL").toLowerCase();

  const supabase = createSupabaseAdminClient();

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("tgl", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = (expenses || []).filter((item: any) => {
    const code = item.expense_code || item.exp_code || "";
    const title = item.title || item.deskripsi || "";
    const status = item.status || "PAID";
    const category = item.category || item.kategori || "";

    const matchesQuery =
      !q ||
      String(title).toLowerCase().includes(q) ||
      String(code).toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      String(status).toUpperCase() === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      String(category).toLowerCase() === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const totalExpense = rows.reduce((sum: number, item: any) => {
    return sum + Number(item.amount ?? item.nominal ?? 0);
  }, 0);

  const paidCount = rows.filter(
    (item: any) => String(item.status || "PAID").toUpperCase() === "PAID"
  ).length;

  const categories = Array.from(
    new Set(
      (expenses || [])
        .map((item: any) => item.category || item.kategori)
        .filter(Boolean)
    )
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Modul Pengeluaran</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Pengeluaran Koperasi
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola seluruh pengeluaran operasional dan transaksi kas keluar.
            </p>
          </div>

          <ExpenseCreateDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Pengeluaran</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Transaksi Dibayar</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{paidCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Jumlah Data</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{rows.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Daftar Pengeluaran
          </h2>
          <p className="text-sm text-slate-500">
            Pencatatan seluruh transaksi pengeluaran koperasi.
          </p>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_120px]">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Cari judul / kode pengeluaran"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />

            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="ALL">Semua Status</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="DRAFT">DRAFT</option>
            </select>

            <select
              name="category"
              defaultValue={params.category || "ALL"}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Filter
            </button>
          </form>
        </div>

        {error ? (
          <div className="px-6 py-10 text-sm text-red-600">
            Gagal memuat data pengeluaran: {error.message}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            Belum ada data pengeluaran yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Judul</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.expense_code || row.exp_code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.title || row.deskripsi}
                    </td>
                    <td className="px-4 py-3">{row.category || row.kategori || "-"}</td>
                    <td className="px-4 py-3">
                      {formatDate(row.expense_date || row.tgl)}
                    </td>
                    <td className="px-4 py-3">
                      {row.payment_method || row.pos || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-rose-700">
                      {formatCurrency(row.amount ?? row.nominal)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(row.status || "PAID")}>
                        {row.status || "PAID"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/expenses/${row.id}`}
                        className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

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

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: expense, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !expense) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/expenses"
          className="inline-flex w-fit items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Kembali ke Pengeluaran
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Detail Pengeluaran</p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {expense.expense_code}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Informasi lengkap transaksi pengeluaran koperasi.
              </p>
            </div>

            <span className={getStatusBadge(expense.status)}>{expense.status}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Judul</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{expense.title}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Kategori</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {expense.category || "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Tanggal</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {formatDate(expense.expense_date)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Metode</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {expense.payment_method || "-"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Informasi Pengeluaran</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Kode Pengeluaran</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {expense.expense_code}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Jumlah</p>
              <p className="mt-1 text-base font-semibold text-rose-700">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Status</p>
              <div className="mt-2">
                <span className={getStatusBadge(expense.status)}>{expense.status}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Dibuat Pada</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {formatDate(expense.created_at)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Catatan</p>
            <p className="mt-1 text-sm text-slate-700">{expense.notes || "-"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Ringkasan Transaksi</h2>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-rose-50 p-4">
              <p className="text-xs text-rose-600">Nominal Pengeluaran</p>
              <p className="mt-1 text-lg font-semibold text-rose-700">
                {formatCurrency(expense.amount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Kategori</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {expense.category || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Metode Pembayaran</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {expense.payment_method || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

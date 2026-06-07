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

export default async function DashboardPage() {
  const supabase = createSupabaseAdminClient();

  const [
    { count: totalMembers, error: membersError },
    { data: payments, error: paymentsError },
    { data: savings, error: savingsError },
    { data: financing, error: financingError },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),

    supabase
      .from("payments")
      .select("nominal, amount"),

    supabase
      .from("savings")
      .select("amount, nominal"),

    supabase
      .from("financing")
      .select("id, status"),
  ]);

  const totalPayments = (payments || []).reduce((sum: number, item: any) => {
    return sum + Number(item.nominal ?? item.amount ?? 0);
  }, 0);

  const totalSavings = (savings || []).reduce((sum: number, item: any) => {
    return sum + Number(item.amount ?? item.nominal ?? 0);
  }, 0);

  const activeFinancing = (financing || []).filter((item: any) => {
    const status = String(item.status || "").toUpperCase();
    return status === "AKTIF" || status === "ACTIVE" || status === "BERJALAN";
  }).length;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Selamat datang</h1>
        <p className="mt-2 text-sm text-slate-500">
          Dashboard admin Winding Treasury sedang kita bangun bertahap.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Anggota</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {totalMembers ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Iuran</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalPayments)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Simpanan</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalSavings)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pembiayaan Aktif</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {activeFinancing}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Ringkasan Sistem</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Data anggota</span>
              <span>{membersError ? "Error" : "OK"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data iuran</span>
              <span>{paymentsError ? "Error" : "OK"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data simpanan</span>
              <span>{savingsError ? "Error" : "OK"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data pembiayaan</span>
              <span>{financingError ? "Error" : "OK"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Statistik Cepat</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Rata-rata iuran per anggota</span>
              <span>
                {formatCurrency(
                  (totalMembers ?? 0) > 0 ? totalPayments / (totalMembers ?? 1) : 0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total transaksi iuran</span>
              <span>{payments?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total transaksi simpanan</span>
              <span>{savings?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total pembiayaan tercatat</span>
              <span>{financing?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

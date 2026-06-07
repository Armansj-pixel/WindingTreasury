import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { FinancingCreateDialog } from "@/components/dashboard/financing/financing-create-dialog";

export const dynamic = "force-dynamic";

function formatCurrency(value?: number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status?: string | null) {
  const value = (status || "AKTIF").toUpperCase();

  if (value === "LUNAS") {
    return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (value === "MACET") {
    return "inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";
  }

  return "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700";
}

export default async function FinancingPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: financing, error }, { data: paymentRows }] = await Promise.all([
    supabase.from("financing").select("*").order("created_at", { ascending: false }),
    supabase.from("financing_payments").select("financing_id, amount_paid"),
  ]);

  const paymentMap = new Map<string, number>();

  for (const row of paymentRows || []) {
    const financingId = row.financing_id;
    const amount = Number(row.amount_paid ?? 0);

    paymentMap.set(financingId, (paymentMap.get(financingId) || 0) + amount);
  }

  const financingWithStats = (financing || []).map((item: any) => {
    const totalAmount = Number(item.total_amount ?? 0);
    const totalPaid = Number(paymentMap.get(item.id) || 0);
    const remainingAmount = Math.max(totalAmount - totalPaid, 0);

    let computedStatus = (item.status || "AKTIF").toUpperCase();
    if (remainingAmount <= 0 && totalAmount > 0) {
      computedStatus = "LUNAS";
    }

    return {
      ...item,
      total_paid: totalPaid,
      remaining_amount: remainingAmount,
      computed_status: computedStatus,
    };
  });

  const totalFinancing = financingWithStats.reduce((sum: number, item: any) => {
    return sum + Number(item.total_amount ?? 0);
  }, 0);

  const activeCount = financingWithStats.filter(
    (item: any) => item.computed_status === "AKTIF"
  ).length;

  const memberCount = new Set(
    financingWithStats.map((item: any) => item.user_id).filter(Boolean)
  ).size;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Modul Pembiayaan</p>
            <h1 className="text-2xl font-semibold text-slate-900">Pembiayaan Anggota</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola pengajuan dan pencatatan pembiayaan anggota.
            </p>
          </div>

          <FinancingCreateDialog members={[]} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Pembiayaan</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalFinancing)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pembiayaan Aktif</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Anggota</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {memberCount}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Riwayat Pembiayaan</h2>
          <p className="text-sm text-slate-500">
            Daftar pembiayaan yang tercatat beserta progres pembayarannya.
          </p>
        </div>

        {error ? (
          <div className="px-6 py-10 text-sm text-red-600">
            Gagal memuat data pembiayaan: {error.message}
          </div>
        ) : !financingWithStats || financingWithStats.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            Belum ada data pembiayaan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Anggota</th>
                  <th className="px-4 py-3 font-medium">Akad</th>
                  <th className="px-4 py-3 font-medium">Pokok</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Terbayar</th>
                  <th className="px-4 py-3 font-medium">Sisa</th>
                  <th className="px-4 py-3 font-medium">Tenor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {financingWithStats.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.financing_code}</td>
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3">{row.akad}</td>
                    <td className="px-4 py-3">{formatCurrency(row.principal_amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.margin_amount)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(row.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">
                      {formatCurrency(row.total_paid)}
                    </td>
                    <td className="px-4 py-3 text-amber-700 font-medium">
                      {formatCurrency(row.remaining_amount)}
                    </td>
                    <td className="px-4 py-3">{row.tenor_months} bulan</td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(row.computed_status)}>
                        {row.computed_status}
                      </span>
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

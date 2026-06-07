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

export default async function FinancingPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: users }, { data: financing, error }] = await Promise.all([
    supabase.from("users").select("id, nama, email").order("nama", { ascending: true }),
    supabase.from("financing").select("*").order("created_at", { ascending: false }),
  ]);

  const members = (users || []).map((item: any) => ({
    id: item.id,
    full_name: item.nama || item.email || "Tanpa Nama",
  }));

  const totalFinancing = (financing || []).reduce((sum: number, item: any) => {
    return sum + Number(item.total_amount ?? 0);
  }, 0);

  const activeFinancing = (financing || []).filter((item: any) => {
    const status = String(item.status || "").toUpperCase();
    return status === "AKTIF" || status === "ACTIVE" || status === "BERJALAN";
  }).length;

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

          <FinancingCreateDialog members={members} />
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
            {activeFinancing}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Anggota</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {users?.length ?? 0}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Riwayat Pembiayaan</h2>
          <p className="text-sm text-slate-500">
            Daftar pembiayaan yang tercatat.
          </p>
        </div>

        {error ? (
          <div className="px-6 py-10 text-sm text-red-600">
            Gagal memuat data pembiayaan: {error.message}
          </div>
        ) : !financing || financing.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            Belum ada data pembiayaan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Anggota</th>
                  <th className="px-4 py-3 font-medium">Akad</th>
                  <th className="px-4 py-3 font-medium">Pokok</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Tenor</th>
                  <th className="px-4 py-3 font-medium">Angsuran</th>
                  <th className="px-4 py-3 font-medium">Mulai</th>
                  <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {financing.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.financing_code}</td>
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3">{row.akad}</td>
                    <td className="px-4 py-3">{formatCurrency(row.principal_amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.margin_amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.total_amount)}</td>
                    <td className="px-4 py-3">{row.tenor_months} bulan</td>
                    <td className="px-4 py-3">{formatCurrency(row.monthly_installment)}</td>
                    <td className="px-4 py-3">{formatDate(row.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(row.due_date)}</td>
                    <td className="px-4 py-3">{row.status}</td>
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

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

export default async function SavingsPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: users }, { data: savings, error }] = await Promise.all([
    supabase.from("users").select("id, nama, email").order("nama", { ascending: true }),
    supabase.from("savings").select("*").order("created_at", { ascending: false }),
  ]);

  const totalSavings = (savings || []).reduce((sum: number, item: any) => {
    return sum + Number(item.nominal ?? 0);
  }, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Modul Simpanan</p>
            <h1 className="text-2xl font-semibold text-slate-900">Simpanan Anggota</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pencatatan simpanan Wadiah dan Mudharabah.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Simpanan</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalSavings)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Transaksi</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {savings?.length ?? 0}
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
          <h2 className="text-base font-semibold text-slate-900">Riwayat Simpanan</h2>
          <p className="text-sm text-slate-500">
            Daftar setoran simpanan anggota.
          </p>
        </div>

        {error ? (
          <div className="px-6 py-10 text-sm text-red-600">
            Gagal memuat data simpanan: {error.message}
          </div>
        ) : !savings || savings.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            Belum ada data simpanan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Anggota</th>
                  <th className="px-4 py-3 font-medium">Jenis</th>
                  <th className="px-4 py-3 font-medium">Nominal</th>
                  <th className="px-4 py-3 font-medium">Tanggal Setor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {savings.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.saving_code}</td>
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3">{row.jenis_simpanan}</td>
                    <td className="px-4 py-3">{formatCurrency(row.nominal)}</td>
                    <td className="px-4 py-3">{formatDate(row.tanggal_setor)}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{row.catatan || "-"}</td>
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

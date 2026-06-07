import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { FinancingPaymentCreateDialog } from "@/components/dashboard/financing-payments/financing-payment-create-dialog";

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

export default async function FinancingPaymentsPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: financing }, { data: payments, error }] = await Promise.all([
    supabase.from("financing").select("*").order("created_at", { ascending: false }),
    supabase.from("financing_payments").select("*").order("payment_date", { ascending: false }),
  ]);

  const totalPaid = (payments || []).reduce((sum: number, item: any) => {
    return sum + Number(item.amount_paid ?? 0);
  }, 0);

  const totalTransactions = payments?.length ?? 0;
  const totalActiveFinancing = financing?.length ?? 0;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Modul Pembayaran Pinjaman</p>
            <h1 className="text-2xl font-semibold text-slate-900">Angsuran Pembiayaan</h1>
            <p className="mt-1 text-sm text-slate-500">
              Catat pembayaran cicilan untuk Qardh dan Murabahah.
            </p>
          </div>

          <FinancingPaymentCreateDialog financingList={financing || []} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Pembayaran</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(totalPaid)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Transaksi Angsuran</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {totalTransactions}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Data Pembiayaan</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {totalActiveFinancing}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Riwayat Pembayaran</h2>
          <p className="text-sm text-slate-500">
            Daftar transaksi pembayaran angsuran anggota.
          </p>
        </div>

        {error ? (
          <div className="px-6 py-10 text-sm text-red-600">
            Gagal memuat data pembayaran: {error.message}
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            Belum ada pembayaran angsuran.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode Bayar</th>
                  <th className="px-4 py-3 font-medium">Kode Pembiayaan</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Akad</th>
                  <th className="px-4 py-3 font-medium">Angsuran Ke</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.payment_code}</td>
                    <td className="px-4 py-3">{row.financing_code}</td>
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3">{row.akad}</td>
                    <td className="px-4 py-3">{row.installment_number}</td>
                    <td className="px-4 py-3">{formatCurrency(row.amount_paid)}</td>
                    <td className="px-4 py-3">{formatDate(row.payment_date)}</td>
                    <td className="px-4 py-3">{row.payment_method || "-"}</td>
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

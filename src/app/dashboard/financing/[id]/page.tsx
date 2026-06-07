import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { PrintButton } from "@/components/dashboard/print-button";

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
  const value = (status || "AKTIF").toUpperCase();

  if (value === "LUNAS") {
    return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (value === "MACET") {
    return "inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";
  }

  return "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700";
}

export default async function FinancingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const [{ data: financing, error: financingError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase.from("financing").select("*").eq("id", id).single(),
      supabase
        .from("financing_payments")
        .select("*")
        .eq("financing_id", id)
        .order("installment_number", { ascending: true })
        .order("payment_date", { ascending: true }),
    ]);

  if (financingError || !financing) {
    notFound();
  }

  const totalAmount = Number(financing.total_amount ?? 0);
  const totalPaid = (payments || []).reduce((sum: number, item: any) => {
    return sum + Number(item.amount_paid ?? 0);
  }, 0);

  const remainingAmount = Math.max(totalAmount - totalPaid, 0);
  const progressPercent =
    totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

  let computedStatus = (financing.status || "AKTIF").toUpperCase();
  if (remainingAmount <= 0 && totalAmount > 0) {
    computedStatus = "LUNAS";
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          html, body {
            background: white !important;
          }

          .print-hide {
            display: none !important;
          }

          .print-root {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #dbe4ee !important;
            border-radius: 16px !important;
            background: white !important;
          }

          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #dbe4ee;
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
          }

          .print-table th {
            background: #f8fafc !important;
            color: #334155 !important;
            font-weight: 600;
          }

          .print-muted {
            color: #64748b !important;
          }

          .print-title {
            font-size: 22px !important;
            line-height: 1.2;
            font-weight: 700;
            color: #0f172a !important;
          }

          .print-subtitle {
            font-size: 12px !important;
            color: #64748b !important;
          }

          .print-grid-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .print-grid-3 {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }

          .print-badge {
            display: inline-flex;
            border: 1px solid #cbd5e1;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            color: #0f172a !important;
            background: #f8fafc !important;
          }

          .print-bar-wrap {
            height: 10px;
            border-radius: 999px;
            background: #e2e8f0 !important;
            overflow: hidden;
          }

          .print-bar {
            height: 100%;
            background: #10b981 !important;
          }
        }
      `}</style>

      <section className="print-root space-y-6">
        <div className="print-hide flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard/financing"
              className="inline-flex w-fit items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ← Kembali ke Pembiayaan
            </Link>

            <PrintButton />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Detail Pembiayaan</p>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {financing.financing_code}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Detail pinjaman dan riwayat pembayaran anggota.
                </p>
              </div>

              <span className={getStatusBadge(computedStatus)}>{computedStatus}</span>
            </div>
          </div>
        </div>

        <div className="print-section print-card hidden p-6 print:block">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="print-subtitle">Winding Treasury</p>
              <h1 className="print-title mt-1">Laporan Detail Pembiayaan</h1>
              <p className="print-subtitle mt-2">
                Dokumen ringkasan pembiayaan anggota beserta riwayat angsuran.
              </p>
            </div>

            <div className="text-right">
              <p className="print-subtitle">Dicetak pada</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>

        <div className="print-section grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
          <div className="print-card rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Nama Anggota</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{financing.nama}</p>
          </div>

          <div className="print-card rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Akad</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{financing.akad}</p>
          </div>

          <div className="print-card rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Tenor</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {financing.tenor_months} bulan
            </p>
          </div>

          <div className="print-card rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Status</p>
            <div className="mt-3">
              <span className="print-badge">{computedStatus}</span>
              <span className="hidden print:inline-flex print-badge">{computedStatus}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3 print:grid-cols-1">
          <div className="print-card rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2 print:col-span-1">
            <h2 className="text-base font-semibold text-slate-900">Informasi Pembiayaan</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 print-grid-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Kode Pembiayaan</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {financing.financing_code}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Angsuran / Bulan</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatCurrency(financing.monthly_installment)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Pokok</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatCurrency(financing.principal_amount)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Margin</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatCurrency(financing.margin_amount)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total Pembiayaan</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatCurrency(financing.total_amount)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Tujuan</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {financing.purpose || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Tanggal Mulai</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatDate(financing.start_date)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Jatuh Tempo</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {formatDate(financing.due_date)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Catatan</p>
              <p className="mt-1 text-sm text-slate-700">{financing.notes || "-"}</p>
            </div>
          </div>

          <div className="print-card rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">Progres Pelunasan</h2>

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium text-slate-900">
                    {progressPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 print-bar-wrap">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all print-bar"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">Total Terbayar</p>
                <p className="mt-1 text-lg font-semibold text-emerald-700">
                  {formatCurrency(totalPaid)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-amber-50 p-4">
                <p className="text-xs text-amber-600">Sisa Tagihan</p>
                <p className="mt-1 text-lg font-semibold text-amber-700">
                  {formatCurrency(remainingAmount)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Jumlah Angsuran Tercatat</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {payments?.length || 0} transaksi
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="print-section print-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Riwayat Angsuran</h2>
            <p className="text-sm text-slate-500">
              Daftar pembayaran yang sudah masuk untuk pembiayaan ini.
            </p>
          </div>

          {paymentsError ? (
            <div className="px-6 py-10 text-sm text-red-600">
              Gagal memuat riwayat pembayaran: {paymentsError.message}
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              Belum ada pembayaran untuk pembiayaan ini.
            </div>
          ) : (
            <>
              <div className="space-y-4 p-4 sm:p-6 print:hidden">
                {payments.map((row: any) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {row.payment_code}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Angsuran ke-{row.installment_number}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-500">Jumlah Pembayaran</p>
                        <p className="text-base font-semibold text-emerald-700">
                          {formatCurrency(row.amount_paid)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs text-slate-500">Tanggal</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatDate(row.payment_date)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs text-slate-500">Metode</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {row.payment_method || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2 xl:col-span-2">
                        <p className="text-xs text-slate-500">Catatan</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {row.notes || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden p-6 print:block">
                <table className="print-table text-sm">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode Bayar</th>
                      <th>Angsuran Ke</th>
                      <th>Tanggal</th>
                      <th>Jumlah</th>
                      <th>Metode</th>
                      <th>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((row: any, index: number) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.payment_code}</td>
                        <td>{row.installment_number}</td>
                        <td>{formatDate(row.payment_date)}</td>
                        <td>{formatCurrency(row.amount_paid)}</td>
                        <td>{row.payment_method || "-"}</td>
                        <td>{row.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

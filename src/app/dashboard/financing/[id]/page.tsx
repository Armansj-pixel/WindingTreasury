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
            margin: 16mm 14mm 20mm 14mm;
          }

          html, body {
            background: #fff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-hide {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .print-root {
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #dbe4ee !important;
            background: #fff !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-header {
            margin-bottom: 20px;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
          }

          .print-header-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .print-brand {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #334155 !important;
          }

          .print-title {
            margin-top: 6px;
            font-size: 24px;
            line-height: 1.2;
            font-weight: 700;
            color: #0f172a !important;
          }

          .print-subtitle {
            margin-top: 4px;
            font-size: 12px;
            color: #64748b !important;
          }

          .print-meta {
            min-width: 220px;
            border: 1px solid #dbe4ee;
            border-radius: 12px;
            padding: 12px;
            background: #f8fafc !important;
          }

          .print-meta-label {
            font-size: 11px;
            color: #64748b !important;
          }

          .print-meta-value {
            margin-top: 3px;
            font-size: 13px;
            font-weight: 600;
            color: #0f172a !important;
          }

          .print-grid-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .print-grid-4 {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 12px;
          }

          .print-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #cbd5e1;
            border-radius: 999px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            background: #f8fafc !important;
            color: #0f172a !important;
          }

          .print-bar-wrap {
            height: 10px;
            border-radius: 999px;
            overflow: hidden;
            background: #e2e8f0 !important;
          }

          .print-bar {
            height: 100%;
            background: #10b981 !important;
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
            font-size: 12px;
          }

          .print-table th {
            background: #f8fafc !important;
            color: #334155 !important;
            font-weight: 700;
          }

          .print-signature-section {
            margin-top: 28px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-signature-box {
            min-height: 120px;
          }

          .print-signature-label {
            font-size: 12px;
            color: #475569 !important;
          }

          .print-signature-space {
            height: 64px;
          }

          .print-signature-line {
            border-top: 1px solid #94a3b8;
            padding-top: 8px;
          }

          .print-footer-note {
            margin-top: 18px;
            font-size: 11px;
            color: #64748b !important;
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

        <div className="hidden print-only print-header">
          <div className="print-header-top">
            <div>
              <p className="print-brand">Winding Treasury</p>
              <h1 className="print-title">Laporan Detail Pembiayaan</h1>
              <p className="print-subtitle">
                Dokumen resmi ringkasan pembiayaan anggota, progres pelunasan,
                dan riwayat angsuran.
              </p>
            </div>

            <div className="print-meta">
              <div>
                <p className="print-meta-label">Kode Pembiayaan</p>
                <p className="print-meta-value">{financing.financing_code}</p>
              </div>
              <div className="mt-3">
                <p className="print-meta-label">Nama Anggota</p>
                <p className="print-meta-value">{financing.nama}</p>
              </div>
              <div className="mt-3">
                <p className="print-meta-label">Tanggal Cetak</p>
                <p className="print-meta-value">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 print-grid-4">
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

        <div className="print-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
              <div className="print-hide space-y-4 p-4 sm:p-6">
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
                <table className="print-table">
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

                <div className="print-signature-section">
                  <div className="print-signature-box">
                    <p className="print-signature-label">Mengetahui,</p>
                    <div className="print-signature-space" />
                    <div className="print-signature-line">
                      <p className="text-sm font-semibold text-slate-900">
                        Ketua / Pengelola
                      </p>
                    </div>
                  </div>

                  <div className="print-signature-box">
                    <p className="print-signature-label">
                      Admin,
                      <span className="ml-1">
                        {formatDate(new Date().toISOString())}
                      </span>
                    </p>
                    <div className="print-signature-space" />
                    <div className="print-signature-line">
                      <p className="text-sm font-semibold text-slate-900">
                        Admin Winding Treasury
                      </p>
                    </div>
                  </div>
                </div>

                <p className="print-footer-note">
                  Dokumen ini dicetak dari sistem Winding Treasury untuk kebutuhan
                  administrasi dan arsip pembiayaan anggota.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

import { PaymentRow } from "@/types/payment";
import { formatRupiah } from "@/lib/currency";
import { formatDate, formatMonthLabel } from "@/lib/date";

interface Props {
  rows: PaymentRow[];
}

export function PaymentsTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Anggota</th>
              <th className="px-4 py-3 font-semibold">Periode</th>
              <th className="px-4 py-3 font-semibold">Jenis</th>
              <th className="px-4 py-3 font-semibold">Metode</th>
              <th className="px-4 py-3 font-semibold">Nominal</th>
              <th className="px-4 py-3 font-semibold">Produktif</th>
              <th className="px-4 py-3 font-semibold">Sosial</th>
              <th className="px-4 py-3 font-semibold">Operasional</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.member_name}</td>
                  <td className="px-4 py-3 text-slate-600">{formatMonthLabel(row.payment_period)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.payment_type}</td>
                  <td className="px-4 py-3 text-slate-600">{row.payment_method}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatRupiah(row.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatRupiah(row.productive_amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatRupiah(row.social_amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatRupiah(row.operational_amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(row.paid_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  Belum ada data iuran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

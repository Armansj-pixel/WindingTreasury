type PaymentRow = {
  id: string;
  payment_code: string;
  user_id: string;
  member_name: string;
  payment_period: string;
  payment_type: string;
  payment_method: string;
  amount: number;
  productive_amount: number;
  social_amount: number;
  operational_amount: number;
  paid_at: string | null;
  notes: string | null;
  created_at: string | null;
};

interface PaymentsTableProps {
  rows: PaymentRow[];
}

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

export function PaymentsTable({ rows }: PaymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">Riwayat Iuran</h2>
        <p className="text-sm text-slate-500">
          Daftar pembayaran iuran anggota yang sudah tercatat.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          Belum ada data iuran.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Anggota</th>
                <th className="px-4 py-3 font-medium">Bulan</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Metode</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Produktif</th>
                <th className="px-4 py-3 font-medium">Sosial</th>
                <th className="px-4 py-3 font-medium">Operasional</th>
                <th className="px-4 py-3 font-medium">Tgl Bayar</th>
                <th className="px-4 py-3 font-medium">Dicatat</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.id} className="text-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.payment_code}
                  </td>
                  <td className="px-4 py-3">{row.member_name}</td>
                  <td className="px-4 py-3">{row.payment_period}</td>
                  <td className="px-4 py-3">{row.payment_type}</td>
                  <td className="px-4 py-3">{row.payment_method}</td>
                  <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-3">{formatCurrency(row.productive_amount)}</td>
                  <td className="px-4 py-3">{formatCurrency(row.social_amount)}</td>
                  <td className="px-4 py-3">{formatCurrency(row.operational_amount)}</td>
                  <td className="px-4 py-3">{formatDate(row.paid_at)}</td>
                  <td className="px-4 py-3">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3">{row.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

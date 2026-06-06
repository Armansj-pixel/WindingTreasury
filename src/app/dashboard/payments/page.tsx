import { requireAdmin } from "@/lib/auth-admin";

export default async function PaymentsPage() {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-500">Modul Keuangan</p>
        <h1 className="text-2xl font-semibold text-slate-900">Iuran Anggota</h1>
        <p className="mt-1 text-sm text-slate-500">
          Auth guard berhasil, lanjut tes komponen berikutnya.
        </p>
      </div>
    </section>
  );
}

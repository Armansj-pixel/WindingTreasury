export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Selamat datang</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Dashboard admin Winding Treasury sedang kita bangun bertahap.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Anggota</p>
          <p className="mt-2 text-2xl font-bold">-</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Simpanan</p>
          <p className="mt-2 text-2xl font-bold">-</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Pembiayaan Aktif</p>
          <p className="mt-2 text-2xl font-bold">-</p>
        </div>
      </div>
    </section>
  )
}

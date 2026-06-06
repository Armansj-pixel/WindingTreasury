import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: caller, error: callerError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerError || caller?.role !== 'ADMIN') {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Akses ditolak</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Halaman ini hanya untuk admin.
        </p>
      </section>
    )
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, nama, email, departemen, role, status, no_hp, tgl_gabung, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Gagal memuat anggota</h1>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold">Daftar Anggota</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Data anggota yang terdaftar di sistem
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Departemen</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.nama}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.departemen ?? '-'}</td>
                  <td className="px-4 py-3">{item.role}</td>
                  <td className="px-4 py-3">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

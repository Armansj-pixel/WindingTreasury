'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddUserModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    departemen: '',
    no_hp: '',
    role: 'USER',
    catatan: '',
  })

  function updateField(name: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Gagal menambahkan anggota')
        setLoading(false)
        return
      }

      setSuccess('Anggota berhasil ditambahkan')
      setForm({
        nama: '',
        email: '',
        password: '',
        departemen: '',
        no_hp: '',
        role: 'USER',
        catatan: '',
      })

      router.refresh()

      setTimeout(() => {
        setOpen(false)
        setSuccess('')
      }, 800)
    } catch {
      setError('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
      >
        + Tambah Anggota
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tambah Anggota</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Nama</label>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => updateField('nama', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Departemen</label>
                <input
                  value={form.departemen}
                  onChange={(e) => updateField('departemen', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">No HP</label>
                <input
                  value={form.no_hp}
                  onChange={(e) => updateField('no_hp', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Catatan</label>
                <textarea
                  rows={3}
                  value={form.catatan}
                  onChange={(e) => updateField('catatan', e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              {error ? (
                <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="md:col-span-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </p>
              ) : null}

              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border px-4 py-2 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

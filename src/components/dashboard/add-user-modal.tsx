'use client'

import { useState } from 'react'

type Props = {
  onSuccess?: () => void
}

export default function AddUserModal({ onSuccess }: Props) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      onSuccess?.()
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
      }, 900)
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

            <form onSubmit={handleSubmit} className="mt-4 

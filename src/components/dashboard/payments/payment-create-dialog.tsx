"use client";

import { useState, useTransition } from "react";

type MemberOption = {
  id: string;
  full_name: string;
};

interface Props {
  members: MemberOption[];
}

export function PaymentCreateDialog({ members }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const payload = {
        user_id: formData.get("user_id"),
        payment_period: formData.get("payment_period"),
        payment_type: formData.get("payment_type"),
        payment_method: formData.get("payment_method"),
        amount: Number(formData.get("amount")),
        paid_at: formData.get("paid_at"),
        notes: formData.get("notes"),
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Gagal menambahkan iuran.");
        return;
      }

      setSuccess("Iuran berhasil ditambahkan.");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Tambah Iuran
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Tambah Iuran</h3>
                <p className="text-sm text-slate-500">
                  Input pembayaran iuran anggota.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form action={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Anggota
                </label>
                <select
                  name="user_id"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                >
                  <option value="">Pilih anggota</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Periode
                  </label>
                  <input
                    type="month"
                    name="payment_period"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tanggal Bayar
                  </label>
                  <input
                    type="date"
                    name="paid_at"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Jenis Iuran
                  </label>
                  <select
                    name="payment_type"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  >
                    <option value="WAJIB">Wajib</option>
                    <option value="SUKARELA">Sukarela</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Metode
                  </label>
                  <select
                    name="payment_method"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                  >
                    <option value="CASH">Cash</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="EWALLET">E-Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nominal
                </label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  required
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Opsional"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </div>

              {error ? (
                <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {pending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  full_name: string;
}

interface Props {
  members: Member[];
}

export function PaymentCreateDialog({ members }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_id: "",
    payment_period: "",
    payment_type: "WAJIB",
    payment_method: "TUNAI",
    amount: "",
    paid_at: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const selectedMember = members.find((m) => m.id === form.user_id);

    if (!selectedMember) {
      setErrorMsg("Silakan pilih anggota terlebih dahulu.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: form.user_id,
      member_name: selectedMember.full_name,
      payment_period: form.payment_period,
      payment_type: form.payment_type,
      payment_method: form.payment_method,
      amount: Number(form.amount),
      paid_at: form.paid_at,
      notes: form.notes,
    };

    console.log("PAYMENT_SUBMIT_PAYLOAD", payload);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result?.error || result?.details || result?.message || "Gagal menyimpan iuran."
        );
      }

      setOpen(false);
      setForm({
        user_id: "",
        payment_period: "",
        payment_type: "WAJIB",
        payment_method: "TUNAI",
        amount: "",
        paid_at: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan iuran.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        + Tambah Iuran
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tambah Iuran</h2>
                <p className="text-sm text-slate-500">Input pembayaran iuran anggota.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Anggota */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Anggota
                </label>
                <select
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Pilih anggota</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Periode / Bulan */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Periode (Bulan)
                </label>
                <select
                  name="payment_period"
                  value={form.payment_period}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Pilih bulan</option>
                  {[
                    "Januari","Februari","Maret","April","Mei","Juni",
                    "Juli","Agustus","September","Oktober","November","Desember",
                  ].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal Bayar */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tanggal Bayar
                </label>
                <input
                  type="date"
                  name="paid_at"
                  value={form.paid_at}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* Jenis Iuran */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Jenis Iuran
                </label>
                <select
                  name="payment_type"
                  value={form.payment_type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="WAJIB">Wajib</option>
                  <option value="SUKARELA">Sukarela</option>
                </select>
              </div>

              {/* Metode */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Metode
                </label>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="TUNAI">Cash</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="EWALLET">E-Wallet</option>
                </select>
              </div>

              {/* Nominal */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nominal
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min={1}
                  placeholder="50000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Opsional"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

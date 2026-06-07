"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface FinancingItem {
  id: string;
  financing_code: string;
  user_id: string;
  nama: string;
  akad: string;
  total_amount: number;
  tenor_months: number;
  monthly_installment: number;
  status?: string;
}

interface Props {
  financingList: FinancingItem[];
}

export function FinancingPaymentCreateDialog({ financingList }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    financing_id: "",
    installment_number: "",
    amount_paid: "",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "TRANSFER",
    notes: "",
  });

  const selectedFinancing = useMemo(() => {
    return financingList.find((item) => item.id === form.financing_id) || null;
  }, [financingList, form.financing_id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!selectedFinancing) {
      setErrorMsg("Silakan pilih pembiayaan.");
      setLoading(false);
      return;
    }

    if (!form.installment_number || Number(form.installment_number) <= 0) {
      setErrorMsg("Angsuran ke wajib diisi.");
      setLoading(false);
      return;
    }

    if (!form.amount_paid || Number(form.amount_paid) <= 0) {
      setErrorMsg("Jumlah pembayaran wajib diisi.");
      setLoading(false);
      return;
    }

    const payload = {
      financing_id: selectedFinancing.id,
      financing_code: selectedFinancing.financing_code,
      user_id: selectedFinancing.user_id,
      nama: selectedFinancing.nama,
      akad: selectedFinancing.akad,
      installment_number: Number(form.installment_number),
      amount_paid: Number(form.amount_paid),
      payment_date: form.payment_date,
      payment_method: form.payment_method,
      notes: form.notes,
    };

    try {
      const res = await fetch("/api/financing-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const rawText = await res.text();

      let result: any = {};
      if (contentType.includes("application/json")) {
        result = JSON.parse(rawText);
      } else {
        throw new Error("API /api/financing-payments tidak mengembalikan JSON.");
      }

      if (!res.ok) {
        throw new Error(
          result?.error || result?.details || result?.message || "Gagal menyimpan pembayaran."
        );
      }

      setOpen(false);
      setForm({
        financing_id: "",
        installment_number: "",
        amount_paid: "",
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: "TRANSFER",
        notes: "",
      });

      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pembayaran.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        + Catat Pembayaran
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
          <div className="flex min-h-[100dvh] items-start justify-center p-3 sm:p-4 md:items-center">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)]">
              <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
                <div className="pr-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Catat Pembayaran Pinjaman
                  </h2>
                  <p className="text-sm text-slate-500">
                    Input transaksi angsuran anggota.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Pilih Pembiayaan
                      </label>
                      <select
                        name="financing_id"
                        value={form.financing_id}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      >
                        <option value="">Pilih data pembiayaan</option>
                        {financingList.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.financing_code} - {item.nama} - {item.akad}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedFinancing ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Nama</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selectedFinancing.nama}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Akad</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selectedFinancing.akad}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Tenor</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selectedFinancing.tenor_months} bulan
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Angsuran Standar</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            Rp {Math.round(selectedFinancing.monthly_installment || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Angsuran Ke
                        </label>
                        <input
                          type="number"
                          name="installment_number"
                          value={form.installment_number}
                          onChange={handleChange}
                          min={1}
                          required
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Jumlah Pembayaran
                        </label>
                        <input
                          type="number"
                          name="amount_paid"
                          value={form.amount_paid}
                          onChange={handleChange}
                          min={1}
                          required
                          placeholder="1000000"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Tanggal Pembayaran
                        </label>
                        <input
                          type="date"
                          name="payment_date"
                          value={form.payment_date}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Metode Pembayaran
                        </label>
                        <select
                          name="payment_method"
                          value={form.payment_method}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        >
                          <option value="TRANSFER">Transfer</option>
                          <option value="CASH">Cash</option>
                          <option value="QRIS">QRIS</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Catatan
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Opsional"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      />
                    </div>

                    {errorMsg ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMsg}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 sm:w-auto"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 sm:w-auto"
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

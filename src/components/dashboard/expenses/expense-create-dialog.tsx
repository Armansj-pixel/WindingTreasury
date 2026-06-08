"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = [
  "Operasional",
  "ATK",
  "Transport",
  "Konsumsi",
  "Perawatan",
  "Utilitas",
  "Lainnya",
];

const STATUS_OPTIONS = ["PAID", "PENDING", "DRAFT"];

// Ubah sesuai hasil query expenses_pos_check
const POS_OPTIONS = [
  { label: "Operasional", value: "OPERASIONAL" },
  { label: "Kantor", value: "KANTOR" },
  { label: "Lainnya", value: "LAINNYA" },
];

function generateExpenseCode() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `EXP-${Date.now().toString().slice(-6)}-${random}`;
}

export function ExpenseCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [pos, setPos] = useState(POS_OPTIONS[0].value);
  const [status, setStatus] = useState("PAID");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const expenseCode = useMemo(() => generateExpenseCode(), [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exp_code: expenseCode,
            expense_code: expenseCode,
            tgl: expenseDate || null,
            expense_date: expenseDate || null,
            deskripsi: title,
            title,
            nominal: Number(amount || 0),
            amount: Number(amount || 0),
            pos,
            payment_method: pos,
            kategori: category,
            category,
            status,
            catatan: notes,
            notes,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Gagal menambahkan pengeluaran");
        }

        setOpen(false);
        setTitle("");
        setCategory(CATEGORY_OPTIONS[0]);
        setAmount("");
        setExpenseDate("");
        setPos(POS_OPTIONS[0].value);
        setStatus("PAID");
        setNotes("");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        + Tambah Pengeluaran
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-3 sm:p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[92vh]">
              <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Tambah Pengeluaran
                    </h2>
                    <p className="text-sm text-slate-500">
                      Catat transaksi pengeluaran baru ke sistem.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Kode Pengeluaran
                      </label>
                      <input
                        value={expenseCode}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Judul Pengeluaran
                      </label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Pembelian ATK kantor"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Kategori
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      >
                        {CATEGORY_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Pos Pengeluaran
                      </label>
                      <select
                        value={pos}
                        onChange={(e) => setPos(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      >
                        {POS_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      >
                        {STATUS_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Catatan
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Tambahkan catatan jika diperlukan"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}
                </div>

                <div className="shrink-0 border-t border-slate-200 px-4 py-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {isPending ? "Menyimpan..." : "Simpan Pengeluaran"}
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

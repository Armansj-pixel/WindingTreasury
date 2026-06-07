"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  full_name: string;
}

interface Props {
  members: Member[];
}

function addMonthsToDate(dateString: string, months: number) {
  if (!dateString || !months) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function FinancingCreateDialog({ members }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_id: "",
    akad: "MURABAHAH",
    principal_amount: "",
    margin_amount: "",
    tenor_months: "12",
    start_date: new Date().toISOString().slice(0, 10),
    purpose: "",
    notes: "",
  });

  const totalAmount = useMemo(() => {
    return Number(form.principal_amount || 0) + Number(form.margin_amount || 0);
  }, [form.principal_amount, form.margin_amount]);

  const monthlyInstallment = useMemo(() => {
    const tenor = Number(form.tenor_months || 0);
    if (!tenor) return 0;
    return totalAmount / tenor;
  }, [totalAmount, form.tenor_months]);

  const dueDate = useMemo(() => {
    return addMonthsToDate(form.start_date, Number(form.tenor_months || 0));
  }, [form.start_date, form.tenor_months]);

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

    const selectedMember = members.find((m) => m.id === form.user_id);

    if (!selectedMember) {
      setErrorMsg("Silakan pilih anggota.");
      setLoading(false);
      return;
    }

    if (!form.principal_amount || Number(form.principal_amount) <= 0) {
      setErrorMsg("Pokok pembiayaan wajib diisi.");
      setLoading(false);
      return;
    }

    if (!form.tenor_months || Number(form.tenor_months) <= 0) {
      setErrorMsg("Tenor wajib diisi.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: form.user_id,
      nama: selectedMember.full_name,
      akad: form.akad,
      principal_amount: Number(form.principal_amount),
      margin_amount: Number(form.margin_amount || 0),
      total_amount: totalAmount,
      tenor_months: Number(form.tenor_months),
      monthly_installment: monthlyInstallment,
      start_date: form.start_date,
      due_date: dueDate,
      purpose: form.purpose,
      notes: form.notes,
    };

    try {
      const res = await fetch("/api/financing", {
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
        throw new Error("API /api/financing tidak mengembalikan JSON.");
      }

      if (!res.ok) {
        throw new Error(
          result?.error || result?.details || result?.message || "Gagal menyimpan pembiayaan."
        );
      }

      setOpen(false);
      setForm({
        user_id: "",
        akad: "MURABAHAH",
        principal_amount: "",
        margin_amount: "",
        tenor_months: "12",
        start_date: new Date().toISOString().slice(0, 10),
        purpose: "",
        notes: "",
      });

      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pembiayaan.");
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
        + Tambah Pembiayaan
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Tambah Pembiayaan
                </h2>
                <p className="text-sm text-slate-500">
                  Input pembiayaan anggota dengan akad dan tenor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Akad
                  </label>
                  <select
                    name="akad"
                    value={form.akad}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="MURABAHAH">Murabahah</option>
                    <option value="MUDHARABAH">Mudharabah</option>
                    <option value="QARDH">Qardh</option>
                    <option value="IJARAH">Ijarah</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tenor (bulan)
                  </label>
                  <input
                    type="number"
                    name="tenor_months"
                    value={form.tenor_months}
                    onChange={handleChange}
                    min={1}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Pokok Pembiayaan
                  </label>
                  <input
                    type="number"
                    name="principal_amount"
                    value={form.principal_amount}
                    onChange={handleChange}
                    min={1}
                    required
                    placeholder="10000000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Margin
                  </label>
                  <input
                    type="number"
                    name="margin_amount"
                    value={form.margin_amount}
                    onChange={handleChange}
                    min={0}
                    placeholder="1000000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Pembiayaan</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Rp {Math.round(totalAmount).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Angsuran / Bulan</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Rp {Math.round(monthlyInstallment).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Jatuh Tempo</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {dueDate || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tujuan Pembiayaan
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Modal usaha, pendidikan, kebutuhan darurat, dll"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

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

              {errorMsg ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMsg}
                </div>
              ) : null}

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
      ) : null}
    </>
  );
}

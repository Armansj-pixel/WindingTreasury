"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

export function SavingsCreateDialog({ members }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_id: "",
    jenis_simpanan: "WADIAH",
    nominal: "",
    tanggal_setor: new Date().toISOString().slice(0, 10),
    lock_months: "",
    catatan: "",
  });

  const maturityDate = useMemo(() => {
    if (form.jenis_simpanan !== "MUDHARABAH") return "";
    return addMonthsToDate(form.tanggal_setor, Number(form.lock_months || 0));
  }, [form.jenis_simpanan, form.tanggal_setor, form.lock_months]);

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
      setErrorMsg("Silakan pilih anggota.");
      setLoading(false);
      return;
    }

    if (form.jenis_simpanan === "MUDHARABAH" && !form.lock_months) {
      setErrorMsg("Tenor penguncian wajib diisi untuk simpanan Mudharabah.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: form.user_id,
      nama: selectedMember.full_name,
      jenis_simpanan: form.jenis_simpanan,
      nominal: Number(form.nominal),
      tanggal_setor: form.tanggal_setor,
      lock_months: form.jenis_simpanan === "MUDHARABAH" ? Number(form.lock_months) : null,
      start_date: form.jenis_simpanan === "MUDHARABAH" ? form.tanggal_setor : null,
      maturity_date: form.jenis_simpanan === "MUDHARABAH" ? maturityDate : null,
      is_locked: form.jenis_simpanan === "MUDHARABAH",
      catatan: form.catatan,
    };

    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || result?.message || "Gagal menyimpan simpanan.");
      }

      setOpen(false);
      setForm({
        user_id: "",
        jenis_simpanan: "WADIAH",
        nominal: "",
        tanggal_setor: new Date().toISOString().slice(0, 10),
        lock_months: "",
        catatan: "",
      });
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan simpanan.");
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
        + Tambah Simpanan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tambah Simpanan</h2>
                <p className="text-sm text-slate-500">
                  Input simpanan Wadiah atau Mudharabah.
                </p>
              </div>
              <button
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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Jenis Simpanan
                </label>
                <select
                  name="jenis_simpanan"
                  value={form.jenis_simpanan}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="WADIAH">Wadiah</option>
                  <option value="MUDHARABAH">Mudharabah</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nominal
                </label>
                <input
                  type="number"
                  name="nominal"
                  value={form.nominal}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tanggal Setor
                </label>
                <input
                  type="date"
                  name="tanggal_setor"
                  value={form.tanggal_setor}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {form.jenis_simpanan === "MUDHARABAH" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Tenor Penguncian (bulan)
                    </label>
                    <input
                      type="number"
                      name="lock_months"
                      value={form.lock_months}
                      onChange={handleChange}
                      min={1}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="6"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Jatuh tempo otomatis: <span className="font-medium">{maturityDate || "-"}</span>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Catatan
                </label>
                <textarea
                  name="cat

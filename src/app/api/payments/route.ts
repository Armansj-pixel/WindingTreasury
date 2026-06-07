import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

function generatePaymentCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const i = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `PAY-${y}${m}${d}-${h}${i}${s}`;
}

function calculateSplit(nominal: number) {
  const produktif = Math.round(nominal * 0.5);
  const sosial = Math.round(nominal * 0.3);
  const ops = nominal - produktif - sosial;

  return {
    split_produktif: produktif,
    split_sosial: sosial,
    split_ops: ops,
  };
}

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data iuran.", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      member_name,
      payment_period,
      payment_type,
      payment_method,
      amount,
      paid_at,
      notes,
    } = body;

    if (!user_id || !member_name || !payment_period || !payment_type || !amount) {
      return NextResponse.json(
        { message: "Data iuran belum lengkap." },
        { status: 400 }
      );
    }

    const nominal = Number(amount);

    if (Number.isNaN(nominal) || nominal <= 0) {
      return NextResponse.json(
        { message: "Nominal iuran tidak valid." },
        { status: 400 }
      );
    }

    const split = calculateSplit(nominal);
    const supabase = createSupabaseAdminClient();

    const payload = {
      payment_code: generatePaymentCode(),
      user_id,
      nama: member_name,
      bulan: payment_period,
      tgl_bayar: paid_at || new Date().toISOString().slice(0, 10),
      nominal,
      jenis: payment_type,
      metode: payment_method || "TUNAI",
      split_produktif: split.split_produktif,
      split_sosial: split.split_sosial,
      split_ops: split.split_ops,
      catatan: notes || null,

      amount: nominal,
      payment_period,
      payment_type,
      payment_method: payment_method || "TUNAI",
      paid_at: paid_at || new Date().toISOString().slice(0, 10),
      notes: notes || null,
    };

    const { error } = await supabase.from("payments").insert(payload);

    if (error) {
      return NextResponse.json(
        {
          message: "Gagal menyimpan iuran.",
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Iuran berhasil ditambahkan." });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
        error: error?.message || "unknown error",
      },
      { status: 500 }
    );
  }
}

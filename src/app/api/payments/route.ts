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

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("id", { ascending: false });

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
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { message: "Anggota belum dipilih." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const payload = {
      user_id,
      payment_code: generatePaymentCode(),
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

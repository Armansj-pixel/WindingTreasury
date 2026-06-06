import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

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
      payment_period,
      payment_type,
      payment_method,
      amount,
      paid_at,
      notes,
    } = body;

    if (!user_id || !payment_period || !payment_type || !payment_method || !amount || !paid_at) {
      return NextResponse.json(
        {
          message: "Data iuran belum lengkap.",
          debug: { user_id, payment_period, payment_type, payment_method, amount, paid_at },
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("payments").insert({
      user_id,
      payment_period,
      payment_type,
      payment_method,
      amount,
      paid_at,
      notes: notes || null,
    });

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

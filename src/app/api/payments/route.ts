import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      user_id,
      payment_period,
      payment_type,
      payment_method,
      amount,
      productive_amount,
      social_amount,
      operational_amount,
      paid_at,
      notes,
      created_at,
      profiles:user_id (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data iuran.", error: error.message },
      { status: 500 }
    );
  }

  const rows = (data || []).map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    member_name: item.profiles?.full_name || "Tanpa Nama",
    payment_period: item.payment_period,
    payment_type: item.payment_type,
    payment_method: item.payment_method,
    amount: item.amount,
    productive_amount: item.productive_amount,
    social_amount: item.social_amount,
    operational_amount: item.operational_amount,
    paid_at: item.paid_at,
    notes: item.notes,
    created_at: item.created_at,
  }));

  return NextResponse.json({ data: rows });
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
        { message: "Data iuran belum lengkap." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", user_id)
      .eq("payment_period", payment_period)
      .eq("payment_type", payment_type)
      .limit(1);

    if (payment_type === "WAJIB" && existing && existing.length > 0) {
      return NextResponse.json(
        { message: "Iuran wajib untuk periode ini sudah ada." },
        { status: 409 }
      );
    }

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
        { message: "Gagal menyimpan iuran.", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Iuran berhasil ditambahkan." });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

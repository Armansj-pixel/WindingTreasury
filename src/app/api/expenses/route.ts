import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const ALLOWED_POS = ["SOSIAL", "OPERASIONAL", "PRODUKTIF"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const expCode = body.exp_code ?? body.expense_code ?? `EXP-${Date.now()}`;
    const title = body.deskripsi ?? body.title ?? "Pengeluaran";
    const nominal = Number(body.nominal ?? body.amount ?? 0);
    const kategori = body.kategori ?? body.category ?? "Lainnya";
    const pos = String(body.pos ?? "OPERASIONAL").toUpperCase();
    const tgl = body.tgl ?? body.expense_date ?? null;
    const catatan = body.catatan ?? body.notes ?? null;
    const status = body.status ?? "PAID";

    if (!ALLOWED_POS.includes(pos)) {
      return NextResponse.json(
        { message: "Pos pengeluaran tidak valid." },
        { status: 400 }
      );
    }

    if (nominal <= 0) {
      return NextResponse.json(
        { message: "Nominal harus lebih dari 0." },
        { status: 400 }
      );
    }

    const payload = {
      exp_code: expCode,
      expense_code: expCode,
      tgl,
      expense_date: tgl,
      deskripsi: title,
      title,
      nominal,
      amount: nominal,
      pos,
      payment_method: body.payment_method ?? pos,
      kategori,
      category: kategori,
      dicatat_oleh: body.dicatat_oleh ?? null,
      bukti_url: body.bukti_url ?? null,
      catatan,
      notes: catatan,
      status,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const title = body.title?.trim() || body.deskripsi?.trim() || "Pengeluaran";
    const category = body.category?.trim() || body.kategori?.trim() || "Lainnya";
    const expenseCode =
      body.expense_code?.trim() || body.exp_code?.trim() || `EXP-${Date.now()}`;
    const notes = body.notes?.trim() || body.catatan?.trim() || null;
    const amount = Number(body.amount ?? body.nominal ?? 0);
    const expenseDate = body.expense_date ?? body.tgl ?? null;
    const paymentMethod = body.payment_method?.trim() || body.pos?.trim() || "Kas";
    const status = body.status?.trim() || "PAID";

    const payload = {
      exp_code: expenseCode,
      tgl: expenseDate,
      deskripsi: title,
      nominal: amount,
      pos: paymentMethod,
      kategori: category,
      catatan: notes,
      expense_code: expenseCode,
      title,
      category,
      amount,
      expense_date: expenseDate,
      payment_method: paymentMethod,
      status,
      notes,
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

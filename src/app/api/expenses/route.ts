import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = createSupabaseAdminClient();

    const payload = {
      expense_code: body.expense_code,
      title: body.title,
      category: body.category,
      amount: Number(body.amount ?? 0),
      expense_date: body.expense_date,
      payment_method: body.payment_method,
      status: body.status,
      notes: body.notes,
    };

    const { data, error } = await supabase
      .from("expenses")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

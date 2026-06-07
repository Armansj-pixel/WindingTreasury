import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function generateFinancingCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `FIN-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      user_id,
      nama,
      akad,
      principal_amount,
      margin_amount,
      total_amount,
      tenor_months,
      monthly_installment,
      start_date,
      due_date,
      purpose,
      notes,
    } = body || {};

    if (!user_id || !nama || !akad || !principal_amount || !tenor_months || !start_date) {
      return NextResponse.json(
        { error: "Data pembiayaan belum lengkap." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const payload = {
      financing_code: generateFinancingCode(),
      user_id,
      nama,
      akad,
      principal_amount: Number(principal_amount),
      margin_amount: Number(margin_amount || 0),
      total_amount: Number(total_amount || 0),
      tenor_months: Number(tenor_months),
      monthly_installment: Number(monthly_installment || 0),
      start_date,
      due_date: due_date || null,
      status: "AKTIF",
      purpose: purpose || null,
      notes: notes || null,
    };

    const { data, error } = await supabase
      .from("financing")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Gagal menyimpan data pembiayaan.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pembiayaan berhasil disimpan.",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

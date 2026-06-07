import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function generatePaymentCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PAY-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      financing_id,
      financing_code,
      user_id,
      nama,
      akad,
      installment_number,
      amount_paid,
      payment_date,
      payment_method,
      notes,
    } = body || {};

    if (
      !financing_id ||
      !financing_code ||
      !user_id ||
      !nama ||
      !akad ||
      !installment_number ||
      !amount_paid ||
      !payment_date
    ) {
      return NextResponse.json(
        { error: "Data pembayaran belum lengkap." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const paymentPayload = {
      payment_code: generatePaymentCode(),
      financing_id,
      financing_code,
      user_id,
      nama,
      akad,
      installment_number: Number(installment_number),
      amount_paid: Number(amount_paid),
      payment_date,
      payment_method: payment_method || "TRANSFER",
      notes: notes || null,
    };

    const { data: paymentData, error: paymentError } = await supabase
      .from("financing_payments")
      .insert([paymentPayload])
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json(
        {
          error: "Gagal menyimpan pembayaran.",
          details: paymentError.message,
        },
        { status: 500 }
      );
    }

    const { data: financingData, error: financingError } = await supabase
      .from("financing")
      .select("id, total_amount")
      .eq("id", financing_id)
      .single();

    if (!financingError && financingData) {
      const { data: paymentRows } = await supabase
        .from("financing_payments")
        .select("amount_paid")
        .eq("financing_id", financing_id);

      const totalPaid = (paymentRows || []).reduce((sum: number, item: any) => {
        return sum + Number(item.amount_paid ?? 0);
      }, 0);

      const totalAmount = Number(financingData.total_amount ?? 0);
      const nextStatus = totalPaid >= totalAmount ? "LUNAS" : "AKTIF";

      await supabase
        .from("financing")
        .update({ status: nextStatus })
        .eq("id", financing_id);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pembayaran berhasil disimpan.",
        data: paymentData,
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

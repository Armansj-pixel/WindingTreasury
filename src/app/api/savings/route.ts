import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function generateSavingCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SAV-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      user_id,
      nama,
      jenis_simpanan,
      nominal,
      tanggal_setor,
      lock_months,
      start_date,
      maturity_date,
      is_locked,
      catatan,
    } = body || {};

    if (!user_id || !nama || !jenis_simpanan || !nominal || !tanggal_setor) {
      return NextResponse.json(
        { error: "Data simpanan belum lengkap." },
        { status: 400 }
      );
    }

    if (jenis_simpanan === "MUDHARABAH" && !lock_months) {
      return NextResponse.json(
        { error: "Tenor penguncian wajib diisi untuk Mudharabah." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const payload = {
      saving_code: generateSavingCode(),
      user_id,
      nama,
      jenis_simpanan,
      nominal: Number(nominal),
      tanggal_setor,
      lock_months: jenis_simpanan === "MUDHARABAH" ? Number(lock_months) : null,
      start_date: jenis_simpanan === "MUDHARABAH" ? start_date : null,
      maturity_date: jenis_simpanan === "MUDHARABAH" ? maturity_date : null,
      is_locked: jenis_simpanan === "MUDHARABAH" ? Boolean(is_locked) : false,
      status: "AKTIF",
      catatan: catatan || null,
    };

    const { data, error } = await supabase
      .from("savings")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Gagal menyimpan data simpanan.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Simpanan berhasil disimpan.",
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

import { requireAdmin } from "@/lib/auth-admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { PaymentCreateDialog } from "@/components/dashboard/payments/payment-create-dialog";
import { PaymentsTable } from "@/components/dashboard/payments/payments-table";

export default async function PaymentsPage() {
  await requireAdmin();

  const supabase = createSupabaseAdminClient();

  const [{ data: members }, { data: payments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "MEMBER")
      .order("full_name", { ascending: true }),

    supabase
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
      .order("created_at", { ascending: false }),
  ]);

  const rows = (payments || []).map((item: any) => ({
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Modul Keuangan</p>
          <h1 className="text-2xl font-semibold text-slate-900">Iuran Anggota</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola pembayaran iuran wajib dan sukarela anggota.
          </p>
        </div>

        <PaymentCreateDialog members={members || []} />
      </div>

      <PaymentsTable rows={rows} />
    </section>
  );
}

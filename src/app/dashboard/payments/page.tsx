import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { PaymentCreateDialog } from "@/components/dashboard/payments/payment-create-dialog";
import { PaymentsTable } from "@/components/dashboard/payments/payments-table";

export default async function PaymentsPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: members, error: membersError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, nama, email")
        .order("nama", { ascending: true }),

      supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

  const memberOptions = (members || []).map((item: any) => ({
    id: item.id,
    full_name: item.nama || item.email || "Tanpa Nama",
  }));

  const rows = (payments || []).map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    member_name: item.user_id || "Tanpa Nama",
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
          <p className="mt-2 text-xs text-slate-400">
            members: {memberOptions.length} | membersError: {membersError?.message || "-"} |
            paymentsError: {paymentsError?.message || "-"}
          </p>
        </div>

        <PaymentCreateDialog members={memberOptions} />
      </div>

      <PaymentsTable rows={rows} />
    </section>
  );
}

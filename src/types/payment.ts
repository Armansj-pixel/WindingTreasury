export type PaymentType = "WAJIB" | "SUKARELA";
export type PaymentMethod = "CASH" | "TRANSFER" | "EWALLET";

export interface PaymentRow {
  id: string;
  user_id: string;
  member_name: string;
  payment_period: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  productive_amount?: number | null;
  social_amount?: number | null;
  operational_amount?: number | null;
  paid_at: string;
  notes?: string | null;
  created_at: string;
}

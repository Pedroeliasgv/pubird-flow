import { supabase } from "../integrations/supabase/client";

export type Plan = {
  id: string;
  name: string;
  slug: "starter" | "pro" | "business" | string;
  description: string | null;
  price: number;
  currency: string;
  interval: "monthly" | "yearly" | string;
  features: string[] | null;
  status: "active" | "inactive" | "archived";
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionStatus =
  | "pending"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;
  company_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  asaas_subscription_id?: string | null;
  billing_type?: "PIX" | "BOLETO" | "CREDIT_CARD" | string | null;
  started_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  raw_payload?: unknown;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  company_id: string;
  subscription_id?: string | null;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  payment_method?: string | null;
  billing_type?: "PIX" | "BOLETO" | "CREDIT_CARD" | string | null;
  due_at?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  invoice_url?: string | null;
  bank_slip_url?: string | null;
  receipt_url?: string | null;
  asaas_payment_id?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type SubscriptionWithPlan = Subscription & {
  plans: Plan | null;
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  pending: "Pendente",
  trialing: "Teste",
  active: "Ativa",
  past_due: "Pagamento pendente",
  cancelled: "Cancelada",
  expired: "Expirada",
};

export const paymentStatusLabels: Record<Payment["status"], string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

export function formatBillingType(type?: string | null) {
  const labels: Record<string, string> = {
    PIX: "Pix",
    BOLETO: "Boleto",
    CREDIT_CARD: "Cartão",
  };

  return type ? labels[type] ?? type : "Não informado";
}

export function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

function getPeriodEnd() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export async function getPlans() {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("status", "active")
    .order("price", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as Plan[];
}

export async function getCurrentSubscription(companyId: string) {
  const { data: activeSubscription, error: activeError } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .in("status", ["active", "trialing", "past_due"])
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeError) {
    throw activeError;
  }

  if (activeSubscription) {
    return activeSubscription as SubscriptionWithPlan;
  }

  const { data: pendingSubscription, error: pendingError } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) {
    throw pendingError;
  }

  return pendingSubscription as SubscriptionWithPlan | null;
}

export async function getPayments(companyId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      company_id,
      subscription_id,
      amount,
      status,
      payment_method,
      billing_type,
      due_at,
      due_date,
      paid_at,
      invoice_url,
      bank_slip_url,
      receipt_url,
      asaas_payment_id,
      created_at,
      updated_at
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as Payment[];
}

export async function subscribeCompany(params: {
  companyId: string;
  planId: string;
}) {
  const now = new Date().toISOString();

  const { data: existingSubscription, error: existingError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", params.companyId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingSubscription) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        plan_id: params.planId,
        status: "active",
        current_period_start: now,
        current_period_end: getPeriodEnd(),
        cancelled_at: null,
        cancel_at: null,
        updated_at: now,
      })
      .eq("id", existingSubscription.id)
      .select("*, plans(*)")
      .single();

    if (error) {
      throw error;
    }

    return data as SubscriptionWithPlan;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      company_id: params.companyId,
      plan_id: params.planId,
      status: "active",
      started_at: now,
      current_period_start: now,
      current_period_end: getPeriodEnd(),
    })
    .select("*, plans(*)")
    .single();

  if (error) {
    throw error;
  }

  return data as SubscriptionWithPlan;
}

export async function cancelSubscription(subscriptionId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: now,
      cancel_at: now,
      updated_at: now,
    })
    .eq("id", subscriptionId)
    .select("*, plans(*)")
    .single();

  if (error) {
    throw error;
  }

  return data as SubscriptionWithPlan;
}
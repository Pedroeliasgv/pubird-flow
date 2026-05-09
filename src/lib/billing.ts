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
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  company_id: string;
  plan_id: string;
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  started_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  company_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  payment_method: string | null;
  paid_at: string | null;
  due_at: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionWithPlan = Subscription & {
  plans: Plan | null;
};

export const subscriptionStatusLabels: Record<Subscription["status"], string> = {
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

  return data as Plan[];
}

export async function getCurrentSubscription(companyId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SubscriptionWithPlan | null;
}

export async function getPayments(companyId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Payment[];
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
    })
    .eq("id", subscriptionId)
    .select("*, plans(*)")
    .single();

  if (error) {
    throw error;
  }

  return data as SubscriptionWithPlan;
}
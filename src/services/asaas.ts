import { supabase } from "../lib/supabase";

export type PlanSlug = "starter" | "pro" | "business";
export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

type CreateAsaasCheckoutResponse = {
  message?: string;
  error?: string;
  details?: unknown;
  subscription?: {
    id: string;
    company_id: string;
    plan_id: string;
    status: string;
    billing_type: BillingType;
    asaas_subscription_id: string;
  };
  asaas?: {
    id: string;
    customer: string;
    billingType: BillingType;
    value: number;
    status: string;
    payment?: {
      id: string;
      status: string;
      invoiceUrl?: string;
      bankSlipUrl?: string;
      transactionReceiptUrl?: string;
      dueDate?: string;
      value?: number;
    } | null;
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function createAsaasCheckout({
  planSlug,
  billingType = "PIX",
}: {
  planSlug: PlanSlug;
  billingType?: BillingType;
}) {
  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL não configurada no .env");
  }

  if (!supabaseAnonKey) {
    throw new Error("VITE_SUPABASE_ANON_KEY não configurada no .env");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log("Sessão Supabase:", session);

  if (sessionError) {
    throw new Error("Erro ao recuperar sessão do usuário.");
  }

  if (!session?.access_token) {
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-asaas-checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        plan_slug: planSlug,
        billing_type: billingType,
      }),
    }
  );

  const text = await response.text();

  let data: CreateAsaasCheckoutResponse;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida da função: ${text}`);
  }

  console.log("Resposta create-asaas-checkout:", {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
  console.error("Erro detalhado da Edge Function:", data);

  const details = data.details as
    | { errors?: { description?: string; code?: string }[] }
    | undefined;

  const firstAsaasError = details?.errors?.[0]?.description;

  throw new Error(
    firstAsaasError ||
      data.error ||
      `Erro ${response.status} ao chamar create-asaas-checkout.`
  );
}

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
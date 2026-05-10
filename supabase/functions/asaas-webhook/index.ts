import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, asaas-access-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function mapPaymentStatusToSubscriptionStatus(status: string) {
  const normalizedStatus = status?.toUpperCase();

  if (
    normalizedStatus === "RECEIVED" ||
    normalizedStatus === "CONFIRMED" ||
    normalizedStatus === "RECEIVED_IN_CASH"
  ) {
    return "active";
  }

  if (normalizedStatus === "OVERDUE") {
    return "past_due";
  }

  if (
    normalizedStatus === "DELETED" ||
    normalizedStatus === "REFUNDED" ||
    normalizedStatus === "CANCELLED"
  ) {
    return "canceled";
  }

  return "pending";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405);
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        {
          error:
            "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.",
        },
        500
      );
    }

    const receivedToken = req.headers.get("asaas-access-token");

    if (ASAAS_WEBHOOK_TOKEN && receivedToken !== ASAAS_WEBHOOK_TOKEN) {
      return jsonResponse({ error: "Token inválido." }, 401);
    }

    const payload = await req.json();

    const event = payload.event;
    const payment = payload.payment;
    const subscription = payload.subscription;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (payment) {
      const asaasSubscriptionId = payment.subscription;
      const asaasPaymentId = payment.id;
      const paymentStatus = payment.status;
      const value = payment.value;
      const dueDate = payment.dueDate;
      const invoiceUrl = payment.invoiceUrl;
      const bankSlipUrl = payment.bankSlipUrl;
      const transactionReceiptUrl = payment.transactionReceiptUrl;
      const billingType = payment.billingType;

      let localSubscription = null;

      if (asaasSubscriptionId) {
        const { data } = await supabase
          .from("subscriptions")
          .select("id, company_id, plan_id")
          .eq("asaas_subscription_id", asaasSubscriptionId)
          .single();

        localSubscription = data;
      }

      if (localSubscription) {
        await supabase.from("payments").upsert(
          {
            company_id: localSubscription.company_id,
            subscription_id: localSubscription.id,
            asaas_payment_id: asaasPaymentId,
            status: paymentStatus?.toLowerCase() ?? "pending",
            amount: value,
            billing_type: billingType,
            due_date: dueDate,
            invoice_url: invoiceUrl,
            bank_slip_url: bankSlipUrl,
            receipt_url: transactionReceiptUrl,
            raw_payload: payload,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "asaas_payment_id",
          }
        );

        const newSubscriptionStatus =
          mapPaymentStatusToSubscriptionStatus(paymentStatus);

        await supabase
          .from("subscriptions")
          .update({
            status: newSubscriptionStatus,
            current_period_start: new Date().toISOString(),
            current_period_end: dueDate ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", localSubscription.id);
      }
    }

    if (subscription) {
      const asaasSubscriptionId = subscription.id;
      const subscriptionStatus = subscription.status;

      if (asaasSubscriptionId) {
        await supabase
          .from("subscriptions")
          .update({
            status: subscriptionStatus?.toLowerCase() ?? "pending",
            updated_at: new Date().toISOString(),
            raw_payload: payload,
          })
          .eq("asaas_subscription_id", asaasSubscriptionId);
      }
    }

    return jsonResponse({
      received: true,
      event,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Erro interno no webhook.",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});
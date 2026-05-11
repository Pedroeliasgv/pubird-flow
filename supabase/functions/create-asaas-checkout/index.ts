import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

type RequestBody = {
  plan_slug: "starter" | "pro" | "business";
  billing_type?: BillingType;
};

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("APP_SUPABASE_URL");

const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY");

const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");

const ASAAS_API_URL =
  Deno.env.get("ASAAS_API_URL") ?? "https://api-sandbox.asaas.com/v3";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getNextDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

function onlyNumbers(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function isValidDocumentLength(document: string) {
  return document.length === 11 || document.length === 14;
}

async function cancelAsaasSubscription(asaasSubscriptionId: string) {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  const response = await fetch(
    `${ASAAS_API_URL}/subscriptions/${asaasSubscriptionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.description ||
        "Erro ao cancelar assinatura antiga no Asaas."
    );
  }

  return data;
}

async function getFirstSubscriptionPayment(asaasSubscriptionId: string) {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  const response = await fetch(
    `${ASAAS_API_URL}/subscriptions/${asaasSubscriptionId}/payments?limit=1`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !Array.isArray(data.data)) {
    return null;
  }

  return data.data[0] ?? null;
}

function formatPayment(payment: any) {
  if (!payment) {
    return null;
  }

  return {
    id: payment.id,
    status: payment.status,
    invoiceUrl: payment.invoiceUrl,
    bankSlipUrl: payment.bankSlipUrl,
    transactionReceiptUrl: payment.transactionReceiptUrl,
    dueDate: payment.dueDate,
    value: payment.value,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405);
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ASAAS_API_KEY) {
      return jsonResponse(
        {
          error:
            "Secrets ausentes. Verifique APP_SUPABASE_URL, APP_SUPABASE_SERVICE_ROLE_KEY e ASAAS_API_KEY.",
        },
        500
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Usuário não autenticado." }, 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: "Sessão inválida." }, 401);
    }

    const body = (await req.json()) as RequestBody;

    const planSlug = body.plan_slug;
    const billingType = body.billing_type ?? "PIX";

    if (!planSlug) {
      return jsonResponse({ error: "plan_slug é obrigatório." }, 400);
    }

    if (!["PIX", "BOLETO", "CREDIT_CARD"].includes(billingType)) {
      return jsonResponse({ error: "Forma de pagamento inválida." }, 400);
    }

    const { data: member, error: memberError } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (memberError || !member) {
      return jsonResponse(
        { error: "Usuário não está vinculado a nenhuma empresa." },
        403
      );
    }

    const companyId = member.company_id;

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, email, phone, document, asaas_customer_id")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return jsonResponse({ error: "Empresa não encontrada." }, 404);
    }

    if (!company.name) {
      return jsonResponse(
        { error: "A empresa precisa ter nome cadastrado." },
        400
      );
    }

    if (!company.email) {
      return jsonResponse(
        { error: "A empresa precisa ter e-mail cadastrado." },
        400
      );
    }

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, slug, price")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return jsonResponse({ error: "Plano não encontrado." }, 404);
    }

    const { data: existingSubscription, error: existingSubscriptionError } =
      await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("company_id", companyId)
        .in("status", ["pending", "active", "trialing", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingSubscriptionError) {
      return jsonResponse(
        {
          error: "Erro ao verificar assinatura existente.",
          details: existingSubscriptionError,
        },
        500
      );
    }

    if (
      existingSubscription?.status === "active" &&
      existingSubscription.plan_id === plan.id
    ) {
      return jsonResponse(
        {
          error: "Esta empresa já está nesse plano.",
          subscription: existingSubscription,
        },
        400
      );
    }

    if (
      existingSubscription?.status === "pending" &&
      existingSubscription.plan_id === plan.id &&
      existingSubscription.asaas_subscription_id
    ) {
      const firstExistingPayment = await getFirstSubscriptionPayment(
        existingSubscription.asaas_subscription_id
      );

      return jsonResponse({
        message: "Já existe uma cobrança pendente para este plano.",
        subscription: existingSubscription,
        asaas: {
          id: existingSubscription.asaas_subscription_id,
          payment: formatPayment(firstExistingPayment),
        },
      });
    }

    if (
      existingSubscription &&
      existingSubscription.plan_id !== plan.id &&
      existingSubscription.asaas_subscription_id
    ) {
      try {
        await cancelAsaasSubscription(existingSubscription.asaas_subscription_id);

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancel_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubscription.id);
      } catch (error) {
        return jsonResponse(
          {
            error:
              "Erro ao cancelar assinatura anterior antes de trocar de plano.",
            details: error instanceof Error ? error.message : String(error),
          },
          400
        );
      }
    }

    let asaasCustomerId = company.asaas_customer_id;

    if (!asaasCustomerId) {
      const cleanedPhone = onlyNumbers(company.phone);
      const cleanedDocument = onlyNumbers(company.document);

      const customerPayload: Record<string, unknown> = {
        name: company.name,
        email: company.email,
        externalReference: company.id,
      };

      if (cleanedPhone.length >= 10 && cleanedPhone.length <= 11) {
        customerPayload.mobilePhone = cleanedPhone;
      }

      if (isValidDocumentLength(cleanedDocument)) {
        customerPayload.cpfCnpj = cleanedDocument;
      }

      const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: ASAAS_API_KEY,
        },
        body: JSON.stringify(customerPayload),
      });

      const customerData = await customerResponse.json();

      if (!customerResponse.ok) {
        return jsonResponse(
          {
            error: "Erro ao criar cliente no Asaas.",
            details: customerData,
            sent_payload: customerPayload,
          },
          400
        );
      }

      asaasCustomerId = customerData.id;

      await supabase
        .from("companies")
        .update({
          asaas_customer_id: asaasCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId);
    }

    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType,
        nextDueDate: getNextDueDate(),
        value: Number(plan.price),
        cycle: "MONTHLY",
        description: `Assinatura Pubird Flow - ${plan.name}`,
        externalReference: company.id,
      }),
    });

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      return jsonResponse(
        {
          error: "Erro ao criar assinatura no Asaas.",
          details: subscriptionData,
        },
        400
      );
    }

    const firstPayment = await getFirstSubscriptionPayment(subscriptionData.id);

    const { data: localSubscription, error: localSubscriptionError } =
      await supabase
        .from("subscriptions")
        .insert({
          company_id: companyId,
          plan_id: plan.id,
          asaas_subscription_id: subscriptionData.id,
          status: "pending",
          billing_type: billingType,
          current_period_start: new Date().toISOString(),
          current_period_end: null,
          raw_payload: subscriptionData,
        })
        .select("*")
        .single();

    if (localSubscriptionError) {
      return jsonResponse(
        {
          error: "Assinatura criada no Asaas, mas falhou ao salvar no banco.",
          details: localSubscriptionError,
          asaas_subscription: subscriptionData,
        },
        500
      );
    }

    return jsonResponse({
      message:
        existingSubscription && existingSubscription.plan_id !== plan.id
          ? "Troca de plano iniciada com sucesso."
          : "Assinatura criada com sucesso.",
      subscription: localSubscription,
      asaas: {
        id: subscriptionData.id,
        customer: subscriptionData.customer,
        billingType: subscriptionData.billingType,
        value: subscriptionData.value,
        status: subscriptionData.status,
        payment: formatPayment(firstPayment),
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Erro interno ao criar assinatura.",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});
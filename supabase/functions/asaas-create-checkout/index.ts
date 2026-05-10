import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  companyId: string;
  planId: string;
};

function addOneMonth(date = new Date()) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next.toISOString();
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");
    const asaasApiUrl =
      Deno.env.get("ASAAS_API_URL") || "https://api-sandbox.asaas.com/v3";
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !asaasApiKey) {
      return Response.json(
        { error: "Variáveis de ambiente ausentes." },
        { status: 500, headers: corsHeaders }
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Usuário não autenticado." },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } =
      await supabaseUser.auth.getUser();

    if (userError || !userData.user) {
      return Response.json(
        { error: "Sessão inválida." },
        { status: 401, headers: corsHeaders }
      );
    }

    const { companyId, planId } = (await req.json()) as RequestBody;

    if (!companyId || !planId) {
      return Response.json(
        { error: "companyId e planId são obrigatórios." },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: member, error: memberError } = await supabaseAdmin
      .from("company_members")
      .select("id, role, status")
      .eq("company_id", companyId)
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memberError || !member) {
      return Response.json(
        { error: "Você não tem acesso a esta empresa." },
        { status: 403, headers: corsHeaders }
      );
    }

    if (!["owner", "admin"].includes(member.role)) {
      return Response.json(
        { error: "Apenas owner/admin pode alterar assinatura." },
        { status: 403, headers: corsHeaders }
      );
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id, name, document, phone, email")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return Response.json(
        { error: "Empresa não encontrada." },
        { status: 404, headers: corsHeaders }
      );
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("status", "active")
      .single();

    if (planError || !plan) {
      return Response.json(
        { error: "Plano não encontrado." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!company.document) {
      return Response.json(
        {
          error:
            "A empresa precisa ter CNPJ/CPF cadastrado para criar cobrança no Asaas.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const now = new Date().toISOString();

    const { data: localSubscription, error: subscriptionError } =
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          company_id: companyId,
          plan_id: planId,
          status: "pending",
          started_at: now,
          current_period_start: now,
          current_period_end: addOneMonth(),
          billing_provider: "asaas",
        })
        .select("*")
        .single();

    if (subscriptionError || !localSubscription) {
      return Response.json(
        { error: "Erro ao criar assinatura local." },
        { status: 500, headers: corsHeaders }
      );
    }

    const customerPayload = {
      name: company.name,
      cpfCnpj: company.document,
      email: company.email || userData.user.email,
      mobilePhone: company.phone || undefined,
      externalReference: company.id,
      notificationDisabled: false,
    };

    const customerResponse = await fetch(`${asaasApiUrl}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
      body: JSON.stringify(customerPayload),
    });

    const customerData = await customerResponse.json();

    if (!customerResponse.ok) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", localSubscription.id);

      return Response.json(
        {
          error: "Erro ao criar cliente no Asaas.",
          details: customerData,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const paymentLinkPayload = {
      name: `Pubird Flow - ${plan.name}`,
      description: `Assinatura mensal do plano ${plan.name}`,
      value: Number(plan.price),
      billingType: "UNDEFINED",
      chargeType: "RECURRENT",
      subscriptionCycle: "MONTHLY",
      dueDateLimitDays: 5,
      externalReference: localSubscription.id,
      notificationEnabled: true,
      callback: {
        successUrl: `${appUrl}/dashboard/billing?checkout=success`,
        autoRedirect: true,
      },
    };

    const paymentLinkResponse = await fetch(`${asaasApiUrl}/paymentLinks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
      },
      body: JSON.stringify(paymentLinkPayload),
    });

    const paymentLinkData = await paymentLinkResponse.json();

    if (!paymentLinkResponse.ok) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", localSubscription.id);

      return Response.json(
        {
          error: "Erro ao criar link de pagamento no Asaas.",
          details: paymentLinkData,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const checkoutUrl =
      paymentLinkData.url ||
      paymentLinkData.paymentLink ||
      paymentLinkData.invoiceUrl;

    await supabaseAdmin
      .from("subscriptions")
      .update({
        external_id: paymentLinkData.id,
        checkout_url: checkoutUrl,
        billing_provider: "asaas",
      })
      .eq("id", localSubscription.id);

    await supabaseAdmin.from("payments").insert({
      company_id: companyId,
      subscription_id: localSubscription.id,
      amount: Number(plan.price),
      currency: "BRL",
      status: "pending",
      payment_method: "asaas_checkout",
      due_at: getTodayDate(),
      external_id: paymentLinkData.id,
      invoice_url: checkoutUrl,
    });

    return Response.json(
      {
        subscriptionId: localSubscription.id,
        checkoutUrl,
        asaasPaymentLinkId: paymentLinkData.id,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Erro interno ao criar checkout.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
});
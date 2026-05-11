import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import {
  cancelSubscription,
  formatBillingType,
  formatCurrency,
  getCurrentSubscription,
  getPayments,
  getPlans,
  Payment,
  paymentStatusLabels,
  Plan,
  SubscriptionWithPlan,
  subscriptionStatusLabels,
} from "../../lib/billing";

import {
  BillingType,
  createAsaasCheckout,
  PlanSlug,
} from "../../services/asaas";

import { getLeads, Lead } from "../../lib/leads";
import { getServices, Service } from "../../lib/services";
import {
  getMessageTemplates,
  MessageTemplate,
} from "../../lib/message-templates";
import {
  formatPlanLimit,
  getPlanAccess,
  isUnlimitedLimit,
} from "../../lib/planAccess";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

type PlanAccessView = {
  label?: string;
  description?: string;
  benefits?: string[];
  maxLeads?: number;
  maxUsers?: number;
  maxServices?: number;
  maxMessageTemplates?: number;
  maxAutomations?: number;
  canUseAutomations?: boolean;
  canUseSocialStudio?: boolean;
  canUseAdvancedReports?: boolean;
  canUsePrioritySupport?: boolean;
  canUseCustomBranding?: boolean;
};

function BillingPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionWithPlan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const [billingType, setBillingType] = useState<BillingType>("PIX");

  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const userCompany = await getUserCompany(user.id);

        if (!userCompany) {
          navigate({ to: "/dashboard/onboarding" });
          return;
        }

        setCompany(userCompany);

        const [
          plansData,
          subscriptionData,
          paymentsData,
          leadsData,
          servicesData,
          templatesData,
        ] = await Promise.all([
          getPlans(),
          getCurrentSubscription(userCompany.id),
          getPayments(userCompany.id),
          getLeads(userCompany.id),
          getServices(userCompany.id),
          getMessageTemplates(userCompany.id),
        ]);

        setPlans(plansData);
        setSubscription(subscriptionData);
        setPayments(paymentsData);
        setLeads(leadsData);
        setServices(servicesData);
        setTemplates(templatesData);
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao carregar informações de assinatura.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const currentPlanId = subscription?.plan_id;

  const currentPlan = useMemo(() => {
    return subscription?.plans || null;
  }, [subscription]);

  const currentPlanAccess = useMemo(() => {
    return currentPlan
      ? (getPlanAccess(currentPlan.slug) as PlanAccessView)
      : null;
  }, [currentPlan]);

  const pendingPaymentUrl = useMemo(() => {
    const paymentWithUrl = payments.find(
      (payment) =>
        payment.invoice_url || payment.bank_slip_url || payment.receipt_url
    );

    return (
      paymentWithUrl?.invoice_url ||
      paymentWithUrl?.bank_slip_url ||
      paymentWithUrl?.receipt_url ||
      null
    );
  }, [payments]);

  const hasPendingSubscription = subscription?.status === "pending";

  async function handleSubscribe(plan: Plan) {
    if (!company) {
      setErrorMessage("Empresa não encontrada. Faça login novamente.");
      return;
    }

    const planSlug = (plan as Plan & { slug?: string }).slug as
      | PlanSlug
      | undefined;

    if (!planSlug) {
      setErrorMessage(
        "Este plano está sem slug cadastrado. Verifique a tabela plans no Supabase."
      );
      return;
    }

    const actionLabel = currentPlan ? "trocar para" : "assinar";
    const confirmed = window.confirm(
      `Confirmar ${actionLabel} o plano ${plan.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingPlanId(plan.id);
      setErrorMessage("");
      setSuccessMessage("");

      const result = await createAsaasCheckout({
        planSlug,
        billingType,
      });

      const invoiceUrl = result.asaas?.payment?.invoiceUrl;

      if (invoiceUrl) {
        window.location.href = invoiceUrl;
        return;
      }

      setSuccessMessage(
        "Assinatura criada, mas o link de pagamento ainda não foi gerado. Verifique no Asaas."
      );
    } catch (error) {
      console.error("Erro ao assinar plano:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Erro ao criar assinatura. Tente novamente.";

      setErrorMessage(message);
      alert(message);
    } finally {
      setProcessingPlanId("");
    }
  }

  async function handleCancelSubscription() {
    if (!subscription) {
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar a assinatura?"
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedSubscription = await cancelSubscription(subscription.id);
      setSubscription(updatedSubscription);
      setSuccessMessage("Assinatura cancelada.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao cancelar assinatura.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando assinatura...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="Billing"
      pageDescription="Gerencie plano, assinatura mensal, uso e histórico de pagamentos."
    >
      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {hasPendingSubscription && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold">Pagamento pendente</p>

              <p className="mt-1 leading-6">
                Sua assinatura foi criada, mas o pagamento ainda não foi
                confirmado. Finalize o pagamento para liberar o CRM completo.
              </p>
            </div>

            {pendingPaymentUrl ? (
              <a
                href={pendingPaymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continuar pagamento
              </a>
            ) : (
              <button
                type="button"
                onClick={() => currentPlan && handleSubscribe(currentPlan)}
                disabled={!currentPlan || processingPlanId === currentPlan?.id}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingPlanId === currentPlan?.id
                  ? "Buscando cobrança..."
                  : "Gerar link de pagamento"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Plano atual"
          value={currentPlan?.name || "Sem plano"}
          icon={<Crown className="h-5 w-5" />}
          active={Boolean(currentPlan)}
        />

        <MetricCard
          label="Status"
          value={
            subscription
              ? subscriptionStatusLabels[subscription.status]
              : "Não assinado"
          }
          icon={<ShieldCheck className="h-5 w-5" />}
        />

        <MetricCard
          label="Valor mensal"
          value={
            currentPlan
              ? `${formatCurrency(Number(currentPlan.price))}/mês`
              : "R$ 0,00"
          }
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                Assinatura atual
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                {currentPlan ? currentPlan.name : "Nenhum plano ativo"}
              </h2>

              <p className="mt-2 leading-7 text-slate-500">
                {currentPlanAccess?.description ||
                  currentPlan?.description ||
                  "Escolha um plano para liberar a estrutura comercial do Pubird Flow."}
              </p>
            </div>

            {subscription && (
              <StatusBadge status={subscription.status}>
                {subscriptionStatusLabels[subscription.status]}
              </StatusBadge>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4">
              <InfoRow
                label="Empresa"
                value={company?.name || "Não informada"}
              />

              <InfoRow
                label="Período atual"
                value={
                  subscription?.current_period_end
                    ? `Até ${new Date(
                        subscription.current_period_end
                      ).toLocaleDateString("pt-BR")}`
                    : "Sem período ativo"
                }
              />

              <InfoRow
                label="Cobrança"
                value={
                  currentPlan
                    ? `${formatCurrency(Number(currentPlan.price))} / mês`
                    : "Nenhuma"
                }
              />

              <InfoRow label="Gateway" value="Asaas" />
            </div>
          </div>

          {currentPlanAccess && (
            <div className="mt-5 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Uso do plano
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Acompanhe quanto sua empresa já utilizou dentro da assinatura
                  atual.
                </p>
              </div>

              <PlanUsageRow
                label="Leads"
                used={leads.length}
                limit={currentPlanAccess.maxLeads}
              />

              <PlanUsageRow
                label="Serviços"
                used={services.length}
                limit={currentPlanAccess.maxServices}
              />

              <PlanUsageRow
                label="Mensagens prontas"
                used={templates.length}
                limit={currentPlanAccess.maxMessageTemplates}
              />

              <PlanUsageRow
                label="Automações"
                used={0}
                limit={
                  currentPlanAccess.canUseAutomations
                    ? currentPlanAccess.maxAutomations
                    : 0
                }
              />
            </div>
          )}

          {subscription && subscription.status !== "cancelled" && (
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancelar assinatura
            </button>
          )}

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            Pagamentos conectados ao Asaas. Ao escolher ou trocar um plano, o
            cliente será enviado para a página de pagamento via Pix, boleto ou
            cartão.
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Planos disponíveis
            </h2>

            <p className="mt-2 text-slate-500">
              Escolha o plano ideal para sua operação comercial. Quanto maior o
              plano, mais limites, automações e recursos premium são liberados.
            </p>
          </div>

          <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setBillingType("PIX")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                billingType === "PIX"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Pix
            </button>

            <button
              type="button"
              onClick={() => setBillingType("BOLETO")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                billingType === "BOLETO"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Boleto
            </button>

            <button
              type="button"
              onClick={() => setBillingType("CREDIT_CARD")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                billingType === "CREDIT_CARD"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              Cartão
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const access = getPlanAccess(plan.slug) as PlanAccessView;
              const benefits = getPlanBenefits(plan, access);

              const isCurrent = currentPlanId === plan.id;
              const isProcessing = processingPlanId === plan.id;
              const isPro = plan.slug === "pro";
              const isBusiness = plan.slug === "business";

              const shouldDisableButton =
                (isCurrent && subscription?.status !== "pending") ||
                isProcessing;

              return (
                <article
                  key={plan.id}
                  className={`relative rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                    isBusiness
                      ? "border-slate-950 bg-slate-950 text-white"
                      : isPro
                        ? "border-indigo-300 bg-indigo-50"
                        : isCurrent
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {isPro && !isBusiness && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      Mais recomendado
                    </div>
                  )}

                  {isBusiness && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                      <Crown className="h-3.5 w-3.5" />
                      Mais completo
                    </div>
                  )}

                  {isCurrent && (
                    <div
                      className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        isBusiness
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {subscription?.status === "pending"
                        ? "Pagamento pendente"
                        : "Plano atual"}
                    </div>
                  )}

                  <h3
                    className={`text-xl font-bold ${
                      isBusiness ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  <p
                    className={`mt-2 min-h-16 text-sm leading-6 ${
                      isBusiness ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {access.description ||
                      plan.description ||
                      "Plano do Pubird Flow."}
                  </p>

                  <div className="mt-5">
                    <span
                      className={`text-3xl font-bold tracking-tight ${
                        isBusiness ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {formatCurrency(Number(plan.price))}
                    </span>

                    <span
                      className={`text-sm ${
                        isBusiness ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      /mês
                    </span>
                  </div>

                  <div
                    className={`mt-5 grid gap-2 rounded-2xl border p-3 text-xs ${
                      isBusiness
                        ? "border-white/10 bg-white/5 text-slate-200"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <PlanHighlight
                      label="Leads"
                      value={formatLimit(access.maxLeads)}
                      dark={isBusiness}
                    />

                    <PlanHighlight
                      label="Usuários"
                      value={formatLimit(access.maxUsers)}
                      dark={isBusiness}
                    />

                    <PlanHighlight
                      label="Automações"
                      value={
                        access.canUseAutomations
                          ? formatLimit(access.maxAutomations)
                          : "Não incluso"
                      }
                      dark={isBusiness}
                    />
                  </div>

                  <div className="mt-5 space-y-2">
                    {benefits.map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-start gap-2 text-sm ${
                          isBusiness ? "text-slate-200" : "text-slate-600"
                        }`}
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isBusiness ? "text-emerald-300" : "text-emerald-600"
                          }`}
                        />

                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan)}
                    disabled={shouldDisableButton}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isBusiness
                        ? "bg-white text-slate-950 hover:bg-slate-100"
                        : isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isProcessing && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {isCurrent
                      ? subscription?.status === "pending"
                        ? "Continuar pagamento"
                        : "Plano atual"
                      : currentPlan
                        ? `Trocar para ${plan.name}`
                        : "Assinar plano"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ReceiptText className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold">Histórico de pagamentos</h2>

            <p className="text-sm text-slate-500">
              Pagamentos registrados para esta empresa.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <div>
              <ReceiptText className="mx-auto h-10 w-10 text-slate-400" />

              <h3 className="mt-4 font-semibold text-slate-900">
                Nenhum pagamento registrado ainda
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Quando o Asaas confirmar cobranças e pagamentos, eles
                aparecerão aqui automaticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Valor</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Método</th>
                  <th className="px-5 py-4">Vencimento</th>
                  <th className="px-5 py-4">Pago em</th>
                  <th className="px-5 py-4">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => {
                  const dueDate = payment.due_date || payment.due_at;
                  const paymentUrl =
                    payment.invoice_url ||
                    payment.bank_slip_url ||
                    payment.receipt_url;

                  return (
                    <tr key={payment.id}>
                      <td className="px-5 py-4 font-semibold text-slate-950">
                        {formatCurrency(Number(payment.amount))}
                      </td>

                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={payment.status}>
                          {paymentStatusLabels[payment.status]}
                        </PaymentStatusBadge>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatBillingType(
                          payment.billing_type || payment.payment_method
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {dueDate
                          ? new Date(dueDate).toLocaleDateString("pt-BR")
                          : "Sem vencimento"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleDateString(
                              "pt-BR"
                            )
                          : "Não pago"}
                      </td>

                      <td className="px-5 py-4">
                        {paymentUrl ? (
                          <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            Ver cobrança
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Indisponível
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

function getPlanBenefits(plan: Plan, access: PlanAccessView) {
  if (access.benefits && access.benefits.length > 0) {
    return access.benefits;
  }

  if (plan.features && plan.features.length > 0) {
    return plan.features;
  }

  if (plan.slug === "business") {
    return [
      "Tudo do Pro",
      "Social Studio liberado",
      "Relatórios avançados",
      "Branding personalizado",
      "Suporte prioritário",
    ];
  }

  if (plan.slug === "pro") {
    return [
      "Tudo do Starter",
      "Automações comerciais",
      "CRM completo",
      "Relatórios comerciais",
      "Gestão básica de equipe",
    ];
  }

  return [
    "CRM de leads",
    "Página pública da empresa",
    "Mensagens prontas",
    "Follow-up comercial",
    "Histórico básico",
  ];
}

function formatLimit(value?: number) {
  return formatPlanLimit(value);
}

function MetricCard(props: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        props.active
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
          props.active
            ? "bg-indigo-600 text-white"
            : "bg-indigo-50 text-indigo-600"
        }`}
      >
        {props.icon}
      </div>

      <p className="text-sm text-slate-500">{props.label}</p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {props.value}
      </p>
    </div>
  );
}

function PlanUsageRow(props: {
  label: string;
  used: number;
  limit?: number;
}) {
  const unlimited = isUnlimitedLimit(props.limit);
  const blocked = !unlimited && props.limit === 0;

  const percent =
    unlimited || blocked || !props.limit
      ? 0
      : Math.min((props.used / props.limit) * 100, 100);

  const nearLimit = !unlimited && !blocked && percent >= 80;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {props.label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {blocked
              ? "Recurso não incluso neste plano"
              : unlimited
                ? `${props.used} usados / ilimitado`
                : `${props.used} usados / ${formatPlanLimit(props.limit)}`}
          </p>
        </div>

        {nearLimit && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Perto do limite
          </span>
        )}

        {blocked && (
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Bloqueado
          </span>
        )}

        {unlimited && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Ilimitado
          </span>
        )}
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            nearLimit ? "bg-amber-500" : "bg-indigo-600"
          }`}
          style={{
            width: unlimited ? "100%" : `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

function PlanHighlight(props: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={props.dark ? "text-slate-300" : "text-slate-500"}>
        {props.label}
      </span>

      <span
        className={`font-bold ${
          props.dark ? "text-white" : "text-slate-950"
        }`}
      >
        {props.value}
      </span>
    </div>
  );
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">{props.label}</span>

      <span className="text-right font-semibold text-slate-900">
        {props.value}
      </span>
    </div>
  );
}

function StatusBadge(props: {
  status: SubscriptionWithPlan["status"];
  children: React.ReactNode;
}) {
  const styles: Record<SubscriptionWithPlan["status"], string> = {
    pending: "bg-amber-100 text-amber-700",
    trialing: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
    past_due: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    expired: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[props.status]}`}
    >
      {props.children}
    </span>
  );
}

function PaymentStatusBadge(props: {
  status: Payment["status"];
  children: React.ReactNode;
}) {
  const styles: Record<Payment["status"], string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-blue-100 text-blue-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[props.status]}`}
    >
      {props.children}
    </span>
  );
}
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
  formatCurrency,
  getCurrentSubscription,
  getPayments,
  getPlans,
  Payment,
  paymentStatusLabels,
  Plan,
  subscribeCompany,
  SubscriptionWithPlan,
  subscriptionStatusLabels,
} from "../../lib/billing";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

function BillingPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<SubscriptionWithPlan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

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

        const [plansData, subscriptionData, paymentsData] = await Promise.all([
          getPlans(),
          getCurrentSubscription(userCompany.id),
          getPayments(userCompany.id),
        ]);

        setPlans(plansData);
        setSubscription(subscriptionData);
        setPayments(paymentsData);
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

  async function handleSubscribe(plan: Plan) {
    if (!company) {
      return;
    }

    const confirmed = window.confirm(
      `Confirmar alteração para o plano ${plan.name}?`
    );

    if (!confirmed) {
      return;
    }

    setProcessingPlanId(plan.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedSubscription = await subscribeCompany({
        companyId: company.id,
        planId: plan.id,
      });

      setSubscription(updatedSubscription);
      setSuccessMessage(`Plano ${plan.name} ativado com sucesso.`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao ativar plano.");
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
      pageDescription="Gerencie plano, assinatura mensal e histórico de pagamentos."
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
                {currentPlan?.description ||
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

              <InfoRow
                label="Gateway"
                value="Preparado para Asaas / Mercado Pago / Stripe"
              />
            </div>
          </div>

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

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Esta tela ainda usa ativação manual/simulada. O próximo passo é
            conectar um gateway real, como Asaas ou Mercado Pago, para cobrança
            mensal automática via Pix, cartão ou boleto.
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Planos disponíveis
            </h2>

            <p className="mt-2 text-slate-500">
              Escolha o plano ideal para sua operação comercial.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlanId === plan.id;

              return (
                <article
                  key={plan.id}
                  className={`rounded-3xl border p-5 ${
                    isCurrent
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {isCurrent && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Plano atual
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-slate-950">
                    {plan.name}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                    {plan.description || "Plano do Pubird Flow."}
                  </p>

                  <div className="mt-5">
                    <span className="text-3xl font-bold tracking-tight text-slate-950">
                      {formatCurrency(Number(plan.price))}
                    </span>

                    <span className="text-sm text-slate-500">/mês</span>
                  </div>

                  <div className="mt-5 space-y-2">
                    {(plan.features || []).slice(0, 5).map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{feature}</span>
                      </div>
                    ))}

                    {(!plan.features || plan.features.length === 0) && (
                      <>
                        <Feature>CRM de leads</Feature>
                        <Feature>Follow-up comercial</Feature>
                        <Feature>Página pública</Feature>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrent || processingPlanId === plan.id}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {processingPlanId === plan.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {isCurrent ? "Plano atual" : "Escolher plano"}
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
                Quando o gateway de pagamento for integrado, cobranças e
                pagamentos aparecerão aqui automaticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Valor</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Método</th>
                  <th className="px-5 py-4">Vencimento</th>
                  <th className="px-5 py-4">Pago em</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
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
                      {payment.payment_method || "Não informado"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.due_at
                        ? new Date(payment.due_at).toLocaleDateString("pt-BR")
                        : "Sem vencimento"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString("pt-BR")
                        : "Não pago"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
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

function Feature(props: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{props.children}</span>
    </div>
  );
}

function StatusBadge(props: {
  status: SubscriptionWithPlan["status"];
  children: React.ReactNode;
}) {
  const styles: Record<SubscriptionWithPlan["status"], string> = {
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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Crown,
  Globe,
  Loader2,
  MessageCircle,
  Phone,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import { getLeads, Lead } from "../../lib/leads";
import { getServices, Service } from "../../lib/services";
import {
  getMessageTemplates,
  MessageTemplate,
} from "../../lib/message-templates";
import { useCurrentPlan } from "../../hooks/useCurrentPlan";
import {
  formatPlanLimit,
  getPlanAccess,
  isUnlimitedLimit,
} from "../../lib/planAccess";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const {
    loading: loadingPlan,
    planSlug,
    planName,
    subscription,
  } = useCurrentPlan();

  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
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

        const [leadsData, servicesData, templatesData] = await Promise.all([
          getLeads(userCompany.id),
          getServices(userCompany.id),
          getMessageTemplates(userCompany.id),
        ]);

        setLeads(leadsData);
        setServices(servicesData);
        setTemplates(templatesData);
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const planAccess = useMemo(() => {
    return getPlanAccess(planSlug);
  }, [planSlug]);

  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const inProgressLeads = leads.filter((lead) =>
    ["contacted", "qualified", "proposal"].includes(lead.status)
  ).length;
  const wonLeads = leads.filter((lead) => lead.status === "won").length;

  const activeServices = services.filter(
    (service) => service.status === "active"
  ).length;

  const activeTemplates = templates.filter(
    (template) => template.status === "active"
  ).length;

  const planUsageItems = [
    {
      label: "Leads",
      used: leads.length,
      limit: planAccess.maxLeads,
      href: "/dashboard/leads",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Serviços",
      used: services.length,
      limit: planAccess.maxServices,
      href: "/dashboard/services",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      label: "Mensagens",
      used: templates.length,
      limit: planAccess.maxMessageTemplates,
      href: "/dashboard/messages",
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      label: "Automações",
      used: 0,
      limit: planAccess.maxAutomations,
      href: "/dashboard/automations",
      icon: <Workflow className="h-4 w-4" />,
    },
  ];

  const hasNearLimitItem = planUsageItems.some((item) => {
    if (isUnlimitedLimit(item.limit) || item.limit <= 0) {
      return false;
    }

    return item.used / item.limit >= 0.8;
  });

  if (checking || loadingPlan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando dashboard...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="Dashboard"
      pageDescription="Visão geral da operação comercial da empresa."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total de leads" value={leads.length} />
        <MetricCard label="Novos leads" value={newLeads} />
        <MetricCard label="Em atendimento" value={inProgressLeads} />
        <MetricCard label="Vendas fechadas" value={wonLeads} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Crown className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Uso do plano {planName || "atual"}
              </h2>

              <p className="text-sm text-slate-500">
                Acompanhe os limites da sua assinatura e identifique quando é
                hora de fazer upgrade.
              </p>
            </div>
          </div>

          {hasNearLimitItem && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Você está perto de atingir um ou mais limites do plano atual.
              Considere fazer upgrade para liberar mais capacidade.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {planUsageItems.map((item) => (
              <PlanUsageCard
                key={item.label}
                label={item.label}
                used={item.used}
                limit={item.limit}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-950">
                Plano atual: {planName || "Não identificado"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Status:{" "}
                {subscription?.status === "active"
                  ? "Ativo"
                  : subscription?.status || "Sem assinatura"}
              </p>
            </div>

            <Link
              to="/dashboard/billing"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ver planos
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">{company?.name}</h2>
              <p className="text-sm text-slate-500">
                Empresa cadastrada no Pubird Flow.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <InfoCard
              icon={<Phone className="h-4 w-4" />}
              label="Telefone"
              value={company?.phone || "Não informado"}
            />

            <InfoCard
              icon={<Globe className="h-4 w-4" />}
              label="Site"
              value={company?.website || "Não informado"}
            />

            <InfoCard
              icon={<Building2 className="h-4 w-4" />}
              label="Status"
              value={company?.status || "active"}
            />

            <InfoCard
              icon={<MessageCircle className="h-4 w-4" />}
              label="Mensagens ativas"
              value={String(activeTemplates)}
            />

            <InfoCard
              icon={<Building2 className="h-4 w-4" />}
              label="Serviços ativos"
              value={String(activeServices)}
            />
          </div>

          {company?.slug && (
            <a
              href={`/empresa/${company.slug}`}
              className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Ver página pública
            </a>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Resumo comercial</h2>
              <p className="text-sm text-slate-500">
                Seus principais indicadores comerciais em tempo real.
              </p>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <div>
                <Users className="mx-auto h-10 w-10 text-slate-400" />

                <h3 className="mt-4 font-semibold text-slate-900">
                  Nenhum lead cadastrado ainda
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Quando você cadastrar leads ou receber contatos pela página
                  pública, seus dados aparecerão aqui.
                </p>

                <Link
                  to="/dashboard/leads"
                  className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Cadastrar primeiro lead
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <SummaryCard
                label="Taxa de fechamento"
                value={`${calculateWinRate(leads.length, wonLeads)}%`}
                description="Percentual de leads marcados como venda fechada."
              />

              <SummaryCard
                label="Leads em andamento"
                value={inProgressLeads}
                description="Leads em contato, qualificação ou proposta."
              />

              <SummaryCard
                label="Serviços ativos"
                value={activeServices}
                description="Serviços visíveis e prontos para captação."
              />

              <SummaryCard
                label="Mensagens ativas"
                value={activeTemplates}
                description="Modelos prontos para acelerar atendimento."
              />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Próximas ações recomendadas
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use estes atalhos para evoluir sua operação comercial.
          </p>

          <div className="mt-5 space-y-3">
            <QuickAction
              title="Cadastrar leads"
              description="Adicione oportunidades comerciais ao CRM."
              href="/dashboard/leads"
            />

            <QuickAction
              title="Criar mensagens prontas"
              description="Padronize respostas e acelere o atendimento."
              href="/dashboard/messages"
            />

            <QuickAction
              title="Organizar serviços"
              description="Melhore a página pública da empresa."
              href="/dashboard/services"
            />

            <QuickAction
              title="Ver automações"
              description="Acompanhe fluxos que reduzem tarefas manuais."
              href="/dashboard/automations"
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function calculateWinRate(totalLeads: number, wonLeads: number) {
  if (totalLeads <= 0) {
    return 0;
  }

  return Math.round((wonLeads / totalLeads) * 100);
}

function MetricCard(props: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{props.label}</p>

      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
        {props.value}
      </p>
    </div>
  );
}

function PlanUsageCard(props: {
  label: string;
  used: number;
  limit: number;
  href: string;
  icon: React.ReactNode;
}) {
  const unlimited = isUnlimitedLimit(props.limit);
  const percent =
    unlimited || props.limit <= 0
      ? 0
      : Math.min((props.used / props.limit) * 100, 100);

  const isNearLimit = !unlimited && props.limit > 0 && percent >= 80;
  const isBlocked = !unlimited && props.limit === 0;

  return (
    <Link
      to={props.href}
      className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            {props.icon}
          </span>
          {props.label}
        </div>

        {isNearLimit && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Perto do limite
          </span>
        )}

        {isBlocked && (
          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Bloqueado
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-slate-950">{props.used}</p>

        <p className="text-sm font-medium text-slate-500">
          / {formatPlanLimit(props.limit)}
        </p>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? "bg-amber-500" : "bg-indigo-600"
          }`}
          style={{
            width: unlimited ? "100%" : `${percent}%`,
          }}
        />
      </div>

      {unlimited && (
        <p className="mt-3 text-xs font-medium text-emerald-600">
          Uso ilimitado liberado neste plano.
        </p>
      )}
    </Link>
  );
}

function SummaryCard(props: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{props.label}</p>

      <p className="mt-3 text-3xl font-bold text-slate-950">{props.value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {props.description}
      </p>
    </div>
  );
}

function QuickAction(props: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      to={props.href}
      className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
    >
      <p className="font-semibold text-slate-950">{props.title}</p>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {props.description}
      </p>
    </Link>
  );
}

function InfoCard(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {props.icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          {props.label}
        </span>
      </div>

      <p className="break-words text-sm font-semibold text-slate-900">
        {props.value}
      </p>
    </div>
  );
}
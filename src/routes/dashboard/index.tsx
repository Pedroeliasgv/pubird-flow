import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Loader2,
  MessageCircle,
  Phone,
  TrendingUp,
  Users,
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

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

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

  if (checking) {
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

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Próximas ações recomendadas
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use estes atalhos para evoluir sua operação comercial.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
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
            title="Ver plano e uso"
            description="Acompanhe assinatura, limites e cobranças."
            href="/dashboard/billing"
          />
        </div>
      </section>
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
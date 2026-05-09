import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import { getLeadMetrics, getLeads, Lead, leadStatusLabels } from "../../lib/leads";
import {
  FollowUpTask,
  followUpPriorityLabels,
  getFollowUpMetrics,
  getFollowUpTasks,
  isTaskOverdue,
} from "../../lib/follow-up";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpTask[]>([]);
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

        const [leadsData, followUpsData] = await Promise.all([
          getLeads(userCompany.id),
          getFollowUpTasks(userCompany.id),
        ]);

        setLeads(leadsData);
        setFollowUps(followUpsData);
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const leadMetrics = getLeadMetrics(leads);
  const followUpMetrics = getFollowUpMetrics(followUps);

  const importantFollowUps = useMemo(() => {
    return followUps
      .filter((task) => {
        const isOpen =
          task.status === "pending" || task.status === "in_progress";

        return isOpen || isTaskOverdue(task);
      })
      .sort((a, b) => {
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;

        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      })
      .slice(0, 5);
  }, [followUps]);

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
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Total de leads" value={leadMetrics.total} />
        <MetricCard label="Novos leads" value={leadMetrics.newLeads} />
        <MetricCard label="Contactados" value={leadMetrics.contacted} />
        <MetricCard label="Vendas fechadas" value={leadMetrics.won} />
        <MetricCard label="Conversão" value={`${leadMetrics.conversionRate}%`} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <FollowUpMetricCard
          label="Follow-ups pendentes"
          value={followUpMetrics.pending}
          icon={<Clock className="h-5 w-5" />}
        />

        <FollowUpMetricCard
          label="Em andamento"
          value={followUpMetrics.inProgress}
          icon={<CalendarClock className="h-5 w-5" />}
        />

        <FollowUpMetricCard
          label="Concluídos"
          value={followUpMetrics.completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <FollowUpMetricCard
          label="Atrasados"
          value={followUpMetrics.overdue}
          icon={<CalendarClock className="h-5 w-5" />}
          danger
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold">Últimos leads</h2>
                <p className="text-sm text-slate-500">
                  Contatos comerciais mais recentes.
                </p>
              </div>
            </div>

            <a
              href="/dashboard/leads"
              className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:inline-flex"
            >
              Ver leads
            </a>
          </div>

          {leads.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <div>
                <Users className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-4 font-semibold text-slate-900">
                  Nenhum lead cadastrado ainda
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Cadastre seu primeiro lead para alimentar o dashboard e o CRM.
                </p>
                <a
                  href="/dashboard/leads"
                  className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Cadastrar primeiro lead
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 6).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{lead.name}</p>
                    <p className="text-sm text-slate-500">
                      {lead.source || "Origem não informada"}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {leadStatusLabels[lead.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  followUpMetrics.overdue > 0
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                <CalendarClock className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold">Follow-ups importantes</h2>
                <p className="text-sm text-slate-500">
                  Tarefas pendentes e atrasadas.
                </p>
              </div>
            </div>

            <a
              href="/dashboard/follow-up"
              className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:inline-flex"
            >
              Ver todos
            </a>
          </div>

          {importantFollowUps.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <div>
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <h3 className="mt-4 font-semibold text-slate-900">
                  Nenhum follow-up pendente
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Quando existirem tarefas comerciais pendentes ou atrasadas,
                  elas aparecerão aqui.
                </p>
                <a
                  href="/dashboard/follow-up"
                  className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Criar follow-up
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {importantFollowUps.map((task) => {
                const overdue = isTaskOverdue(task);

                return (
                  <a
                    key={task.id}
                    href="/dashboard/follow-up"
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      overdue
                        ? "border-red-200 bg-red-50 hover:bg-red-100"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {task.title}
                        </p>

                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {task.description || "Sem descrição."}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          overdue
                            ? "bg-red-100 text-red-700"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {overdue ? "Atrasado" : followUpPriorityLabels[task.priority]}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
                      <span>
                        {task.due_at
                          ? new Date(task.due_at).toLocaleString("pt-BR")
                          : "Sem vencimento"}
                      </span>

                      <span>
                        {task.status === "pending"
                          ? "Pendente"
                          : task.status === "in_progress"
                            ? "Em andamento"
                            : task.status}
                      </span>
                    </div>
                  </a>
                );
              })}

              <a
                href="/dashboard/follow-up"
                className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Gerenciar follow-ups
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <div className="grid gap-3 md:grid-cols-3">
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
        </div>

        {company?.slug && (
          <a
            href={`/empresa/${company.slug}`}
            className="mt-5 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Ver página pública
          </a>
        )}
      </div>
    </DashboardLayout>
  );
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

function FollowUpMetricCard(props: {
  label: string;
  value: number;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        props.danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${
          props.danger
            ? "bg-red-100 text-red-600"
            : "bg-indigo-50 text-indigo-600"
        }`}
      >
        {props.icon}
      </div>

      <p
        className={`text-sm ${
          props.danger ? "text-red-600" : "text-slate-500"
        }`}
      >
        {props.label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          props.danger ? "text-red-700" : "text-slate-950"
        }`}
      >
        {props.value}
      </p>
    </div>
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
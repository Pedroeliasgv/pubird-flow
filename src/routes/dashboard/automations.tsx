import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  LockKeyhole,
  MessageCircle,
  MousePointerClick,
  Sparkles,
  Workflow,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/automations")({
  component: AutomationsPage,
});

const automations = [
  {
    title: "Lead público → Follow-up automático",
    description:
      "Quando alguém preencher a página pública da empresa, o Pubird Flow cria o lead no CRM e gera automaticamente uma tarefa de follow-up para retorno comercial.",
    status: "active",
    badge: "Ativa",
    icon: CalendarClock,
    trigger: "Novo lead pela página pública",
    action: "Criar tarefa de follow-up",
    impact:
      "Evita que leads recebidos pela página pública sejam esquecidos pela equipe.",
  },
  {
    title: "Lead novo → Mensagem inicial sugerida",
    description:
      "Quando um lead novo for criado, o sistema poderá sugerir automaticamente uma mensagem pronta para iniciar o atendimento.",
    status: "soon",
    badge: "Em breve",
    icon: MessageCircle,
    trigger: "Novo lead cadastrado",
    action: "Sugerir mensagem pronta",
    impact:
      "Ajuda a equipe a responder mais rápido usando mensagens padronizadas.",
  },
  {
    title: "Lead parado → Criar tarefa de retorno",
    description:
      "Quando um lead ficar muitos dias sem interação, o sistema poderá criar uma tarefa de retorno automaticamente.",
    status: "soon",
    badge: "Em breve",
    icon: Clock,
    trigger: "Lead sem interação",
    action: "Criar follow-up",
    impact:
      "Reduz perda de oportunidades por falta de acompanhamento.",
  },
  {
    title: "Proposta enviada → Lembrete comercial",
    description:
      "Quando um lead entrar no status de proposta, o sistema poderá gerar um lembrete automático para acompanhar a decisão.",
    status: "soon",
    badge: "Em breve",
    icon: BellRing,
    trigger: "Lead no status Proposta",
    action: "Criar lembrete",
    impact:
      "Ajuda a equipe a não abandonar negociações abertas.",
  },
  {
    title: "Venda fechada → Registro de sucesso",
    description:
      "Quando um lead for marcado como fechado, o sistema poderá registrar uma interação de sucesso e sugerir próximos passos.",
    status: "soon",
    badge: "Em breve",
    icon: CheckCircle2,
    trigger: "Lead marcado como Fechado",
    action: "Registrar interação",
    impact:
      "Melhora o histórico comercial e ajuda na organização dos resultados.",
  },
];

function AutomationsPage() {
  const activeAutomations = automations.filter(
    (automation) => automation.status === "active"
  ).length;

  const soonAutomations = automations.filter(
    (automation) => automation.status === "soon"
  ).length;

  return (
    <DashboardLayout
      pageTitle="Automações"
      pageDescription="Veja quais fluxos automáticos estão ajudando sua empresa a organizar leads, tarefas e vendas."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Automações ativas"
          value={activeAutomations}
          icon={<Workflow className="h-5 w-5" />}
          active
        />

        <MetricCard
          label="Em breve"
          value={soonAutomations}
          icon={<Sparkles className="h-5 w-5" />}
        />

        <MetricCard
          label="Impacto principal"
          value="Follow-up"
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Automação real ativa
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Seu sistema já cria follow-ups automaticamente quando um lead
              entra pela página pública.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Isso significa que o lead não fica perdido. Assim que alguém
              preenche o formulário público da empresa, o Pubird Flow cria o
              contato no CRM e gera uma tarefa para a equipe retornar.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/dashboard/follow-up"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ver follow-ups
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/dashboard/leads"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Ver leads
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4">
              <FlowStep
                number="01"
                title="Visitante preenche a página pública"
                description="A pessoa envia nome, WhatsApp, serviço de interesse e mensagem."
              />

              <FlowConnector />

              <FlowStep
                number="02"
                title="Lead entra automaticamente no CRM"
                description="O contato é salvo com origem Página Pública e status Novo."
              />

              <FlowConnector />

              <FlowStep
                number="03"
                title="Follow-up é criado sozinho"
                description="O sistema cria uma tarefa com prioridade alta para retorno comercial."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {automations.map((automation) => {
          const Icon = automation.icon;
          const isActive = automation.status === "active";

          return (
            <article
              key={automation.title}
              className={`rounded-[2rem] border p-6 shadow-sm ${
                isActive
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {automation.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-slate-950">
                {automation.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {automation.description}
              </p>

              <div className="mt-6 grid gap-3">
                <AutomationDetail
                  label="Gatilho"
                  value={automation.trigger}
                  icon={<MousePointerClick className="h-4 w-4" />}
                />

                <AutomationDetail
                  label="Ação"
                  value={automation.action}
                  icon={<Workflow className="h-4 w-4" />}
                />

                <AutomationDetail
                  label="Impacto"
                  value={automation.impact}
                  icon={<Sparkles className="h-4 w-4" />}
                />
              </div>

              {!isActive && (
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  <LockKeyhole className="h-4 w-4" />
                  Essa automação será liberada em uma próxima versão.
                </div>
              )}
            </article>
          );
        })}
      </div>
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
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
          props.active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-indigo-50 text-indigo-600"
        }`}
      >
        {props.icon}
      </div>

      <p
        className={`text-sm ${
          props.active ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {props.label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {props.value}
      </p>
    </div>
  );
}

function FlowStep(props: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          {props.number}
        </div>

        <div>
          <h3 className="font-bold text-slate-950">{props.title}</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {props.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="ml-5 h-7 w-px bg-slate-200" />
  );
}

function AutomationDetail(props: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {props.icon}
        {props.label}
      </div>

      <p className="text-sm font-medium text-slate-900">{props.value}</p>
    </div>
  );
}
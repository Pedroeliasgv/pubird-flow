import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Loader2,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
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
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    }

    loadDashboard();
  }, [navigate]);

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
        <MetricCard label="Total de leads" value="0" />
        <MetricCard label="Novos leads" value="0" />
        <MetricCard label="Em atendimento" value="0" />
        <MetricCard label="Vendas fechadas" value="0" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold">Resumo comercial</h2>
              <p className="text-sm text-slate-500">
                Seus indicadores aparecerão aqui quando os leads forem cadastrados.
              </p>
            </div>
          </div>

          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <div>
              <Users className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 font-semibold text-slate-900">
                Nenhum lead cadastrado ainda
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Quando você cadastrar leads ou receber contatos pela página pública,
                seus dados aparecerão aqui.
              </p>
              <a
                href="/dashboard/leads"
                className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Cadastrar primeiro lead
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
          </div>

          {company?.slug && (
            <a
              href={`/empresa/${company.slug}`}
              className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Ver página pública
            </a>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{props.label}</p>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
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
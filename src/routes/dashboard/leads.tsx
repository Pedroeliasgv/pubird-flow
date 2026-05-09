import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <DashboardLayout
      pageTitle="Leads"
      pageDescription="Cadastre, organize e acompanhe seus contatos comerciais."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Users className="h-7 w-7" />
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight">
          Gestão de Leads
        </h2>

        <p className="mt-2 max-w-xl text-slate-500">
          Aqui ficará a listagem de leads, cadastro manual, filtros, edição e
          exclusão de contatos.
        </p>
      </div>
    </DashboardLayout>
  );
}
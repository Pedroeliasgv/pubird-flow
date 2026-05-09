import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/crm")({
  component: CrmPage,
});

function CrmPage() {
  return (
    <DashboardLayout
      pageTitle="CRM"
      pageDescription="Visualize seus leads em um funil comercial estilo Kanban."
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {["Novo", "Contactado", "Qualificado", "Proposta", "Fechado", "Perdido"].map(
          (column) => (
            <div
              key={column}
              className="min-h-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{column}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  0
                </span>
              </div>

              <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                <div>
                  <BarChart3 className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="mt-2 text-xs text-slate-500">Sem leads</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Phone, Thermometer } from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import {
  getLeads,
  Lead,
  LeadStatus,
  leadStatusLabels,
  leadTemperatureLabels,
  updateLeadStatus,
} from "../../lib/leads";

export const Route = createFileRoute("/dashboard/crm")({
  component: CrmPage,
});

const columns: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

function CrmPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

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

        const data = await getLeads(userCompany.id);
        setLeads(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const leadsByStatus = useMemo(() => {
    return columns.reduce(
      (acc, status) => {
        acc[status] = leads.filter((lead) => lead.status === status);
        return acc;
      },
      {} as Record<LeadStatus, Lead[]>
    );
  }, [leads]);

  async function handleMoveLead(lead: Lead, status: LeadStatus) {
    try {
      setUpdatingLeadId(lead.id);

      const updated = await updateLeadStatus({
        leadId: lead.id,
        status,
      });

      setLeads((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao mover lead.");
    } finally {
      setUpdatingLeadId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando CRM...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="CRM"
      pageDescription="Visualize seus leads em um funil comercial estilo Kanban."
    >
      <div className="grid gap-4 xl:grid-cols-6">
        {columns.map((column) => (
          <div
            key={column}
            className="min-h-[520px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-950">
                {leadStatusLabels[column]}
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                {leadsByStatus[column]?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {leadsByStatus[column]?.length === 0 ? (
                <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
                  <p className="text-xs text-slate-400">Sem leads</p>
                </div>
              ) : (
                leadsByStatus[column].map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-semibold text-slate-950">{lead.name}</p>

                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone || "Sem telefone"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Thermometer className="h-3.5 w-3.5" />
                        {leadTemperatureLabels[lead.temperature]}
                      </div>
                    </div>

                    <select
                      value={lead.status}
                      disabled={updatingLeadId === lead.id}
                      onChange={(event) =>
                        handleMoveLead(lead, event.target.value as LeadStatus)
                      }
                      className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
                    >
                      {columns.map((status) => (
                        <option key={status} value={status}>
                          Mover para {leadStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
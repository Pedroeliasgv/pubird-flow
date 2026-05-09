import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Pencil,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import {
  createLead,
  deleteLead,
  getLeads,
  Lead,
  LeadStatus,
  LeadTemperature,
  leadSources,
  leadStatusLabels,
  leadTemperatureLabels,
  updateLead,
} from "../../lib/leads";

export const Route = createFileRoute("/dashboard/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("Instagram");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [temperature, setTemperature] = useState<LeadTemperature>("cold");
  const [notes, setNotes] = useState("");

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

        const data = await getLeads(userCompany.id);
        setLeads(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao carregar leads.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : lead.status === statusFilter;

      const matchesSource =
        sourceFilter === "all" ? true : lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  function resetForm() {
    setEditingLead(null);
    setName("");
    setPhone("");
    setEmail("");
    setSource("Instagram");
    setStatus("new");
    setTemperature("cold");
    setNotes("");
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(lead: Lead) {
    setEditingLead(lead);
    setName(lead.name);
    setPhone(lead.phone || "");
    setEmail(lead.email || "");
    setSource(lead.source || "Instagram");
    setStatus(lead.status);
    setTemperature(lead.temperature);
    setNotes(lead.notes || "");
    setIsFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingLead) {
        const updated = await updateLead({
          leadId: editingLead.id,
          name,
          phone,
          email,
          source,
          status,
          temperature,
          notes,
        });

        setLeads((current) =>
          current.map((lead) => (lead.id === updated.id ? updated : lead))
        );

        setSuccessMessage("Lead atualizado com sucesso.");
      } else {
        const created = await createLead({
          companyId: company.id,
          name,
          phone,
          email,
          source,
          status,
          temperature,
          notes,
        });

        setLeads((current) => [created, ...current]);
        setSuccessMessage("Lead cadastrado com sucesso.");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao salvar lead.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLead(leadId: string) {
    const confirmed = window.confirm("Deseja excluir este lead?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteLead(leadId);
      setLeads((current) => current.filter((lead) => lead.id !== leadId));
      setSuccessMessage("Lead excluído com sucesso.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao excluir lead.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando leads...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="Leads"
      pageDescription="Cadastre, organize e acompanhe seus contatos comerciais."
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

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Total" value={leads.length} />
          <MiniMetric
            label="Novos"
            value={leads.filter((lead) => lead.status === "new").length}
          />
          <MiniMetric
            label="Fechados"
            value={leads.filter((lead) => lead.status === "won").length}
          />
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Novo lead
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input-light pl-11"
              placeholder="Buscar por nome, telefone ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="input-light"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as LeadStatus | "all")
            }
          >
            <option value="all">Todos os status</option>
            {Object.entries(leadStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className="input-light"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
          >
            <option value="all">Todas as origens</option>
            {leadSources.map((sourceItem) => (
              <option key={sourceItem} value={sourceItem}>
                {sourceItem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {filteredLeads.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-xl font-bold">Nenhum lead encontrado</h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Cadastre seu primeiro lead para começar a acompanhar oportunidades
              comerciais.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Cadastrar lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Lead</th>
                  <th className="px-5 py-4">Contato</th>
                  <th className="px-5 py-4">Origem</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Temperatura</th>
                  <th className="px-5 py-4">Criado em</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">
                        {lead.name}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {lead.notes || "Sem observações"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>{lead.phone || "Sem telefone"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.email || "Sem e-mail"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Badge>{lead.source || "Outro"}</Badge>
                    </td>

                    <td className="px-5 py-4">
                      <Badge>{leadStatusLabels[lead.status]}</Badge>
                    </td>

                    <td className="px-5 py-4">
                      <TemperatureBadge temperature={lead.temperature} />
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(lead)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingLead ? "Editar lead" : "Novo lead"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha as informações do contato comercial.
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nome" required>
                  <input
                    className="input-light"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nome do lead"
                    required
                  />
                </Field>

                <Field label="Telefone / WhatsApp">
                  <input
                    className="input-light"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </Field>
              </div>

              <Field label="E-mail">
                <input
                  type="email"
                  className="input-light"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="lead@email.com"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Origem">
                  <select
                    className="input-light"
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                  >
                    {leadSources.map((sourceItem) => (
                      <option key={sourceItem} value={sourceItem}>
                        {sourceItem}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    className="input-light"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as LeadStatus)
                    }
                  >
                    {Object.entries(leadStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Temperatura">
                  <select
                    className="input-light"
                    value={temperature}
                    onChange={(event) =>
                      setTemperature(event.target.value as LeadTemperature)
                    }
                  >
                    {Object.entries(leadTemperatureLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </Field>
              </div>

              <Field label="Observações">
                <textarea
                  className="input-light min-h-28 resize-none"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ex: pediu orçamento pelo Instagram..."
                />
              </Field>

              <button
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingLead ? "Salvar alterações" : "Cadastrar lead"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MiniMetric(props: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {props.label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{props.value}</p>
    </div>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {props.label}
        {props.required && <span className="text-indigo-600"> *</span>}
      </span>
      {props.children}
    </label>
  );
}

function Badge(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
      {props.children}
    </span>
  );
}

function TemperatureBadge(props: { temperature: LeadTemperature }) {
  const styles = {
    cold: "border-sky-200 bg-sky-50 text-sky-700",
    warm: "border-amber-200 bg-amber-50 text-amber-700",
    hot: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[props.temperature]}`}
    >
      {leadTemperatureLabels[props.temperature]}
    </span>
  );
}
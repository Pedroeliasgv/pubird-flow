import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Loader2,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
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
import {
  applyMessageVariables,
  getMessageTemplates,
  MessageTemplate,
} from "../../lib/message-templates";
import {
  createLeadInteraction,
  getLeadInteractions,
  LeadInteraction,
  leadInteractionTypeLabels,
} from "../../lib/lead-interactions";

export const Route = createFileRoute("/dashboard/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [userId, setUserId] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadInteractions, setLeadInteractions] = useState<LeadInteraction[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [manualInteraction, setManualInteraction] = useState("");

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

        setUserId(user.id);

        const userCompany = await getUserCompany(user.id);

        if (!userCompany) {
          navigate({ to: "/dashboard/onboarding" });
          return;
        }

        setCompany(userCompany);

        const [leadsData, templatesData] = await Promise.all([
          getLeads(userCompany.id),
          getMessageTemplates(userCompany.id),
        ]);

        setLeads(leadsData);
        setTemplates(templatesData.filter((item) => item.status === "active"));
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

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId
  );

  const serviceInterest = selectedLead?.notes?.includes("Serviço de interesse:")
    ? selectedLead.notes
        .split("Serviço de interesse:")[1]
        ?.split("\n")[0]
        ?.trim()
    : "serviço de interesse";

  const messagePreview =
    selectedLead && selectedTemplate
      ? applyMessageVariables(selectedTemplate.content, {
          nome: selectedLead.name,
          empresa: company?.name,
          servico: serviceInterest || "serviço de interesse",
        })
      : "";

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

  async function openServiceModal(lead: Lead) {
    setSelectedLead(lead);
    setSelectedTemplateId(templates[0]?.id || "");
    setManualInteraction("");

    try {
      const interactions = await getLeadInteractions(lead.id);
      setLeadInteractions(interactions);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao carregar histórico do lead.");
    }
  }

  function closeServiceModal() {
    setSelectedLead(null);
    setLeadInteractions([]);
    setSelectedTemplateId("");
    setManualInteraction("");
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

  async function handleCopyTemplateMessage() {
    if (!company || !selectedLead || !selectedTemplate || !messagePreview) {
      return;
    }

    try {
      await navigator.clipboard.writeText(messagePreview);

      const interaction = await createLeadInteraction({
        companyId: company.id,
        leadId: selectedLead.id,
        userId,
        type: "message_copied",
        content: `Mensagem pronta copiada: ${selectedTemplate.name}\n\n${messagePreview}`,
      });

      setLeadInteractions((current) => [interaction, ...current]);
      setSuccessMessage("Mensagem copiada e registrada no histórico.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao copiar mensagem.");
    }
  }

  async function handleAddManualInteraction() {
    if (!company || !selectedLead || manualInteraction.trim().length < 2) {
      return;
    }

    try {
      const interaction = await createLeadInteraction({
        companyId: company.id,
        leadId: selectedLead.id,
        userId,
        type: "note",
        content: manualInteraction,
      });

      setLeadInteractions((current) => [interaction, ...current]);
      setManualInteraction("");
      setSuccessMessage("Interação adicionada ao histórico.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao adicionar interação.");
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
            <table className="w-full min-w-[980px] text-left text-sm">
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
                          onClick={() => openServiceModal(lead)}
                          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Atender
                        </button>

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
        <LeadFormModal
          editingLead={editingLead}
          saving={saving}
          name={name}
          phone={phone}
          email={email}
          source={source}
          status={status}
          temperature={temperature}
          notes={notes}
          setName={setName}
          setPhone={setPhone}
          setEmail={setEmail}
          setSource={setSource}
          setStatus={setStatus}
          setTemperature={setTemperature}
          setNotes={setNotes}
          onClose={() => {
            resetForm();
            setIsFormOpen(false);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1fr_420px]">
            <div className="overflow-y-auto p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Atendimento de {selectedLead.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Use uma mensagem pronta e registre o histórico comercial.
                  </p>
                </div>

                <button
                  onClick={closeServiceModal}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-950">Dados do lead</h3>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <InfoItem label="Nome" value={selectedLead.name} />
                  <InfoItem label="Telefone" value={selectedLead.phone || "Não informado"} />
                  <InfoItem label="E-mail" value={selectedLead.email || "Não informado"} />
                  <InfoItem label="Origem" value={selectedLead.source || "Não informada"} />
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-950">Mensagem pronta</h3>

                <div className="mt-4">
                  <select
                    className="input-light"
                    value={selectedTemplateId}
                    onChange={(event) => setSelectedTemplateId(event.target.value)}
                  >
                    {templates.length === 0 && (
                      <option value="">Nenhuma mensagem cadastrada</option>
                    )}

                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 min-h-48 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {messagePreview ||
                    "Cadastre uma mensagem pronta em Mensagens para usar aqui."}
                </div>

                <button
                  onClick={handleCopyTemplateMessage}
                  disabled={!messagePreview}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  Copiar mensagem e registrar
                </button>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-950">
                  Adicionar observação
                </h3>

                <textarea
                  className="input-light mt-4 min-h-28 resize-none"
                  value={manualInteraction}
                  onChange={(event) => setManualInteraction(event.target.value)}
                  placeholder="Ex: Cliente pediu retorno amanhã pela manhã..."
                />

                <button
                  onClick={handleAddManualInteraction}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Salvar observação
                </button>
              </div>
            </div>

            <aside className="overflow-y-auto border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
              <h3 className="font-bold text-slate-950">Histórico</h3>

              <p className="mt-1 text-sm text-slate-500">
                Interações registradas com este lead.
              </p>

              <div className="mt-5 space-y-3">
                {leadInteractions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                    Nenhuma interação registrada ainda.
                  </div>
                ) : (
                  leadInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {leadInteractionTypeLabels[interaction.type]}
                        </span>

                        <span className="text-xs text-slate-400">
                          {new Date(interaction.created_at).toLocaleString(
                            "pt-BR"
                          )}
                        </span>
                      </div>

                      <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                        {interaction.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function LeadFormModal(props: {
  editingLead: Lead | null;
  saving: boolean;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: LeadStatus;
  temperature: LeadTemperature;
  notes: string;
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
  setSource: (value: string) => void;
  setStatus: (value: LeadStatus) => void;
  setTemperature: (value: LeadTemperature) => void;
  setNotes: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {props.editingLead ? "Editar lead" : "Novo lead"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preencha as informações do contato comercial.
            </p>
          </div>

          <button
            onClick={props.onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={props.onSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome" required>
              <input
                className="input-light"
                value={props.name}
                onChange={(event) => props.setName(event.target.value)}
                placeholder="Nome do lead"
                required
              />
            </Field>

            <Field label="Telefone / WhatsApp">
              <input
                className="input-light"
                value={props.phone}
                onChange={(event) => props.setPhone(event.target.value)}
                placeholder="(11) 99999-9999"
              />
            </Field>
          </div>

          <Field label="E-mail">
            <input
              type="email"
              className="input-light"
              value={props.email}
              onChange={(event) => props.setEmail(event.target.value)}
              placeholder="lead@email.com"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Origem">
              <select
                className="input-light"
                value={props.source}
                onChange={(event) => props.setSource(event.target.value)}
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
                value={props.status}
                onChange={(event) =>
                  props.setStatus(event.target.value as LeadStatus)
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
                value={props.temperature}
                onChange={(event) =>
                  props.setTemperature(event.target.value as LeadTemperature)
                }
              >
                {Object.entries(leadTemperatureLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Observações">
            <textarea
              className="input-light min-h-28 resize-none"
              value={props.notes}
              onChange={(event) => props.setNotes(event.target.value)}
              placeholder="Ex: pediu orçamento pelo Instagram..."
            />
          </Field>

          <button
            disabled={props.saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {props.saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {props.editingLead ? "Salvar alterações" : "Cadastrar lead"}
          </button>
        </form>
      </div>
    </div>
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

function InfoItem(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {props.label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {props.value}
      </p>
    </div>
  );
}
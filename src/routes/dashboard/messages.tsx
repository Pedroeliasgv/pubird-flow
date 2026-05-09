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
  X,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import {
  applyMessageVariables,
  createMessageTemplate,
  deleteMessageTemplate,
  getMessageTemplates,
  MessageTemplate,
  MessageTemplateChannel,
  messageTemplateChannelLabels,
  MessageTemplateStatus,
  messageTemplateStatusLabels,
  updateMessageTemplate,
} from "../../lib/message-templates";

export const Route = createFileRoute("/dashboard/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] =
    useState<MessageTemplateChannel | "all">("all");
  const [statusFilter, setStatusFilter] =
    useState<MessageTemplateStatus | "all">("all");

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<MessageTemplateChannel>("whatsapp");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<MessageTemplateStatus>("active");

  const [previewName, setPreviewName] = useState("João");
  const [previewService, setPreviewService] = useState("avaliação");

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

        const data = await getMessageTemplates(userCompany.id);
        setTemplates(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao carregar mensagens prontas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.content.toLowerCase().includes(search.toLowerCase());

      const matchesChannel =
        channelFilter === "all" ? true : template.channel === channelFilter;

      const matchesStatus =
        statusFilter === "all" ? true : template.status === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [templates, search, channelFilter, statusFilter]);

  const previewMessage = applyMessageVariables(content, {
    nome: previewName,
    empresa: company?.name,
    servico: previewService,
  });

  function resetForm() {
    setEditingTemplate(null);
    setName("");
    setChannel("whatsapp");
    setContent("");
    setStatus("active");
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(template: MessageTemplate) {
    setEditingTemplate(template);
    setName(template.name);
    setChannel(template.channel);
    setContent(template.content);
    setStatus(template.status);
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
      if (name.trim().length < 2) {
        setErrorMessage("Informe um nome válido para a mensagem.");
        return;
      }

      if (content.trim().length < 5) {
        setErrorMessage("Escreva o conteúdo da mensagem.");
        return;
      }

      if (editingTemplate) {
        const updated = await updateMessageTemplate({
          templateId: editingTemplate.id,
          name,
          channel,
          content,
          status,
        });

        setTemplates((current) =>
          current.map((template) =>
            template.id === updated.id ? updated : template
          )
        );

        setSuccessMessage("Mensagem atualizada com sucesso.");
      } else {
        const created = await createMessageTemplate({
          companyId: company.id,
          name,
          channel,
          content,
          status,
        });

        setTemplates((current) => [created, ...current]);
        setSuccessMessage("Mensagem criada com sucesso.");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao salvar mensagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    const confirmed = window.confirm("Deseja excluir esta mensagem pronta?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteMessageTemplate(templateId);

      setTemplates((current) =>
        current.filter((template) => template.id !== templateId)
      );

      setSuccessMessage("Mensagem excluída com sucesso.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao excluir mensagem.");
    }
  }

  async function handleCopyMessage(template: MessageTemplate) {
    const message = applyMessageVariables(template.content, {
      nome: previewName,
      empresa: company?.name,
      servico: previewService,
    });

    await navigator.clipboard.writeText(message);
    setSuccessMessage("Mensagem copiada.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando mensagens...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="Mensagens Prontas"
      pageDescription="Crie respostas comerciais reutilizáveis para acelerar o atendimento."
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
          <MiniMetric label="Total" value={templates.length} />
          <MiniMetric
            label="Ativas"
            value={templates.filter((item) => item.status === "active").length}
          />
          <MiniMetric
            label="WhatsApp"
            value={
              templates.filter((item) => item.channel === "whatsapp").length
            }
          />
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Nova mensagem
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input-light pl-11"
              placeholder="Buscar por nome ou conteúdo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="input-light"
            value={channelFilter}
            onChange={(event) =>
              setChannelFilter(event.target.value as MessageTemplateChannel | "all")
            }
          >
            <option value="all">Todos os canais</option>
            {Object.entries(messageTemplateChannelLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>

          <select
            className="input-light"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as MessageTemplateStatus | "all")
            }
          >
            <option value="all">Todos os status</option>
            {Object.entries(messageTemplateStatusLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          {filteredTemplates.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="h-12 w-12 text-slate-400" />

              <h2 className="mt-4 text-xl font-bold">
                Nenhuma mensagem encontrada
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Crie mensagens prontas para responder leads mais rápido e manter
                o atendimento padronizado.
              </p>

              <button
                onClick={openCreateForm}
                className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Criar mensagem
              </button>
            </div>
          ) : (
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{messageTemplateChannelLabels[template.channel]}</Badge>
                        <Badge>{messageTemplateStatusLabels[template.status]}</Badge>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-950">
                        {template.name}
                      </h3>
                    </div>
                  </div>

                  <p className="min-h-28 whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    {template.content}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => handleCopyMessage(template)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </button>

                    <button
                      onClick={() => openEditForm(template)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 transition hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Variáveis disponíveis</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use essas variáveis dentro da mensagem para personalizar o texto.
          </p>

          <div className="mt-5 space-y-3">
            <VariableItem value="{nome}" description="Nome do lead" />
            <VariableItem value="{empresa}" description="Nome da empresa" />
            <VariableItem value="{servico}" description="Serviço de interesse" />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Preview rápido
            </p>

            <div className="mt-4 space-y-3">
              <input
                className="input-light"
                value={previewName}
                onChange={(event) => setPreviewName(event.target.value)}
                placeholder="Nome"
              />

              <input
                className="input-light"
                value={previewService}
                onChange={(event) => setPreviewService(event.target.value)}
                placeholder="Serviço"
              />
            </div>
          </div>
        </aside>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingTemplate ? "Editar mensagem" : "Nova mensagem"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Crie uma resposta comercial reutilizável.
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

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-5">
                <Field label="Nome da mensagem" required>
                  <input
                    className="input-light"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex: Primeiro contato pelo WhatsApp"
                    required
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Canal">
                    <select
                      className="input-light"
                      value={channel}
                      onChange={(event) =>
                        setChannel(event.target.value as MessageTemplateChannel)
                      }
                    >
                      {Object.entries(messageTemplateChannelLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </Field>

                  <Field label="Status">
                    <select
                      className="input-light"
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as MessageTemplateStatus)
                      }
                    >
                      {Object.entries(messageTemplateStatusLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                </div>

                <Field label="Conteúdo" required>
                  <textarea
                    className="input-light min-h-56 resize-none"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Olá {nome}, tudo bem? Vi que você demonstrou interesse em {servico}. Posso te passar mais detalhes?"
                    required
                  />
                </Field>

                <button
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingTemplate ? "Salvar alterações" : "Criar mensagem"}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-950">
                  Prévia da mensagem
                </p>

                <p className="mt-4 whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {previewMessage || "A prévia aparecerá aqui."}
                </p>
              </div>
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
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
      {props.children}
    </span>
  );
}

function VariableItem(props: { value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-mono text-sm font-bold text-slate-950">
        {props.value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{props.description}</p>
    </div>
  );
}
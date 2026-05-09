import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
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
  createFollowUpTask,
  deleteFollowUpTask,
  FollowUpPriority,
  FollowUpStatus,
  FollowUpTask,
  followUpPriorityLabels,
  followUpStatusLabels,
  getFollowUpMetrics,
  getFollowUpTasks,
  isTaskOverdue,
  updateFollowUpTask,
  updateFollowUpTaskStatus,
} from "../../lib/follow-up";
import { getLeads, Lead } from "../../lib/leads";

export const Route = createFileRoute("/dashboard/follow-up")({
  component: FollowUpPage,
});

function FollowUpPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [userId, setUserId] = useState("");
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FollowUpTask | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | "all">(
    "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<FollowUpPriority | "all">(
    "all"
  );

  const [leadId, setLeadId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [status, setStatus] = useState<FollowUpStatus>("pending");
  const [priority, setPriority] = useState<FollowUpPriority>("medium");

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

        const [tasksData, leadsData] = await Promise.all([
          getFollowUpTasks(userCompany.id),
          getLeads(userCompany.id),
        ]);

        setTasks(tasksData);
        setLeads(leadsData);
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao carregar follow-ups.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const metrics = getFollowUpMetrics(tasks);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const relatedLead = getLeadById(task.lead_id);

      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase()) ||
        relatedLead?.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ? true : task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter, leads]);

  function getLeadById(id: string | null) {
    if (!id) {
      return null;
    }

    return leads.find((lead) => lead.id === id) || null;
  }

  function resetForm() {
    setEditingTask(null);
    setLeadId("");
    setTitle("");
    setDescription("");
    setDueAt("");
    setStatus("pending");
    setPriority("medium");
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(task: FollowUpTask) {
    setEditingTask(task);
    setLeadId(task.lead_id || "");
    setTitle(task.title);
    setDescription(task.description || "");
    setDueAt(task.due_at ? task.due_at.slice(0, 16) : "");
    setStatus(task.status);
    setPriority(task.priority);
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
      if (title.trim().length < 2) {
        setErrorMessage("Informe um título válido.");
        return;
      }

      if (editingTask) {
        const updated = await updateFollowUpTask({
          taskId: editingTask.id,
          leadId: leadId || null,
          title,
          description,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
          status,
          priority,
        });

        setTasks((current) =>
          current.map((task) => (task.id === updated.id ? updated : task))
        );

        setSuccessMessage("Follow-up atualizado com sucesso.");
      } else {
        const created = await createFollowUpTask({
          companyId: company.id,
          assignedTo: userId,
          leadId: leadId || null,
          title,
          description,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
          priority,
        });

        setTasks((current) => [created, ...current]);
        setSuccessMessage("Follow-up criado com sucesso.");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao salvar follow-up.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      const updated = await updateFollowUpTaskStatus({
        taskId,
        status: "completed",
      });

      setTasks((current) =>
        current.map((task) => (task.id === updated.id ? updated : task))
      );

      setSuccessMessage("Tarefa marcada como concluída.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao concluir tarefa.");
    }
  }

  async function handleDeleteTask(taskId: string) {
    const confirmed = window.confirm("Deseja excluir este follow-up?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteFollowUpTask(taskId);

      setTasks((current) => current.filter((task) => task.id !== taskId));

      setSuccessMessage("Follow-up excluído com sucesso.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao excluir follow-up.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando follow-ups...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="Follow-up"
      pageDescription="Organize retornos comerciais, prazos e tarefas para não perder oportunidades."
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
        <div className="grid gap-3 sm:grid-cols-5">
          <MiniMetric label="Total" value={metrics.total} />
          <MiniMetric label="Pendentes" value={metrics.pending} />
          <MiniMetric label="Em andamento" value={metrics.inProgress} />
          <MiniMetric label="Concluídas" value={metrics.completed} />
          <MiniMetric label="Atrasadas" value={metrics.overdue} danger />
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Novo follow-up
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input-light pl-11"
              placeholder="Buscar por tarefa, descrição ou lead"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="input-light"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as FollowUpStatus | "all")
            }
          >
            <option value="all">Todos os status</option>
            {Object.entries(followUpStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className="input-light"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as FollowUpPriority | "all")
            }
          >
            <option value="all">Todas as prioridades</option>
            {Object.entries(followUpPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <CalendarClock className="h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-xl font-bold">
              Nenhum follow-up encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Crie tarefas de retorno para acompanhar seus leads e evitar que
              oportunidades sejam esquecidas.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Criar follow-up
            </button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => {
              const relatedLead = getLeadById(task.lead_id);
              const overdue = isTaskOverdue(task);

              return (
                <article
                  key={task.id}
                  className={`rounded-3xl border p-5 ${
                    overdue
                      ? "border-red-200 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={overdue ? "overdue" : task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-950">
                        {task.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {task.description || "Sem descrição."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500">Lead</span>
                      <span className="text-right font-semibold text-slate-900">
                        {relatedLead?.name || "Não vinculado"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500">Vencimento</span>
                      <span className="text-right font-semibold text-slate-900">
                        {task.due_at
                          ? new Date(task.due_at).toLocaleString("pt-BR")
                          : "Sem data"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    {task.status !== "completed" && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Concluir
                      </button>
                    )}

                    <button
                      onClick={() => openEditForm(task)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 transition hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingTask ? "Editar follow-up" : "Novo follow-up"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Crie uma tarefa comercial vinculada a um lead ou uma ação
                  interna.
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
              <Field label="Título" required>
                <input
                  className="input-light"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Retornar orçamento pelo WhatsApp"
                  required
                />
              </Field>

              <Field label="Lead vinculado">
                <select
                  className="input-light"
                  value={leadId}
                  onChange={(event) => setLeadId(event.target.value)}
                >
                  <option value="">Sem lead vinculado</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} — {lead.phone || "sem telefone"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Descrição">
                <textarea
                  className="input-light min-h-28 resize-none"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex: Enviar mensagem perguntando se ainda tem interesse..."
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Vencimento">
                  <input
                    type="datetime-local"
                    className="input-light"
                    value={dueAt}
                    onChange={(event) => setDueAt(event.target.value)}
                  />
                </Field>

                <Field label="Prioridade">
                  <select
                    className="input-light"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as FollowUpPriority)
                    }
                  >
                    {Object.entries(followUpPriorityLabels).map(
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
                      setStatus(event.target.value as FollowUpStatus)
                    }
                  >
                    {Object.entries(followUpStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </Field>
              </div>

              <button
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTask ? "Salvar alterações" : "Criar follow-up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MiniMetric(props: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${
        props.danger
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          props.danger ? "text-red-600" : "text-slate-500"
        }`}
      >
        {props.label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          props.danger ? "text-red-700" : "text-slate-950"
        }`}
      >
        {props.value}
      </p>
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

function StatusBadge(props: { status: FollowUpStatus }) {
  const styles: Record<FollowUpStatus, string> = {
    pending: "border-slate-200 bg-slate-100 text-slate-700",
    in_progress: "border-indigo-200 bg-indigo-50 text-indigo-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled: "border-slate-200 bg-slate-50 text-slate-500",
    overdue: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[props.status]}`}
    >
      {followUpStatusLabels[props.status]}
    </span>
  );
}

function PriorityBadge(props: { priority: FollowUpPriority }) {
  const styles: Record<FollowUpPriority, string> = {
    low: "border-slate-200 bg-white text-slate-600",
    medium: "border-blue-200 bg-blue-50 text-blue-700",
    high: "border-amber-200 bg-amber-50 text-amber-700",
    urgent: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[props.priority]}`}
    >
      {followUpPriorityLabels[props.priority]}
    </span>
  );
}
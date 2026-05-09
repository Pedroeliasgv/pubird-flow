import { supabase } from "../integrations/supabase/client";

export type FollowUpStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "overdue";

export type FollowUpPriority = "low" | "medium" | "high" | "urgent";

export type FollowUpTask = {
  id: string;
  company_id: string;
  lead_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  created_at: string;
  updated_at: string;
};

export type CreateFollowUpTaskInput = {
  companyId: string;
  leadId?: string | null;
  assignedTo?: string | null;
  title: string;
  description?: string;
  dueAt?: string;
  priority?: FollowUpPriority;
};

export type UpdateFollowUpTaskInput = {
  taskId: string;
  leadId?: string | null;
  title: string;
  description?: string;
  dueAt?: string;
  status: FollowUpStatus;
  priority: FollowUpPriority;
};

export const followUpStatusLabels: Record<FollowUpStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
  overdue: "Atrasada",
};

export const followUpPriorityLabels: Record<FollowUpPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export async function getFollowUpTasks(companyId: string) {
  const { data, error } = await supabase
    .from("follow_up_tasks")
    .select("*")
    .eq("company_id", companyId)
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return data as FollowUpTask[];
}

export async function createFollowUpTask(input: CreateFollowUpTaskInput) {
  const { data, error } = await supabase
    .from("follow_up_tasks")
    .insert({
      company_id: input.companyId,
      lead_id: input.leadId || null,
      assigned_to: input.assignedTo || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_at: input.dueAt || null,
      status: "pending",
      priority: input.priority || "medium",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FollowUpTask;
}

export async function updateFollowUpTask(input: UpdateFollowUpTaskInput) {
  const { data, error } = await supabase
    .from("follow_up_tasks")
    .update({
      lead_id: input.leadId || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_at: input.dueAt || null,
      status: input.status,
      priority: input.priority,
    })
    .eq("id", input.taskId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FollowUpTask;
}

export async function updateFollowUpTaskStatus(params: {
  taskId: string;
  status: FollowUpStatus;
}) {
  const { data, error } = await supabase
    .from("follow_up_tasks")
    .update({
      status: params.status,
    })
    .eq("id", params.taskId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as FollowUpTask;
}

export async function deleteFollowUpTask(taskId: string) {
  const { error } = await supabase
    .from("follow_up_tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

export function isTaskOverdue(task: FollowUpTask) {
  if (!task.due_at) {
    return false;
  }

  if (task.status === "completed" || task.status === "cancelled") {
    return false;
  }

  return new Date(task.due_at).getTime() < new Date().getTime();
}

export function getFollowUpMetrics(tasks: FollowUpTask[]) {
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const overdue = tasks.filter((task) => isTaskOverdue(task)).length;

  return {
    total: tasks.length,
    pending,
    inProgress,
    completed,
    overdue,
  };
}
import { supabase } from "../integrations/supabase/client";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost"
  | "archived";

export type LeadTemperature = "cold" | "warm" | "hot";

export type Lead = {
  id: string;
  company_id: string;
  assigned_to: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
  status: LeadStatus;
  temperature: LeadTemperature;
  created_at: string;
  updated_at: string;
};

export type CreateLeadInput = {
  companyId: string;
  assignedTo?: string | null;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  status?: LeadStatus;
  temperature?: LeadTemperature;
};

export type UpdateLeadInput = {
  leadId: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  status: LeadStatus;
  temperature: LeadTemperature;
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contactado",
  qualified: "Qualificado",
  proposal: "Proposta",
  won: "Fechado",
  lost: "Perdido",
  archived: "Arquivado",
};

export const leadTemperatureLabels: Record<LeadTemperature, string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente",
};

export const leadSources = [
  "Instagram",
  "WhatsApp",
  "Site",
  "Indicação",
  "Tráfego Pago",
  "Google",
  "Página Pública",
  "Outro",
];

export async function getLeads(companyId: string) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Lead[];
}

export async function createLead(input: CreateLeadInput) {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      company_id: input.companyId,
      assigned_to: input.assignedTo || null,
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
      source: input.source || null,
      notes: input.notes?.trim() || null,
      status: input.status || "new",
      temperature: input.temperature || "cold",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Lead;
}

export async function updateLead(input: UpdateLeadInput) {
  const { data, error } = await supabase
    .from("leads")
    .update({
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
      source: input.source || null,
      notes: input.notes?.trim() || null,
      status: input.status,
      temperature: input.temperature,
    })
    .eq("id", input.leadId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Lead;
}

export async function updateLeadStatus(params: {
  leadId: string;
  status: LeadStatus;
}) {
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: params.status,
    })
    .eq("id", params.leadId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Lead;
}

export async function deleteLead(leadId: string) {
  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) {
    throw error;
  }
}

export function getLeadMetrics(leads: Lead[]) {
  const total = leads.length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const contacted = leads.filter((lead) => lead.status === "contacted").length;
  const won = leads.filter((lead) => lead.status === "won").length;
  const lost = leads.filter((lead) => lead.status === "lost").length;

  const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

  return {
    total,
    newLeads,
    contacted,
    won,
    lost,
    conversionRate,
  };
}
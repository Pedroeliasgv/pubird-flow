import { supabase } from "../integrations/supabase/client";

export type LeadInteractionType =
  | "note"
  | "whatsapp"
  | "email"
  | "call"
  | "meeting"
  | "message_copied";

export type LeadInteraction = {
  id: string;
  company_id: string;
  lead_id: string;
  user_id: string | null;
  type: LeadInteractionType;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CreateLeadInteractionInput = {
  companyId: string;
  leadId: string;
  userId?: string | null;
  type: LeadInteractionType;
  content: string;
};

export const leadInteractionTypeLabels: Record<LeadInteractionType, string> = {
  note: "Observação",
  whatsapp: "WhatsApp",
  email: "E-mail",
  call: "Ligação",
  meeting: "Reunião",
  message_copied: "Mensagem copiada",
};

export async function getLeadInteractions(leadId: string) {
  const { data, error } = await supabase
    .from("lead_interactions")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as LeadInteraction[];
}

export async function createLeadInteraction(input: CreateLeadInteractionInput) {
  const { data, error } = await supabase
    .from("lead_interactions")
    .insert({
      company_id: input.companyId,
      lead_id: input.leadId,
      user_id: input.userId || null,
      type: input.type,
      content: input.content.trim(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as LeadInteraction;
}
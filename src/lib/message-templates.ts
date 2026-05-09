import { supabase } from "../integrations/supabase/client";

export type MessageTemplateChannel =
  | "whatsapp"
  | "email"
  | "sms"
  | "instagram"
  | "other";

export type MessageTemplateStatus = "active" | "inactive" | "archived";

export type MessageTemplate = {
  id: string;
  company_id: string;
  name: string;
  channel: MessageTemplateChannel;
  content: string;
  status: MessageTemplateStatus;
  created_at: string;
  updated_at: string;
};

export type CreateMessageTemplateInput = {
  companyId: string;
  name: string;
  channel: MessageTemplateChannel;
  content: string;
  status?: MessageTemplateStatus;
};

export type UpdateMessageTemplateInput = {
  templateId: string;
  name: string;
  channel: MessageTemplateChannel;
  content: string;
  status: MessageTemplateStatus;
};

export const messageTemplateChannelLabels: Record<
  MessageTemplateChannel,
  string
> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
  sms: "SMS",
  instagram: "Instagram",
  other: "Outro",
};

export const messageTemplateStatusLabels: Record<
  MessageTemplateStatus,
  string
> = {
  active: "Ativa",
  inactive: "Inativa",
  archived: "Arquivada",
};

export async function getMessageTemplates(companyId: string) {
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as MessageTemplate[];
}

export async function createMessageTemplate(
  input: CreateMessageTemplateInput
) {
  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      company_id: input.companyId,
      name: input.name.trim(),
      channel: input.channel,
      content: input.content.trim(),
      status: input.status || "active",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as MessageTemplate;
}

export async function updateMessageTemplate(
  input: UpdateMessageTemplateInput
) {
  const { data, error } = await supabase
    .from("message_templates")
    .update({
      name: input.name.trim(),
      channel: input.channel,
      content: input.content.trim(),
      status: input.status,
    })
    .eq("id", input.templateId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as MessageTemplate;
}

export async function deleteMessageTemplate(templateId: string) {
  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    throw error;
  }
}

export function applyMessageVariables(
  content: string,
  variables: {
    nome?: string;
    empresa?: string;
    servico?: string;
  }
) {
  return content
    .replaceAll("{nome}", variables.nome || "Nome do lead")
    .replaceAll("{empresa}", variables.empresa || "Sua empresa")
    .replaceAll("{servico}", variables.servico || "serviço de interesse");
}
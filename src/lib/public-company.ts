import { supabase } from "../integrations/supabase/client";
import type { Service } from "./services";

export type PublicCompany = {
  id: string;
  name: string;
  slug: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: "active" | "inactive" | "blocked";
};

export type CreatePublicLeadInput = {
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  serviceInterest?: string;
  message?: string;
};

export async function getPublicCompanyBySlug(slug: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, slug, phone, email, website, status")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicCompany | null;
}

export async function getPublicCompanyServices(companyId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Service[];
}

function getTomorrowAtNine() {
  const date = new Date();

  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);

  return date.toISOString();
}

export async function createPublicLead(input: CreatePublicLeadInput) {
  const notesParts = [
    input.serviceInterest
      ? `Serviço de interesse: ${input.serviceInterest}`
      : null,
    input.message ? `Mensagem: ${input.message}` : null,
  ].filter(Boolean);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      company_id: input.companyId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim().toLowerCase() || null,
      source: "Página Pública",
      status: "new",
      temperature: "cold",
      notes: notesParts.join("\n\n") || null,
    })
    .select("id, name")
    .single();

  if (leadError) {
    throw leadError;
  }

  const followUpTitle = `Retornar contato de ${input.name.trim()}`;

  const followUpDescription = [
    "Lead capturado automaticamente pela página pública.",
    input.serviceInterest
      ? `Serviço de interesse: ${input.serviceInterest}`
      : null,
    input.phone ? `WhatsApp: ${input.phone}` : null,
    input.email ? `E-mail: ${input.email}` : null,
    input.message ? `Mensagem: ${input.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { error: followUpError } = await supabase
    .from("follow_up_tasks")
    .insert({
      company_id: input.companyId,
      lead_id: lead.id,
      assigned_to: null,
      title: followUpTitle,
      description: followUpDescription,
      due_at: getTomorrowAtNine(),
      status: "pending",
      priority: "high",
    });

  if (followUpError) {
    console.error("Erro ao criar follow-up automático:", followUpError);
  }

  return lead;
}
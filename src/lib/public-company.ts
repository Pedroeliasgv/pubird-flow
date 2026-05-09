import { supabase } from "../integrations/supabase/client";

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

export async function createPublicLead(input: CreatePublicLeadInput) {
  const notesParts = [
    input.serviceInterest
      ? `Serviço de interesse: ${input.serviceInterest}`
      : null,
    input.message ? `Mensagem: ${input.message}` : null,
  ].filter(Boolean);

  const { error } = await supabase.from("leads").insert({
    company_id: input.companyId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim().toLowerCase() || null,
    source: "Página Pública",
    status: "new",
    temperature: "cold",
    notes: notesParts.join("\n\n") || null,
  });

  if (error) {
    throw error;
  }
}
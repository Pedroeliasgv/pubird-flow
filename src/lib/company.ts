import { supabase } from "../integrations/supabase/client";

export type Company = {
  id: string;
  name: string;
  slug: string;
  billing_email: string | null;
  phone: string | null;
  timezone: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function getUserCompany(userId: string) {
  const { data: member, error: memberError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (!member) {
    return null;
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", member.company_id)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  return company as Company | null;
}

export async function createCompanyWithOwner(params: {
  userId: string;
  name: string;
  slug: string;
  phone?: string;
  billingEmail?: string;
}) {
  const { userId, name, slug, phone, billingEmail } = params;

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name,
      slug,
      phone: phone || null,
      billing_email: billingEmail || null,
      timezone: "America/Sao_Paulo",
      status: "active",
    })
    .select("*")
    .single();

  if (companyError) {
    throw companyError;
  }

  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: company.id,
    user_id: userId,
    role: "owner",
    status: "active",
  });

  if (memberError) {
    throw memberError;
  }

  return company as Company;
}

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
import { supabase } from "../integrations/supabase/client";

export type Company = {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: "active" | "inactive" | "blocked";
  created_at: string;
  updated_at: string;
};

export type CreateCompanyInput = {
  ownerId: string;
  name: string;
  slug: string;
  document?: string;
  phone?: string;
  email?: string;
  website?: string;
};

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCnpj(value: string) {
  const numbers = onlyNumbers(value).slice(0, 14);

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatPhone(value: string) {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function normalizeWebsite(value: string) {
  const website = value.trim();

  if (!website) {
    return "";
  }

  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }

  return `https://${website}`;
}

export async function getUserCompany(userId: string) {
  const { data: membership, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    return null;
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", membership.company_id)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  return company as Company | null;
}

export async function checkSlugAvailability(slug: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !data;
}

export async function createCompany(input: CreateCompanyInput) {
  const payload = {
    owner_id: input.ownerId,
    name: input.name.trim(),
    slug: createSlug(input.slug),
    document: input.document ? onlyNumbers(input.document) : null,
    phone: input.phone ? onlyNumbers(input.phone) : null,
    email: input.email?.trim().toLowerCase() || null,
    website: input.website ? normalizeWebsite(input.website) : null,
    status: "active" as const,
  };

  const { error } = await supabase.from("companies").insert(payload);

  if (error) {
    throw error;
  }

  const { data: company, error: selectError } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", payload.slug)
    .eq("owner_id", input.ownerId)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  return company as Company;
}
import { supabase } from "../integrations/supabase/client";

export type ServiceStatus = "active" | "inactive" | "archived";

export type ServiceBillingType = "one_time" | "monthly" | "yearly";

export type Service = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  billing_type: ServiceBillingType;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
};

export type CreateServiceInput = {
  companyId: string;
  name: string;
  description?: string;
  price?: number;
  billingType?: ServiceBillingType;
  status?: ServiceStatus;
};

export type UpdateServiceInput = {
  serviceId: string;
  name: string;
  description?: string;
  price?: number;
  billingType: ServiceBillingType;
  status: ServiceStatus;
};

export const serviceStatusLabels: Record<ServiceStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  archived: "Arquivado",
};

export const serviceBillingTypeLabels: Record<ServiceBillingType, string> = {
  one_time: "Pagamento único",
  monthly: "Mensal",
  yearly: "Anual",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseCurrencyInput(value: string) {
  const normalized = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

export async function getServices(companyId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Service[];
}

export async function getActiveServices(companyId: string) {
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

export async function createService(input: CreateServiceInput) {
  const { data, error } = await supabase
    .from("services")
    .insert({
      company_id: input.companyId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price || 0,
      billing_type: input.billingType || "one_time",
      status: input.status || "active",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Service;
}

export async function updateService(input: UpdateServiceInput) {
  const { data, error } = await supabase
    .from("services")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price || 0,
      billing_type: input.billingType,
      status: input.status,
    })
    .eq("id", input.serviceId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Service;
}

export async function deleteService(serviceId: string) {
  const { error } = await supabase.from("services").delete().eq("id", serviceId);

  if (error) {
    throw error;
  }
}
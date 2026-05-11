export type PlanSlug = "starter" | "pro" | "business" | string;

export type PlanAccess = {
  label: string;
  description: string;

  maxLeads: number;
  maxUsers: number;
  maxServices: number;
  maxMessageTemplates: number;
  maxAutomations: number;

  canUseCRM: boolean;
  canUseFollowUps: boolean;
  canUseMessageTemplates: boolean;
  canUseAutomations: boolean;
  canUseSocialStudio: boolean;
  canUseAdvancedReports: boolean;
  canUsePublicPage: boolean;
  canUsePrioritySupport: boolean;
  canUseTeamManagement: boolean;
  canUseCustomBranding: boolean;

  benefits: string[];
};

export const UNLIMITED_LIMIT = 999999;

export const planAccess: Record<string, PlanAccess> = {
  starter: {
    label: "Starter",
    description:
      "Para começar a organizar leads, serviços e follow-ups básicos.",

    maxLeads: 100,
    maxUsers: 1,
    maxServices: 5,
    maxMessageTemplates: 10,
    maxAutomations: 0,

    canUseCRM: true,
    canUseFollowUps: true,
    canUseMessageTemplates: true,
    canUseAutomations: false,
    canUseSocialStudio: false,
    canUseAdvancedReports: false,
    canUsePublicPage: true,
    canUsePrioritySupport: false,
    canUseTeamManagement: false,
    canUseCustomBranding: false,

    benefits: [
      "Até 100 leads cadastrados",
      "1 usuário",
      "CRM básico de leads",
      "Página pública da empresa",
      "Até 5 serviços cadastrados",
      "Até 10 mensagens prontas",
      "Follow-ups manuais",
      "Histórico básico de interações",
    ],
  },

  pro: {
    label: "Pro",
    description:
      "Para empresas que querem organizar vendas, automações e operação comercial.",

    maxLeads: 1000,
    maxUsers: 3,
    maxServices: 25,
    maxMessageTemplates: 50,
    maxAutomations: 10,

    canUseCRM: true,
    canUseFollowUps: true,
    canUseMessageTemplates: true,
    canUseAutomations: true,
    canUseSocialStudio: false,
    canUseAdvancedReports: true,
    canUsePublicPage: true,
    canUsePrioritySupport: false,
    canUseTeamManagement: true,
    canUseCustomBranding: false,

    benefits: [
      "Até 1.000 leads cadastrados",
      "Até 3 usuários",
      "CRM completo",
      "Automações comerciais",
      "Até 25 serviços cadastrados",
      "Até 50 mensagens prontas",
      "Follow-ups automáticos",
      "Relatórios comerciais",
      "Página pública da empresa",
      "Gestão básica de equipe",
    ],
  },

  business: {
    label: "Business",
    description:
      "Para empresas que querem escalar vendas, conteúdo, equipe e operação digital com limites expandidos.",

    maxLeads: UNLIMITED_LIMIT,
    maxUsers: UNLIMITED_LIMIT,
    maxServices: UNLIMITED_LIMIT,
    maxMessageTemplates: UNLIMITED_LIMIT,
    maxAutomations: UNLIMITED_LIMIT,

    canUseCRM: true,
    canUseFollowUps: true,
    canUseMessageTemplates: true,
    canUseAutomations: true,
    canUseSocialStudio: true,
    canUseAdvancedReports: true,
    canUsePublicPage: true,
    canUsePrioritySupport: true,
    canUseTeamManagement: true,
    canUseCustomBranding: true,

    benefits: [
      "Leads ilimitados",
      "Usuários ilimitados",
      "Serviços ilimitados",
      "Mensagens prontas ilimitadas",
      "Automações ilimitadas",
      "Social Studio liberado",
      "Relatórios avançados",
      "Gestão de equipe completa",
      "Página pública personalizada",
      "Branding personalizado",
      "Suporte prioritário",
    ],
  },
};

export function getPlanAccess(planSlug?: PlanSlug | null): PlanAccess {
  if (!planSlug) {
    return planAccess.starter;
  }

  return planAccess[planSlug] ?? planAccess.starter;
}

export function isUnlimitedLimit(value?: number) {
  return typeof value === "number" && value >= UNLIMITED_LIMIT;
}

export function formatPlanLimit(value?: number) {
  if (typeof value !== "number") {
    return "—";
  }

  if (isUnlimitedLimit(value)) {
    return "Ilimitado";
  }

  if (value >= 10000) {
    return "10k+";
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}

export function canUseCRM(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseCRM;
}

export function canUseFollowUps(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseFollowUps;
}

export function canUseMessageTemplates(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseMessageTemplates;
}

export function canUseAutomations(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseAutomations;
}

export function canUseSocialStudio(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseSocialStudio;
}

export function canUseAdvancedReports(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseAdvancedReports;
}

export function canUsePublicPage(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUsePublicPage;
}

export function canUsePrioritySupport(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUsePrioritySupport;
}

export function canUseTeamManagement(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseTeamManagement;
}

export function canUseCustomBranding(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseCustomBranding;
}

export function canCreateLead(
  planSlug: PlanSlug | null | undefined,
  currentLeadCount: number
) {
  return currentLeadCount < getPlanAccess(planSlug).maxLeads;
}

export function canInviteUser(
  planSlug: PlanSlug | null | undefined,
  currentUserCount: number
) {
  return currentUserCount < getPlanAccess(planSlug).maxUsers;
}

export function canCreateService(
  planSlug: PlanSlug | null | undefined,
  currentServiceCount: number
) {
  return currentServiceCount < getPlanAccess(planSlug).maxServices;
}

export function canCreateMessageTemplate(
  planSlug: PlanSlug | null | undefined,
  currentTemplateCount: number
) {
  return currentTemplateCount < getPlanAccess(planSlug).maxMessageTemplates;
}

export function canCreateAutomation(
  planSlug: PlanSlug | null | undefined,
  currentAutomationCount: number
) {
  return currentAutomationCount < getPlanAccess(planSlug).maxAutomations;
}
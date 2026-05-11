export type PlanSlug = "starter" | "pro" | "business" | string;

export type PlanAccess = {
  maxLeads: number;
  maxUsers: number;
  canUseAutomations: boolean;
  canUseSocialStudio: boolean;
  canUseAdvancedReports: boolean;
  canUseMessageTemplates: boolean;
};

export const planAccess: Record<string, PlanAccess> = {
  starter: {
    maxLeads: 100,
    maxUsers: 1,
    canUseAutomations: false,
    canUseSocialStudio: false,
    canUseAdvancedReports: false,
    canUseMessageTemplates: true,
  },
  pro: {
    maxLeads: 1000,
    maxUsers: 3,
    canUseAutomations: true,
    canUseSocialStudio: false,
    canUseAdvancedReports: true,
    canUseMessageTemplates: true,
  },
  business: {
    maxLeads: 10000,
    maxUsers: 10,
    canUseAutomations: true,
    canUseSocialStudio: true,
    canUseAdvancedReports: true,
    canUseMessageTemplates: true,
  },
};

export function getPlanAccess(planSlug?: PlanSlug | null): PlanAccess {
  if (!planSlug) {
    return planAccess.starter;
  }

  return planAccess[planSlug] ?? planAccess.starter;
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

export function canUseMessageTemplates(planSlug?: PlanSlug | null) {
  return getPlanAccess(planSlug).canUseMessageTemplates;
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
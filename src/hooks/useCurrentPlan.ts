import { useEffect, useState } from "react";

import { getCurrentUser } from "../lib/auth";
import { getUserCompany } from "../lib/company";
import {
  getCurrentSubscription,
  SubscriptionWithPlan,
} from "../lib/billing";

type UseCurrentPlanResult = {
  loading: boolean;
  subscription: SubscriptionWithPlan | null;
  planSlug: string | null;
  planName: string | null;
  isActive: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useCurrentPlan(): UseCurrentPlanResult {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] =
    useState<SubscriptionWithPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadCurrentPlan() {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();

      if (!user) {
        setSubscription(null);
        setError("Usuário não autenticado.");
        return;
      }

      const company = await getUserCompany(user.id);

      if (!company) {
        setSubscription(null);
        setError("Empresa não encontrada.");
        return;
      }

      const currentSubscription = await getCurrentSubscription(company.id);

      setSubscription(currentSubscription);
    } catch (err) {
      console.error("Erro ao carregar plano atual:", err);

      setSubscription(null);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar plano atual."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  return {
    loading,
    subscription,
    planSlug: subscription?.plans?.slug ?? null,
    planName: subscription?.plans?.name ?? null,
    isActive: subscription?.status === "active",
    error,
    refresh: loadCurrentPlan,
  };
}
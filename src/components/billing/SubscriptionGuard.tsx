import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { getCurrentUser } from "../../lib/auth";
import { getUserCompany } from "../../lib/company";
import { getCurrentSubscription } from "../../lib/billing";

type SubscriptionGuardProps = {
  children: ReactNode;
};

const FREE_ROUTES = [
  "/login",
  "/register",
  "/dashboard/billing",
  "/dashboard/onboarding",
];

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSubscription() {
      try {
        setChecking(true);

        const isFreeRoute = FREE_ROUTES.some((route) =>
          pathname.startsWith(route)
        );

        if (isFreeRoute) {
          if (isMounted) {
            setChecking(false);
          }

          return;
        }

        const user = await getCurrentUser();

        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const company = await getUserCompany(user.id);

        if (!company) {
          navigate({ to: "/dashboard/onboarding" });
          return;
        }

        const subscription = await getCurrentSubscription(company.id);

        if (!subscription || subscription.status !== "active") {
          navigate({
            to: "/dashboard/billing",
          });

          return;
        }

        if (isMounted) {
          setChecking(false);
        }
      } catch (error) {
        console.error("Erro ao validar assinatura:", error);

        navigate({
          to: "/dashboard/billing",
        });
      }
    }

    checkSubscription();

    return () => {
      isMounted = false;
    };
  }, [navigate, pathname]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Verificando assinatura...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

type PlanFeatureGuardProps = {
  allowed: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
  requiredPlan?: "Pro" | "Business";
};

export function PlanFeatureGuard({
  allowed,
  children,
  title = "Recurso bloqueado neste plano",
  description = "Faça upgrade para liberar este recurso no Pubird Flow.",
  requiredPlan = "Pro",
}: PlanFeatureGuardProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
        <Lock className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-bold text-amber-950">{title}</h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-800">
        {description}
      </p>

      <p className="mt-3 text-sm font-semibold text-amber-900">
        Plano necessário: {requiredPlan}
      </p>

      <Link
        to="/dashboard/billing"
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Ver planos
      </Link>
    </div>
  );
}
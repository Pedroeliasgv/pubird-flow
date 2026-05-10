import { useState } from "react";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { BillingType, PlanSlug } from "@/services/asaas";

const plans: {
  name: string;
  slug: PlanSlug;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}[] = [
  {
    name: "Starter",
    slug: "starter",
    price: "R$97/mês",
    description: "Para começar a organizar leads e follow-ups.",
    features: [
      "Gestão de leads",
      "Serviços cadastrados",
      "Mensagens prontas",
      "Follow-ups básicos",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    price: "R$197/mês",
    description: "Para empresas que querem vender com mais consistência.",
    highlighted: true,
    features: [
      "Tudo do Starter",
      "Automações comerciais",
      "Dashboard avançado",
      "Mais controle de oportunidades",
    ],
  },
  {
    name: "Business",
    slug: "business",
    price: "R$397/mês",
    description: "Para operações maiores com mais volume comercial.",
    features: [
      "Tudo do Pro",
      "Multiusuários",
      "Relatórios completos",
      "Prioridade em recursos futuros",
    ],
  },
];

export function BillingPage() {
  const [billingType, setBillingType] = useState<BillingType>("PIX");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Assinatura
          </p>

          <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">
            Escolha o plano do Pubird Flow
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Ative sua assinatura mensal e comece a usar o sistema para gerenciar
            leads, serviços, mensagens e automações comerciais.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingType("PIX")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                billingType === "PIX"
                  ? "bg-black text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Pix
            </button>

            <button
              type="button"
              onClick={() => setBillingType("BOLETO")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                billingType === "BOLETO"
                  ? "bg-black text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Boleto
            </button>

            <button
              type="button"
              onClick={() => setBillingType("CREDIT_CARD")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                billingType === "CREDIT_CARD"
                  ? "bg-black text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Cartão
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`
                relative rounded-3xl border bg-white p-6 shadow-sm transition
                hover:-translate-y-1 hover:shadow-xl
                ${
                  plan.highlighted
                    ? "border-black ring-2 ring-black"
                    : "border-slate-200"
                }
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-xs font-semibold text-white">
                  Mais recomendado
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-950">
                  {plan.name}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-5 text-3xl font-bold text-slate-950">
                  {plan.price}
                </div>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <SubscribeButton planSlug={plan.slug} billingType={billingType}>
                Assinar {plan.name}
              </SubscribeButton>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
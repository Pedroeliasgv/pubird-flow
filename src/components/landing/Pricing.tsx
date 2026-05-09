import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: "R$97",
    description: "Para pequenos negócios começarem a organizar seus leads.",
    features: [
      "Até 300 leads",
      "Até 3 membros",
      "CRM básico",
      "Mensagens prontas",
      "Página pública de captura",
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    price: "R$197",
    description: "Para empresas que querem vender mais com processo comercial.",
    featured: true,
    features: [
      "Até 1.500 leads",
      "Até 10 membros",
      "CRM completo",
      "Follow-up",
      "Relatórios",
      "Social Studio",
    ],
  },
  {
    name: "Business",
    slug: "business",
    price: "R$397",
    description: "Para operações maiores com equipe, volume e automações.",
    features: [
      "Até 10.000 leads",
      "Até 30 membros",
      "Automações avançadas",
      "Relatórios completos",
      "Prioridade no suporte",
      "Integrações futuras",
    ],
  },
];

export function Pricing() {
  return (
    <section id="planos" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Planos
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Escolha o plano ideal para sua operação crescer.
          </h2>

          <p className="mt-5 text-muted-foreground">
            Comece simples, organize seus leads e evolua para automações,
            relatórios e integrações.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`relative rounded-3xl border p-8 ${
                plan.featured
                  ? "border-primary bg-primary/10 shadow-2xl shadow-indigo-500/20"
                  : "border-border bg-card/70"
              }`}
            >
              {plan.featured && (
                <span className="mb-5 inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  Mais recomendado
                </span>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <p className="mt-3 text-muted-foreground">{plan.description}</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="mb-2 text-muted-foreground">/mês</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`/register?plan=${plan.slug}`}
                className={`mt-8 flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold transition ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                Escolher {plan.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
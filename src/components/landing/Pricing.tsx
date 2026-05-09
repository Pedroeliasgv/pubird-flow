import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "R$97",
    description: "Para começar a organizar seus leads.",
    features: ["Até 100 leads/mês", "1 usuário", "CRM básico", "Mensagens prontas"],
  },
  {
    name: "Pro",
    price: "R$197",
    description: "Para negócios que querem vender mais.",
    featured: true,
    features: [
      "Até 500 leads/mês",
      "3 usuários",
      "CRM completo",
      "Follow-up",
      "Relatórios",
      "Página pública",
    ],
  },
  {
    name: "Business",
    price: "R$397",
    description: "Para equipes comerciais e operações maiores.",
    features: [
      "Leads ilimitados",
      "Até 10 usuários",
      "Automações avançadas",
      "Integrações",
      "Suporte prioritário",
    ],
  },
];

export function Pricing() {
  return (
    <section id="planos" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Planos
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Comece simples e escale conforme sua operação crescer.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 ${
                plan.featured
                  ? "border-indigo-400 bg-indigo-500/10 shadow-2xl shadow-indigo-500/20"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.featured && (
                <span className="mb-5 inline-flex rounded-full bg-indigo-500 px-3 py-1 text-sm font-semibold text-white">
                  Mais recomendado
                </span>
              )}

              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>

              <p className="mt-3 text-slate-400">{plan.description}</p>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="mb-2 text-slate-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`mt-8 flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold transition ${
                  plan.featured
                    ? "bg-indigo-500 text-white hover:bg-indigo-400"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Escolher plano
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
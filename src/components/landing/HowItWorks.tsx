import { Building2, KanbanSquare, MessageCircle, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Configure sua empresa",
    description:
      "Cadastre nome, segmento, serviços, WhatsApp e sua página pública de captura.",
  },
  {
    icon: KanbanSquare,
    title: "Receba e organize leads",
    description:
      "Todo contato vira uma oportunidade dentro do CRM visual da empresa.",
  },
  {
    icon: MessageCircle,
    title: "Faça follow-up",
    description:
      "Use mensagens prontas, registre interações e recupere leads parados.",
  },
  {
    icon: TrendingUp,
    title: "Acompanhe resultados",
    description:
      "Veja total de leads, vendas fechadas, taxa de conversão e receita estimada.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Como funciona
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Da captação ao fechamento em um único fluxo.
          </h2>

          <p className="mt-5 text-muted-foreground">
            O Pubird Flow organiza a jornada comercial para sua empresa parar
            de perder oportunidades.
          </p>
        </div>

        <div id="demo" className="mt-14 grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-3xl border border-border bg-card/70 p-6"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>

                <span className="text-sm font-semibold text-primary">
                  Etapa {index + 1}
                </span>

                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
const steps = [
  {
    title: "Cadastre sua empresa",
    description:
      "Configure nome, segmento, WhatsApp, serviços e página pública.",
  },
  {
    title: "Receba leads no CRM",
    description:
      "Leads manuais ou vindos da página pública entram automaticamente no funil.",
  },
  {
    title: "Acompanhe o funil",
    description:
      "Mova oportunidades entre etapas e saiba quem está perto de fechar.",
  },
  {
    title: "Faça follow-up",
    description:
      "Use mensagens prontas, registre interações e recupere leads parados.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Como funciona
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Do primeiro contato até a venda fechada.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              O Pubird Flow organiza o processo comercial para que nenhum lead
              fique esquecido e sua equipe saiba exatamente o próximo passo.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-bold text-white">
                  {index + 1}
                </div>

                <div>
                  <p className="font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
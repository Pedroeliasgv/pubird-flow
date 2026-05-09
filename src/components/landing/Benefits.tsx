import { BarChart3, MessageCircle, ShieldCheck, Users } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Leads organizados",
    description:
      "Centralize contatos vindos do WhatsApp, Instagram, site e anúncios em um único painel.",
  },
  {
    icon: MessageCircle,
    title: "Follow-up sem esquecimento",
    description:
      "Tenha lembretes e mensagens prontas para recuperar oportunidades que ficaram paradas.",
  },
  {
    icon: BarChart3,
    title: "Métricas de vendas",
    description:
      "Acompanhe leads, conversões, receita estimada e oportunidades próximas de fechar.",
  },
  {
    icon: ShieldCheck,
    title: "Dados por empresa",
    description:
      "Cada empresa acessa apenas seus próprios dados, com estrutura multiempresa preparada para escalar.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Benefícios
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Tudo que um negócio local precisa para parar de perder cliente.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 transition group-hover:bg-indigo-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-white">
                  {benefit.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
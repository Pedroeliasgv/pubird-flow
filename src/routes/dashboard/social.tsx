import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Megaphone, Sparkles } from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/social")({
  component: SocialStudioPage,
});

function SocialStudioPage() {
  return (
    <DashboardLayout
      pageTitle="Social Studio"
      pageDescription="Planeje conteúdos, organize ideias e prepare publicações para as redes sociais."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Megaphone className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            Social Studio
          </h2>

          <p className="mt-2 max-w-xl text-slate-500">
            Aqui ficará o módulo de planejamento de conteúdo, ideias de posts,
            legendas, calendário editorial e automações de redes sociais.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Ideias de conteúdo"
              description="Gere temas para posts, Reels, stories e carrosséis."
            />

            <FeatureCard
              icon={<Megaphone className="h-5 w-5" />}
              title="Legendas prontas"
              description="Crie textos comerciais com CTA para WhatsApp e direct."
            />

            <FeatureCard
              icon={<CalendarDays className="h-5 w-5" />}
              title="Calendário"
              description="Organize conteúdos por status, canal e data."
            />
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold tracking-tight">Próximas funções</h3>

          <div className="mt-5 space-y-3">
            {[
              "Criar post",
              "Gerar legenda",
              "Salvar rascunho",
              "Marcar como agendado",
              "Marcar como publicado",
              "Copiar legenda",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

function FeatureCard(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
        {props.icon}
      </div>

      <h3 className="font-bold text-slate-950">{props.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {props.description}
      </p>
    </div>
  );
}
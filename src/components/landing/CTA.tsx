import { ArrowRight, MousePointerClick } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 p-10 text-center shadow-2xl shadow-indigo-500/10 md:p-16">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background">
          <MousePointerClick className="h-7 w-7" />
        </div>

        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          Pronto para transformar atendimento em vendas?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Crie uma operação comercial mais organizada, acompanhe seus leads e
          pare de perder oportunidades por falta de follow-up.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:opacity-90"
          >
            Começar agora
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </a>

          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card/60 px-8 py-4 font-bold text-foreground transition hover:bg-muted"
          >
            Já tenho conta
          </a>
        </div>
      </div>
    </section>
  );
}
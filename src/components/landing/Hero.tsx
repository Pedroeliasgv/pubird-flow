import {
  ArrowRight,
  Sparkles,
  MessageCircle,
  Instagram,
  Megaphone,
  Users,
  TrendingUp,
  CheckCircle2,
  MousePointerClick,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background layers */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />

      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />

      <div className="container relative mx-auto px-6 pb-24 pt-28 md:pb-32 md:pt-40">
        <div className="mx-auto max-w-5xl text-center [animation:fade-up_0.7s_var(--ease-spring)_both]">
          <a
            href="#planos"
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 pl-1.5 text-xs text-muted-foreground backdrop-blur transition-all hover:border-primary/50 hover:text-foreground"
          >
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-3 w-3" />
              Novo
            </span>

            <span>CRM + automação para negócios locais</span>

            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </a>

          <h1
            className="text-balance text-5xl font-bold leading-[1.02] text-foreground md:text-6xl lg:text-7xl"
            style={{ letterSpacing: "var(--tracking-tighter)" }}
          >
            Transforme leads em{" "}
            <span className="text-gradient">clientes pagantes</span>
            <br className="hidden sm:block" /> com uma esteira inteligente de
            vendas
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-8 text-muted-foreground md:text-xl">
            Capture leads do WhatsApp, Instagram, site e anúncios em um só
            lugar. Organize o atendimento, acompanhe o funil e faça follow-up
            sem perder oportunidades.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="group inline-flex h-12 items-center justify-center rounded-2xl px-7 text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Começar agora
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>

            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card/40 px-7 text-base font-semibold text-foreground backdrop-blur transition-colors hover:bg-card/80"
            >
              Ver demonstração
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              CRM visual
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Follow-up organizado
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Dashboard de vendas
            </span>
          </div>
        </div>

        {/* Mockup */}
        <div className="relative mx-auto mt-20 max-w-6xl [animation:fade-up_0.9s_var(--ease-spring)_0.15s_both] md:mt-24">
          <div
            className="rounded-3xl border border-border p-1.5 ring-1 ring-white/5"
            style={{
              background: "var(--gradient-surface)",
              boxShadow: "var(--shadow-elegant), var(--shadow-glow)",
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />

              <span className="ml-3 hidden font-mono text-[10px] text-muted-foreground sm:block">
                app.pubirdflow.com/dashboard
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-5 backdrop-blur md:p-7">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Visão geral
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Operação comercial em tempo real
                  </h2>
                </div>

                <div className="flex w-fit items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +24% em oportunidades
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {[
                  {
                    icon: Users,
                    label: "Total de leads",
                    value: "1.247",
                    trend: "+18%",
                  },
                  {
                    icon: MessageCircle,
                    label: "Em atendimento",
                    value: "84",
                    trend: "+12%",
                  },
                  {
                    icon: TrendingUp,
                    label: "Taxa conversão",
                    value: "32%",
                    trend: "+5pp",
                  },
                  {
                    icon: Megaphone,
                    label: "Receita estimada",
                    value: "R$ 48k",
                    trend: "+24%",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="group rounded-2xl border border-border bg-card/70 p-4 transition-all hover:border-primary/30 hover:bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary-glow">
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                          {stat.trend}
                        </span>
                      </div>

                      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                        {stat.value}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mini Kanban */}
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {[
                  {
                    name: "Novo Lead",
                    color: "oklch(0.66 0.21 272)",
                    count: 12,
                  },
                  {
                    name: "Atendendo",
                    color: "oklch(0.72 0.16 200)",
                    count: 8,
                  },
                  {
                    name: "Interessado",
                    color: "oklch(0.74 0.18 295)",
                    count: 5,
                  },
                  {
                    name: "Proposta",
                    color: "oklch(0.82 0.16 82)",
                    count: 3,
                  },
                  {
                    name: "Fechado",
                    color: "oklch(0.72 0.17 152)",
                    count: 14,
                  },
                  {
                    name: "Perdido",
                    color: "oklch(0.64 0.23 25)",
                    count: 2,
                  },
                ].map((col) => (
                  <div
                    key={col.name}
                    className="rounded-2xl border border-border bg-muted/40 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: col.color }}
                        />

                        <span className="text-[11px] font-medium text-foreground">
                          {col.name}
                        </span>
                      </div>

                      <span className="text-[10px] text-muted-foreground">
                        {col.count}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-lg bg-background/80 p-2 ring-1 ring-white/5">
                        <div className="h-2 w-2/3 rounded bg-muted-foreground/20" />
                        <div className="mt-2 h-2 w-1/2 rounded bg-muted-foreground/10" />
                      </div>

                      <div className="rounded-lg bg-background/80 p-2 ring-1 ring-white/5">
                        <div className="h-2 w-3/4 rounded bg-muted-foreground/20" />
                        <div className="mt-2 h-2 w-1/3 rounded bg-muted-foreground/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating notification cards */}
          <div className="absolute -left-2 top-12 hidden animate-[float_6s_ease-in-out_infinite] rounded-2xl border border-border bg-popover/90 p-3 shadow-xl backdrop-blur md:block">
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary-glow">
                <Instagram className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary [animation:pulse-glow_2s_ease-in-out_infinite]" />
              </span>

              <div>
                <div className="font-medium text-foreground">Novo lead</div>
                <div className="text-[10px] text-muted-foreground">
                  via Instagram
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-2 bottom-12 hidden animate-[float_7s_ease-in-out_infinite_-2s] rounded-2xl border border-border bg-popover/90 p-3 shadow-xl backdrop-blur md:block">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success">
                <CheckCircle2 className="h-4 w-4" />
              </span>

              <div>
                <div className="font-medium text-foreground">Venda fechada</div>
                <div className="text-[10px] text-muted-foreground">
                  R$ 1.890,00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-20 flex max-w-4xl flex-col items-center gap-4 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Ideal para clínicas, estéticas, academias, imobiliárias e negócios
            locais premium
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60">
            {[
              "CLÍNICAS",
              "ESTÉTICAS",
              "ACADEMIAS",
              "IMOBILIÁRIAS",
              "RESTAURANTES",
              "PRESTADORES",
            ].map((item) => (
              <span
                key={item}
                className="text-sm font-semibold tracking-wider text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <MousePointerClick className="h-4 w-4 text-primary" />
          Em poucos minutos, sua empresa já pode começar a organizar leads e
          oportunidades.
        </div>
      </div>
    </section>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  LayoutDashboard,
  MessageCircle,
  Users,
  LogOut,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-border bg-card/40 p-6 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BarChart3 className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold">Pubird Flow</p>
              <p className="text-xs text-muted-foreground">
                CRM + automação
              </p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {[
              { label: "Dashboard", icon: LayoutDashboard, active: true },
              { label: "Leads", icon: Users },
              { label: "CRM", icon: BarChart3 },
              { label: "Mensagens", icon: MessageCircle },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-border px-6">
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <h1 className="text-xl font-bold">Pubird Flow</h1>
            </div>

            <button className="flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </header>

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="mt-2 text-muted-foreground">
                Visão geral inicial da operação comercial.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Total de leads", "0"],
                ["Novos leads", "0"],
                ["Em atendimento", "0"],
                ["Vendas fechadas", "0"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-border bg-card/70 p-6"
                >
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-4 text-4xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-border bg-card/70 p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Dashboard carregado com sucesso
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    Próximo passo: conectar os dados reais do Supabase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageCircle,
  Users,
} from "lucide-react";
import { getCurrentUser, signOut } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const userCompany = await getUserCompany(user.id);

        if (!userCompany) {
          navigate({ to: "/dashboard/onboarding" });
          return;
        }

        setCompany(userCompany);
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-950/80 p-6 md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500">
              <BarChart3 className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold">Pubird Flow</p>
              <p className="text-xs text-slate-400">CRM + automação</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {[
              {
                label: "Dashboard",
                icon: LayoutDashboard,
                active: true,
              },
              {
                label: "Leads",
                icon: Users,
              },
              {
                label: "CRM",
                icon: BarChart3,
              },
              {
                label: "Mensagens",
                icon: MessageCircle,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                    item.active
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
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
          <header className="flex h-20 items-center justify-between border-b border-white/10 px-6">
            <div>
              <p className="text-sm text-slate-400">Empresa</p>
              <h1 className="text-xl font-bold">{company?.name}</h1>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </header>

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="mt-2 text-slate-400">
                Visão geral inicial da sua operação comercial.
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
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-4 text-4xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                  <Building2 className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Sua empresa está configurada
                  </h3>
                  <p className="mt-1 text-slate-400">
                    Próximo passo: criar cadastro de leads e CRM Kanban.
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
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users,
  CalendarClock,
} from "lucide-react";

import { signOut } from "../../lib/auth";

type DashboardLayoutProps = {
  children: React.ReactNode;
  companyName?: string;
  pageTitle: string;
  pageDescription?: string;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    label: "CRM",
    href: "/dashboard/crm",
    icon: BarChart3,
  },
  {
    label: "Follow-up",
    href: "/dashboard/follow-up",
    icon: CalendarClock,
  },
  {
    label: "Serviços",
    href: "/dashboard/services",
    icon: BriefcaseBusiness,
  },
  {
    label: "Social Studio",
    href: "/dashboard/social",
    icon: Megaphone,
  },
];

export function DashboardLayout({
  children,
  companyName,
  pageTitle,
  pageDescription,
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }

    return location.pathname.startsWith(href);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:flex lg:flex-col">
          <Link to="/" className="group flex items-center gap-4">
            <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-cyan-400/20 to-purple-500/30 opacity-70 blur-xl transition duration-300 group-hover:opacity-100" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200 bg-slate-950 p-2 shadow-xl shadow-indigo-500/10 transition duration-300 group-hover:-translate-y-0.5">
                <img
                    src="/public/logo-pubird.png"
                    alt="Logo Pubird"
                    className="h-full w-full object-contain"
                />
                </div>
            </div>

            <div>
                <p className="text-lg font-black tracking-tight text-slate-950">
                Pubird Flow
                </p>

                <p className="text-xs font-medium text-slate-500">
                CRM + automação
                </p>
            </div>
            </Link>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Empresa ativa
            </p>
            <p className="mt-1 truncate font-semibold text-slate-900">
              {companyName || "Carregando..."}
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {companyName || "Pubird Flow"}
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {pageTitle}
                </h1>

                {pageDescription && (
                  <p className="mt-1 text-sm text-slate-500">
                    {pageDescription}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 md:flex"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>

            <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <div className="flex-1 p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
import { BarChart3, Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Pubird Flow
            </p>
            <p className="text-xs text-slate-400">
              CRM + automação comercial
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#beneficios" className="transition hover:text-white">
            Benefícios
          </a>
          <a href="#como-funciona" className="transition hover:text-white">
            Como funciona
          </a>
          <a href="#planos" className="transition hover:text-white">
            Planos
          </a>
          <a href="#faq" className="transition hover:text-white">
            FAQ
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Entrar
          </a>

          <a
            href="/register"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Começar agora
          </a>
        </div>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
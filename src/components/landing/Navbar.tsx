import { useState } from "react";
import { BarChart3, Menu, X } from "lucide-react";

const navItems = [
  { label: "Benefícios", href: "#beneficios" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="/" className="group flex items-center gap-4" onClick={closeMenu}>
            <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/40 via-cyan-400/20 to-purple-500/40 opacity-70 blur-xl transition duration-300 group-hover:opacity-100" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-slate-950 p-2 shadow-xl shadow-indigo-500/20 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-indigo-500/30">
                <img
                    src="/public/logo-pubird.png"
                    alt="Logo Pubird"
                    className="h-full w-full object-contain"
                />
                </div>
            </div>

            <div>
                <p className="text-xl font-black tracking-tight text-foreground">
                Pubird Flow
                </p>

                <p className="text-xs font-medium text-muted-foreground">
                CRM + automação comercial
                </p>
            </div>
            </a>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Entrar
          </a>

          <a
            href="/register"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Começar agora
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground md:hidden"
          aria-label="Abrir menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-background/95 px-6 py-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 transition hover:bg-card hover:text-foreground"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-3 grid gap-3">
              <a
                href="/login"
                onClick={closeMenu}
                className="rounded-2xl border border-border px-5 py-3 text-center font-medium text-foreground"
              >
                Entrar
              </a>

              <a
                href="/register"
                onClick={closeMenu}
                className="rounded-2xl bg-primary px-5 py-3 text-center font-semibold text-primary-foreground"
              >
                Começar agora
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
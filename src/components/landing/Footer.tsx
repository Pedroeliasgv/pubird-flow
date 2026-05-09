import { BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <p className="font-bold">Pubird Flow</p>
              <p className="text-xs text-muted-foreground">
                CRM + automação comercial
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            Uma plataforma para negócios locais organizarem leads, atendimento,
            conteúdo e vendas em um só lugar.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Produto</h3>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <a href="#beneficios" className="block hover:text-foreground">
              Benefícios
            </a>
            <a href="#como-funciona" className="block hover:text-foreground">
              Como funciona
            </a>
            <a href="#planos" className="block hover:text-foreground">
              Planos
            </a>
            <a href="#faq" className="block hover:text-foreground">
              FAQ
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Acesso</h3>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <a href="/login" className="block hover:text-foreground">
              Entrar
            </a>
            <a href="/register" className="block hover:text-foreground">
              Criar conta
            </a>
            <a href="mailto:contato@pubird.com" className="block hover:text-foreground">
              Contato
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row">
        <p>© 2026 Pubird Flow. Todos os direitos reservados.</p>
        <p>Desenvolvido por Pubird.</p>
      </div>
    </footer>
  );
}
export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-400 md:flex-row">
        <p>© 2026 Pubird Flow. Todos os direitos reservados.</p>

        <div className="flex gap-6">
          <a href="#" className="hover:text-white">
            Termos
          </a>
          <a href="#" className="hover:text-white">
            Privacidade
          </a>
          <a href="#" className="hover:text-white">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
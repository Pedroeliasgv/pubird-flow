export function SocialProof() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["+248", "leads organizados em um único painel"],
            ["24%", "aumento estimado em conversão"],
            ["3x", "mais controle sobre follow-ups"],
          ].map(([number, label]) => (
            <div key={label} className="text-center">
              <p className="text-5xl font-bold text-white">{number}</p>
              <p className="mt-3 text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
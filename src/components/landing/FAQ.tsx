const faqs = [
  {
    question: "O Pubird Flow envia WhatsApp automaticamente?",
    answer:
      "Na primeira versão, o sistema organiza leads e mensagens prontas. A integração com WhatsApp API pode ser adicionada na próxima fase.",
  },
  {
    question: "Serve para qualquer negócio?",
    answer:
      "Ele foi pensado principalmente para negócios locais: clínicas, estéticas, academias, imobiliárias, igrejas, eventos e prestadores de serviço.",
  },
  {
    question: "Tem pagamento mensal?",
    answer:
      "A estrutura de planos e assinaturas já estará preparada. Depois você pode conectar Asaas, Mercado Pago ou Stripe.",
  },
  {
    question: "Cada empresa vê apenas seus dados?",
    answer:
      "Sim. A estrutura é multiempresa, com isolamento por company_id e policies no Supabase.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            FAQ
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white">
            Perguntas frequentes
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="font-semibold text-white">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
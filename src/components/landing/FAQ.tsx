const faqs = [
  {
    question: "O Pubird Flow é um CRM?",
    answer:
      "Sim, mas não é só um CRM. Ele une gestão de leads, follow-up, mensagens prontas, dashboard comercial e estrutura para automações futuras.",
  },
  {
    question: "Serve para qualquer tipo de empresa?",
    answer:
      "Ele foi pensado principalmente para negócios locais que recebem leads pelo WhatsApp, Instagram, site, indicação ou anúncios.",
  },
  {
    question: "Já publica automaticamente no Instagram?",
    answer:
      "A primeira versão organiza ideias, legendas e calendário de conteúdo. A publicação automática pode entrar em uma próxima fase com integração oficial.",
  },
  {
    question: "Precisa de cartão para começar?",
    answer:
      "A proposta inicial é permitir teste sem cartão. Depois, a assinatura mensal pode ser conectada com Asaas, Mercado Pago ou Stripe.",
  },
  {
    question: "Cada empresa vê apenas seus próprios dados?",
    answer:
      "Sim. O sistema foi estruturado como multiempresa, para que cada empresa acesse apenas seus próprios leads, serviços, mensagens e dados.",
  },
  {
    question: "Posso usar junto com tráfego pago?",
    answer:
      "Sim. A ideia é que leads vindos de anúncios, landing pages e redes sociais sejam organizados no mesmo funil comercial.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            FAQ
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight">
            Perguntas frequentes
          </h2>

          <p className="mt-5 text-muted-foreground">
            As principais dúvidas antes de começar a usar o Pubird Flow.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-border bg-card/70 p-6"
            >
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  createPublicLead,
  getPublicCompanyBySlug,
  getPublicCompanyServices,
  PublicCompany,
} from "../../lib/public-company";

import type { Service } from "../../lib/services";
import { formatCurrency, serviceBillingTypeLabels } from "../../lib/services";

export const Route = createFileRoute("/empresa/$slug")({
  component: PublicCompanyPage,
});

function PublicCompanyPage() {
  const { slug } = Route.useParams();

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCompany() {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getPublicCompanyBySlug(slug);

        if (!data) {
          setCompany(null);
          return;
        }

        setCompany(data);

        const companyServices = await getPublicCompanyServices(data.id);
        setServices(companyServices);

        if (companyServices.length > 0) {
          setServiceInterest(companyServices[0].name);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Não foi possível carregar essa página.");
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company) {
      return;
    }

    setSending(true);
    setErrorMessage("");

    try {
      if (name.trim().length < 2) {
        setErrorMessage("Informe seu nome.");
        return;
      }

      if (phone.trim().length < 8) {
        setErrorMessage("Informe um WhatsApp válido.");
        return;
      }

      await createPublicLead({
        companyId: company.id,
        name,
        phone,
        email,
        serviceInterest,
        message,
      });

      setSent(true);
      setName("");
      setPhone("");
      setEmail("");
      setServiceInterest(services.length > 0 ? services[0].name : "");
      setMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao enviar sua solicitação. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando página...
        </div>
      </main>
    );
  }

  if (!company) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-950">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Building2 className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">Empresa não encontrada</h1>

          <p className="mt-3 text-slate-500">
            Essa página pode ter sido removida, desativada ou o link está
            incorreto.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <section className="relative overflow-hidden px-6 py-8 md:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
          <header className="mb-10 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold tracking-tight">Pubird Flow</p>
                <p className="text-xs text-slate-500">Página pública</p>
              </div>
            </Link>

            <span className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm md:inline-flex">
              Powered by Pubird Flow
            </span>
          </header>

          <div className="grid min-h-[calc(100vh-160px)] items-center gap-8 lg:grid-cols-[1fr_520px]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Atendimento comercial seguro
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                Fale com{" "}
                <span className="text-indigo-600">{company.name}</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Preencha o formulário e a equipe da empresa receberá sua
                solicitação diretamente no CRM para dar continuidade ao
                atendimento.
              </p>

              <div className="mt-10 grid max-w-2xl gap-4 md:grid-cols-3">
                <InfoCard
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Resposta rápida"
                  description="Seu contato entra direto no fluxo de atendimento."
                />

                <InfoCard
                  icon={<Send className="h-5 w-5" />}
                  title="Lead organizado"
                  description="Sua solicitação será registrada corretamente."
                />

                <InfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="Próximo passo"
                  description="A empresa poderá retornar com mais precisão."
                />
              </div>

              {services.length > 0 && (
                <div className="mt-10 max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
                      Serviços disponíveis
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight">
                      Escolha o serviço que você procura
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Esses são alguns dos serviços cadastrados por{" "}
                      {company.name}.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {services.slice(0, 4).map((service) => (
                      <div
                        key={service.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-950">
                              {service.name}
                            </h3>

                            {service.description && (
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                {service.description}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-bold text-slate-950">
                              {formatCurrency(Number(service.price))}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {serviceBillingTypeLabels[service.billing_type]}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-600">
                {company.phone && (
                  <a
                    href={`https://wa.me/55${company.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}

                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
                  >
                    <Mail className="h-4 w-4" />
                    E-mail
                  </a>
                )}

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
                  >
                    <Globe className="h-4 w-4" />
                    Site
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
              {sent ? (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <h2 className="mt-6 text-3xl font-bold">
                    Solicitação enviada
                  </h2>

                  <p className="mt-3 max-w-sm text-slate-500">
                    Seu contato foi enviado para {company.name}. A equipe poderá
                    retornar em breve.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Enviar outro contato
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Formulário de interesse
                    </span>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight">
                      Como podemos ajudar?
                    </h2>

                    <p className="mt-2 text-slate-500">
                      Preencha os dados abaixo para iniciar o atendimento.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Field label="Nome" required>
                      <input
                        className="input-light"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </Field>

                    <Field label="WhatsApp" required>
                      <input
                        className="input-light"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </Field>

                    <Field label="E-mail">
                      <input
                        type="email"
                        className="input-light"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="voce@email.com"
                      />
                    </Field>

                    <Field label="Serviço de interesse">
                      {services.length > 0 ? (
                        <select
                          className="input-light"
                          value={serviceInterest}
                          onChange={(event) =>
                            setServiceInterest(event.target.value)
                          }
                        >
                          {services.map((service) => (
                            <option key={service.id} value={service.name}>
                              {service.name} —{" "}
                              {formatCurrency(Number(service.price))}
                            </option>
                          ))}

                          <option value="Outro">Outro serviço</option>
                        </select>
                      ) : (
                        <input
                          className="input-light"
                          value={serviceInterest}
                          onChange={(event) =>
                            setServiceInterest(event.target.value)
                          }
                          placeholder="Ex: avaliação, orçamento, consulta..."
                        />
                      )}

                      {services.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          Escolha um dos serviços cadastrados pela empresa.
                        </p>
                      )}
                    </Field>

                    <Field label="Mensagem">
                      <textarea
                        className="input-light min-h-28 resize-none"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Conte rapidamente o que você precisa..."
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={sending}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      )}

                      Enviar solicitação
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {props.label}
        {props.required && <span className="text-indigo-600"> *</span>}
      </span>

      {props.children}
    </label>
  );
}

function InfoCard(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {props.icon}
      </div>

      <h3 className="font-bold text-slate-950">{props.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {props.description}
      </p>
    </div>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CircleAlert,
  Globe,
  Loader2,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { getCurrentUser, signOut } from "../../lib/auth";
import {
  checkSlugAvailability,
  createCompany,
  createSlug,
  formatCnpj,
  formatPhone,
  getUserCompany,
  normalizeWebsite,
} from "../../lib/company";

export const Route = createFileRoute("/dashboard/onboarding")({
  component: OnboardingPage,
});

type Step = 1 | 2 | 3;

function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);

  const [userId, setUserId] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [slug, setSlug] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const publicUrl = useMemo(() => {
    return `/empresa/${slug || "sua-empresa"}`;
  }, [slug]);

  useEffect(() => {
    async function checkAccess() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        setUserId(user.id);

        if (user.email) {
          setEmail(user.email);
        }

        const existingCompany = await getUserCompany(user.id);

        if (existingCompany) {
          navigate({ to: "/dashboard" });
          return;
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Não foi possível verificar sua conta.");
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setCheckingSlug(true);
        const available = await checkSlugAvailability(slug);
        setSlugAvailable(available);
      } catch (error) {
        console.error(error);
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [slug]);

  function handleCompanyName(value: string) {
    setCompanyName(value);

    const nextSlug = createSlug(value);

    if (!slug || slug === createSlug(companyName)) {
      setSlug(nextSlug);
    }
  }

  function nextStep() {
    setErrorMessage("");

    if (step === 1) {
      if (companyName.trim().length < 2) {
        setErrorMessage("Informe o nome da empresa para continuar.");
        return;
      }

      if (document && document.replace(/\D/g, "").length !== 14) {
        setErrorMessage("Informe um CNPJ válido com 14 números.");
        return;
      }

      if (phone && phone.replace(/\D/g, "").length < 10) {
        setErrorMessage("Informe um telefone/WhatsApp válido.");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (slug.trim().length < 3) {
        setErrorMessage("O slug precisa ter pelo menos 3 caracteres.");
        return;
      }

      if (slugAvailable === false) {
        setErrorMessage("Esse slug já está em uso. Escolha outro.");
        return;
      }

      setStep(3);
    }
  }

  function previousStep() {
    setErrorMessage("");

    if (step > 1) {
      setStep((current) => (current - 1) as Step);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step !== 3) {
      nextStep();
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!userId) {
        setErrorMessage("Usuário não encontrado. Faça login novamente.");
        return;
      }

      const available = await checkSlugAvailability(slug);

      if (!available) {
        setErrorMessage("Esse slug já está em uso. Escolha outro.");
        setStep(2);
        return;
      }

      await createCompany({
        ownerId: userId,
        name: companyName,
        slug,
        document,
        phone,
        email,
        website,
      });

      setSuccessMessage("Empresa criada com sucesso. Redirecionando...");

      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 700);
    } catch (error: any) {
      console.error(error);

      if (error?.code === "23505") {
        setErrorMessage("Já existe uma empresa usando esse slug.");
        setStep(2);
        return;
      }

      setErrorMessage("Erro ao criar empresa. Verifique os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Preparando seu ambiente...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[430px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white px-8 py-10 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="font-bold tracking-tight">Pubird Flow</p>
              <p className="text-xs text-slate-500">Setup da empresa</p>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Onboarding
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
              Configure a base da sua operação comercial.
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              Crie o ambiente da empresa para começar a organizar leads,
              serviços, páginas de captura e automações.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <ProgressItem
              number={1}
              title="Dados da empresa"
              description="Nome, CNPJ e WhatsApp"
              active={step === 1}
              done={step > 1}
            />

            <ProgressItem
              number={2}
              title="Identidade digital"
              description="E-mail, site e link público"
              active={step === 2}
              done={step > 2}
            />

            <ProgressItem
              number={3}
              title="Revisão"
              description="Confirmação final"
              active={step === 3}
              done={false}
            />
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600" />

              <div>
                <p className="font-semibold">Ambiente seguro</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Cada empresa possui seus próprios dados, leads e permissões.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold">Pubird Flow</p>
                  <p className="text-xs text-slate-500">Setup da empresa</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm"
              >
                Sair
              </button>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Etapa {step} de 3
                  </span>

                  <h2 className="mt-4 text-3xl font-bold tracking-tight">
                    {step === 1 && "Dados da empresa"}
                    {step === 2 && "Identidade digital"}
                    {step === 3 && "Revise e confirme"}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {step === 1 &&
                      "Informe os dados principais para criar o ambiente da empresa."}
                    {step === 2 &&
                      "Configure como sua empresa será encontrada e identificada."}
                    {step === 3 &&
                      "Confira os dados antes de finalizar o cadastro."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-50 md:flex"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              </div>

              <div className="mb-8 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-2 rounded-full ${
                      item <= step ? "bg-indigo-600" : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-5">
                    <Field label="Nome da empresa" required>
                      <input
                        className="input-light"
                        value={companyName}
                        onChange={(event) =>
                          handleCompanyName(event.target.value)
                        }
                        placeholder="Ex: Clínica Bella Forma"
                        required
                      />
                    </Field>

                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="CNPJ">
                        <input
                          className="input-light"
                          value={document}
                          onChange={(event) =>
                            setDocument(formatCnpj(event.target.value))
                          }
                          placeholder="00.000.000/0000-00"
                        />
                      </Field>

                      <Field label="WhatsApp comercial">
                        <input
                          className="input-light"
                          value={phone}
                          onChange={(event) =>
                            setPhone(formatPhone(event.target.value))
                          }
                          placeholder="(11) 99999-9999"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <Field label="E-mail comercial">
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          className="input-light pl-11"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="contato@empresa.com"
                        />
                      </div>
                    </Field>

                    <Field label="Site ou domínio">
                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className="input-light pl-11"
                          value={website}
                          onBlur={() => setWebsite(normalizeWebsite(website))}
                          onChange={(event) => setWebsite(event.target.value)}
                          placeholder="empresa.com.br"
                        />
                      </div>
                    </Field>

                    <Field label="Link público da empresa" required>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <input
                            className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
                            value={slug}
                            onChange={(event) =>
                              setSlug(createSlug(event.target.value))
                            }
                            placeholder="nome-da-empresa"
                            required
                          />

                          {checkingSlug && (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          )}

                          {!checkingSlug && slugAvailable === true && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          )}

                          {!checkingSlug && slugAvailable === false && (
                            <CircleAlert className="h-4 w-4 text-red-600" />
                          )}
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                          Página pública:{" "}
                          <span className="font-semibold text-slate-900">
                            {publicUrl}
                          </span>
                        </div>
                      </div>

                      {slugAvailable === false && (
                        <p className="mt-2 text-xs text-red-600">
                          Esse link já está em uso.
                        </p>
                      )}

                      {slugAvailable === true && (
                        <p className="mt-2 text-xs text-emerald-600">
                          Link disponível.
                        </p>
                      )}
                    </Field>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                          <Building2 className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="font-bold">{companyName}</h3>
                          <p className="text-sm text-slate-500">{publicUrl}</p>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <ReviewItem label="CNPJ" value={document || "Não informado"} />
                        <ReviewItem label="WhatsApp" value={phone || "Não informado"} />
                        <ReviewItem label="E-mail" value={email || "Não informado"} />
                        <ReviewItem label="Site" value={website || "Não informado"} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-800">
                      Ao confirmar, o sistema criará a empresa e vinculará sua
                      conta como proprietária do ambiente.
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={previousStep}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : step === 3 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}

                    {step === 3 ? "Criar empresa" : "Continuar"}
                  </button>
                </div>
              </form>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Você poderá editar essas informações depois nas configurações.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProgressItem(props: {
  number: number;
  title: string;
  description: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-4 transition ${
        props.active
          ? "border-indigo-200 bg-indigo-50"
          : props.done
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            props.done
              ? "bg-emerald-600 text-white"
              : props.active
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {props.done ? <Check className="h-4 w-4" /> : props.number}
        </div>

        <div>
          <p className="font-semibold">{props.title}</p>
          <p className="mt-1 text-sm text-slate-500">{props.description}</p>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  children: ReactNode;
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

function ReviewItem(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">{props.label}</span>
      <span className="text-right font-semibold text-slate-900">
        {props.value}
      </span>
    </div>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { getCurrentUser, signOut } from "../../lib/auth";
import {
  createCompanyWithOwner,
  createSlug,
  getUserCompany,
} from "../../lib/company";

export const Route = createFileRoute("/dashboard/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkAuthAndCompany() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        setUserId(user.id);

        if (user.email) {
          setBillingEmail(user.email);
        }

        const company = await getUserCompany(user.id);

        if (company) {
          navigate({ to: "/dashboard" });
          return;
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao verificar usuário.");
      } finally {
        setChecking(false);
      }
    }

    checkAuthAndCompany();
  }, [navigate]);

  function handleCompanyNameChange(value: string) {
    setCompanyName(value);
    setSlug(createSlug(value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      if (!userId) {
        setErrorMessage("Usuário não encontrado.");
        return;
      }

      if (!companyName.trim()) {
        setErrorMessage("Informe o nome da empresa.");
        return;
      }

      if (!slug.trim()) {
        setErrorMessage("Informe um slug válido.");
        return;
      }

      await createCompanyWithOwner({
        userId,
        name: companyName,
        slug,
        phone,
        billingEmail,
      });

      navigate({ to: "/dashboard" });
    } catch (error: any) {
      console.error(error);

      if (error?.code === "23505") {
        setErrorMessage("Esse slug já está em uso. Escolha outro.");
        return;
      }

      setErrorMessage("Erro ao criar empresa. Tente novamente.");
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
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Verificando acesso...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">Configure sua empresa</h1>
                <p className="mt-1 text-slate-400">
                  Esse será o ambiente principal do seu CRM.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              Sair
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-300">
                Nome da empresa
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Clínica Bella Forma"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={companyName}
                onChange={(event) =>
                  handleCompanyNameChange(event.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                Slug público
              </label>
              <input
                type="text"
                required
                placeholder="clinica-bella-forma"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={slug}
                onChange={(event) => setSlug(createSlug(event.target.value))}
              />
              <p className="mt-2 text-xs text-slate-500">
                URL futura: /empresa/{slug || "sua-empresa"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                WhatsApp comercial
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-300">
                E-mail de cobrança/contato
              </label>
              <input
                type="email"
                placeholder="empresa@email.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={billingEmail}
                onChange={(event) => setBillingEmail(event.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar empresa e continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
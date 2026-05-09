import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { signUpWithEmail } from "../lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await signUpWithEmail({
        fullName,
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user && data.session) {
        navigate({ to: "/dashboard/onboarding" });
        return;
      }

      setSuccessMessage(
        "Conta criada. Confira seu e-mail para confirmar o cadastro antes de entrar."
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro inesperado ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/30">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500">
              <BarChart3 className="h-6 w-6" />
            </div>

            <div>
              <p className="font-bold">Pubird Flow</p>
              <p className="text-xs text-slate-400">Criar nova conta</p>
            </div>
          </Link>

          <h1 className="text-3xl font-bold">Criar conta</h1>
          <p className="mt-2 text-slate-400">
            Comece a organizar seus leads em poucos minutos.
          </p>

          {successMessage && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300">
                Nome completo
              </label>
              <input
                type="text"
                required
                placeholder="Seu nome"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="voce@email.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar conta
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-indigo-300">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
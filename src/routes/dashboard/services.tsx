import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../lib/auth";
import { Company, getUserCompany } from "../../lib/company";
import {
  createService,
  deleteService,
  formatCurrency,
  getServices,
  parseCurrencyInput,
  Service,
  ServiceBillingType,
  serviceBillingTypeLabels,
  ServiceStatus,
  serviceStatusLabels,
  updateService,
} from "../../lib/services";
import { useCurrentPlan } from "../../hooks/useCurrentPlan";
import { canCreateService } from "../../lib/planAccess";

export const Route = createFileRoute("/dashboard/services")({
  component: ServicesPage,
});

function ServicesPage() {
  const navigate = useNavigate();

  const {
    loading: loadingPlan,
    planSlug,
    planName,
    isActive,
  } = useCurrentPlan();

  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">(
    "all"
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingType, setBillingType] =
    useState<ServiceBillingType>("one_time");
  const [status, setStatus] = useState<ServiceStatus>("active");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const userCompany = await getUserCompany(user.id);

        if (!userCompany) {
          navigate({ to: "/dashboard/onboarding" });
          return;
        }

        setCompany(userCompany);

        const data = await getServices(userCompany.id);
        setServices(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Erro ao carregar serviços.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const servicesUsed = services.length;
  const canAddService = isActive && canCreateService(planSlug, servicesUsed);

  function resetForm() {
    setEditingService(null);
    setName("");
    setDescription("");
    setPrice("");
    setBillingType("one_time");
    setStatus("active");
  }

  function openCreateForm() {
    if (!canAddService) {
      setErrorMessage(
        `Limite de serviços atingido no plano ${
          planName || "atual"
        }. Faça upgrade para cadastrar mais serviços.`
      );
      return;
    }

    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(service: Service) {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || "");
    setPrice(String(service.price).replace(".", ","));
    setBillingType(service.billing_type);
    setStatus(service.status);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company) {
      return;
    }

    if (!editingService && !canAddService) {
      setErrorMessage(
        `Limite de serviços atingido no plano ${
          planName || "atual"
        }. Faça upgrade para cadastrar mais serviços.`
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (name.trim().length < 2) {
        setErrorMessage("Informe um nome de serviço válido.");
        return;
      }

      const parsedPrice = parseCurrencyInput(price);

      if (editingService) {
        const updated = await updateService({
          serviceId: editingService.id,
          name,
          description,
          price: parsedPrice,
          billingType,
          status,
        });

        setServices((current) =>
          current.map((service) =>
            service.id === updated.id ? updated : service
          )
        );

        setSuccessMessage("Serviço atualizado com sucesso.");
      } else {
        const created = await createService({
          companyId: company.id,
          name,
          description,
          price: parsedPrice,
          billingType,
          status,
        });

        setServices((current) => [created, ...current]);
        setSuccessMessage("Serviço cadastrado com sucesso.");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao salvar serviço.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(serviceId: string) {
    const confirmed = window.confirm("Deseja excluir este serviço?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteService(serviceId);
      setServices((current) =>
        current.filter((service) => service.id !== serviceId)
      );
      setSuccessMessage("Serviço excluído com sucesso.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao excluir serviço.");
    }
  }

  if (loading || loadingPlan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Carregando serviços...
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      companyName={company?.name}
      pageTitle="Serviços"
      pageDescription="Cadastre os serviços que sua empresa oferece e use-os na captação de leads."
    >
      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Total" value={services.length} />

          <MiniMetric
            label="Ativos"
            value={
              services.filter((service) => service.status === "active").length
            }
          />

          <MiniMetric
            label="Inativos"
            value={
              services.filter((service) => service.status === "inactive")
                .length
            }
          />
        </div>

        <button
          onClick={openCreateForm}
          disabled={!canAddService}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {canAddService ? "Novo serviço" : "Limite atingido"}
        </button>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              className="input-light pl-11"
              placeholder="Buscar por nome ou descrição"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="input-light"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ServiceStatus | "all")
            }
          >
            <option value="all">Todos os status</option>

            {Object.entries(serviceStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {filteredServices.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <BriefcaseBusiness className="h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-xl font-bold">
              Nenhum serviço encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Cadastre os serviços da sua empresa para melhorar a captação de
              leads e deixar sua página pública mais profissional.
            </p>

            <button
              onClick={openCreateForm}
              disabled={!canAddService}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canAddService ? "Cadastrar serviço" : "Limite atingido"}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Badge status={service.status}>
                      {serviceStatusLabels[service.status]}
                    </Badge>

                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      {service.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {service.description || "Sem descrição cadastrada."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Preço
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {formatCurrency(Number(service.price))}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {serviceBillingTypeLabels[service.billing_type]}
                  </p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => openEditForm(service)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingService ? "Editar serviço" : "Novo serviço"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cadastre os serviços que poderão aparecer na página pública.
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Nome do serviço" required>
                <input
                  className="input-light"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: Limpeza de pele"
                  required
                />
              </Field>

              <Field label="Descrição">
                <textarea
                  className="input-light min-h-28 resize-none"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explique brevemente o que esse serviço oferece..."
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Preço">
                  <input
                    className="input-light"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Ex: 197,00"
                  />
                </Field>

                <Field label="Cobrança">
                  <select
                    className="input-light"
                    value={billingType}
                    onChange={(event) =>
                      setBillingType(event.target.value as ServiceBillingType)
                    }
                  >
                    {Object.entries(serviceBillingTypeLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    className="input-light"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as ServiceStatus)
                    }
                  >
                    {Object.entries(serviceStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </Field>
              </div>

              <button
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingService ? "Salvar alterações" : "Cadastrar serviço"}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MiniMetric(props: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {props.label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-950">{props.value}</p>
    </div>
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

function Badge(props: { children: React.ReactNode; status: ServiceStatus }) {
  const styles = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    inactive: "border-amber-200 bg-amber-50 text-amber-700",
    archived: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[props.status]}`}
    >
      {props.children}
    </span>
  );
}
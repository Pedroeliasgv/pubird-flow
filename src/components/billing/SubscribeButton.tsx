import { useState } from "react";
import { createAsaasCheckout, BillingType, PlanSlug } from "@/services/asaas";

type SubscribeButtonProps = {
  planSlug: PlanSlug;
  billingType?: BillingType;
  children?: React.ReactNode;
};

export function SubscribeButton({
  planSlug,
  billingType = "PIX",
  children,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    try {
      setLoading(true);

      const result = await createAsaasCheckout({
        planSlug,
        billingType,
      });

      console.log("Assinatura criada:", result);

      alert(
        "Assinatura criada com sucesso! Agora aguarde a confirmação do pagamento."
      );
    } catch (error) {
      console.error("Erro ao assinar plano:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao criar assinatura. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className="
        w-full rounded-xl bg-black px-5 py-3
        text-sm font-semibold text-white
        transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60
      "
    >
      {loading ? "Criando assinatura..." : children ?? "Assinar plano"}
    </button>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotaoCancelar({ agendamentoId }: { agendamentoId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [carregando, setCarregando] = useState(false);

  async function cancelar() {
    if (!confirm("Cancelar este agendamento?")) return;
    setCarregando(true);
    await supabase
      .from("agendamentos")
      .update({ status: "cancelado" })
      .eq("id", agendamentoId);
    setCarregando(false);
    router.refresh();
  }

  return (
    <button
      onClick={cancelar}
      disabled={carregando}
      className="text-on-surface-variant hover:text-error disabled:opacity-40"
      aria-label="Cancelar agendamento"
    >
      <span className="material-symbols-outlined">close</span>
    </button>
  );
}

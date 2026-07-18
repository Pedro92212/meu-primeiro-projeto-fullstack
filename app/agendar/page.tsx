"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const HORARIOS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

function proximosDias(qtd: number) {
  const dias = [];
  const hoje = new Date();
  for (let i = 0; i < qtd; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push(d);
  }
  return dias;
}

export default function AgendarPage() {
  return (
    <Suspense fallback={null}>
      <AgendarConteudo />
    </Suspense>
  );
}

function AgendarConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const servicoId = searchParams.get("servico");
  const supabase = createClient();

  const dias = useMemo(() => proximosDias(14), []);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(dias[0]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null
  );
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarOcupados() {
      setCarregando(true);
      const inicio = new Date(diaSelecionado);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(diaSelecionado);
      fim.setHours(23, 59, 59, 999);

      const { data } = await supabase
        .from("agendamentos")
        .select("data_hora")
        .eq("status", "agendado")
        .gte("data_hora", inicio.toISOString())
        .lte("data_hora", fim.toISOString());

      const horariosOcupados = (data ?? []).map((a) => {
        const d = new Date(a.data_hora);
        return `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`;
      });

      setOcupados(horariosOcupados);
      setCarregando(false);
    }
    buscarOcupados();
  }, [diaSelecionado]);

  function continuar() {
    if (!horarioSelecionado || !servicoId) return;
    const [h, m] = horarioSelecionado.split(":");
    const dataHora = new Date(diaSelecionado);
    dataHora.setHours(Number(h), Number(m), 0, 0);

    const params = new URLSearchParams({
      servico: servicoId,
      dataHora: dataHora.toISOString(),
    });
    router.push(`/confirmar?${params.toString()}`);
  }

  if (!servicoId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-margin-mobile text-center">
        <p className="text-on-surface-variant">
          Nenhum serviço selecionado.{" "}
          <a href="/" className="text-aged-gold underline">
            Voltar para os serviços
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-32">
      <header className="bg-background shadow-sm fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16">
        <h1 className="font-h1-mobile text-h1-mobile font-bold text-primary">
          Barbearia do Pedro
        </h1>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant" />
      </header>

      <div className="pt-24 px-margin-mobile max-w-md mx-auto">
        <div className="mb-lg">
          <h2 className="font-h1 text-h1 mb-2">Escolha data e hora</h2>
          <p className="text-on-surface-variant font-body text-body">
            Selecione o melhor momento para o seu ritual de cuidado.
          </p>
        </div>

        <section className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-lg border border-surface-container">
          <h3 className="font-h2 text-h2 mb-md">Escolha o dia</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dias.map((d) => {
              const ativo =
                d.toDateString() === diaSelecionado.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setDiaSelecionado(d);
                    setHorarioSelecionado(null);
                  }}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-lg transition-colors ${
                    ativo
                      ? "bg-primary text-white font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="text-[11px] uppercase">
                    {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </span>
                  <span className="text-lg">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="font-h2 text-h2 mb-sm">Horários disponíveis</h3>
          {carregando ? (
            <p className="text-on-surface-variant text-body">Carregando...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {HORARIOS.map((h) => {
                const ocupado = ocupados.includes(h);
                const ativo = horarioSelecionado === h;
                return (
                  <button
                    key={h}
                    disabled={ocupado}
                    onClick={() => setHorarioSelecionado(h)}
                    className={`py-3 rounded-xl font-label text-label transition-all ${
                      ocupado
                        ? "bg-surface-container opacity-50 text-on-surface-variant cursor-not-allowed"
                        : ativo
                        ? "border-2 border-primary bg-white"
                        : "bg-white border border-outline-variant hover:shadow-md active:scale-95"
                    }`}
                  >
                    {h}
                    {ocupado && (
                      <div className="text-[10px] uppercase font-bold">
                        Ocupado
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-margin-mobile pb-sm pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          disabled={!horarioSelecionado}
          onClick={continuar}
          className="w-full bg-aged-gold text-primary py-5 rounded-xl font-button uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
        >
          Continuar
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </button>
      </div>
    </main>
  );
}

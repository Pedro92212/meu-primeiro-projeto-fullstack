"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Servico } from "@/lib/types";

function formatarTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  const match = digitos.match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
  if (!match) return valor;
  const [, ddd, parte1, parte2] = match;
  if (!parte1) return ddd;
  if (!parte2) return `(${ddd}) ${parte1}`;
  return `(${ddd}) ${parte1}-${parte2}`;
}

export default function ConfirmarPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmarConteudo />
    </Suspense>
  );
}

function ConfirmarConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const servicoId = searchParams.get("servico");
  const dataHoraStr = searchParams.get("dataHora");
  const supabase = createClient();

  const [servico, setServico] = useState<Servico | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function buscarServico() {
      if (!servicoId) return;
      const { data } = await supabase
        .from("servicos")
        .select("*")
        .eq("id", servicoId)
        .single();
      setServico(data as Servico);
    }
    buscarServico();
  }, [servicoId]);

  if (!servicoId || !dataHoraStr) {
    return (
      <main className="min-h-screen flex items-center justify-center px-margin-mobile text-center">
        <p className="text-on-surface-variant">
          Dados de agendamento incompletos.{" "}
          <a href="/" className="text-aged-gold underline">
            Voltar ao início
          </a>
        </p>
      </main>
    );
  }

  const dataHora = new Date(dataHoraStr);

  async function confirmar() {
    if (!nome.trim() || telefone.replace(/\D/g, "").length < 10) {
      setErro("Preencha nome completo e um telefone válido.");
      return;
    }
    setErro(null);
    setEnviando(true);

    try {
      const clienteId = crypto.randomUUID();
      const { error: erroCliente } = await supabase
        .from("clientes")
        .insert({ id: clienteId, nome: nome.trim(), telefone });

      if (erroCliente) throw erroCliente;

      const { error: erroAgendamento } = await supabase
        .from("agendamentos")
        .insert({
          cliente_id: clienteId,
          servico_id: servicoId,
          data_hora: dataHora.toISOString(),
          status: "agendado",
        });

      if (erroAgendamento) {
        // Provavelmente o horário acabou de ser ocupado por outra pessoa
        setErro(
          "Esse horário acabou de ser reservado por outra pessoa. Volte e escolha outro horário."
        );
        setEnviando(false);
        return;
      }

      setSucesso(true);
    } catch {
      setErro("Não foi possível confirmar o agendamento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-background shadow-sm h-16 flex items-center justify-between px-margin-mobile">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="p-2 rounded-full hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-primary">
            arrow_back
          </span>
        </button>
        <h1 className="font-h1-mobile text-h1-mobile font-bold text-primary">
          Confirmar Agendamento
        </h1>
        <div className="w-10" />
      </header>

      <div className="pt-24 pb-12 px-margin-mobile max-w-md mx-auto">
        <section className="space-y-sm mb-lg">
          <div className="grid grid-cols-2 gap-sm">
            <div className="col-span-2 bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-container">
              <div className="flex items-center gap-sm mb-xs">
                <span className="material-symbols-outlined text-secondary">
                  content_cut
                </span>
                <span className="font-label text-label text-on-surface-variant uppercase tracking-wider">
                  Serviço Selecionado
                </span>
              </div>
              <p className="font-h2 text-h2 text-primary">
                {servico?.nome ?? "Carregando..."}
              </p>
              {servico && (
                <p className="text-secondary font-bold mt-1">
                  {servico.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              )}
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-container">
              <div className="flex items-center gap-xs mb-xs">
                <span className="material-symbols-outlined text-secondary">
                  calendar_today
                </span>
                <span className="font-label text-label text-on-surface-variant uppercase tracking-wider">
                  Data
                </span>
              </div>
              <p className="font-body text-body font-semibold text-primary">
                {dataHora.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}
              </p>
              <p className="font-label text-label text-on-surface-variant">
                {dataHora.toLocaleDateString("pt-BR", { weekday: "long" })}
              </p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-container">
              <div className="flex items-center gap-xs mb-xs">
                <span className="material-symbols-outlined text-secondary">
                  schedule
                </span>
                <span className="font-label text-label text-on-surface-variant uppercase tracking-wider">
                  Horário
                </span>
              </div>
              <p className="font-body text-body font-semibold text-primary">
                {dataHora.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-surface-container mb-lg">
          <h3 className="font-h2 text-h2 mb-md text-primary">Seus Dados</h3>
          <div className="space-y-md">
            <div>
              <label className="font-label text-label text-on-surface-variant ml-1">
                Nome Completo
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full h-12 px-md rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all mt-1"
              />
            </div>
            <div>
              <label className="font-label text-label text-on-surface-variant ml-1">
                Telefone
              </label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
                type="tel"
                className="w-full h-12 px-md rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all mt-1"
              />
            </div>
            {erro && <p className="text-error text-body">{erro}</p>}
          </div>
        </section>

        <div className="space-y-md text-center">
          <button
            onClick={confirmar}
            disabled={enviando}
            className="w-full h-14 aged-gold-gradient text-primary font-button uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-sm disabled:opacity-60"
          >
            {enviando ? "Processando..." : "Confirmar Agendamento"}
            <span className="material-symbols-outlined">check_circle</span>
          </button>
        </div>
      </div>

      {sucesso && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-margin-mobile">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
          <div className="relative bg-surface-container-lowest w-full max-w-sm rounded-[24px] p-xl text-center shadow-2xl">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-md">
              <span className="material-symbols-outlined text-[48px] text-secondary">
                task_alt
              </span>
            </div>
            <h2 className="font-h1-mobile text-h1-mobile text-primary mb-xs">
              Tudo Pronto!
            </h2>
            <p className="text-on-surface-variant mb-lg">
              Seu agendamento foi confirmado com sucesso.
            </p>
            <a
              href="/"
              className="block w-full py-md border border-primary text-primary font-button uppercase rounded-xl hover:bg-surface-container transition-colors"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
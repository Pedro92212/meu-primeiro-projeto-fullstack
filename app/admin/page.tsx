import { createClient } from "@/lib/supabase/server";
import type { AgendamentoComDetalhes } from "@/lib/types";
import BotaoCancelar from "./BotaoCancelar";
import BotaoSair from "./BotaoSair";

function formatarPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Brasil não tem mais horário de verão, então o fuso de Brasília é sempre UTC-3.
// Calculamos o início e fim do dia "de hoje" em Brasília, independente de em
// qual fuso horário o servidor (Vercel) estiver rodando.
function limitesDoDiaEmBrasilia() {
  const agora = new Date();
  const dataBrasilia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora); // formato "YYYY-MM-DD"
  const [ano, mes, dia] = dataBrasilia.split("-").map(Number);

  // 00:00 em Brasília equivale a 03:00 UTC
  const inicio = new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0, 0));
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { inicio, fim };
}

export default async function AdminPage() {
  const supabase = createClient();

  const { inicio: inicioHoje, fim: fimHoje } = limitesDoDiaEmBrasilia();

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);

  const [
    { data: agendamentosHoje },
    { data: proximosAgendamentos },
    { count: novosClientesSemana },
    { data: todosServicos },
  ] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("id")
      .eq("status", "agendado")
      .gte("data_hora", inicioHoje.toISOString())
      .lte("data_hora", fimHoje.toISOString()),
    supabase
      .from("agendamentos")
      .select("*, clientes(nome, telefone), servicos(nome, preco)")
      .eq("status", "agendado")
      .gte("data_hora", new Date().toISOString())
      .order("data_hora", { ascending: true })
      .limit(10),
    supabase
      .from("clientes")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", inicioSemana.toISOString()),
    supabase
      .from("agendamentos")
      .select("servico_id, servicos(nome, preco)")
      .eq("status", "agendado"),
  ]);

  const lista = (proximosAgendamentos ?? []) as unknown as AgendamentoComDetalhes[];

  // Serviço mais procurado + ticket médio (cálculo simples em memória)
  const contagemServicos: Record<string, { nome: string; preco: number; qtd: number }> = {};
  (todosServicos ?? []).forEach((a: any) => {
    if (!a.servicos) return;
    const key = a.servico_id;
    if (!contagemServicos[key]) {
      contagemServicos[key] = { nome: a.servicos.nome, preco: a.servicos.preco, qtd: 0 };
    }
    contagemServicos[key].qtd += 1;
  });
  const servicosOrdenados = Object.values(contagemServicos).sort((a, b) => b.qtd - a.qtd);
  const servicoMaisProcurado = servicosOrdenados[0];
  const ticketMedio =
    (todosServicos ?? []).length > 0
      ? (todosServicos as any[]).reduce((soma, a) => soma + (a.servicos?.preco ?? 0), 0) /
        (todosServicos as any[]).length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest shadow-[20px_0_40px_rgba(26,26,26,0.04)] flex flex-col py-md z-50">
        <div className="px-md mb-xl">
          <h1 className="font-h2 text-h2 text-primary">Barbearia do Pedro</h1>
          <p className="text-label text-on-surface-variant opacity-70">
            Painel Administrativo
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          <div className="flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 mx-2">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label">Visão Geral</span>
          </div>
        </nav>
        <div className="mt-md pt-md border-t border-surface-container">
          <BotaoSair />
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="flex justify-between items-center px-xl py-md w-full bg-background sticky top-0 z-40 border-b border-surface-container">
          <h2 className="font-h1 text-h1 text-primary">Painel Administrativo</h2>
        </header>

        <div className="px-xl py-lg space-y-lg">
          <section>
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-h2 text-h2 opacity-90">Resumo de Hoje</h3>
              <p className="text-label text-on-surface-variant">
                {new Date().toLocaleDateString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-surface-container-lowest rounded-xl p-md border-l-4 border-secondary shadow-sm">
                <p className="text-label text-on-surface-variant mb-xs">
                  Agendamentos Hoje
                </p>
                <p className="font-h1 text-h1">{agendamentosHoje?.length ?? 0}</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-md border-l-4 border-primary shadow-sm">
                <p className="text-label text-on-surface-variant mb-xs">
                  Próximos Agendamentos
                </p>
                <p className="font-h1 text-h1">{lista.length}</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-md border-l-4 border-secondary shadow-sm">
                <p className="text-label text-on-surface-variant mb-xs">
                  Novos Clientes (7 dias)
                </p>
                <p className="font-h1 text-h1">{novosClientesSemana ?? 0}</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 space-y-md">
              <h3 className="font-h2 text-h2">Próximos Agendamentos</h3>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-surface-container">
                    <tr>
                      <th className="px-md py-4 text-label font-semibold text-on-surface-variant uppercase">
                        Cliente
                      </th>
                      <th className="px-md py-4 text-label font-semibold text-on-surface-variant uppercase">
                        Serviço
                      </th>
                      <th className="px-md py-4 text-label font-semibold text-on-surface-variant uppercase">
                        Horário
                      </th>
                      <th className="px-md py-4 text-label font-semibold text-on-surface-variant uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {lista.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-md py-8 text-center text-on-surface-variant">
                          Nenhum agendamento futuro.
                        </td>
                      </tr>
                    )}
                    {lista.map((a) => (
                      <tr key={a.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-md py-5">
                          <p className="text-body font-semibold">{a.clientes?.nome ?? "—"}</p>
                          <p className="text-label text-on-surface-variant text-[11px]">
                            {a.clientes?.telefone ?? "—"}
                          </p>
                        </td>
                        <td className="px-md py-5 text-body">{a.servicos?.nome ?? "—"}</td>
                        <td className="px-md py-5 text-body font-medium">
                          {new Date(a.data_hora).toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-md py-5 text-right">
                          <BotaoCancelar agendamentoId={a.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-md">
              <h3 className="font-h2 text-h2">Métricas</h3>
              <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-container space-y-md">
                <div>
                  <p className="text-label text-on-surface-variant">Serviço Mais Procurado</p>
                  <p className="font-h2 text-h2">
                    {servicoMaisProcurado?.nome ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-label text-on-surface-variant">Ticket Médio</p>
                  <p className="font-h2 text-h2 text-secondary">
                    {formatarPreco(ticketMedio)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

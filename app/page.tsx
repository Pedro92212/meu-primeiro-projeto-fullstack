import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Servico } from "@/lib/types";

function formatarPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function HomePage() {
  const supabase = createClient();
  const { data: servicos } = await supabase
    .from("servicos")
    .select("*")
    .eq("ativo", true)
    .order("preco", { ascending: false });

  const lista = (servicos ?? []) as Servico[];

  return (
    <main className="min-h-screen pb-24">
      <header className="bg-background shadow-sm fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16">
        <h1 className="font-h1-mobile text-h1-mobile font-bold text-primary">
          Barbearia do Pedro
        </h1>
        <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden">
          <img
            src="/barbeiro-noir.png"
            alt="Pedro, o barbeiro"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <div className="mt-16 px-margin-mobile max-w-md mx-auto">
        <section className="py-lg space-y-md">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-aged-gold/10 text-aged-gold font-label text-label tracking-wider border border-aged-gold/20">
            EXPERIÊNCIA PREMIUM
          </div>
          <h2 className="font-h1 text-h1 max-w-[280px]">
            Bem-vindo à Barbearia do Pedro
          </h2>
          <p className="font-body text-body text-on-surface-variant max-w-xs">
            Faça uso de nossos serviços disponíveis abaixo para uma
            experiência de cuidado impecável.
          </p>
        </section>

        <section className="py-sm space-y-md">
          <h3 className="font-h2 text-h2">Serviços</h3>

          {lista.length === 0 && (
            <p className="text-on-surface-variant text-body">
              Nenhum serviço disponível no momento. Configure a tabela{" "}
              <code>servicos</code> no Supabase.
            </p>
          )}

          <div className="grid grid-cols-1 gap-sm">
            {lista.map((servico) => (
              <div
                key={servico.id}
                className="glass-card p-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-sm">
                  <div className="bg-primary text-on-primary w-12 h-12 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">
                      content_cut
                    </span>
                  </div>
                  <span className="font-h2 text-h2 text-aged-gold">
                    {formatarPreco(servico.preco)}
                  </span>
                </div>
                <div>
                  <h4 className="font-h2 text-h2 mb-xs">{servico.nome}</h4>
                </div>
                <Link
                  href={`/agendar?servico=${servico.id}`}
                  className="w-full text-center py-4 bg-aged-gold text-primary rounded-xl font-button text-button uppercase tracking-widest active:scale-95 transition-transform hover:shadow-lg"
                >
                  Agendar
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

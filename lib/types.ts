export type Servico = {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
  criado_em: string;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  criado_em: string;
};

export type StatusAgendamento = "agendado" | "concluido" | "cancelado";

export type Agendamento = {
  id: string;
  cliente_id: string;
  servico_id: string;
  data_hora: string;
  status: StatusAgendamento;
  criado_em: string;
};

export type AgendamentoComDetalhes = Agendamento & {
  clientes: Pick<Cliente, "nome" | "telefone"> | null;
  servicos: Pick<Servico, "nome" | "preco"> | null;
};

// Configuração global do usuário.
// Por ora (MVP) guarda só a alíquota de imposto, mas é aqui que futuros
// ajustes do app vão morar (moeda padrão, reserva/colchão, etc.).
export type Config = {
  aliquotaImposto: number // percentual, ex.: 6 = 6%
}

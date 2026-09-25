// Uma entrada de dinheiro (renda variável).
// Diferente da Fatura (que é recorrente), cada Receita é um evento AVULSO,
// com valor e data próprios — porque a renda de autônomo é irregular.
export type Receita = {
  id: string
  valor: number
  data: string // data de recebimento, formato "AAAA-MM-DD"
  origem: string // de quem/onde veio (ex.: "Cliente A")
}

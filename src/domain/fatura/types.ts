// O "molde" de uma fatura — garante que toda fatura tenha esses campos.
// Mora no domínio (não numa tela) porque é a entidade central do negócio.
export type Fatura = {
  id: string
  tipo: 'assinatura' | 'variavel' // discriminante: assinatura (preço fixo) ou conta variável
  nome: string
  icone: string | null // ícone PNG (data URL) na frente do nome; null se não tem
  tipoPagamento: string
  parcelas: number | null // nº de parcelas (só crédito parcelado); null = à vista
  valorParcelado: number | null // valor de cada parcela; null se não parcelado
  banco: number | null // código do banco (pra achar a logo); null se não escolhido
  vencimento: number | null // dia do mês em que é cobrado (1–31)
  status: 'Ativa' | 'Cancelada' // assinatura ativa ou cancelada
  inicio: string | null // mês/ano de início da assinatura (formato "AAAA-MM")
  fim: string | null // mês/ano de fim (só quando cancelada)
  preco: number
  moeda: string // código da moeda (BRL, USD, EUR...)
  periodicidade: string // 'Mensal' ou 'Anual'
  mesVencimento: number | null // mês da cobrança (1–12); só quando anual
  categoria: string
}

import type { Fatura } from '@/domain/fatura/types'
import { custoMensalTotal } from '@/domain/fatura/calc'

type Args = {
  despesas: Fatura[]
  imposto: number // imposto reservado do mês (Σ receitas × alíquota) — vem da cascata
  reservaAtual: number // R$ que o usuário já tem guardado
}

// O retrato do colchão de segurança — tudo derivado, o sistema é quem calcula.
// Responde: "quanto preciso ter guardado pra não fechar no vermelho no próximo mês?"
export type DetalheColchao = {
  necessario: number // total a ter guardado (despesas fixas + imposto a pagar)
  despesasFixas: number // parcela de despesas do necessário
  imposto: number // parcela de imposto do necessário
  saldo: number // quanto já tem (informado pelo usuário)
  falta: number // quanto ainda falta (nunca negativo)
  progresso: number // % do saldo em relação ao necessário (0–100)
  coberto: boolean // o saldo já cobre o próximo mês?
  mesesSobrevivencia: number | null // saldo ÷ despesas fixas (null se sem despesa)
}

/**
 * Modelo "colchão do próximo mês": o número que responde à pergunta real do
 * autônomo — quanto ter guardado pra atravessar o próximo mês sem ficar no
 * vermelho. Custo fixo é constante todo mês; o imposto reservado é dinheiro que
 * não é seu (vai pro governo), por isso soma no que você precisa ter à parte.
 */
export function calcularColchao({
  despesas,
  imposto,
  reservaAtual,
}: Args): DetalheColchao {
  const despesasFixas = custoMensalTotal(despesas)
  const necessario = despesasFixas + imposto
  const saldo = reservaAtual
  const falta = Math.max(0, necessario - saldo)
  const progresso = necessario > 0 ? Math.min(100, (saldo / necessario) * 100) : 0
  const coberto = necessario > 0 && saldo >= necessario
  // "aguenta X sem receita" = por quanto tempo o guardado paga o custo fixo
  const mesesSobrevivencia = despesasFixas > 0 ? saldo / despesasFixas : null

  return {
    necessario,
    despesasFixas,
    imposto,
    saldo,
    falta,
    progresso,
    coberto,
    mesesSobrevivencia,
  }
}

/**
 * Traduz "meses de sobrevivência" pra uma frase humana:
 * - a partir de 1 mês, fala em meses (1 mês, 2 meses...);
 * - abaixo disso (saldo pequeno), fala em dias, que é o que autônomo sente.
 * Retorna null quando não há despesas pra comparar.
 */
export function descreverSobrevivencia(meses: number | null): string | null {
  if (meses === null) return null

  if (meses >= 1) {
    const arredondado = Math.round(meses)
    return `${arredondado} ${arredondado === 1 ? 'mês' : 'meses'}`
  }

  const dias = Math.round(meses * 30)
  return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
}

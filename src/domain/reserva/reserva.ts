import type { Fatura } from '@/domain/fatura/types'
import { custoMensalTotal } from '@/domain/fatura/calc'

type Args = {
  despesas: Fatura[]
  reservaAtual: number // R$ que o usuário já tem guardado
  mesesMeta: number // meta em meses de despesas (3, 6, 12...)
}

// O retrato da reserva de emergência — tudo derivado, o sistema é quem calcula.
export type DetalheReserva = {
  meta: number // total ideal a ter guardado (despesas mensais × mesesMeta)
  saldo: number // quanto já tem (informado pelo usuário)
  falta: number // quanto ainda falta pra meta (nunca negativo)
  progresso: number // % do saldo em relação à meta (0–100)
  mesesSobrevivencia: number | null // saldo ÷ despesas mensais (null se sem despesa)
}

/**
 * Modelo de META: o usuário só informa quanto já tem (saldo) e escolhe a meta
 * em meses; o sistema calcula o resto (RN09). Responde "quanto preciso guardar".
 */
export function calcularReserva({
  despesas,
  reservaAtual,
  mesesMeta,
}: Args): DetalheReserva {
  const custoMensal = custoMensalTotal(despesas)
  const meta = custoMensal * mesesMeta
  const saldo = reservaAtual
  const falta = Math.max(0, meta - saldo)
  const progresso = meta > 0 ? Math.min(100, (saldo / meta) * 100) : 0
  const mesesSobrevivencia = custoMensal > 0 ? saldo / custoMensal : null

  return { meta, saldo, falta, progresso, mesesSobrevivencia }
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

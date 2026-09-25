import { despesasPorCategoria } from '@/domain/fatura/calc'
import type { Fatura } from '@/domain/fatura/types'
import type { Receita } from '@/domain/receita/types'
import type { DetalheDinheiroLivre } from '@/domain/receita/dinheiroLivre'
import { receitasDoMes } from '@/domain/receita/filtros'
import { formatarPreco } from '@/lib/format'

// Um "aviso" que o sistema fala pro usuário.
// tom: muda a cor/ênfase (info = neutro, bom = positivo, alerta = atenção).
export type Insight = {
  id: string
  texto: string
  tom: 'info' | 'bom' | 'alerta'
}

type Args = {
  receitas: Receita[] // TODAS as receitas (para cálculos históricos)
  despesas: Fatura[] // despesas fixas cadastradas
  aliquota: number // % de imposto configurado
  mes: string // mês atual "AAAA-MM"
  detalhe: DetalheDinheiroLivre // cascata já calculada do mês atual
}

/**
 * Gera os avisos "invisíveis" do mês: informações que o usuário NÃO consegue
 * ler direto na tela (tendência, média, concentração, imposto do ano, reserva).
 * Cada aviso tem uma GUARDA: se faltam dados, ele é omitido em vez de mostrar
 * um número sem sentido.
 *
 * É uma função pura — no futuro uma IA reescreve os textos com tom natural,
 * mas os números continuam vindo daqui (código confiável; IA só verbaliza).
 */
export function gerarInsights({
  receitas,
  despesas,
  aliquota,
  mes,
  detalhe,
}: Args): Insight[] {
  const lista: Insight[] = []

  // 1) Comparação com o mês passado — precisa ter receita no mês anterior
  const anterior = mesAnterior(mes)
  const recebidoAnterior = totalRecebido(receitasDoMes(receitas, anterior))
  if (recebidoAnterior > 0) {
    const pct = Math.round(
      ((detalhe.recebido - recebidoAnterior) / recebidoAnterior) * 100,
    )
    if (pct !== 0) {
      lista.push({
        id: 'comparacao',
        tom: pct > 0 ? 'bom' : 'alerta',
        texto:
          pct > 0
            ? `Você recebeu ${pct}% a mais que no mês passado.`
            : `Você recebeu ${Math.abs(pct)}% a menos que no mês passado.`,
      })
    }
  }

  // 2) Média mensal + posição do mês atual em relação a ela
  const meses = new Set(receitas.map((r) => r.data.slice(0, 7)))
  if (meses.size > 0) {
    const totalGeral = totalRecebido(receitas)
    const media = totalGeral / meses.size
    const difPct = media > 0 ? Math.round(((detalhe.recebido - media) / media) * 100) : 0
    const posicao =
      difPct > 0
        ? `${difPct}% acima dela`
        : difPct < 0
          ? `${Math.abs(difPct)}% abaixo dela`
          : 'na média'
    lista.push({
      id: 'media',
      tom: difPct >= 0 ? 'bom' : 'info',
      texto: `Sua média mensal é ${formatarPreco(media)}. Este mês está ${posicao}.`,
    })
  }

  // 3) Concentração de gasto — a categoria que mais pesa nas despesas fixas
  const categorias = despesasPorCategoria(despesas)
  if (categorias.length > 0 && detalhe.despesas > 0) {
    const top = categorias[0]
    lista.push({
      id: 'concentracao',
      tom: top.pct >= 50 ? 'alerta' : 'info',
      texto: `${top.pct}% dos seus gastos fixos vão para ${top.categoria}.`,
    })
  }

  // 4) Imposto acumulado no ano — a tela só mostra o do mês
  const ano = mes.slice(0, 4)
  const recebidoAno = totalRecebido(receitas.filter((r) => r.data.startsWith(ano)))
  if (recebidoAno > 0 && aliquota > 0) {
    const impostoAno = recebidoAno * (aliquota / 100)
    lista.push({
      id: 'imposto-ano',
      tom: 'info',
      texto: `Você já reservou ${formatarPreco(impostoAno)} em impostos em ${ano}.`,
    })
  }

  // 5) Reserva de emergência sugerida — 3 meses de despesas fixas
  if (detalhe.despesas > 0) {
    const reservaIdeal = detalhe.despesas * 3
    lista.push({
      id: 'reserva',
      tom: 'info',
      texto: `Uma reserva de emergência ideal seria ${formatarPreco(reservaIdeal)} (3 meses de despesas).`,
    })
  }

  return lista
}

// Soma o valor de uma lista de receitas
function totalRecebido(receitas: Receita[]): number {
  return receitas.reduce((soma, r) => soma + r.valor, 0)
}

// "AAAA-MM" -> mês anterior "AAAA-MM" (cuida da virada de ano)
function mesAnterior(mes: string): string {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m - 1, 1) // 1º dia do mês atual
  d.setMonth(d.getMonth() - 1) // volta um mês
  const y = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${mm}`
}

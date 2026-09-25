import nubank from '@/assets/Bank/Nubank.png'
import c6 from '@/assets/Bank/C6 Bank.png'
import santander from '@/assets/Bank/Banco Santander.png'
import caixa from '@/assets/Bank/Caixa.svg'
import bb from '@/assets/Bank/Banco do Brasil.png'
import itau from '@/assets/Bank/Itau.png'
import bradesco from '@/assets/Bank/Banco Bradesco.png'
import inter from '@/assets/Bank/Banco Inter.png'

/**
 * Integração com a BrasilAPI para buscar bancos brasileiros.
 * Endpoint: GET https://brasilapi.com.br/api/banks/v1 (público, sem auth).
 */

// Códigos (campo "code" da BrasilAPI) dos bancos mais usados no Brasil.
// IMPORTANTE: estes valores foram CONFIRMADOS consultando a própria API,
// não foram chutados. (ver README/commit da verificação)
export const BANCOS_POPULARES = [
  1, // Banco do Brasil  (BCO DO BRASIL S.A.)
  104, // Caixa Econômica Federal
  237, // Bradesco        (BCO BRADESCO S.A.)
  341, // Itaú Unibanco
  33, // Santander       (BCO SANTANDER (BRASIL) S.A.)
  260, // Nubank          (NU PAGAMENTOS - IP)
  77, // Inter           (BANCO INTER)
  336, // C6 Bank         (BCO C6 S.A.)
  212, // Original        (BANCO ORIGINAL)
] as const

// Formato de cada item retornado pela BrasilAPI
export type BancoAPI = {
  ispb: string
  name: string | null
  code: number | null
  fullName: string | null
}

// Formato enxuto que a nossa aplicação usa
export type Banco = {
  code: number
  name: string
}

// Banco exibido na interface: nome amigável + logo local.
// (As logos são locais porque a BrasilAPI só retorna dados, não imagens.)
export type BancoUI = {
  code: number
  name: string
  logo?: string // opcional — bancos secundários podem não ter logo
}

// Lista fixa dos bancos que aparecem no app, cada um com sua logo.
export const BANCOS: BancoUI[] = [
  { code: 260, name: 'Nubank', logo: nubank },
  { code: 336, name: 'C6 Bank', logo: c6 },
  { code: 33, name: 'Santander', logo: santander },
  { code: 104, name: 'Caixa', logo: caixa },
  { code: 1, name: 'Banco do Brasil', logo: bb },
]

// Bancos secundários populares — trazidos pela opção "Selecionar Outros Bancos".
// Códigos confirmados na BrasilAPI. Alguns têm logo (as que temos em assets);
// o resto aparece só com o nome.
export const OUTROS_BANCOS: BancoUI[] = [
  { code: 341, name: 'Itaú', logo: itau },
  { code: 237, name: 'Bradesco', logo: bradesco },
  { code: 77, name: 'Inter', logo: inter },
  { code: 212, name: 'Original' },
  { code: 290, name: 'PagBank' },
  { code: 323, name: 'Mercado Pago' },
  { code: 380, name: 'PicPay' },
  { code: 536, name: 'Neon' },
  { code: 422, name: 'Safra' },
  { code: 348, name: 'XP' },
  { code: 318, name: 'BMG' },
]

// Acha os dados (nome + logo) de um banco pelo código, nas duas listas
export function acharBanco(code: number | null): BancoUI | undefined {
  if (code == null) return undefined
  return [...BANCOS, ...OUTROS_BANCOS].find((b) => b.code === code)
}

// Bancos secundários que o usuário adicionou ao dropdown (persiste no navegador)
const CHAVE_BANCOS_ADICIONADOS = 'arktall:bancosAdicionados'

export function lerBancosAdicionados(): number[] {
  const salvo = localStorage.getItem(CHAVE_BANCOS_ADICIONADOS)
  return salvo ? JSON.parse(salvo) : []
}

export function salvarBancosAdicionados(codes: number[]): void {
  localStorage.setItem(CHAVE_BANCOS_ADICIONADOS, JSON.stringify(codes))
}

/**
 * Busca a lista de bancos na BrasilAPI e devolve apenas os "populares".
 *
 * Por que o filtro é feito AQUI no código, e não na API?
 * A BrasilAPI (GET /banks/v1) retorna TODAS as instituições do país
 * (~380 itens: bancos grandes, mas também bancos pequenos, cooperativas e
 * instituições regionais). O endpoint NÃO aceita nenhum parâmetro de filtro
 * (não dá pra pedir "só os populares", "por porte", etc). Logo, a única
 * forma de exibir apenas os principais é baixar a lista completa e filtrar
 * localmente, cruzando o `code` de cada banco com a nossa BANCOS_POPULARES.
 */
export async function buscarBancosPopulares(): Promise<Banco[]> {
  try {
    const resposta = await fetch('https://brasilapi.com.br/api/banks/v1')

    // fetch não lança em status HTTP de erro (404/500) — precisamos checar
    if (!resposta.ok) {
      throw new Error(`BrasilAPI respondeu com status ${resposta.status}`)
    }

    const todos: BancoAPI[] = await resposta.json()

    return todos
      .filter(
        (b): b is BancoAPI & { code: number; name: string } =>
          b.code != null &&
          b.name != null &&
          (BANCOS_POPULARES as readonly number[]).includes(b.code),
      )
      .map((b) => ({ code: b.code, name: b.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (erro) {
    // Falha de rede, API fora do ar ou JSON inválido: não quebramos a app.
    // Devolvemos um array vazio e quem chama decide o que exibir.
    console.error('Falha ao buscar bancos na BrasilAPI:', erro)
    return []
  }
}

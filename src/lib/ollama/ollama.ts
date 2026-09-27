// Adapter do Ollama — a ÚNICA porta de saída do sistema para o modelo de IA.
// Tudo que fala com a IA passa por aqui. No dia que trocarmos Ollama local por
// uma API na nuvem, só este arquivo muda (Last Responsible Moment).

// Os papéis de uma mensagem, iguais aos do protocolo do Ollama.
// system = regras/comportamento; user = o que a pessoa digitou; assistant = o que o modelo respondeu.
export type Papel = 'system' | 'user' | 'assistant'

export type Mensagem = {
  role: Papel
  content: string
}

export type OpcoesConversa = {
  modelo?: string // qual modelo usar (padrão: leve, cabe em máquina modesta)
  temperatura?: number // 0 = previsível (ideal p/ extrair dados); mais alto = criativo
  baseUrl?: string // onde o servidor Ollama está ouvindo
}

// Erro específico pra quando o Ollama está desligado/inacessível.
// Existe pra UI poder tratar esse caso com carinho (RN13: IA é conveniência, não dependência).
export class OllamaIndisponivelError extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'OllamaIndisponivelError'
  }
}

const BASE_URL_PADRAO = 'http://localhost:11434'
const MODELO_PADRAO = 'llama3.2:3b' // leve; roda bem em ~7 GB de RAM
const TEMPERATURA_PADRAO = 0.2 // baixa: queremos respostas estáveis, não criativas

/**
 * Manda o histórico de mensagens pro Ollama e devolve o texto da resposta.
 *
 * É stateless: o Ollama não guarda a conversa, então mandamos o array inteiro
 * a cada chamada (igual REST puro). Aqui usamos stream:false — esperamos a
 * resposta completa. O streaming (palavra por palavra) vem numa versão futura.
 */
export async function conversar(
  mensagens: Mensagem[],
  opcoes: OpcoesConversa = {},
): Promise<string> {
  const {
    modelo = MODELO_PADRAO,
    temperatura = TEMPERATURA_PADRAO,
    baseUrl = BASE_URL_PADRAO,
  } = opcoes

  let resposta: Response
  try {
    resposta = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelo,
        messages: mensagens,
        stream: false,
        options: { temperature: temperatura },
      }),
    })
  } catch {
    // fetch só cai aqui quando nem chegou no servidor (offline, porta errada...).
    throw new OllamaIndisponivelError(
      'Não consegui falar com o Ollama. Ele está rodando em localhost:11434?',
    )
  }

  if (!resposta.ok) {
    // Chegou no servidor, mas ele reclamou (ex.: modelo não baixado -> 404).
    throw new Error(`O Ollama respondeu com erro ${resposta.status}.`)
  }

  const dados: { message?: { content?: string } } = await resposta.json()
  return dados.message?.content ?? ''
}

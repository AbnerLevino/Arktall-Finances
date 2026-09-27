// Demo de linha de comando pra PROVAR que o adapter lib/ollama funciona.
// Não faz parte do app nem da suíte de testes — é só pra você ver o tubo funcionando.
// Rodar com:  npx vite-node scripts/demo-ollama.ts
import { conversar, OllamaIndisponivelError } from '@/lib/ollama/ollama'

async function main() {
  console.log('Falando com o Ollama...\n')
  const inicio = Date.now()

  try {
    const resposta = await conversar(
      [
        {
          role: 'system',
          content:
            'Você é o copiloto do arktall, um app financeiro. Responda em português, curto e direto.',
        },
        { role: 'user', content: 'Em uma frase, o que é uma reserva de emergência?' },
      ],
      // Sem opções: usa o padrão do adapter (llama3.2:3b), mais leve e rápido.
    )

    const segundos = ((Date.now() - inicio) / 1000).toFixed(1)
    console.log('=== Resposta da IA ===')
    console.log(resposta)
    console.log(`\n(demorou ${segundos}s)`)
  } catch (erro) {
    if (erro instanceof OllamaIndisponivelError) {
      console.error('❌', erro.message)
    } else {
      console.error('❌ Erro inesperado:', erro)
    }
    process.exit(1)
  }
}

main()

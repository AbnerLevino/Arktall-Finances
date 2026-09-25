// Resultado do processamento de um ícone enviado pelo usuário
type ResultadoIcone =
  | { ok: true; dataUrl: string }
  | { ok: false; erro: string }

/**
 * Valida e processa uma imagem enviada como ícone (qualquer formato).
 * Regra de negócio: a imagem PRECISA ter fundo transparente. Se for opaca
 * (nenhum pixel com alpha < 255), retorna erro. Também converte pra data URL
 * (string base64) pra poder salvar no localStorage.
 */
export async function processarIcone(file: File): Promise<ResultadoIcone> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, erro: 'O arquivo precisa ser uma imagem.' }
  }

  const dataUrl = await lerComoDataUrl(file)
  const temTransparencia = await verificarTransparencia(dataUrl)

  if (!temTransparencia) {
    return {
      ok: false,
      erro: 'A imagem precisa ter fundo transparente.',
    }
  }

  return { ok: true, dataUrl }
}

// Extrai a primeira imagem de uma colagem (área de transferência)
export function imagemDaColagem(dt: DataTransfer | null): File | null {
  if (!dt) return null
  for (const item of dt.items) {
    if (item.type.startsWith('image/')) {
      const arquivo = item.getAsFile()
      if (arquivo) return arquivo
    }
  }
  return null
}

// Lê o arquivo como data URL (base64)
function lerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

// Desenha a imagem num canvas e verifica se algum pixel tem alpha < 255
function verificarTransparencia(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      // O canal alpha é cada 4º byte (R, G, B, A). Se algum < 255, é transparente.
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          resolve(true)
          return
        }
      }
      resolve(false)
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}

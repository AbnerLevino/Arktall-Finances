import { useRef, type ChangeEvent } from 'react'
import { processarIcone } from '@/lib/image'
import styles from './IconeUpload.module.css'

type Props = {
  value: string | null // data URL do ícone (ou null)
  onChange: (dataUrl: string) => void
  onErro: (mensagem: string) => void
  size?: number // lado do quadradinho em px (padrão 42)
}

export function IconeUpload({ value, onChange, onErro, size = 42 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleArquivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reenviar o mesmo arquivo depois
    if (!file) return

    const resultado = await processarIcone(file)
    if (resultado.ok) {
      onErro('')
      onChange(resultado.dataUrl)
    } else {
      onErro(resultado.erro)
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.box}
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
        aria-label="Enviar ícone PNG"
      >
        {value ? (
          <img src={value} alt="" className={styles.preview} />
        ) : (
          <span className={styles.plus}>+</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleArquivo}
      />
    </>
  )
}

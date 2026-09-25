import { useState } from 'react'
import { Select } from './Select'
import styles from './MesAnoPicker.module.css'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

type Props = {
  value: string // "AAAA-MM" ou ""
  onChange: (valor: string) => void
}

export function MesAnoPicker({ value, onChange }: Props) {
  // Deriva mês/ano do valor recebido (ex: "2026-01")
  const [anoInicial, mesInicial] = value ? value.split('-') : ['', '']
  const [mes, setMes] = useState(
    mesInicial ? MESES[Number(mesInicial) - 1] : '',
  )
  const [ano, setAno] = useState(anoInicial || '')

  // Anos: do ano atual até 20 anos atrás
  const anoAtual = new Date().getFullYear()
  const ANOS = Array.from({ length: 21 }, (_, i) => String(anoAtual - i))

  // Só emite um valor válido quando mês E ano estão escolhidos
  const emitir = (novoMes: string, novoAno: string) => {
    if (novoMes && novoAno) {
      const mm = String(MESES.indexOf(novoMes) + 1).padStart(2, '0')
      onChange(`${novoAno}-${mm}`)
    } else {
      onChange('')
    }
  }

  return (
    <div className={styles.picker}>
      <div className={styles.col}>
        <Select
          value={mes}
          onChange={(m) => {
            setMes(m)
            emitir(m, ano)
          }}
          options={MESES}
          placeholder="Mês"
        />
      </div>
      <div className={styles.col}>
        <Select
          value={ano}
          onChange={(a) => {
            setAno(a)
            emitir(mes, a)
          }}
          options={ANOS}
          placeholder="Ano"
        />
      </div>
    </div>
  )
}

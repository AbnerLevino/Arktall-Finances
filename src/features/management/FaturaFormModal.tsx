import { useEffect, useState, type FormEvent } from 'react'
import type { Fatura } from '@/domain/fatura/types'
import { BancoSelect } from './BancoSelect'
import { Select } from '@/ui/Select/Select'
import { CategoriaSelect } from './CategoriaSelect'
import { CategoriaPanel } from './CategoriaPanel'
import { MesAnoPicker } from '@/ui/MesAnoPicker/MesAnoPicker'
import { IconeUpload } from '@/ui/IconeUpload/IconeUpload'
import { processarIcone, imagemDaColagem } from '@/lib/image'
import { algumDropdownAberto } from '@/ui/Select/useDropdownAnchor'
import type { Categoria } from '@/domain/categoria/categorias'
import styles from '@/ui/Modal/Modal.module.css'

const CREDITO = '💳 Cartão de Crédito'
const TIPOS = [CREDITO, '🏧 Cartão de Débito', '⚡ PIX', '🧾 Boleto']
const MOEDAS = ['BRL', 'USD', 'EUR']
const PERIODICIDADES = ['Mensal', 'Anual']
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
  fatura?: Fatura // se vier preenchida, o modal está em modo edição
  categorias: Categoria[]
  adicionarCategoria: (c: Categoria) => void
  onClose: () => void
  onSave: (fatura: Fatura) => void
}

export function FaturaFormModal({
  fatura,
  categorias,
  adicionarCategoria,
  onClose,
  onSave,
}: Props) {
  // Tipo escolhido no seletor inicial. null = ainda mostrando o seletor.
  // Em edição (fatura existe) nunca mostramos o seletor: usamos o tipo salvo
  // ou, para dados legados sem `tipo`, assumimos 'assinatura' (o único tipo
  // que existia antes do campo ser criado).
  const [tipo, setTipo] = useState<'assinatura' | 'variavel' | null>(
    fatura ? fatura.tipo ?? 'assinatura' : null,
  )
  const [nome, setNome] = useState(fatura?.nome ?? '')
  const [icone, setIcone] = useState<string | null>(fatura?.icone ?? null)
  const [erroIcone, setErroIcone] = useState('')
  const [categoria, setCategoria] = useState(fatura?.categoria ?? '')
  const [preco, setPreco] = useState(
    fatura?.preco != null ? String(fatura.preco) : '',
  )
  const [moeda, setMoeda] = useState(fatura?.moeda ?? 'BRL')
  const [periodicidade, setPeriodicidade] = useState(
    fatura?.periodicidade ?? 'Mensal',
  )
  const [tipoPagamento, setTipoPagamento] = useState(fatura?.tipoPagamento ?? '')
  const [parcelado, setParcelado] = useState(fatura?.parcelas != null)
  const [parcelasQtd, setParcelasQtd] = useState(
    fatura?.parcelas != null ? String(fatura.parcelas) : '',
  )
  const [valorParcela, setValorParcela] = useState(
    fatura?.valorParcelado != null ? String(fatura.valorParcelado) : '',
  )
  const [banco, setBanco] = useState<number | null>(fatura?.banco ?? null)
  const [vencimento, setVencimento] = useState(
    fatura?.vencimento != null ? String(fatura.vencimento) : '',
  )
  const [inicio, setInicio] = useState(fatura?.inicio ?? '')
  const [erroInicio, setErroInicio] = useState('')
  const [status, setStatus] = useState<'Ativa' | 'Cancelada'>(
    fatura?.status ?? 'Ativa',
  )
  const [fim, setFim] = useState(fatura?.fim ?? '')
  const [mes, setMes] = useState(
    fatura?.mesVencimento != null ? MESES[fatura.mesVencimento - 1] : '',
  )

  // Categorias vêm do container (fonte única da verdade)
  const [painelAberto, setPainelAberto] = useState(false)

  // Colar imagem (Ctrl+V) como ícone — só quando NÃO está digitando num campo,
  // nenhum dropdown está aberto e o painel de categoria está fechado.
  // Nesses casos, deixa a colagem normal de texto acontecer.
  useEffect(() => {
    const aoColar = (e: ClipboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      const digitando =
        !!el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.isContentEditable)
      if (digitando || algumDropdownAberto() || painelAberto) return

      const arquivo = imagemDaColagem(e.clipboardData)
      if (!arquivo) return
      e.preventDefault()
      processarIcone(arquivo).then((r) => {
        if (r.ok) {
          setErroIcone('')
          setIcone(r.dataUrl)
        } else {
          setErroIcone(r.erro)
        }
      })
    }

    document.addEventListener('paste', aoColar)
    return () => document.removeEventListener('paste', aoColar)
  }, [painelAberto])

  // Parcelas só fazem sentido no cartão de crédito
  const ehCredito = tipoPagamento === CREDITO
  // O campo de valor aparece depois que o usuário digita as parcelas
  const mostrarValor = parcelado && parcelasQtd.trim() !== ''
  // Anual exige mês da cobrança; mensal não
  const ehAnual = periodicidade === 'Anual'
  // Estamos editando um card existente? (muda o layout do bloco Identidade)
  const ehEdicao = !!fatura
  // Título do modal muda conforme o passo (seletor) e o tipo escolhido
  const titulo =
    tipo === null
      ? 'O que você quer adicionar?'
      : `${fatura ? 'Editar' : 'Nova'} ${
          tipo === 'variavel' ? 'Conta Variável' : 'Assinatura'
        }`

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return // Nome é obrigatório

    // Início só é obrigatório na assinatura (alimenta o gráfico de gasto acumulado)
    if (tipo === 'assinatura' && !inicio) {
      setErroInicio('Escolha o mês/ano de início da assinatura.')
      return
    }

    // Campos comuns aos dois tipos
    const base = {
      id: fatura?.id ?? crypto.randomUUID(),
      nome: nome.trim(),
      icone,
      categoria,
      preco: Number(preco) || 0,
      moeda,
      banco,
      vencimento: vencimento ? Number(vencimento) : null,
    }

    if (tipo === 'variavel') {
      // Conta variável não tem periodicidade, parcelas, status nem início/fim.
      // Preenchemos valores neutros só pra satisfazer o molde Fatura.
      onSave({
        ...base,
        tipo: 'variavel',
        periodicidade: 'Mensal',
        tipoPagamento: '',
        parcelas: null,
        valorParcelado: null,
        status: 'Ativa',
        inicio: null,
        fim: null,
        mesVencimento: null,
      })
      return
    }

    onSave({
      ...base,
      tipo: 'assinatura',
      periodicidade,
      tipoPagamento,
      parcelas: ehCredito && parcelado ? Number(parcelasQtd) || null : null,
      valorParcelado:
        ehCredito && parcelado ? Number(valorParcela) || null : null,
      status,
      inicio: inicio || null,
      fim: status === 'Cancelada' ? fim || null : null,
      mesVencimento: ehAnual && mes ? MESES.indexOf(mes) + 1 : null,
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.stage}>
        {painelAberto && (
          <CategoriaPanel
            onClose={() => setPainelAberto(false)}
            onCreate={(c) => {
              adicionarCategoria(c)
              setCategoria(`${c.emoji} ${c.nome}`.trim())
            }}
          />
        )}
        <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
          <header className={styles.dialogHeader}>
            <h2>{titulo}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        {tipo === null ? (
          // Passo do seletor: escolhe entre assinatura e conta variável
          <div className={styles.chooser}>
            <p className={styles.chooserHint}>
              Escolha o tipo de conta que você quer cadastrar.
            </p>
            <div className={styles.chooserOptions}>
              <button
                type="button"
                className={styles.chooserCard}
                onClick={() => setTipo('assinatura')}
              >
                <span className={styles.chooserEmoji}>🔁</span>
                <span className={styles.chooserTitle}>Assinatura</span>
                <span className={styles.chooserDesc}>
                  Cobrança recorrente de valor fixo (Netflix, Spotify...)
                </span>
              </button>
              <button
                type="button"
                className={styles.chooserCard}
                onClick={() => setTipo('variavel')}
              >
                <span className={styles.chooserEmoji}>📊</span>
                <span className={styles.chooserTitle}>Conta Variável</span>
                <span className={styles.chooserDesc}>
                  Valor que muda todo mês (luz, água, cartão...)
                </span>
              </button>
            </div>
          </div>
        ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Bloco 1 — Identidade
              Edição: cabeçalho ícone médio + nome no topo, categoria abaixo.
              Criação: ícone | nome | categoria em uma linha (layout original). */}
          <div className={styles.block}>
            <span className={styles.blockTitle}>Identidade</span>

            {ehEdicao ? (
              <>
                <div className={styles.identityHeader}>
                  <div className={`${styles.field} ${styles.fieldIcone}`}>
                    <span>Ícone</span>
                    <IconeUpload
                      value={icone}
                      onChange={setIcone}
                      onErro={setErroIcone}
                      size={52}
                    />
                  </div>

                  <label className={`${styles.field} ${styles.fieldNome}`}>
                    <span>Nome *</span>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Netflix"
                      required
                    />
                  </label>
                </div>

                {erroIcone && <span className={styles.erro}>{erroIcone}</span>}

                <div className={styles.field}>
                  <span>Categoria</span>
                  <CategoriaSelect
                    value={categoria}
                    categorias={categorias}
                    onChange={setCategoria}
                    onCriar={() => setPainelAberto(true)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles.row}>
                  <div className={`${styles.field} ${styles.fieldIcone}`}>
                    <span>Ícone</span>
                    <IconeUpload
                      value={icone}
                      onChange={setIcone}
                      onErro={setErroIcone}
                    />
                  </div>

                  <label className={`${styles.field} ${styles.fieldNome}`}>
                    <span>Nome *</span>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Netflix"
                      required
                    />
                  </label>

                  <div className={`${styles.field} ${styles.fieldCategoria}`}>
                    <span>Categoria</span>
                    <CategoriaSelect
                      value={categoria}
                      categorias={categorias}
                      onChange={setCategoria}
                      onCriar={() => setPainelAberto(true)}
                    />
                  </div>
                </div>

                {erroIcone && <span className={styles.erro}>{erroIcone}</span>}
              </>
            )}
          </div>

          {/* Bloco 2 — Cobrança */}
          <div className={styles.block}>
            <span className={styles.blockTitle}>Cobrança</span>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>{tipo === 'variavel' ? 'Valor estimado' : 'Valor'}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0,00"
                />
              </label>

              <div className={styles.field}>
                <span>Moeda</span>
                <Select
                  value={moeda}
                  onChange={setMoeda}
                  options={MOEDAS}
                  placeholder="Selecione a moeda (ex: BRL, USD...)"
                />
              </div>

              {tipo === 'assinatura' && (
                <div className={styles.field}>
                  <span>Periodicidade</span>
                  <Select
                    value={periodicidade}
                    onChange={setPeriodicidade}
                    options={PERIODICIDADES}
                    placeholder="Selecione a periodicidade (ex: Mensal...)"
                  />
                </div>
              )}
            </div>

            {tipo === 'assinatura' && (
              <div className={styles.field}>
                <span>Tipo de Pagamento</span>
                <Select
                  value={tipoPagamento}
                  onChange={setTipoPagamento}
                  options={TIPOS}
                  placeholder="Selecione o tipo (ex: PIX, Boleto...)"
                />
              </div>
            )}

            {tipo === 'assinatura' && ehCredito && (
              <div className={styles.field}>
                <span>
                  {mostrarValor
                    ? 'Qual será o valor parcelado?'
                    : 'Deseja parcelar em quantas vezes?'}
                </span>
                <div className={styles.parcelar}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={parcelado}
                      onChange={(e) => setParcelado(e.target.checked)}
                    />
                    Parcelar
                  </label>

                  {parcelado && (
                    <input
                      type="number"
                      min="2"
                      step="1"
                      value={parcelasQtd}
                      onChange={(e) => setParcelasQtd(e.target.value)}
                      className={styles.parcelasInput}
                      aria-label="Quantas vezes"
                      placeholder="Ex: 1x, 2x, 3x..."
                    />
                  )}

                  {mostrarValor && (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorParcela}
                      onChange={(e) => setValorParcela(e.target.value)}
                      className={`${styles.parcelasInput} ${
                        valorParcela === '' ? styles.destaque : ''
                      }`}
                      aria-label="Qual valor parcelado"
                      placeholder="Ex: 250, 300, 400..."
                    />
                  )}
                </div>
              </div>
            )}

            <div className={styles.field}>
              <span>Banco</span>
              <BancoSelect value={banco} onChange={setBanco} />
            </div>
          </div>

          {/* Bloco 3 — Agenda */}
          <div className={styles.block}>
            <span className={styles.blockTitle}>Agenda</span>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Dia do vencimento</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  placeholder="Ex: 10"
                />
              </label>

              {ehAnual && (
                <div className={styles.field}>
                  <span>Mês</span>
                  <Select
                    value={mes}
                    onChange={setMes}
                    options={MESES}
                    placeholder="Selecione o mês (ex: Janeiro...)"
                  />
                </div>
              )}
            </div>

            {tipo === 'assinatura' && (
              <>
                <div className={styles.field}>
                  <span>Status</span>
                  <Select
                    value={status}
                    onChange={(v) => setStatus(v as 'Ativa' | 'Cancelada')}
                    options={['Ativa', 'Cancelada']}
                    placeholder="Selecione o status"
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <span>Início da assinatura (mês/ano) *</span>
                    <MesAnoPicker
                      value={inicio}
                      onChange={(v) => {
                        setInicio(v)
                        if (v) setErroInicio('')
                      }}
                    />
                    {erroInicio && (
                      <span className={styles.erro}>{erroInicio}</span>
                    )}
                  </div>

                  {status === 'Cancelada' && (
                    <div className={styles.field}>
                      <span>Fim da assinatura (mês/ano)</span>
                      <MesAnoPicker value={fim} onChange={setFim} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.save}>
              Salvar
            </button>
          </div>
        </form>
        )}
        </div>
      </div>
    </div>
  )
}

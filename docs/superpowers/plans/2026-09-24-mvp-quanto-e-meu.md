# MVP "Quanto é meu de verdade" — Plano de Implementação

> **Para quem vai executar:** este plano é a nossa **aula de React na prática**. Cada tarefa começa com o **conceito React/TS** que ela ensina (com ponte pro mundo Java), depois vem o passo a passo. A ideia é **você digitar o código e entender**, não copiar e colar. Os passos usam checkbox (`- [ ]`) pra acompanhar.

**Objetivo:** entregar o "número mágico" — o *dinheiro livre do mês* — a partir de receitas registradas, imposto reservado e as despesas fixas já existentes.

**Arquitetura:** Fase 1 (frontend puro). Reaproveita os padrões que já existem no projeto (`useCategorias` para storage, `FaturaFormModal` para formulário, `calc.ts` para regra pura). Nenhum backend nesta fase.

**Tech Stack:** React 19 + TypeScript + Vite + Recharts (já instalados). **Vitest** será adicionado para testar a regra de negócio.

## Global Constraints (copiadas do documento de engenharia)

- Código em **inglês**; textos de interface em **português**.
- Estilos via **CSS Modules** (`*.module.css`) + variáveis de `tokens.css`. Nunca cores/valores fixos soltos.
- Imports absolutos com alias **`@/`**.
- Precisa passar em `npm run type-check` (`tsc --noEmit`) e `npm run lint` (oxlint).
- Persistência da Fase 1 = `localStorage`. Chaves novas: `arktall:receitas`, `arktall:config`.
- **RN07:** `imposto = valor × (aliquotaImposto / 100)`.
- **RN08:** `dinheiro livre do mês = Σ receitas do mês − Σ imposto do mês − custo mensal total das despesas`. Uma receita pertence ao mês da sua `data`.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade | Ação |
|---------|------------------|------|
| `package.json` / `vite.config.ts` | Adicionar Vitest e script `test` | Modificar |
| `src/pages/Wallet/receitas.ts` | Tipo `Receita` + hook `useReceitas` (storage) | Criar |
| `src/pages/Wallet/config.ts` | Tipo `Config` + hook `useConfig` (alíquota) | Criar |
| `src/pages/Wallet/dinheiroLivre.ts` | Regras puras: `impostoDaReceita`, `dinheiroLivreDoMes` | Criar |
| `src/pages/Wallet/dinheiroLivre.test.ts` | Testes das regras puras (TDD) | Criar |
| `src/pages/Wallet/ReceitaFormModal.tsx` | Formulário de nova receita (molde: `FaturaFormModal`) | Criar |
| `src/pages/Home/Home.tsx` + `Home.module.css` | Vitrine do dinheiro livre + campo da alíquota + FAB de receita | Criar |
| `src/App.tsx` | Ligar a página `Home` real no lugar do `<h1>Home</h1>` | Modificar |

---

## Task 1: Configurar o Vitest (base de testes)

**Conceito React/TS (ponte com Java):** no Java você usa **JUnit** pra testar. No mundo Vite, o equivalente é o **Vitest** — mesma ideia (`describe`/`it`/`expect` ≈ `@Test`/`assertEquals`). Vamos testar primeiro a **regra de negócio pura** (funções sem tela), que é o tipo mais fácil e valioso de testar — igual você testaria um método de Service.

**Files:**
- Modify: `package.json` (adiciona dependência e script)
- Modify: `vite.config.ts` (habilita o Vitest)

- [ ] **Step 1: Instalar o Vitest**

Run: `npm install -D vitest`
Expected: instala sem erro; aparece em `devDependencies`.

- [ ] **Step 2: Adicionar o script de teste no `package.json`**

Em `"scripts"`, adicione:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Habilitar globals do Vitest no `vite.config.ts`**

Troque a linha de import inicial e adicione a chave `test`:
```ts
/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,       // deixa describe/it/expect disponíveis sem import
    environment: 'node', // regra pura não precisa de DOM
  },
})
```

- [ ] **Step 4: Rodar o Vitest vazio pra confirmar que funciona**

Run: `npm test`
Expected: roda e diz "No test files found" (ainda não criamos testes) — sem erro de configuração.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "chore: adiciona Vitest para testes de regra de negocio"
```

---

## Task 2: Tipo `Receita` + hook de persistência `useReceitas`

**Conceito React/TS:** um **custom hook** é uma função que empacota estado + efeito e é reutilizável. `useCategorias` (que você já tem) é o molde perfeito — vamos fazer o irmão dele para receitas. `type Receita` é o "contrato" (como um DTO/record Java).

**Files:**
- Create: `src/pages/Wallet/receitas.ts`

**Interfaces:**
- Produces:
  - `type Receita = { id: string; valor: number; data: string; origem: string }`
  - `useReceitas(): { receitas: Receita[]; adicionar: (r: Receita) => void }`

- [ ] **Step 1: Criar `receitas.ts` espelhando `categorias.ts`**

```ts
import { useState, useEffect } from 'react'

// Uma entrada de dinheiro (renda variável): evento avulso, com valor e data próprios.
export type Receita = {
  id: string
  valor: number
  data: string // "AAAA-MM-DD" — data de recebimento
  origem: string // de quem/onde veio
}

const CHAVE = 'arktall:receitas'

// Custom hook: lista de receitas + persistência no localStorage.
// Chame UMA vez no componente pai e compartilhe por props (mesma regra do useCategorias).
export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>(() => {
    const salvo = localStorage.getItem(CHAVE)
    return salvo ? JSON.parse(salvo) : []
  })

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(receitas))
  }, [receitas])

  const adicionar = (receita: Receita) => {
    setReceitas((prev) => [...prev, receita])
  }

  return { receitas, adicionar }
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run type-check`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Wallet/receitas.ts
git commit -m "feat: entidade Receita e hook useReceitas (RF18)"
```

---

## Task 3: Tipo `Config` + hook `useConfig` (alíquota de imposto)

**Conceito React/TS:** mesmo padrão de hook, mas guardando **um objeto de configuração** (não uma lista). Mostra que o padrão de `useState` + `useEffect` + `localStorage` se repete — isso é reuso de padrão, não código copiado à toa.

**Files:**
- Create: `src/pages/Wallet/config.ts`

**Interfaces:**
- Produces:
  - `type Config = { aliquotaImposto: number }`
  - `useConfig(): { config: Config; setAliquota: (n: number) => void }`

- [ ] **Step 1: Criar `config.ts`**

```ts
import { useState, useEffect } from 'react'

// Configuração global do usuário (Fase 1: só a alíquota de imposto).
export type Config = {
  aliquotaImposto: number // percentual, ex.: 6 = 6%
}

const CHAVE = 'arktall:config'
const PADRAO: Config = { aliquotaImposto: 0 }

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    const salvo = localStorage.getItem(CHAVE)
    return salvo ? JSON.parse(salvo) : PADRAO
  })

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(config))
  }, [config])

  const setAliquota = (n: number) => {
    setConfig((prev) => ({ ...prev, aliquotaImposto: n }))
  }

  return { config, setAliquota }
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run type-check`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Wallet/config.ts
git commit -m "feat: Config e hook useConfig para aliquota (RF19)"
```

---

## Task 4: Regra de negócio pura — imposto + dinheiro livre (TDD)

**Conceito React/TS:** esta é a peça mais "backend" do MVP — **funções puras**, sem React, testáveis igual um Service Java. Fazemos **TDD**: escreve o teste que falha, depois o código que passa. Reaproveitamos `custoMensalTotal` (já existe em `calc.ts`) para as despesas.

**Files:**
- Create: `src/pages/Wallet/dinheiroLivre.ts`
- Test: `src/pages/Wallet/dinheiroLivre.test.ts`

**Interfaces:**
- Consumes: `custoMensalTotal(faturas: Fatura[]): number` de `./calc`; `Receita` de `./receitas`; `Fatura` de `./Subscriptions`.
- Produces:
  - `impostoDaReceita(valor: number, aliquota: number): number`
  - `dinheiroLivreDoMes(args): number` onde
    `args = { receitas: Receita[]; despesas: Fatura[]; aliquota: number; mes: string }` e `mes` é `"AAAA-MM"`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
import { describe, it, expect } from 'vitest'
import { impostoDaReceita, dinheiroLivreDoMes } from './dinheiroLivre'
import type { Receita } from './receitas'
import type { Fatura } from './Subscriptions'

// helper: cria uma Fatura mensal mínima só com o preço (o resto não importa pro cálculo)
function despesaMensal(preco: number): Fatura {
  return {
    id: crypto.randomUUID(), tipo: 'variavel', nome: 'x', icone: null,
    tipoPagamento: 'PIX', parcelas: null, valorParcelado: null, banco: null,
    vencimento: null, status: 'Ativa', inicio: null, fim: null,
    preco, moeda: 'BRL', periodicidade: 'Mensal', mesVencimento: null, categoria: '',
  }
}

describe('impostoDaReceita', () => {
  it('aplica a alíquota percentual sobre o valor', () => {
    expect(impostoDaReceita(1000, 6)).toBe(60)
  })
  it('alíquota zero não reserva nada', () => {
    expect(impostoDaReceita(1000, 0)).toBe(0)
  })
})

describe('dinheiroLivreDoMes', () => {
  const receitas: Receita[] = [
    { id: '1', valor: 5000, data: '2026-09-10', origem: 'Cliente A' },
    { id: '2', valor: 3000, data: '2026-09-25', origem: 'Cliente B' },
    { id: '3', valor: 9999, data: '2026-08-01', origem: 'mês anterior' }, // fora do mês
  ]

  it('receitas do mês − imposto − despesas', () => {
    // receitas de 09/2026 = 8000; imposto 6% = 480; despesas = 2000
    // livre = 8000 - 480 - 2000 = 5520
    const livre = dinheiroLivreDoMes({
      receitas,
      despesas: [despesaMensal(1200), despesaMensal(800)],
      aliquota: 6,
      mes: '2026-09',
    })
    expect(livre).toBe(5520)
  })

  it('mês sem receita dá negativo do custo das despesas', () => {
    const livre = dinheiroLivreDoMes({
      receitas: [],
      despesas: [despesaMensal(500)],
      aliquota: 10,
      mes: '2026-09',
    })
    expect(livre).toBe(-500)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test`
Expected: FAIL — "impostoDaReceita is not a function" / módulo não encontrado.

- [ ] **Step 3: Implementar `dinheiroLivre.ts` (mínimo pra passar)**

```ts
import { custoMensalTotal } from './calc'
import type { Receita } from './receitas'
import type { Fatura } from './Subscriptions'

// RN07 — imposto reservado de uma receita
export function impostoDaReceita(valor: number, aliquota: number): number {
  return valor * (aliquota / 100)
}

// uma receita pertence ao mês "AAAA-MM" do começo da sua data "AAAA-MM-DD"
function ehDoMes(receita: Receita, mes: string): boolean {
  return receita.data.startsWith(mes)
}

type Args = {
  receitas: Receita[]
  despesas: Fatura[]
  aliquota: number
  mes: string // "AAAA-MM"
}

// RN08 — cascata do dinheiro livre do mês
export function dinheiroLivreDoMes({ receitas, despesas, aliquota, mes }: Args): number {
  const doMes = receitas.filter((r) => ehDoMes(r, mes))
  const totalReceita = doMes.reduce((s, r) => s + r.valor, 0)
  const totalImposto = doMes.reduce((s, r) => s + impostoDaReceita(r.valor, aliquota), 0)
  const totalDespesas = custoMensalTotal(despesas)
  return totalReceita - totalImposto - totalDespesas
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS (todos os testes verdes).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Wallet/dinheiroLivre.ts src/pages/Wallet/dinheiroLivre.test.ts
git commit -m "feat: regras impostoDaReceita e dinheiroLivreDoMes com testes (RF20/RF21, RN07/RN08)"
```

---

## Task 5: Formulário de nova receita (`ReceitaFormModal`)

**Conceito React/TS:** um **formulário controlado** — cada campo tem um `useState` e a tela reflete o estado (diferente do Java/HTML puro, onde você lê o value no submit). Molde direto: `FaturaFormModal.tsx` (abra e siga o padrão dele, versão enxuta com 3 campos). Reutilize `Modal.module.css`.

**Files:**
- Create: `src/pages/Wallet/ReceitaFormModal.tsx`

**Interfaces:**
- Consumes: `Receita` de `./receitas`; estilos de `./Modal.module.css`.
- Produces: `ReceitaFormModal({ onClose, onSave }: { onClose: () => void; onSave: (r: Receita) => void })`

- [ ] **Step 1: Criar o modal com 3 campos (valor, data, origem)**

Siga o esqueleto de `FaturaFormModal` (imports de `useState`/`FormEvent`, wrapper `styles.overlay`/`styles.modal`, botões de fechar/salvar). Estado mínimo:
```tsx
const [valor, setValor] = useState('')
const [data, setData] = useState('') // <input type="date"> → "AAAA-MM-DD"
const [origem, setOrigem] = useState('')
```
No submit, monte e salve:
```tsx
function handleSubmit(e: FormEvent) {
  e.preventDefault()
  if (!valor || !data) return // validação mínima: valor e data obrigatórios
  onSave({ id: crypto.randomUUID(), valor: Number(valor), data, origem })
  onClose()
}
```
Campos: `<input type="number">` para valor, `<input type="date">` para data, `<input type="text">` para origem. Textos em português ("Nova receita", "Valor", "Data de recebimento", "Origem", "Salvar").

- [ ] **Step 2: Verificar tipos e lint**

Run: `npm run type-check && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Wallet/ReceitaFormModal.tsx
git commit -m "feat: modal de cadastro de receita (RF18)"
```

---

## Task 6: Página Home — vitrine do dinheiro livre

**Conceito React/TS:** aqui os pedaços se conectam. A `Home` chama os hooks (`useReceitas`, `useConfig`) e lê as despesas do `localStorage` (como `Subscriptions` faz), calcula o número com `dinheiroLivreDoMes` e mostra. Um `<input>` edita a alíquota (estado → recalcula na hora, reatividade do React). Um FAB abre o `ReceitaFormModal`.

**Files:**
- Create: `src/pages/Home/Home.tsx`, `src/pages/Home/Home.module.css`
- Modify: `src/App.tsx` (linha 24)

**Interfaces:**
- Consumes: `useReceitas`, `useConfig`, `dinheiroLivreDoMes`, `Fatura`, `formatarPreco` de `@/pages/Wallet/format`.
- Produces: `Home()` (default/named export usado pelo `App`).

- [ ] **Step 1: Montar a Home**

Esqueleto:
```tsx
import { useState } from 'react'
import styles from './Home.module.css'
import { useReceitas, type Receita } from '@/pages/Wallet/receitas'
import { useConfig } from '@/pages/Wallet/config'
import { dinheiroLivreDoMes } from '@/pages/Wallet/dinheiroLivre'
import { formatarPreco } from '@/pages/Wallet/format'
import type { Fatura } from '@/pages/Wallet/Subscriptions'
import { ReceitaFormModal } from '@/pages/Wallet/ReceitaFormModal'

const CHAVE_FATURAS = 'arktall:faturas'

export function Home() {
  const { receitas, adicionar } = useReceitas()
  const { config, setAliquota } = useConfig()
  const [modalAberto, setModalAberto] = useState(false)

  // mesmo padrão de leitura única do Subscriptions
  const [despesas] = useState<Fatura[]>(() => {
    const salvo = localStorage.getItem(CHAVE_FATURAS)
    return salvo ? JSON.parse(salvo) : []
  })

  const mesAtual = new Date().toISOString().slice(0, 7) // "AAAA-MM"
  const livre = dinheiroLivreDoMes({
    receitas, despesas, aliquota: config.aliquotaImposto, mes: mesAtual,
  })

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.label}>Dinheiro livre este mês</span>
        <span className={styles.value}>{formatarPreco(livre)}</span>
      </div>

      <label className={styles.aliquota}>
        Alíquota de imposto (%)
        <input
          type="number"
          value={config.aliquotaImposto}
          onChange={(e) => setAliquota(Number(e.target.value))}
        />
      </label>

      <button className={styles.fab} onClick={() => setModalAberto(true)} aria-label="Nova receita">
        +
      </button>

      {modalAberto && (
        <ReceitaFormModal onClose={() => setModalAberto(false)} onSave={adicionar} />
      )}
    </section>
  )
}
```

- [ ] **Step 2: Criar `Home.module.css`**

Estilo mínimo usando variáveis de `tokens.css` (destaque no `.value`, tema dark+dourado). Sem cores hardcoded.

- [ ] **Step 3: Ligar a Home no `App.tsx`**

Em `src/App.tsx`, importe `Home` e troque a linha 24:
```tsx
// de:
{activeId==='home' && <h1>Home</h1>}
// para:
{activeId==='home' && <Home />}
```

- [ ] **Step 4: Verificar tudo e testar na tela**

Run: `npm run type-check && npm run lint && npm test`
Expected: tudo verde.
Run: `npm run dev` → abra a Home, defina alíquota, cadastre uma receita, confira o número mudar.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home/ src/App.tsx
git commit -m "feat: Home mostra dinheiro livre do mes (RF22)"
```

---

## Cobertura dos requisitos

| Requisito | Onde é atendido |
|-----------|-----------------|
| RF18 — registrar receita | Task 2 (`useReceitas`) + Task 5 (modal) |
| RF19 — reservar imposto (alíquota configurável) | Task 3 (`useConfig`) + Task 4 (`impostoDaReceita`) |
| RF20 — reaproveitar despesas | Task 4 (`custoMensalTotal` dentro de `dinheiroLivreDoMes`) |
| RF21 — calcular dinheiro livre | Task 4 (`dinheiroLivreDoMes`) |
| RF22 — exibir na Home | Task 6 |

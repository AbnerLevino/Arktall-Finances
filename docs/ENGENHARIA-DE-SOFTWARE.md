# Documento de Engenharia de Software — arktall

> **Status:** Em desenvolvimento (documento vivo)
> **Versão do documento:** 1.0
> **Última atualização:** 24/09/2026
> **Autor(a):** Equipe arktall

---

## Sumário

1. [Visão geral e objetivo](#1-visão-geral-e-objetivo)
2. [Escopo](#2-escopo)
3. [Personas e casos de uso](#3-personas-e-casos-de-uso)
4. [Requisitos funcionais](#4-requisitos-funcionais)
5. [Requisitos não funcionais](#5-requisitos-não-funcionais)
6. [Arquitetura e stack](#6-arquitetura-e-stack)
7. [Modelo de dados](#7-modelo-de-dados)
8. [Regras de negócio](#8-regras-de-negócio)
9. [Estado atual vs. roadmap](#9-estado-atual-vs-roadmap)
10. [Glossário](#10-glossário)

---

## 1. Visão geral e objetivo

### 1.1 O que é
O **arktall** é uma aplicação web de **gestão financeira pessoal** voltada a **profissionais autônomos e pessoas com renda variável**. Diferente de um controlador de gastos genérico, o foco é dar **previsibilidade** a quem não tem salário fixo: entender quanto compromete por mês em contas recorrentes, visualizar a evolução do gasto no tempo e — na visão futura — planejar o fluxo de caixa com apoio de uma IA copiloto.

### 1.2 Problema que resolve
Quem tem renda variável sofre com duas dores centrais:
- **Não sabe o custo fixo mensal real** (assinaturas, parcelas, contas recorrentes se acumulam sem visibilidade).
- **Não consegue projetar** se o mês vai fechar no positivo, porque a receita oscila.

O arktall ataca a primeira dor **hoje** (controle e visualização de contas recorrentes) e mira a segunda no **roadmap** (fluxo de caixa + copiloto de IA).

### 1.3 Objetivos do produto
- **OBJ-01** — Centralizar todas as contas recorrentes (assinaturas e contas variáveis) num só lugar.
- **OBJ-02** — Mostrar de forma visual o custo mensal comprometido e sua composição por categoria.
- **OBJ-03** — Revelar a evolução histórica do gasto (quando começou/cancelou cada assinatura).
- **OBJ-04** *(futuro)* — Projetar fluxo de caixa considerando receita variável.
- **OBJ-05** *(futuro)* — Oferecer um copiloto de IA para insights e importação de extratos.

---

## 2. Escopo

### 2.1 Dentro do escopo (atual)
- Cadastro, edição e exclusão de contas (assinaturas e contas variáveis).
- Criação de categorias personalizadas (nome, emoji, cor).
- Dashboard com KPI de custo mensal, gráfico por categoria e linha do tempo das assinaturas.
- Persistência local no navegador (sem necessidade de login).

### 2.2 Dentro do escopo (futuro / roadmap)
- Página **Home** (resumo/entrada).
- **Fluxo de caixa** (entradas x saídas, projeção).
- **IA copiloto** (insights e recomendações).
- **Importação de extrato** bancário.

### 2.3 Fora do escopo
- Integração via **Open Finance** (descartada — decisão de projeto).
- Aplicativo mobile nativo (o alvo é web).
- Multiusuário / colaboração / compartilhamento de contas.
- Integração automática com bancos em tempo real.

---

## 3. Personas e casos de uso

### 3.1 Persona principal — "Autônomo(a) com renda variável"
Freelancer, prestador de serviço ou pequeno empreendedor. Recebe valores diferentes a cada mês, tem várias assinaturas (ferramentas, streamings) e contas variáveis, e precisa entender o custo fixo para saber quanto pode gastar/investir.

### 3.2 Casos de uso principais
- **UC-01** — Cadastrar uma nova assinatura ou conta variável.
- **UC-02** — Editar ou excluir uma conta existente.
- **UC-03** — Criar uma categoria personalizada e classificar contas nela.
- **UC-04** — Consultar o custo mensal total comprometido.
- **UC-05** — Visualizar a composição do gasto por categoria.
- **UC-06** — Acompanhar a linha do tempo das assinaturas (início, cancelamento, duração).

---

## 4. Requisitos funcionais

> **RF = o que o sistema FAZ.** Descrevem funcionalidades observáveis pelo usuário.
> Legenda de status: ✅ implementado · 🔜 planejado

### 4.1 Módulo Contas (Management)
- **RF01** ✅ — O sistema deve permitir **cadastrar** uma conta com: tipo (assinatura ou variável), nome, ícone opcional, forma de pagamento, banco, vencimento, status, preço, moeda, periodicidade e categoria.
- **RF02** ✅ — O sistema deve permitir **editar** uma conta existente.
- **RF03** 🔜 — O sistema deve permitir **excluir** uma conta (o botão existe na interface, mas a ação ainda não está ligada).
- **RF04** ✅ — O sistema deve **agrupar as contas por categoria** na listagem, exibindo um grupo "Sem categoria" quando aplicável.
- **RF05** ✅ — Para assinaturas, o sistema deve registrar **parcelas** (crédito parcelado), **início** e **fim** (quando cancelada).
- **RF06** ✅ — O sistema deve suportar contas **mensais e anuais**, além de moeda configurável.

### 4.2 Módulo Categorias
- **RF07** ✅ — O sistema deve permitir que o usuário **crie categorias** próprias, definindo nome, emoji e cor.
- **RF08** ✅ — As categorias criadas devem estar disponíveis na hora de cadastrar/editar uma conta.

### 4.3 Módulo Dashboard (Wallet)
- **RF09** ✅ — O sistema deve exibir um **KPI de custo mensal total**, somando todas as contas (anuais entram como preço ÷ 12).
- **RF10** ✅ — O sistema deve exibir um **gráfico de custo por categoria**.
- **RF11** ✅ — O sistema deve exibir uma **linha do tempo (tipo Gantt)** com a vida de cada assinatura (do início até o cancelamento ou até hoje).
- **RF12** ✅ — O sistema deve calcular séries de **gasto acumulado** e **gasto mensal por categoria** ao longo do tempo.

### 4.4 Módulo Home 🔜
- **RF13** 🔜 — O sistema deve exibir uma tela inicial com resumo do estado financeiro.

### 4.5 Módulo Fluxo de caixa 🔜
- **RF14** 🔜 — O sistema deve permitir registrar **entradas (receitas)** além das saídas.
- **RF15** 🔜 — O sistema deve **projetar o saldo** futuro considerando receitas e despesas recorrentes.

### 4.6 Módulo IA copiloto 🔜
- **RF16** 🔜 — O sistema deve oferecer **insights automáticos** sobre os gastos (ex.: alertas de aumento, sugestões de corte).

### 4.7 Módulo Importação de extrato 🔜
- **RF17** 🔜 — O sistema deve permitir **importar um extrato** bancário e sugerir a categorização das transações.

---

## 5. Requisitos não funcionais

> **RNF = COMO o sistema faz / quais qualidades ele tem.** Não são funcionalidades, e sim atributos (velocidade, segurança, usabilidade...).

### 5.1 Usabilidade
- **RNF01** — A interface deve estar **100% em português**, embora o código seja em inglês.
- **RNF02** — O sistema deve seguir uma identidade visual consistente (tema **dark + dourado**), com todas as cores/espaços/raios vindo de **design tokens** (`tokens.css`), nunca valores fixos soltos.
- **RNF03** — A interface deve ser clara o suficiente para um usuário não técnico cadastrar uma conta sem instruções.

### 5.2 Desempenho
- **RNF04** — O dashboard deve renderizar os gráficos de forma fluida para volumes típicos de uso pessoal (dezenas a centenas de contas).
- **RNF05** — A leitura dos dados locais deve ocorrer uma única vez na montagem (evitando re-leituras desnecessárias).

### 5.3 Portabilidade / compatibilidade
- **RNF06** — Deve rodar em navegadores modernos de desktop.
- **RNF07** — Requer **Node.js 20+** para desenvolvimento.

### 5.4 Manutenibilidade
- **RNF08** — Estilos devem usar **CSS Modules** escopados por componente (`*.module.css`).
- **RNF09** — Imports devem usar o alias absoluto **`@/`**.
- **RNF10** — O código deve passar no **oxlint** e na checagem de tipos do TypeScript (`tsc --noEmit`).
- **RNF11** — Componentes devem ter responsabilidade única e bem delimitada (ex.: dashboard só visualiza; Management é quem edita).

### 5.5 Segurança e privacidade
- **RNF12** — Hoje os dados ficam **apenas no navegador do usuário** (localStorage) — não há envio a servidores, o que preserva a privacidade, mas **não há backup** nem sincronização.
- **RNF13** *(futuro)* — Ao introduzir backend/IA, dados financeiros sensíveis deverão trafegar de forma criptografada e com consentimento explícito.

### 5.6 Confiabilidade
- **RNF14** — O sistema deve lidar graciosamente com dados ausentes/antigos (ex.: conta sem `periodicidade` assume "Mensal").

---

## 6. Arquitetura e stack

### 6.1 Stack
| Camada | Tecnologia |
|--------|-----------|
| Linguagem | TypeScript |
| Biblioteca UI | React 19 |
| Build/dev server | Vite 8 |
| Gráficos | Recharts 3 |
| Estilos | CSS Modules + design tokens |
| Lint | oxlint |
| Persistência | `localStorage` do navegador |

### 6.2 Visão de arquitetura (atual)
Aplicação **frontend-only** (SPA). Não há backend, banco de dados nem autenticação. O roteamento entre telas é feito por **estado local** no `App.tsx` (não usa uma biblioteca de rotas).

```
┌───────────────────────────────────────────────┐
│                    App.tsx                      │
│  (estado activeId → decide qual página mostrar) │
├───────────────────────────────────────────────┤
│  Header  │  Sidebar  │  BlurOverlay             │  ← layout
├───────────────────────────────────────────────┤
│  Páginas:                                       │
│   • Home        (🔜 vazia)                       │
│   • Wallet      (dashboard: KPIs + gráficos)     │
│   • Management  (CRUD de contas)                 │
├───────────────────────────────────────────────┤
│  Lógica de domínio:  calc.ts  categorias.ts      │
│  Componentes de gráfico: TimelineChart,          │
│  CategoriaBarras, EvolucaoChart, ...             │
├───────────────────────────────────────────────┤
│  localStorage:                                   │
│   • arktall:faturas      (as contas)             │
│   • arktall:categorias   (as categorias)         │
└───────────────────────────────────────────────┘
```

### 6.3 Organização de pastas
```
src/
├── main.tsx              # ponto de entrada
├── App.tsx               # componente raiz + roteamento por estado
├── components/Icon/      # sistema de ícones SVG
├── layout/               # Header, Sidebar, BlurOverlay
├── pages/
│   ├── Wallet/           # dashboard + toda a lógica de domínio e gráficos
│   └── Management/       # listagem e CRUD das contas
├── hooks/                # hooks reutilizáveis (ex.: useTema)
└── styles/               # tokens.css + global.css
```

> **Observação de arquitetura:** a pasta `pages/Wallet/` concentra muita coisa (dashboard, modelo `Fatura`, cálculos, gráficos, modais). À medida que o projeto crescer, vale extrair o **domínio** (tipos + `calc.ts` + `categorias.ts`) para uma pasta própria (ex.: `src/domain/`), separando "regra de negócio" de "tela".

---

## 7. Modelo de dados

Como não há banco, as entidades são **tipos TypeScript** persistidos como JSON no `localStorage`.

### 7.1 Entidade `Fatura` (uma conta)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador único |
| `tipo` | `'assinatura' \| 'variavel'` | Assinatura (preço fixo) ou conta variável |
| `nome` | `string` | Nome da conta |
| `icone` | `string \| null` | Ícone PNG (data URL) ou nulo |
| `tipoPagamento` | `string` | Forma de pagamento |
| `parcelas` | `number \| null` | Nº de parcelas (crédito parcelado) |
| `valorParcelado` | `number \| null` | Valor de cada parcela |
| `banco` | `number \| null` | Código do banco (para achar a logo) |
| `vencimento` | `number \| null` | Dia do mês da cobrança (1–31) |
| `status` | `'Ativa' \| 'Cancelada'` | Situação da assinatura |
| `inicio` | `string \| null` | Mês/ano de início ("AAAA-MM") |
| `fim` | `string \| null` | Mês/ano de fim (quando cancelada) |
| `preco` | `number` | Valor da cobrança |
| `moeda` | `string` | Código da moeda (BRL, USD...) |
| `periodicidade` | `string` | "Mensal" ou "Anual" |
| `mesVencimento` | `number \| null` | Mês da cobrança (1–12), só se anual |
| `categoria` | `string` | Rótulo da categoria (emoji + nome) |

### 7.2 Entidade `Categoria`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador único |
| `nome` | `string` | Nome da categoria |
| `emoji` | `string` | Emoji ilustrativo |
| `cor` | `string` | Cor em hex (ex.: `#d4af37`) |

### 7.3 Entidades futuras (roadmap)
- **`Receita`** — para o fluxo de caixa (valor, data, origem, recorrência).
- **`Transacao`** — para importação de extrato (valor, data, descrição, categoria sugerida).

---

## 8. Regras de negócio

- **RN01 — Custo mensal por conta:** contas **mensais** contam com o preço cheio; contas **anuais** contam como `preço ÷ 12` (diluídas no ano). Contas antigas sem periodicidade caem no caso mensal.
- **RN02 — Custo mensal total:** é a soma do custo mensal de todas as contas (base do KPI).
- **RN03 — Duração de uma assinatura:** vai do mês de `início` até o mês de `fim` (se cancelada) ou até o mês atual (se ativa); mínimo de 1 mês.
- **RN04 — Total gasto por assinatura:** `duração em meses × custo mensal`.
- **RN05 — Agrupamento:** contas cuja categoria não bate com nenhuma categoria existente vão para o grupo **"Sem categoria"**.
- **RN06 — Fonte da verdade das categorias:** o hook `useCategorias` deve ser chamado **uma única vez** no componente pai e compartilhado por props (dois usos separados criariam estados divergentes).

---

## 9. Estado atual vs. roadmap

| Funcionalidade | Status |
|----------------|--------|
| Cadastrar conta | ✅ Feito |
| Editar conta | ✅ Feito |
| Excluir conta | 🔜 Botão existe, ação não ligada |
| Criar categorias | ✅ Feito |
| Agrupar por categoria | ✅ Feito |
| KPI de custo mensal | ✅ Feito |
| Gráfico por categoria | ✅ Feito |
| Linha do tempo (Gantt) | ✅ Feito |
| Séries acumulada/mensal | ✅ Calculadas |
| Página Home | 🔜 Vazia |
| Fluxo de caixa (receitas + projeção) | 🔜 Planejado |
| IA copiloto | 🔜 Planejado |
| Importação de extrato | 🔜 Planejado |
| Backend / sincronização / backup | 🔜 A decidir |

---

## 10. Glossário

| Termo | Significado |
|-------|-------------|
| **Fatura / Conta** | Uma despesa recorrente cadastrada (assinatura ou conta variável). |
| **Assinatura** | Conta de preço fixo recorrente (ex.: streaming). |
| **Conta variável** | Conta recorrente cujo valor muda (ex.: energia). |
| **Categoria** | Rótulo criado pelo usuário (nome + emoji + cor) para agrupar contas. |
| **KPI** | *Key Performance Indicator* — indicador-chave (aqui, o custo mensal). |
| **Design token** | Variável de estilo (cor, espaço, raio) centralizada e reutilizável. |
| **localStorage** | Armazenamento de dados no próprio navegador do usuário. |
| **SPA** | *Single Page Application* — app web que roda numa única página. |
| **RF / RNF** | Requisito Funcional / Requisito Não Funcional. |
| **CRUD** | *Create, Read, Update, Delete* — as 4 operações básicas sobre dados. |

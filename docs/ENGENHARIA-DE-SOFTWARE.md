# Documento de Engenharia de Software — arktall

> **Status:** Em desenvolvimento (documento vivo)
> **Versão do documento:** 1.1
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
O **arktall** é uma aplicação web de **gestão financeira para quem vive de renda variável** (autônomos, freelancers, MEIs, pequenos empreendedores). Ele não é mais um "controlador de gastos" — isso uma planilha já faz. O arktall responde a **pergunta que a planilha não responde**:

> **"Do que entrou este mês, quanto é realmente meu pra gastar ou guardar?"**

### 1.2 Problema que resolve
Quem tem salário fixo sabe exatamente quanto recebe e quando. Quem vive de renda variável, não: o valor muda todo mês, a data é irregular, e o dinheiro que entra vem **"sujo"** — dentro dele há imposto a pagar, custo do trabalho e o que precisa sobrar pro mês magro. Isso gera as dores centrais:

- 💸 **Não sabe o que é "seu de verdade"** — vê R$ 8.000 na conta e gasta como se fossem livres, quando na prática grande parte já tem destino.
- 🧾 **É pego de surpresa pelo imposto** — não separa a fatia do DAS/Simples quando o dinheiro entra.
- 📉 **Não sobrevive à oscilação** — o mês gordo não sustenta o magro por falta de planejamento.

O arktall ataca a **primeira dor como MVP** (ver seção 2), e as demais como evolução.

### 1.3 Proposta de valor
Uma ferramenta que **calcula**, e não só mostra. A entrega central é **um número**: o *dinheiro livre do mês*, obtido descontando da receita o imposto reservado e as despesas fixas. É isso que justifica o usuário pagar — a planilha mostra números, o arktall **toma a decisão de conta pra você**.

### 1.4 Objetivos do produto
- **OBJ-01** — Registrar a **renda variável** (entradas com valor e data próprios).
- **OBJ-02** — Reservar automaticamente a fatia do **imposto** de cada receita.
- **OBJ-03** — Reaproveitar as **despesas fixas** já cadastradas como saída no cálculo.
- **OBJ-04** — Calcular e destacar o **dinheiro livre do mês** (o número mágico).
- **OBJ-05** *(futuro)* — Suavizar a oscilação (reserva/colchão para o mês magro).
- **OBJ-06** *(futuro)* — Copiloto de IA e importação de extrato.

---

## 2. Escopo

### 2.1 Já construído (base reaproveitada)
- Cadastro, edição e agrupamento de contas/despesas (assinaturas e contas variáveis).
- Criação de categorias personalizadas (nome, emoji, cor).
- Dashboard com KPI de custo mensal, gráfico por categoria e linha do tempo.
- Persistência local no navegador (`localStorage`).

### 2.2 MVP atual — "Quanto é meu de verdade" 🎯
Foco único desta fase (escopo enxuto e vendável). Requisitos **RF18–RF22** (seção 4.4):
- Registrar **receitas** (entradas de renda variável).
- Reservar **imposto** automaticamente (alíquota única configurável).
- Reaproveitar o total de **despesas fixas** já cadastradas.
- Calcular e exibir o **dinheiro livre do mês** na Home.

### 2.3 Roadmap (fases seguintes)
- **Fase 2 — Backend:** API em **Java/Spring Boot + PostgreSQL**, login e sincronização (ver seção 6).
- Suavização mês gordo/magro (reserva/colchão).
- **IA copiloto** (insights e recomendações).
- **Importação de extrato** bancário.

### 2.4 Fora do escopo
- Integração via **Open Finance** (descartada — decisão de projeto).
- Aplicativo mobile nativo (o alvo é web).
- Multiusuário / colaboração / compartilhamento de contas.
- Integração automática com bancos em tempo real.
- Separação PJ x PF, categorização de receita — reavaliados após o MVP.

---

## 3. Personas e casos de uso

### 3.1 Persona principal — "Autônomo(a) com renda variável"
Freelancer, prestador de serviço, MEI ou pequeno empreendedor. **Recebe valores diferentes a cada mês, em datas irregulares, vindos de clientes/vendas — não de um patrão.** Tem despesas fixas (assinaturas, contas) e obrigações (imposto) que a renda oscilante torna difíceis de planejar. A dor não é "quanto gastei", é **"quanto posso gastar sem me ferrar no mês que vem"**.

### 3.2 Casos de uso principais
**Do MVP "Quanto é meu de verdade":**
- **UC-01** — Registrar uma receita recebida (valor, data, origem).
- **UC-02** — Configurar a alíquota de imposto a reservar.
- **UC-03** — Consultar o dinheiro livre do mês na Home.

**Da base já construída (despesas):**
- **UC-04** — Cadastrar/editar uma despesa (assinatura ou conta variável).
- **UC-05** — Criar categorias e classificar despesas.
- **UC-06** — Visualizar custo mensal, composição por categoria e linha do tempo.

---

## 4. Requisitos funcionais

> Descrevem funcionalidades observáveis pelo usuário.
> Legenda de status: ✅ implementado · 🎯 MVP atual (a fazer) · 🔜 planejado (futuro)

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

### 4.4 Módulo "Quanto é meu de verdade" (MVP) 🎯
Módulo foco da fase atual. Ainda a implementar.
- **RF18** 🎯 — O sistema deve permitir ao usuário **registrar uma receita**, informando **valor**, **data de recebimento** e **origem/descrição**.
- **RF19** 🎯 — O sistema deve **calcular automaticamente o imposto reservado** de cada receita, aplicando uma **alíquota percentual única, configurável** pelo usuário.
- **RF20** 🎯 — O sistema deve considerar o **total das despesas fixas mensais** já cadastradas como uma das saídas do cálculo.
- **RF21** 🎯 — O sistema deve calcular o **dinheiro livre do mês** como: *receitas do mês − imposto reservado − despesas fixas do mês*.
- **RF22** 🎯 — O sistema deve **exibir o dinheiro livre do mês corrente de forma destacada na tela inicial (Home)**.

### 4.5 Módulos futuros 🔜
- **RF23** 🔜 — O sistema deve permitir definir uma **reserva/colchão** e descontá-la do dinheiro livre (suavização mês gordo/magro).
- **RF24** 🔜 — O sistema deve oferecer **insights automáticos** sobre gastos e receitas (IA copiloto).
- **RF25** 🔜 — O sistema deve permitir **importar um extrato** bancário e sugerir a categorização das transações.

---

## 5. Requisitos não funcionais

> Não são funcionalidades, e sim atributos (velocidade, segurança, usabilidade...).

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

### 6.1 Estratégia em duas fases
A arquitetura evolui em fases para não pagar complexidade antes da hora:

- **Fase 1 (atual) — Frontend puro:** o MVP roda 100% no navegador, com `localStorage`. Objetivo: **provar o conceito** (o loop "quanto é meu") com o menor custo possível. Não precisa de backend, login ou servidor.
- **Fase 2 (após o MVP validado) — Backend próprio:** entra uma **API REST em Java/Spring Boot** com **PostgreSQL**, e o front passa a consumir dados via HTTP em vez do `localStorage`. Gatilhos que disparam esta fase: necessidade de **persistência entre dispositivos**, **contas de usuário/login**, **segurança do dado financeiro** e **lógica de servidor** (IA, importação de extrato). *Escolha de Java/Spring alinhada à experiência de backend da autora e ao valor de portfólio full-stack.*

### 6.2 Stack
| Camada | Fase 1 (atual) | Fase 2 (planejada) |
|--------|----------------|--------------------|
| Front — Linguagem | TypeScript | (mantém) |
| Front — UI | React 19 | (mantém) |
| Front — Build | Vite 8 | (mantém) |
| Front — Gráficos | Recharts 3 | (mantém) |
| Front — Estilos | CSS Modules + design tokens | (mantém) |
| Lint | oxlint | (mantém) |
| Persistência | `localStorage` | **PostgreSQL** via API |
| Backend | — (não há) | **Java + Spring Boot (REST)** |
| Comunicação | — | **HTTP/JSON** |

### 6.3 Visão de arquitetura (Fase 1 — atual)
Aplicação **frontend-only** (SPA). Não há backend, banco de dados nem autenticação. O roteamento entre telas é feito por **estado local** no `App.tsx` (não usa uma biblioteca de rotas).

```
┌───────────────────────────────────────────────┐
│                    App.tsx                      │
│  (estado activeId → decide qual página mostrar) │
├───────────────────────────────────────────────┤
│  Header  │  Sidebar  │  BlurOverlay             │  ← layout
├───────────────────────────────────────────────┤
│  Páginas:                                       │
│   • Home        (🎯 vitrine "dinheiro livre")   │
│   • Wallet      (dashboard: KPIs + gráficos)     │
│   • Management  (CRUD de contas/despesas)        │
├───────────────────────────────────────────────┤
│  Lógica de domínio:  calc.ts  categorias.ts      │
│  (🎯 novo: cascata do dinheiro livre)            │
│  Componentes de gráfico: TimelineChart,          │
│  CategoriaBarras, EvolucaoChart, ...             │
├───────────────────────────────────────────────┤
│  localStorage:                                   │
│   • arktall:faturas      (as despesas)           │
│   • arktall:categorias   (as categorias)         │
│   • arktall:receitas     (🎯 novo — entradas)    │
│   • arktall:config       (🎯 novo — alíquota %)  │
└───────────────────────────────────────────────┘
```

### 6.4 Visão de arquitetura (Fase 2 — planejada)
```
┌──────────────┐   HTTP/JSON   ┌────────────────────┐   JDBC   ┌────────────┐
│ React + TS    │ ───────────▶  │ Java + Spring Boot  │ ──────▶  │ PostgreSQL │
│ (SPA atual)   │ ◀───────────  │ REST API + regras   │          │ (banco)    │
└──────────────┘               └────────────────────┘          └────────────┘
```
A lógica de domínio hoje em `calc.ts` migra para os *Services* do backend; o front vira consumidor da API.

### 6.5 Organização de pastas
Organização **por contexto/funcionalidade** (não por camada técnica). Regra de dependência: `features/` pode depender de `ui/`, `domain/` e `lib/`; `ui/` e `domain/` **nunca** dependem de `features/`.

```
src/
├── main.tsx              # ponto de entrada
├── App.tsx               # componente raiz + roteamento por estado
├── domain/               # regra de negócio + tipos + persistência (o "backend" do front)
│   ├── fatura/           #   types.ts (entidade Fatura) + calc.ts
│   ├── categoria/        #   Categoria + hook useCategorias
│   └── banco/            #   dados dos bancos + acharBanco
├── lib/                  # utilitários puros (format.ts, image.ts)
├── ui/                   # componentes GENÉRICOS reutilizáveis
│   ├── Icon/  Select/  Modal/  MesAnoPicker/  IconeUpload/
├── features/             # as telas, por contexto
│   ├── dashboard/        #   Wallet + Subscriptions + charts/
│   └── management/       #   Management + FaturaFormModal + selects
├── layout/               # Header, Sidebar, BlurOverlay
├── hooks/                # hooks transversais (ex.: useTema)
└── styles/               # tokens.css + global.css
```

> **Nota:** durante a reorganização foram identificados arquivos sem uso (código morto): `features/dashboard/Bills.tsx`, `features/dashboard/charts/EvolucaoChart.tsx`, `features/dashboard/charts/GastoMensalChart.tsx` e `features/management/FaturaDetailModal.tsx`. Foram mantidos, mas são candidatos a remoção.

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

### 7.3 Entidade `Receita` (MVP 🎯 — a implementar)
Espelho da `Fatura`, mas do lado das **entradas**. Diferente da despesa (recorrente), cada receita é um **evento avulso**, com valor e data próprios.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador único |
| `valor` | `number` | Valor recebido |
| `data` | `string` | Data de recebimento ("AAAA-MM-DD") |
| `origem` | `string` | De quem/onde veio (descrição) |

### 7.4 Configuração (MVP 🎯 — a implementar)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `aliquotaImposto` | `number` | Percentual de imposto a reservar de cada receita (ex.: 6 = 6%) |

### 7.5 Entidades futuras (roadmap)
- **`Transacao`** — para importação de extrato (valor, data, descrição, categoria sugerida).

---

## 8. Regras de negócio

- **RN01 — Custo mensal por conta:** contas **mensais** contam com o preço cheio; contas **anuais** contam como `preço ÷ 12` (diluídas no ano). Contas antigas sem periodicidade caem no caso mensal.
- **RN02 — Custo mensal total:** é a soma do custo mensal de todas as contas (base do KPI).
- **RN03 — Duração de uma assinatura:** vai do mês de `início` até o mês de `fim` (se cancelada) ou até o mês atual (se ativa); mínimo de 1 mês.
- **RN04 — Total gasto por assinatura:** `duração em meses × custo mensal`.
- **RN05 — Agrupamento:** contas cuja categoria não bate com nenhuma categoria existente vão para o grupo **"Sem categoria"**.
- **RN06 — Fonte da verdade das categorias:** o hook `useCategorias` deve ser chamado **uma única vez** no componente pai e compartilhado por props (dois usos separados criariam estados divergentes).
- **RN07 — Imposto reservado (MVP 🎯):** para cada receita, `imposto = valor × (aliquotaImposto / 100)`.
- **RN08 — Cascata do dinheiro livre (MVP 🎯):** para o mês corrente,
  `dinheiro livre = Σ receitas do mês − Σ imposto reservado do mês − custo mensal total das despesas fixas`.
  Uma receita pertence ao mês da sua `data`.

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
| **Registrar receitas (RF18)** | 🎯 **MVP — a fazer** |
| **Reserva de imposto (RF19)** | 🎯 **MVP — a fazer** |
| **Cálculo do dinheiro livre (RF21)** | 🎯 **MVP — a fazer** |
| **Dinheiro livre na Home (RF22)** | 🎯 **MVP — a fazer** |
| Reserva/colchão (suavização) | 🔜 Fase futura |
| Backend Java/Spring + PostgreSQL | 🔜 Fase 2 (pós-MVP) |
| IA copiloto | 🔜 Planejado |
| Importação de extrato | 🔜 Planejado |

---

## 10. Glossário

| Termo | Significado |
|-------|-------------|
| **Fatura / Conta / Despesa** | Uma despesa recorrente cadastrada (assinatura ou conta variável). |
| **Receita / Entrada** | Dinheiro que entra, avulso, com valor e data próprios (renda variável). |
| **Dinheiro livre** | O que sobra da receita depois de reservar imposto e descontar despesas fixas — o "número mágico" do produto. |
| **Cascata do dinheiro** | Modelo mental: a receita entra "suja" e vai perdendo camadas (imposto, despesas) até sobrar o dinheiro livre. |
| **Alíquota** | Percentual de imposto aplicado sobre a receita. |
| **MVP** | *Minimum Viable Product* — a menor versão que já entrega valor real e testa a ideia. |
| **REST API** | Interface HTTP pela qual o front (Fase 2) conversa com o backend. |
| **Assinatura** | Conta de preço fixo recorrente (ex.: streaming). |
| **Conta variável** | Conta recorrente cujo valor muda (ex.: energia). |
| **Categoria** | Rótulo criado pelo usuário (nome + emoji + cor) para agrupar contas. |
| **KPI** | *Key Performance Indicator* — indicador-chave (aqui, o custo mensal). |
| **Design token** | Variável de estilo (cor, espaço, raio) centralizada e reutilizável. |
| **localStorage** | Armazenamento de dados no próprio navegador do usuário. |
| **SPA** | *Single Page Application* — app web que roda numa única página. |
| **RF / RNF** | Requisito Funcional / Requisito Não Funcional. |
| **CRUD** | *Create, Read, Update, Delete* — as 4 operações básicas sobre dados. |

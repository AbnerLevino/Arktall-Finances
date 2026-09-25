# 💰 arktall

> Gestão financeira para quem vive de **renda variável** — autônomos, freelancers, MEIs e pequenos empreendedores.
O arktall não é só mais um "controlador de gastos" (isso uma planilha já faz). Ele responde à pergunta que a planilha **não** responde:
> **"Do que entrou este mês, quanto é realmente meu pra gastar ou guardar?"**
A entrega central é **um número** — o *dinheiro livre do mês* — calculado descontando da receita o imposto reservado e as despesas fixas.
---

## ✨ Funcionalidades

**Já construído**
- 📇 Cadastro e edição de despesas (assinaturas e contas variáveis)
- 🏷️ Categorias personalizadas (nome, emoji, cor)
- 📊 Dashboard: custo mensal, gráfico por categoria e linha do tempo das assinaturas

**MVP em desenvolvimento — "Quanto é meu de verdade" 🎯**
- 💵 Registro de receitas (renda variável: valor e data próprios)
- 🧾 Reserva automática de imposto (alíquota configurável)
- 🪙 Cálculo e destaque do **dinheiro livre do mês**

**Roadmap 🔜**
- Suavização mês gordo/magro (reserva/colchão)
- Backend próprio (Java + Spring Boot + PostgreSQL)
- Copiloto de IA e importação de extrato bancário

---

## 🛠️ Stack

- **React 19** + **TypeScript**
- **Vite** (build e dev server)
- **Recharts** (gráficos)
- **CSS Modules** + design tokens (tema dark + dourado)
- **Vitest** (testes de regra de negócio)
- Persistência atual: `localStorage` (Fase 1 — frontend puro)

---

## 🚀 Como rodar

Requer **Node.js 20+**.

```bash
npm install       # instala as dependências
npm run dev       # sobe o servidor de desenvolvimento (http://localhost:5173)
npm run build     # checa os tipos e gera o build de produção
npm run preview   # serve o build de produção localmente
npm run test      # roda os testes (Vitest)
npm run lint      # roda o oxlint
npm run type-check # só a checagem de tipos

---
📁 Estrutura

src/
├── main.tsx              # ponto de entrada
├── App.tsx               # componente raiz + navegação por estado
├── components/           # componentes reutilizáveis (ex.: Icon)
├── layout/               # Header, Sidebar, BlurOverlay
├── pages/
│   ├── Home/             # vitrine do "dinheiro livre"
│   ├── Wallet/           # dashboard + lógica de domínio (calc, receitas...)
│   └── Management/       # CRUD de despesas
├── hooks/                # hooks reutilizáveis
└── styles/               # tokens.css + global.css
docs/                     # documento de engenharia e planos

---
🧭 Arquitetura em fases

- Fase 1 (atual): frontend puro, dados no localStorage — prova o conceito com o menor custo.
- Fase 2 (pós-MVP): API REST em Java/Spring Boot + PostgreSQL; o front passa a consumir via HTTP.

---
📐 Convenções

- Código em inglês; textos da interface em português.
- Estilos com CSS Modules (*.module.css), escopados por componente.
- Cores, espaçamentos e raios sempre via variáveis de tokens.css — nunca valor
- Imports absolutos com o alias @/ (ex.: @/components/Icon/Icon).

---
📄 Documentação

- docs/ENGENHARIA-DE-SOFTWARE.md — visão, requisitos e arquitetura

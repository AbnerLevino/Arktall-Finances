# Arktall

Aplicação web em **React 19 + TypeScript + Vite**.

## Requisitos

- Node.js 20+ e npm

## Como rodar

```bash
npm install       # instala as dependências
npm run dev       # sobe o servidor de desenvolvimento (http://localhost:5173)
npm run build     # checa os tipos e gera o build de produção
npm run preview   # serve o build de produção localmente
npm run lint      # roda o oxlint
npm run type-check # só a checagem de tipos
```

## Estrutura

```
src/
├── main.tsx              # ponto de entrada
├── App.tsx               # componente raiz
├── components/           # componentes reutilizáveis
│   └── Icon/             # sistema de ícones SVG
│       ├── Icon.tsx
│       └── icons.tsx     # catálogo de ícones
├── layout/               # estruturas de página
│   └── Sidebar/          # barra de navegação
├── styles/
│   ├── tokens.css        # design tokens (cores, espaços, raios) — espelha o Figma
│   └── global.css        # reset + base
└── assets/               # imagens e estáticos
```

## Convenções

- **Código em inglês** (`Sidebar`, `NavItem`); **textos da interface em português**.
- Estilos com **CSS Modules** (`*.module.css`), escopados por componente.
- Cores, espaçamentos e raios sempre via **variáveis de `tokens.css`** — nunca valores fixos soltos.
- Imports absolutos com o alias **`@/`** (ex.: `@/components/Icon/Icon`).

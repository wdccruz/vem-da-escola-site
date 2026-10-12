# Arquitetura Técnica — Vem da Escola Site Institucional (v1)

## 1. Visão Geral
O site institucional do **Vem da Escola** foi concebido sob uma arquitetura estática pura (HTML5 semântico, CSS3 modular com variáveis customizadas, e JavaScript Vanilla estruturado), sem acoplamento a backends complexos ou bancos de dados desnecessários.

Esta decisão técnica oferece:
- **Desempenho Extremo:** Carregamento instantâneo, métricas ótimas de Core Web Vitals (LCP < 1.0s, CLS = 0, INP imediato).
- **Segurança Total:** Zero superfície de ataque por injeção SQL, autenticação duplicada ou brechas de servidor.
- **Independência Operacional:** Total separação do sistema de gestão de bibliotecas escolares (`wdccruz/vem-da-escola`).
- **Facilidade de Publicação:** Compatível com Cloudflare Pages, GitHub Pages, Vercel, Netlify, Nginx ou qualquer servidor web estático.

---

## 2. Estrutura de Diretórios
```
vem-da-escola-site/
├── css/
│   ├── variables.css           # Tokens de design, cores, tipografia e raios
│   ├── base.css                # Reset moderno, utilitários, acessibilidade
│   ├── components.css          # Cabeçalho, menu, botões, cartões, modal, rodapé
│   └── pages.css               # Estilos de páginas específicas (Hero, Quem Somos, Biblioteca)
├── js/
│   ├── config.js               # Centralização de URLs externas e configurações
│   ├── main.js                 # Comportamento interativo (menu mobile, galeria, formulários)
│   └── search.js               # Busca instantânea client-side com diálogo <dialog> acessível
├── images/
│   ├── hero-educacao.jpg       # Fotografia principal da prancha aprovada (otimizada 2x)
│   ├── quem-somos-professora.jpg # Fotografia da seção Quem Somos (lousa digital)
│   ├── logo-vem-da-escola.svg  # Logotipo vetorial oficial com traço e elementos decorativos
│   ├── favicon.svg             # Favicon vetorial da plataforma
│   └── biblioteca/             # Capturas reais da aplicação de bibliotecas
│       ├── dashboard.png
│       ├── acervo.png
│       ├── exemplar.png
│       ├── emprestimos.png
│       ├── relatorios.png
│       └── ranking.png
├── index.html                  # Página Inicial (reprodução fiel da prancha aprovada)
├── educadores.html             # Página "Para Educadores"
├── familias.html               # Página "Para Famílias"
├── conteudos.html              # Página "Conteúdos & Artigos"
├── sobre.html                  # Página "Sobre a Iniciativa"
├── contato.html                # Página "Contato & Atendimento"
├── ferramentas/
│   └── biblioteca.html         # Apresentação institucional da Biblioteca Escolar
├── docs/
│   ├── arquitetura.md          # Esta documentação técnica
│   ├── navegacao.md            # Mapeamento detalhado dos fluxos de navegação
│   └── evidencias/             # Capturas reais da execução e testes responsivos
└── tests/
    └── test_site.py            # Suíte de testes automatizados com Playwright
```

---

## 3. Design System & Tokens

### Paleta de Cores Aprovada
- **Azul Profundo / Marinho:** `#152e44` (Títulos, botões escuros, rodapé, contrastes fortes).
- **Laranja-Terra / Terracota:** `#dd5024` (Destaque visual, chamadas primárias, badges).
- **Azul Suave:** `#4a789c` / `#eaf2f8` (Badges de cartões, caixas de citação e destaques secundários).
- **Bege Claro / Canvas:** `#faf8f5` (Superfície de fundo de página, acolhedor e confortável para leitura).
- **Branco Puro:** `#ffffff` (Cartões, campos de texto e caixas de diálogo).
- **Bordas Neutras:** `#e8e4de` / `#eeeae4` (Linhas divisórias e molduras).

### Tipografia
- Fontes Primárias: `Plus Jakarta Sans` e `Outfit` (importadas via Google Fonts com fallbacks do sistema operacional).
- Escala: `0.75rem` (12px) a `3.25rem` (52px), utilizando `clamp()` para escalonamento fluido entre mobile e telas ultrawide.

---

## 4. Acessibilidade (A11y)
- **Marcação Semântica:** Uso rigoroso de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` e `<dialog>`.
- **Skip Links:** Link direto para o conteúdo principal no início do documento.
- **Teclado:** Foco visível acessível (`:focus-visible` com offset de 3px), modal de pesquisa acionável por `Ctrl+K` e fechável por `Esc`.
- **Aria Attributes:** `aria-expanded` no botão mobile, `aria-current="page"` no link ativo, e `aria-hidden="true"` em ícones puramente visuais.

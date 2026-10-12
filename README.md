# Vem da Escola — Site Institucional (Versão 1)

> **"Conhecimento que nasce da experiência."**  
> Soluções educacionais criadas a partir da realidade de quem vive a escola. Fundado por Fabby Assis.

---

## 1. Descrição do Projeto
O **Vem da Escola** é uma iniciativa educacional dedicada a transformar décadas de experiência prática e vivência na rotina escolar em ferramentas, metodologias e soluções digitais acessíveis.

Este repositório contém o código-fonte da primeira versão do **site institucional**, responsável por apresentar a marca, seus princípios, conteúdos pedagógicos para educadores e famílias, e dar acesso organizado às suas ferramentas tecnológicas.

---

## 2. Objetivo do Site Institucional
- Estabelecer a presença digital e a identidade visual da iniciativa com rigorosa fidelidade à prancha aprovada.
- Apresentar a trajetória de **Fabby Assis** e a filosofia do projeto ("Da experiência real para uma educação mais viva").
- Oferecer conteúdos e canais de diálogo seguros para professores, gestores e famílias.
- Atuar como porta de entrada oficial e organizada para as ferramentas da plataforma, introduzindo e contextualizando cada solução antes de qualquer direcionamento ao ambiente operacional.

---

## 3. Relação com o Sistema de Gestão de Bibliotecas Escolares
A iniciativa possui dois projetos de software mantidos em repositórios estritamente independentes:

1. **Repositório do Site Institucional (este repositório):**  
   `wdccruz/vem-da-escola-site` — Desenvolvido em arquitetura estática, sem backend acoplado, focado em apresentação institucional e navegabilidade.
2. **Repositório do Sistema de Bibliotecas:**  
   `wdccruz/vem-da-escola` — Aplicação operacional full-stack em FastAPI/PostgreSQL para gestão física de acervos escolares.

A integração entre os dois projetos ocorre **exclusivamente por navegação web**. O site institucional não compartilha banco de dados, autenticação ou dependências de runtime com a aplicação de bibliotecas. O repositório da biblioteca permanece 100% preservado e inalterado.

---

## 4. Estrutura do Repositório
```
vem-da-escola-site/
├── css/
│   ├── variables.css           # Tokens do Design System (cores, tipografia, espaçamento)
│   ├── base.css                # Reset semântico, utilitários, acessibilidade e foco
│   ├── components.css          # Cabeçalho, menu mobile, cartões compactos, modal, rodapé
│   ├── pages.css               # Estilos das páginas internas e da Biblioteca Escolar
│   └── home.css                # Composição da Página Inicial nas proporções da prancha (unidade --u)
├── js/
│   ├── config.js               # Centralização de configurações e URLs externas
│   ├── main.js                 # Comportamento interativo (menu, rolagem, galeria, form seguro)
│   └── search.js               # Pesquisa instantânea acessível com elemento <dialog>
├── images/
│   ├── hero-educacao.jpg       # Fotografia ampla com enquadramento completo dos personagens
│   ├── quem-somos-professora.jpg # Fotografia pura da professora diante da lousa digital
│   ├── hero-mask.svg           # Máscara que dissolve a borda esquerda da fotografia do hero
│   ├── logo-vem-da-escola.svg  # Logotipo vetorizado a partir da prancha (não é o arquivo-mestre da marca)
│   ├── logo-vem-da-escola.png  # Versão PNG transparente gerada a partir do SVG
│   ├── favicon.svg             # Favicon da plataforma
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
├── sobre.html                  # Página "Sobre a Iniciativa / História"
├── contato.html                # Página "Contato & Atendimento"
├── ferramentas/
│   └── biblioteca.html         # Apresentação institucional da Biblioteca Escolar
├── docs/
│   ├── arquitetura.md          # Especificação da arquitetura e tokens
│   ├── navegacao.md            # Mapeamento completo das rotas e fluxos de usuário
│   └── evidencias/             # Evidências de testes responsivos e comparações visuais
├── referencias/
│   └── wide_clean_modern_website_homepage_layout_with_w.png # Prancha visual aprovada (1672 × 941)
├── tests/
│   └── test-site.mjs           # Testes Playwright, capturas responsivas e comparação com a prancha
└── package.json                # Gerenciamento de scripts e comandos portáteis
```

---

## 5. Tecnologias Utilizadas
- **HTML5 Semântico:** Marcação estruturada, acessível com suporte nativo a `<dialog>` e tags de seção.
- **CSS3 Moderno:** Custom Properties (variáveis CSS), Grid Layout, Flexbox, `clamp()` para tipografia fluida e suporte a `backdrop-filter`.
- **JavaScript Vanilla (ES6+):** Zero dependências externas de terceiros, garantindo carregamento ultrarrápido e segurança contra ataques XSS.
- **Tipografia:** Famílias `Plus Jakarta Sans` e `Outfit` com fallbacks para fontes do sistema operacional.

---

## 6. Instalação
O projeto não exige compilação obrigatória para execução básica. Basta clonar o repositório:

```bash
git clone https://github.com/wdccruz/vem-da-escola-site.git
cd vem-da-escola-site
```

---

## 7. Execução Local
Qualquer servidor web estático pode ser utilizado para servir os arquivos:

### Opção A: Usando Node.js (npm / npx)
```bash
npx serve .
```

### Opção B: Usando Python (Nativo)
```bash
python -m http.server 3000
```
Acesse: [http://localhost:3000](http://localhost:3000)

---

## 8. Build de Produção e Validação Estática
Por se tratar de uma arquitetura estática pura de alto desempenho, os próprios arquivos constituem o artefato de produção pronto para publicação. Não há etapa obrigatória de empacotamento que gere arquivos minificados ilegíveis.

A validação completa da integridade dos arquivos estáticos é executada via:
```bash
npm install   # instala o Playwright (devDependency)
npm test
# ou diretamente:
node tests/test-site.mjs
```

---

## 9. Execução dos Testes Automatizados
Os testes automatizados usam o Playwright declarado em `package.json` (`npm install`), sem caminhos locais do desenvolvedor. O navegador é o Chromium do Playwright (`npx playwright install chromium`) ou, na ausência dele, o Edge ou o Chrome já instalados no sistema.

A cada execução são geradas capturas da Página Inicial em 1672, 1440, 1280, 768, 390 e 360 px e a comparação `docs/evidencias/comparacao_prancha_vs_implementacao_1672.png` (prancha × navegador real). Em cada resolução verifica-se ausência de rolagem horizontal, de textos cortados, de imagens deformadas e de sobreposição de cartões. A comparação visual é insumo para a aprovação humana; os testes não substituem a homologação visual.

> **Pendência factual:** o indicador "+30 anos de experiência na educação" reproduz a prancha aprovada e permanece **sujeito à confirmação factual pela fundadora antes da publicação**.

Eles cobrem:
- **Integridade de Carregamento:** Todas as páginas internas (`index.html`, `biblioteca.html`, `educadores.html`, `familias.html`, `conteudos.html`, `sobre.html`, `contato.html`) carregam com status HTTP 200.
- **Ausência de Erros no Console:** Zero warnings ou exceptions de JavaScript.
- **Enquadramento das Imagens:** A foto do Hero (1408 × 580 px) é exibida inteira, sem recorte, preservando os quatro personagens e o quadro verde; a foto de Quem Somos carrega sem erros.
- **Ausência de Redirecionamento para Localhost:** Garantia de que o botão "ACESSAR BIBLIOTECA" não redireciona o visitante indevidamente para `localhost` antes da homologação final.
- **Comportamento Real do Formulário:** Validação dos campos obrigatórios e sanitização total contra injeção de scripts (XSS).
- **Transparência de Pré-produção:** Informação clara sobre o status de configuração da mensageria institucional, sem mensagens de confirmação falsas.
- **Responsividade Multi-resolução:** Homologado em 1440px, 1280px, 768px, 390px e 360px.

Comando para execução:
```bash
npm test
```

---

## 10. Organização das Páginas
- `index.html`: Página principal com cabeçalho, logotipo oficial em duas linhas, hero com composição fotográfica ampla, 4 cartões compactos horizontais, seção "Quem Somos" com pilares de valor e citação oficial.
- `ferramentas/biblioteca.html`: Apresentação institucional da Biblioteca Escolar dividida em 6 seções obrigatórias (Apresentação, Funcionalidades, Como Funciona, Telas Reais, Acesso e Retorno).
- `educadores.html`: Conteúdos dedicados a professores e equipes diretivas.
- `familias.html`: Orientações de leitura compartilhada e aproximação família-escola.
- `conteudos.html`: Artigos e materiais práticos sobre educação e leitura.
- `sobre.html`: História de Fabby Assis, pilares de atuação e manifesto institucional.
- `contato.html`: Formulário seguro com validação e canais oficiais.

---

## 11. Configuração dos Links Externos
Todas as URLs externas, canais de contato e parâmetros da aplicação são centralizados no arquivo:
👉 `js/config.js`

```javascript
const VDE_CONFIG = {
  // Endereço público da aplicação em produção (definido no go-live da VPS)
  // Enquanto estiver vazio, exibe o aviso institucional de homologação
  libraryAppUrl: "",
  
  // Apresentação interna
  libraryPresentationUrl: "/ferramentas/biblioteca.html",

  // Canais de contato
  contact: {
    email: null, // Sob configuração da caixa postal oficial
    formEndpoint: null // Provedor de mensageria estática
  }
};
```

---

## 12. Integração com a Biblioteca
O fluxo de acesso segue a seguinte diretriz de experiência de usuário:
1. O usuário acessa o site e clica em **"Acessar"** ou no **Cartão 4 (Ferramentas e Soluções)**.
2. É encaminhado para `/ferramentas/biblioteca.html` onde conhece as funcionalidades do sistema e vê telas reais da interface.
3. Clica no botão em destaque **"ACESSAR BIBLIOTECA"**.
4. Se o domínio público estiver preenchido em `js/config.js`, o navegador abre a aplicação em nova aba. Em fase pré-produção, exibe aviso institucional transparente sobre a fase de homologação.

---

## 13. Atualização de Conteúdos
- Os textos estão organizados em tags semânticas no HTML de cada página.
- O array `SEARCH_INDEX` em `js/search.js` indexa automaticamente os tópicos institucionais para a busca client-side.

---

## 14. Atualização de Imagens
- Fotos e logotipos estão localizados na pasta `images/`.
- As capturas de tela reais do sistema de bibliotecas estão armazenadas em `images/biblioteca/`.
- Ao atualizar imagens, preservar a proporção de aspecto documentada no CSS para garantir métricas CLS zero.

---

## 15. Procedimento de Publicação
O site pode ser publicado em qualquer provedor de hospedagem estática:

### Publicação no GitHub Pages
1. No repositório `wdccruz/vem-da-escola-site`, vá em **Settings > Pages**.
2. Em **Source**, selecione **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)`.
4. O site estará disponível em `https://wdccruz.github.io/vem-da-escola-site/`.

### Publicação na Cloudflare Pages ou Vercel
1. Conecte o repositório GitHub.
2. Diretório de saída: `.` (raiz).
3. O deploy ocorrerá automaticamente a cada push autorizado na branch `main`.

---

## 16. Orientações para Adicionar Novas Ferramentas
O Vem da Escola foi estruturado para expandir seu portfólio de ferramentas educacionais:

1. Crie uma nova página de apresentação dentro da pasta `/ferramentas/` (ex: `/ferramentas/planejamento.html`).
2. Siga o mesmo padrão de 6 seções (Apresentação, Recursos, Como Funciona, Telas, Acesso, Retorno).
3. Adicione a nova ferramenta no array de busca em `js/search.js`.
4. Adicione o link correspondente no rodapé das páginas.

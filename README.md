# Vem da Escola — Site Institucional (Versão 1)

> **"Conhecimento que nasce da experiência."**  
> Soluções educacionais criadas a partir da realidade de quem vive a escola. Fundado por Fabby Assis.

---

## 1. Descrição do Projeto
O **Vem da Escola** é uma iniciativa educacional dedicada a transformar décadas de experiência prática e vivência na rotina escolar em ferramentas, metodologias e soluções digitais acessíveis.

Este repositório contém o código-fonte da primeira versão do **site institucional**, responsável por apresentar a marca, seus princípios, conteúdos pedagógicos para educadores e famílias, e dar acesso organizado às suas ferramentas tecnológicas.

---

## 2. Objetivo do Site Institucional
- Estabelecer a presença digital e a identidade visual da iniciativa com base no design aprovado.
- Apresentar a trajetória de **Fabby Assis** e a filosofia do projeto ("Da experiência real para uma educação mais viva").
- Oferecer conteúdos e canais de diálogo para professores, gestores e famílias.
- Atuar como porta de entrada oficial e organizada para as ferramentas da plataforma, introduzindo e contextualizando cada solução antes do acesso ao sistema operacional.

---

## 3. Relação com o Sistema de Gestão de Bibliotecas Escolares
A iniciativa possui dois projetos de software mantidos em repositórios estritamente independentes:

1. **Repositório do Site Institucional (este repositório):**  
   `wdccruz/vem-da-escola-site` — Desenvolvido em arquitetura estática, sem backend acoplado, focado em apresentação institucional e navegabilidade.
2. **Repositório do Sistema de Bibliotecas:**  
   `wdccruz/vem-da-escola` — Aplicação operacional full-stack em FastAPI/PostgreSQL para gestão física de acervos escolares.

A integração entre os dois projetos ocorre **exclusivamente por navegação web**. O site institucional não compartilha banco de dados, autenticação ou dependências de runtime com a aplicação de bibliotecas.

---

## 4. Estrutura do Repositório
```
vem-da-escola-site/
├── css/
│   ├── variables.css           # Tokens do Design System (cores, tipografia, espaçamento)
│   ├── base.css                # Reset semântico, utilitários, acessibilidade e foco
│   ├── components.css          # Cabeçalho, menu mobile, botões pill, cartões, modal, rodapé
│   └── pages.css               # Estilos da Home (Hero, Quem Somos) e da Biblioteca Escolar
├── js/
│   ├── config.js               # Centralização de configurações e URLs externas
│   ├── main.js                 # Comportamento interativo (menu, rolagem, abas de telas)
│   └── search.js               # Pesquisa instantânea acessível com elemento <dialog>
├── images/
│   ├── hero-educacao.jpg       # Fotografia principal aprovada (Educadora, família e lousa verde)
│   ├── quem-somos-professora.jpg # Fotografia da professora em sala diante da lousa digital
│   ├── logo-vem-da-escola.svg  # Logotipo vetorial oficial da marca
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
│   └── evidencias/             # Evidências de testes responsivos e fidelidade visual
└── tests/
    └── test_site.py            # Bateria automatizada de testes Playwright
```

---

## 5. Tecnologias Utilizadas
- **HTML5 Semântico:** Marcação estruturada, acessível com suporte nativo a `<dialog>` e tags de seção.
- **CSS3 Moderno:** Custom Properties (variáveis CSS), Grid Layout, Flexbox, `clamp()` para tipografia fluida e suporte a `backdrop-filter`.
- **JavaScript Vanilla (ES6+):** Zero dependências externas de terceiros, garantindo carregamento ultrarrápido e segurança.
- **Tipografia:** Famílias `Plus Jakarta Sans` e `Outfit` com fallbacks para fontes do sistema operacional.

---

## 6. Instalação
O projeto não exige instalação de pacotes gerenciados para execução básica. Basta clonar o repositório:

```bash
git clone https://github.com/wdccruz/vem-da-escola-site.git
cd vem-da-escola-site
```

---

## 7. Execução Local
Qualquer servidor web estático pode ser utilizado para servir os arquivos:

### Opção A: Usando Python (Nativo)
```bash
python -m http.server 3000
```
Acesse: [http://localhost:3000](http://localhost:3000)

### Opção B: Usando Node.js (npx serve)
```bash
npx serve .
```

### Opção C: Usando Extensão Live Server no VS Code
Abra a pasta no VS Code e clique em "Go Live".

---

## 8. Build de Produção
Por se tratar de uma arquitetura estática otimizada, os próprios arquivos na raiz já constituem o artefato de produção pronto para publicação. Não há etapa obrigatória de transpilação.

Para validar os arquivos antes da publicação:
```bash
# Validação de integridade dos links e recursos
python tests/test_site.py
```

---

## 9. Execução dos Testes
Os testes automatizados foram construídos com Playwright e cobrem:
- Integridade de carregamento de todas as páginas (status 200, sem 404s).
- Ausência de erros de script no console.
- Responsividade em 5 resoluções distintas (1440px, 1280px, 768px, 390px, 360px).
- Funcionamento do modal de busca (`Ctrl+K` e input).
- Fluxo de apresentação da biblioteca antes do redirecionamento.

Para executar os testes:
```bash
python tests/test_site.py
```

---

## 10. Organização das Páginas
- `index.html`: Página principal com cabeçalho, hero, 4 cartões com badges, seção "Quem Somos" com pilares de valor e rodapé.
- `ferramentas/biblioteca.html`: Apresentação institucional da Biblioteca Escolar dividida em 6 seções obrigatórias (Apresentação, Funcionalidades, Como Funciona, Telas Reais, Acesso e Retorno).
- `educadores.html`: Conteúdos dedicados a professores e equipes diretivas.
- `familias.html`: Orientações de leitura compartilhada e aproximação família-escola.
- `conteudos.html`: Artigos e materiais práticos sobre educação e leitura.
- `sobre.html`: História de Fabby Assis, pilares de atuação e manifesto institucional.
- `contato.html`: Formulário funcional com validação e canais oficiais.

---

## 11. Configuração dos Links Externos
Todas as URLs externas, e-mails de contato e links da aplicação são centralizados no arquivo:
👉 `js/config.js`

```javascript
const VDE_CONFIG = {
  // Endereço da aplicação de biblioteca em produção
  libraryAppUrl: "http://localhost:8000/login",
  
  // Apresentação interna
  libraryPresentationUrl: "/ferramentas/biblioteca.html",

  // Canais de contato
  contact: {
    email: "contato@vemdaescola.com.br"
  }
};
```

---

## 12. Integração com a Biblioteca
O fluxo de acesso segue a seguinte diretriz de experiência de usuário:
1. O usuário acessa o site e clica em **"Acessar"** ou no **Cartão 4 (Ferramentas e Soluções)**.
2. É encaminhado para `/ferramentas/biblioteca.html` onde conhece as funcionalidades do sistema e vê telas reais da interface.
3. Clica no botão em destaque **"ACESSAR BIBLIOTECA"**.
4. O navegador abre a URL da aplicação configurada em `js/config.js` em uma nova aba.

---

## 13. Atualização de Conteúdos
- Os textos estão organizados em tags semânticas no HTML de cada página (`index.html`, `sobre.html`, etc.).
- Para adicionar novos termos ao sistema de busca instantânea, edite o array `SEARCH_INDEX` em `js/search.js`.

---

## 14. Atualização de Imagens
- Fotos e logotipos estão localizados na pasta `images/`.
- Ao substituir fotografias, mantenha as proporções e formatos indicados para preservar a estabilidade de layout (CLS zero).
- Capturas de novas telas da biblioteca devem ser salvas em `images/biblioteca/` e associadas nos botões correspondentes em `ferramentas/biblioteca.html`.

---

## 15. Procedimento de Publicação
O site pode ser publicado em qualquer provedor de hospedagem estática:

### Publicação no GitHub Pages
1. No repositório `wdccruz/vem-da-escola-site`, vá em **Settings > Pages**.
2. Em **Source**, selecione **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)`.
4. Salve. O site estará disponível em `https://wdccruz.github.io/vem-da-escola-site/`.

### Publicação na Cloudflare Pages ou Vercel
1. Conecte o repositório GitHub.
2. Deixe o comando de build vazio (ou `echo build done`).
3. Diretório de saída: `.` (raiz).
4. O deploy ocorrerá automaticamente a cada push na `main`.

---

## 16. Orientações para Adicionar Novas Ferramentas
O Vem da Escola foi estruturado para expandir seu portfólio de ferramentas educacionais:

1. Crie uma nova página de apresentação dentro da pasta `/ferramentas/` (ex: `/ferramentas/planejamento.html`).
2. Siga o mesmo padrão de 6 seções (Apresentação, Recursos, Como Funciona, Telas, Acesso, Retorno).
3. Adicione a nova ferramenta no array de busca em `js/search.js`.
4. Adicione o link correspondente no rodapé de todas as páginas.

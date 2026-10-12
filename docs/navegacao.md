# Mapa de Navegação e Fluxos de Usuário — Vem da Escola

## 1. Fluxo Obrigatório de Apresentação da Biblioteca

Conforme especificado nos requisitos, novos visitantes e interessados na plataforma **nunca** devem ser direcionados diretamente para uma tela de login sem antes conhecer a proposta e as funcionalidades do produto.

### Diagrama do Fluxo de Acesso:
```
[ PÁGINA INICIAL ]
       │
       ├── Clique em "Acessar" (Cabeçalho)
       ├── Clique em "Conheça nossas soluções" (Hero)
       └── Clique no Cartão 4 "Ferramentas e Soluções"
       │
       ▼
[ APRESENTAÇÃO INSTITUCIONAL DA BIBLIOTECA ] (/ferramentas/biblioteca.html)
       │
       ├── Seção 1: Apresentação e propósito
       ├── Seção 2: Funcionalidades reais verificadas
       ├── Seção 3: Como funciona passo a passo
       ├── Seção 4: Galeria com telas reais da aplicação
       └── Seção 5: Botão "ACESSAR BIBLIOTECA"
       │
       ▼
[ APLICAÇÃO EXTERNA DE GESTÃO DE BIBLIOTECAS ] (ex: http://localhost:8000/login)
```

---

## 2. Mapa Completo de Rotas e Destinos

| Rota / Link | Destino Físico | Descrição |
| :--- | :--- | :--- |
| **Início** | `/index.html` | Homepage com Hero, 4 Cartões e Quem Somos |
| **Para Educadores** | `/educadores.html` | Conteúdos e ferramentas para a rotina pedagógica |
| **Para Famílias** | `/familias.html` | Orientações de leitura e parceria escola-família |
| **Conteúdos** | `/conteudos.html` | Temas editoriais e situação das publicações (sem artigos publicados) |
| **Sobre** | `/sobre.html` | Trajetória de Fabby Assis, pilares e manifesto |
| **Contato** | `/contato.html` | Públicos e formulário preparado, desativado até a configuração do canal |
| **Pesquisa** | Diálogo `<dialog>` | Busca instantânea por qualquer tema do site |
| **Biblioteca Escolar** | `/ferramentas/biblioteca.html` | Página de apresentação do produto 1 |
| **Aplicação Externa** | Configurado em `js/config.js` | Sistema web de gestão de bibliotecas escolares |

---

## 3. Comportamento Responsivo da Navegação
- **Desktop (> 768px):** Menu horizontal completo com links diretos, campo de busca com atalho de teclado e botão pill de ação rápida.
- **Mobile (<= 768px):** Botão hambúrguer com alternância suave, links em largura total com áreas de toque ampliadas (mínimo de 44px de altura) e fechamento automático ao navegar.

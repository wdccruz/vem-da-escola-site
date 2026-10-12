/**
 * ============================================================================
 * VEM DA ESCOLA — SISTEMA DE BUSCA INSTITUCIONAL
 * ============================================================================
 * Indexação e pesquisa instantânea em todas as páginas e tópicos do site.
 * Utiliza o elemento semântico <dialog> com atalhos de teclado acessíveis.
 */

(function () {
  'use strict';

  // Base de dados institucional indexada para busca client-side real
  const SEARCH_INDEX = [
    {
      title: "Início — Conhecimento que nasce da experiência",
      category: "Institucional",
      url: "/index.html",
      keywords: "inicio home bem-vindo educacao inovacao fabby assis experiencia",
      desc: "Soluções educacionais criadas a partir da realidade de quem vive a escola."
    },
    {
      title: "Biblioteca Escolar (Apresentação)",
      category: "Ferramentas",
      url: "/ferramentas/biblioteca.html",
      keywords: "biblioteca sistema acervo livros exemplares emprestimos devolucao reservas relatorios gratuito software",
      desc: "Ferramenta gratuita para organizar e facilitar a gestão da biblioteca da sua escola."
    },
    {
      title: "Catálogo e Acervo de Livros",
      category: "Biblioteca",
      url: "/ferramentas/biblioteca.html#funcionalidades",
      keywords: "catalogo livros isbn autor editora busca acervo organizacao",
      desc: "Cadastro estruturado de títulos com localização física e metadados completos."
    },
    {
      title: "Controle de Exemplares Físicos",
      category: "Biblioteca",
      url: "/ferramentas/biblioteca.html#funcionalidades",
      keywords: "exemplar fisico estoque inventario estado conservacao tombo etiquetas",
      desc: "Inventário detalhado por exemplar físico e reconciliação de estoque."
    },
    {
      title: "Circulação e Empréstimos",
      category: "Biblioteca",
      url: "/ferramentas/biblioteca.html#funcionalidades",
      keywords: "emprestimo devolucao renovacao prazos pendencias alunos professores",
      desc: "Operação rápida de empréstimos e devoluções para a comunidade escolar."
    },
    {
      title: "Relatórios e Gráficos de Evolução",
      category: "Biblioteca",
      url: "/ferramentas/biblioteca.html#funcionalidades",
      keywords: "relatorios graficos evolucao temporal rankings turmas mais ativas leitura indicadores",
      desc: "Métricas gerenciais com evolução de leituras por período e turmas mais leitoras."
    },
    {
      title: "Para Educadores",
      category: "Público",
      url: "/educadores.html",
      keywords: "educadores professores formacoes ferramentas recursos praticos rotina pedagogica",
      desc: "Ferramentas, conteúdos e formações para facilitar o seu dia a dia na escola."
    },
    {
      title: "Para Famílias",
      category: "Público",
      url: "/familias.html",
      keywords: "familias pais maes responsaveis apoio aprendizagem desenvolvimento leitura em casa",
      desc: "Orientações, conteúdos e apoio para acompanhar a aprendizagem dos seus filhos."
    },
    {
      title: "Conteúdos e Artigos",
      category: "Conteúdos",
      url: "/conteudos.html",
      keywords: "conteudos artigos guias materiais pedagogicos leitura escola gestao",
      desc: "Temas editoriais do Vem da Escola e orientações já disponíveis no site."
    },
    {
      title: "Quem Somos — Sobre Fabby Assis",
      category: "Sobre",
      url: "/sobre.html",
      keywords: "sobre quem somos fabby assis fundadora trajetoria 30 anos vivencia manifesto",
      desc: "Da experiência real para uma educação mais viva: conheça a trajetória da iniciativa."
    },
    {
      title: "Contato e Atendimento",
      category: "Contato",
      url: "/contato.html",
      keywords: "contato atendimento duvidas suporte falar conosco mensagem",
      desc: "Página de contato do Vem da Escola. O canal de envio de mensagens está em configuração."
    }
  ];

  function initSearch() {
    const dialog = document.getElementById('search-dialog');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const triggerBtns = document.querySelectorAll('[data-action="open-search"]');
    const closeBtns = document.querySelectorAll('[data-action="close-search"]');

    if (!dialog || !input || !resultsContainer) return;

    // Abrir Modal
    function openModal() {
      dialog.showModal();
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 50);
    }

    // Fechar Modal
    function closeModal() {
      dialog.close();
    }

    // Eventos dos botões de abertura
    triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Eventos dos botões de fechamento
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    });

    // Fechar ao clicar no backdrop (fora do diálogo)
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    });

    // Atalhos de Teclado (Ctrl+K ou '/')
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.open) {
          closeModal();
        } else {
          openModal();
        }
      }
      if (e.key === '/' && !dialog.open && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openModal();
      }
    });

    // Pesquisa em tempo real
    input.addEventListener('input', (e) => {
      renderResults(e.target.value.trim());
    });

    function renderResults(query) {
      if (!query) {
        // Exibe destaques sugeridos quando vazio
        resultsContainer.innerHTML = `
          <div class="search-empty-state">
            <p>Digite para pesquisar em conteúdos, ferramentas e páginas institucionais...</p>
          </div>
        `;
        return;
      }

      const q = query.toLowerCase();
      const matches = SEARCH_INDEX.filter(item => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
        );
      });

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-empty-state">
            <p>Nenhum resultado encontrado para "<strong>${escapeHtml(query)}</strong>".</p>
            <p style="margin-top: 6px; font-size: 0.8rem;">Tente palavras como <em>biblioteca</em>, <em>acervo</em>, <em>educadores</em> ou <em>sobre</em>.</p>
          </div>
        `;
        return;
      }

      const listHtml = matches.map(item => `
        <a href="${item.url}" class="search-result-item" data-action="search-link">
          <div class="search-result-title">
            <span>${escapeHtml(item.title)}</span>
            <span class="search-result-category">${escapeHtml(item.category)}</span>
          </div>
          <div class="search-result-desc">${escapeHtml(item.desc)}</div>
        </a>
      `).join('');

      resultsContainer.innerHTML = `<div class="search-results-list">${listHtml}</div>`;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();

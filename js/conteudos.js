/**
 * ============================================================================
 * VEM DA ESCOLA — ARTIGOS PUBLICADOS
 * ============================================================================
 * Lista de artigos exibida em conteudos.html. Não há CMS nem banco de dados:
 * para publicar um artigo, crie a página HTML dele e acrescente um item aqui.
 *
 * Só inclua textos escritos ou aprovados pela fundadora.
 *
 * Formato de cada item:
 *   {
 *     title: "Título do artigo",
 *     summary: "Resumo em uma ou duas frases.",
 *     category: "Leitura",              // uma das categorias editoriais
 *     date: "2026-10-12",               // AAAA-MM-DD
 *     url: "conteudos/nome-do-artigo.html"
 *   }
 *
 * Enquanto a lista estiver vazia, a página informa que ainda não há artigos.
 */

const VDE_ARTICLES = [];

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('articles-list');
    const empty = document.getElementById('articles-empty');
    if (!list || !empty) return;

    const articles = VDE_ARTICLES.filter(a => a && a.title && a.url);
    if (!articles.length) return;

    articles.forEach(article => {
      const card = document.createElement('article');
      card.className = 'ip-article';

      if (article.category) {
        const chip = document.createElement('span');
        chip.className = 'ip-chip';
        chip.textContent = article.category;
        card.appendChild(chip);
      }

      const title = document.createElement('h3');
      title.className = 'ip-h3';
      title.textContent = article.title;
      card.appendChild(title);

      if (article.summary) {
        const summary = document.createElement('p');
        summary.className = 'ip-text';
        summary.textContent = article.summary;
        card.appendChild(summary);
      }

      const date = article.date ? new Date(article.date + 'T00:00:00') : null;
      if (date && !Number.isNaN(date.getTime())) {
        const meta = document.createElement('time');
        meta.className = 'ip-article-meta';
        meta.dateTime = article.date;
        meta.textContent = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        card.appendChild(meta);
      }

      const link = document.createElement('a');
      link.className = 'ip-link';
      link.href = article.url;
      link.textContent = 'Ler o artigo';
      card.appendChild(link);

      list.appendChild(card);
    });

    list.hidden = false;
    empty.hidden = true;
  });
})();

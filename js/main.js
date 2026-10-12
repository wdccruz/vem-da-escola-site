/**
 * ============================================================================
 * VEM DA ESCOLA — SCRIPT PRINCIPAL
 * ============================================================================
 * Controle de menu mobile, navegação suave, galeria de telas e interatividade.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeaderScroll();
    initGalleryTabs();
    initExternalLinks();
    initContactForm();
  });

  /**
   * 1. Menu Mobile
   */
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open');

      if (!isExpanded) {
        toggleBtn.setAttribute('aria-label', 'Fechar menu de navegação');
      } else {
        toggleBtn.setAttribute('aria-label', 'Abrir menu de navegação');
      }
    });

    // Fecha ao clicar em um link do menu
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Fecha ao redimensionar para tela desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * 2. Sombra e Efeito no Header ao rolar
   */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  /**
   * 3. Galeria de Telas da Biblioteca (/ferramentas/biblioteca.html)
   */
  function initGalleryTabs() {
    const tabBtns = document.querySelectorAll('.preview-tab-btn');
    const previewImg = document.getElementById('preview-image');
    const previewCaption = document.getElementById('preview-caption-text');
    const previewBadge = document.getElementById('preview-badge-text');

    if (!tabBtns.length || !previewImg) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const imgSrc = btn.getAttribute('data-image');
        const caption = btn.getAttribute('data-caption');
        const badge = btn.getAttribute('data-badge') || 'Módulo Verificado';

        if (imgSrc) {
          previewImg.src = imgSrc;
          previewImg.alt = caption || 'Captura da tela do sistema';
        }
        if (previewCaption && caption) {
          previewCaption.textContent = caption;
        }
        if (previewBadge) {
          previewBadge.textContent = badge;
        }
      });
    });
  }

  /**
   * 4. Centralização de Links Externos da Aplicação
   */
  function initExternalLinks() {
    if (typeof window.VDE_CONFIG === 'undefined') return;

    // Vincula botões que apontam para a aplicação de biblioteca
    const appLinks = document.querySelectorAll('[data-link="app-library"]');
    appLinks.forEach(link => {
      link.href = window.VDE_CONFIG.libraryAppUrl;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /**
   * 5. Formulário de Contato Institucional
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackBox = document.getElementById('contact-feedback');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#contact-name')?.value.trim();
      const email = form.querySelector('#contact-email')?.value.trim();
      const message = form.querySelector('#contact-message')?.value.trim();

      if (!name || !email || !message) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Validação simples de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }

      // Feedback amigável
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.innerHTML = `
          <div style="background-color: var(--color-green-tint); border: 1px solid var(--color-green-accent); color: var(--color-green-accent); padding: 16px; border-radius: var(--radius-md); font-weight: 500;">
            Obrigado, <strong>${name}</strong>! Sua mensagem foi registrada. Em breve entraremos em contato através do e-mail <em>${email}</em>.
          </div>
        `;
        form.reset();
        setTimeout(() => {
          feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    });
  }
})();

/**
 * ============================================================================
 * VEM DA ESCOLA — SCRIPT PRINCIPAL (v1 Corrigido)
 * ============================================================================
 * Controle de menu mobile, navegação acessível, galeria de telas,
 * tratamento seguro de formulários e integração com a biblioteca.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeaderScroll();
    initGalleryTabs();
    initLibraryAccess();
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

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * 2. Sombra e Efeito no Header
   */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 15) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  /**
   * 3. Galeria de Telas da Biblioteca
   * Abas acessíveis (setas, Home/End) e ampliação da captura em <dialog>.
   */
  function initGalleryTabs() {
    const tabBtns = Array.from(document.querySelectorAll('.preview-tab-btn'));
    const previewImg = document.getElementById('preview-image');
    const previewCaption = document.getElementById('preview-caption-text');
    const previewBadge = document.getElementById('preview-badge-text');

    if (!tabBtns.length || !previewImg) return;

    function selectTab(btn) {
      tabBtns.forEach(b => {
        const selected = b === btn;
        b.classList.toggle('active', selected);
        b.setAttribute('aria-selected', selected ? 'true' : 'false');
        b.tabIndex = selected ? 0 : -1;
      });

      const imgSrc = btn.getAttribute('data-image');
      const caption = btn.getAttribute('data-caption');
      const badge = btn.getAttribute('data-badge') || btn.textContent.trim();

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
      const frame = previewImg.closest('.ip-gallery-frame');
      if (frame) frame.scrollTop = 0;
    }

    tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => selectTab(btn));
      btn.addEventListener('keydown', (e) => {
        let target = null;
        if (e.key === 'ArrowRight') target = tabBtns[(index + 1) % tabBtns.length];
        if (e.key === 'ArrowLeft') target = tabBtns[(index - 1 + tabBtns.length) % tabBtns.length];
        if (e.key === 'Home') target = tabBtns[0];
        if (e.key === 'End') target = tabBtns[tabBtns.length - 1];
        if (target) {
          e.preventDefault();
          selectTab(target);
          target.focus();
        }
      });
    });

    // Ampliação da captura
    const lightbox = document.getElementById('preview-lightbox');
    const lightboxImg = document.getElementById('preview-lightbox-image');
    const lightboxCaption = document.getElementById('preview-lightbox-caption');
    const zoomBtn = document.querySelector('[data-action="zoom-preview"]');
    if (!lightbox || !lightboxImg || !zoomBtn || typeof lightbox.showModal !== 'function') return;

    zoomBtn.addEventListener('click', () => {
      lightboxImg.src = previewImg.src;
      lightboxImg.alt = previewImg.alt;
      if (lightboxCaption) lightboxCaption.textContent = previewImg.alt;
      lightbox.showModal();
    });

    const closeBtn = lightbox.querySelector('[data-action="close-lightbox"]');
    if (closeBtn) closeBtn.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.close();
    });
  }

  /**
   * 4. Acesso Controlado à Aplicação de Biblioteca
   * O endereço público vem de js/config.js (libraryAppUrl). Sem ele, o botão
   * abre um aviso informativo em vez de redirecionar; nunca aponta para localhost.
   */
  function initLibraryAccess() {
    const appLinks = document.querySelectorAll('[data-link="app-library"]');
    if (!appLinks.length) return;

    const config = window.VDE_CONFIG || {};
    const publicUrl = (config.libraryAppUrl || '').trim();
    const isPublic = /^https:\/\//i.test(publicUrl) && !/^https:\/\/(localhost|127\.|\[::1\])/i.test(publicUrl);
    const status = document.getElementById('library-access-status');

    appLinks.forEach(link => {
      if (isPublic) {
        link.href = publicUrl;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      } else {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showHomologationNotice();
        });
      }
    });

    if (status && isPublic) {
      status.textContent = 'A aplicação abre em uma nova aba.';
    }
  }

  function showHomologationNotice() {
    let dialog = document.getElementById('homologation-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'homologation-dialog';
      dialog.className = 'ip-dialog';
      dialog.setAttribute('aria-labelledby', 'homologation-title');

      const title = document.createElement('h3');
      title.id = 'homologation-title';
      title.className = 'ip-h3';
      title.textContent = 'A aplicação ainda não está disponível ao público';

      const p1 = document.createElement('p');
      p1.className = 'ip-text';
      p1.textContent = 'A Biblioteca Escolar está em fase de homologação e o endereço público ainda não foi publicado.';

      const p2 = document.createElement('p');
      p2.className = 'ip-text';
      p2.textContent = 'Assim que a aplicação estiver disponível, o acesso será feito por este mesmo botão.';

      const actions = document.createElement('div');
      actions.className = 'ip-actions';

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn btn-primary';
      closeBtn.textContent = 'Entendi';
      closeBtn.addEventListener('click', () => dialog.close());
      actions.appendChild(closeBtn);

      // Caminho relativo à página atual, obtido do próprio menu de navegação
      const navContact = document.querySelector('.nav-menu a[href$="contato.html"]');
      if (navContact) {
        const contactBtn = document.createElement('a');
        contactBtn.href = navContact.getAttribute('href');
        contactBtn.className = 'btn btn-secondary';
        contactBtn.textContent = 'Página de contato';
        actions.appendChild(contactBtn);
      }

      dialog.appendChild(title);
      dialog.appendChild(p1);
      dialog.appendChild(p2);
      dialog.appendChild(actions);
      document.body.appendChild(dialog);

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
    }
    dialog.showModal();
  }

  /**
   * 5. Formulário de Contato
   * O formulário só é habilitado quando existe um endpoint de envio em
   * js/config.js (contact.formEndpoint). Sem endpoint ele permanece desativado
   * e nenhuma mensagem é enviada nem simulada.
   * Todo texto é inserido com textContent (sem innerHTML).
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackBox = document.getElementById('contact-feedback');
    if (!form || !feedbackBox) return;

    const config = window.VDE_CONFIG || {};
    const contact = config.contact || {};
    const endpoint = typeof contact.formEndpoint === 'string' && /^https:\/\//i.test(contact.formEndpoint.trim())
      ? contact.formEndpoint.trim()
      : null;
    const email = typeof contact.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())
      ? contact.email.trim()
      : null;

    const fieldset = document.getElementById('contact-fieldset');
    const submitBtn = document.getElementById('contact-submit');
    const submitLabel = document.getElementById('contact-submit-label');
    const statusBox = document.getElementById('contact-status');

    // E-mail institucional: só aparece quando configurado
    const emailRow = document.getElementById('contact-email-channel');
    const emailLink = document.getElementById('contact-email-link');
    if (email && emailRow && emailLink) {
      emailLink.href = 'mailto:' + email;
      emailLink.textContent = email;
      emailRow.hidden = false;
    }

    if (!endpoint) {
      // Sem meio de entrega: o formulário permanece desativado
      form.addEventListener('submit', (e) => e.preventDefault());
      return;
    }

    if (fieldset) fieldset.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    if (submitLabel) submitLabel.textContent = 'Enviar mensagem';
    if (statusBox) statusBox.hidden = true;
    form.removeAttribute('aria-describedby');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const value = id => {
        const field = form.querySelector('#' + id);
        return field ? field.value.trim() : '';
      };
      const name = value('contact-name');
      const emailValue = value('contact-email');
      const role = value('contact-role');
      const subject = value('contact-subject') || 'Contato Institucional';
      const message = value('contact-message');

      if (!name || !emailValue || !message) {
        showFeedback(feedbackBox, 'warning', 'Por favor, preencha todos os campos obrigatórios (*).');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        showFeedback(feedbackBox, 'warning', 'Por favor, insira um endereço de e-mail válido.');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email: emailValue, role, subject, message })
        });
        if (resp.ok) {
          showFeedback(feedbackBox, 'success', `Mensagem enviada. Obrigado, ${name}!`);
          form.reset();
        } else {
          showFeedback(feedbackBox, 'error', 'Houve uma falha no envio. Por favor, tente novamente mais tarde.');
        }
      } catch {
        showFeedback(feedbackBox, 'error', 'Serviço de envio temporariamente indisponível.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function showFeedback(container, type, messageText) {
    container.className = 'form-feedback is-visible is-' + type;
    container.textContent = messageText;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();

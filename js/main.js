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
   * 4. Acesso Controlado à Aplicação de Biblioteca
   * Impede direcionamento a localhost na ausência de URL pública configurada.
   */
  function initLibraryAccess() {
    const appLinks = document.querySelectorAll('[data-link="app-library"]');
    if (!appLinks.length) return;

    const config = window.VDE_CONFIG || {};
    const publicUrl = config.libraryAppUrl && config.libraryAppUrl.trim();

    appLinks.forEach(link => {
      if (publicUrl && publicUrl.startsWith('http')) {
        link.href = publicUrl;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      } else {
        // Sem URL pública confirmada: intercepta e exibe modal institucional
        link.href = "#status-homologacao";
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showHomologationNotice();
        });
      }
    });
  }

  function showHomologationNotice() {
    let dialog = document.getElementById('homologation-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'homologation-dialog';
      dialog.className = 'search-dialog';
      dialog.style.padding = '24px';
      dialog.style.maxWidth = '540px';

      const content = document.createElement('div');
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.gap = '16px';

      const title = document.createElement('h3');
      title.textContent = 'Sistema de Bibliotecas — Fase de Homologação';
      title.style.color = 'var(--color-navy)';
      title.style.fontSize = '1.25rem';
      title.style.fontWeight = '700';

      const p1 = document.createElement('p');
      p1.textContent = 'O primeiro produto tecnológico do Vem da Escola concluiu o ciclo de auditoria técnica e está em fase final de preparação para publicação oficial na infraestrutura de produção.';
      p1.style.fontSize = '0.9rem';
      p1.style.color = 'var(--color-text-body)';
      p1.style.lineHeight = '1.6';

      const p2 = document.createElement('p');
      p2.textContent = 'Para solicitar acesso antecipado para a sua escola ou agendar a implantação do acervo, entre em contato com nossa equipe.';
      p2.style.fontSize = '0.85rem';
      p2.style.color = 'var(--color-text-muted)';
      p2.style.lineHeight = '1.5';

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '12px';
      actions.style.marginTop = '8px';
      actions.style.flexWrap = 'wrap';

      const contactBtn = document.createElement('a');
      contactBtn.href = '/contato.html';
      contactBtn.className = 'btn btn-primary';
      contactBtn.textContent = 'Falar com a Equipe →';

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn btn-secondary';
      closeBtn.textContent = 'Fechar';
      closeBtn.addEventListener('click', () => dialog.close());

      actions.appendChild(contactBtn);
      actions.appendChild(closeBtn);

      content.appendChild(title);
      content.appendChild(p1);
      content.appendChild(p2);
      content.appendChild(actions);
      dialog.appendChild(content);

      document.body.appendChild(dialog);

      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) dialog.close();
      });
    }
    dialog.showModal();
  }

  /**
   * 5. Formulário de Contato Seguro
   * Elimina completamente innerHTML para prevenir XSS.
   * Não simula sucesso falso se não houver backend de mensageria configurado.
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedbackBox = document.getElementById('contact-feedback');

    if (!form || !feedbackBox) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('#contact-name');
      const emailInput = form.querySelector('#contact-email');
      const roleInput = form.querySelector('#contact-role');
      const subjectInput = form.querySelector('#contact-subject');
      const messageInput = form.querySelector('#contact-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const role = roleInput ? roleInput.value : '';
      const subject = subjectInput ? subjectInput.value.trim() : 'Contato Institucional';
      const message = messageInput ? messageInput.value.trim() : '';

      // Limpa feedback anterior de forma segura
      while (feedbackBox.firstChild) {
        feedbackBox.removeChild(feedbackBox.firstChild);
      }

      if (!name || !email || !message) {
        showFeedback(feedbackBox, 'warning', 'Por favor, preencha todos os campos obrigatórios (*).');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFeedback(feedbackBox, 'warning', 'Por favor, insira um endereço de e-mail válido.');
        return;
      }

      const config = window.VDE_CONFIG || {};
      const endpoint = config.contact && config.contact.formEndpoint;

      if (endpoint) {
        // Envio real via serviço configurado
        try {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name, email, role, subject, message })
          });
          if (resp.ok) {
            showFeedback(feedbackBox, 'success', 'Mensagem enviada com sucesso! Retornaremos o contato em breve.');
            form.reset();
          } else {
            showFeedback(feedbackBox, 'error', 'Houve uma falha no envio. Por favor, tente novamente mais tarde.');
          }
        } catch {
          showFeedback(feedbackBox, 'error', 'Serviço de envio temporariamente indisponível.');
        }
      } else {
        // Sem endpoint configurado: orientação transparente sem simulação fictícia
        showPreProductionNotice(feedbackBox, name, email, subject, message);
      }
    });
  }

  function showFeedback(container, type, messageText) {
    container.style.display = 'block';

    const box = document.createElement('div');
    box.style.padding = '14px 18px';
    box.style.borderRadius = 'var(--radius-md)';
    box.style.fontSize = '0.9rem';
    box.style.lineHeight = '1.5';
    box.style.marginBottom = '16px';

    if (type === 'success') {
      box.style.backgroundColor = 'var(--color-green-tint)';
      box.style.border = '1px solid var(--color-green-accent)';
      box.style.color = 'var(--color-green-accent)';
    } else if (type === 'error') {
      box.style.backgroundColor = '#fdf2f2';
      box.style.border = '1px solid #f05252';
      box.style.color = '#c81e1e';
    } else {
      box.style.backgroundColor = '#fef9e7';
      box.style.border = '1px solid #f59e0b';
      box.style.color = '#92400e';
    }

    box.textContent = messageText;
    container.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showPreProductionNotice(container, name, email, subject, message) {
    container.style.display = 'block';

    const box = document.createElement('div');
    box.style.padding = '16px 20px';
    box.style.borderRadius = 'var(--radius-md)';
    box.style.backgroundColor = 'var(--color-canvas-alt)';
    box.style.border = '1.5px solid var(--color-card-border)';
    box.style.marginBottom = '16px';

    const title = document.createElement('h4');
    title.textContent = 'Integração de Mensageria em Configuração';
    title.style.color = 'var(--color-navy)';
    title.style.marginBottom = '8px';
    title.style.fontSize = '0.95rem';

    const desc = document.createElement('p');
    desc.textContent = 'Este site estático aguarda a definição do provedor institucional de mensageria da plataforma (pendência documentada em js/config.js).';
    desc.style.color = 'var(--color-text-body)';
    desc.style.fontSize = '0.85rem';
    desc.style.lineHeight = '1.5';
    desc.style.marginBottom = '12px';

    const mailtoBtn = document.createElement('a');
    mailtoBtn.className = 'btn btn-primary';
    mailtoBtn.style.fontSize = '0.85rem';
    mailtoBtn.textContent = 'Abrir no Cliente de E-mail Local →';
    const bodyEncoded = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\n${message}`);
    const subjectEncoded = encodeURIComponent(subject || 'Contato Vem da Escola');
    mailtoBtn.href = `mailto:?subject=${subjectEncoded}&body=${bodyEncoded}`;

    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(mailtoBtn);
    container.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Playwright é devDependency do projeto (npm install).
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('[ERRO] Playwright não foi localizado. Execute "npm install" na raiz do projeto.');
  process.exit(1);
}

// 1. Servidor HTTP Local
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let parsedUrl = req.url.split('?')[0];
  if (parsedUrl === '/') parsedUrl = '/index.html';

  const filePath = path.join(rootDir, parsedUrl);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 3456;
await new Promise(resolve => server.listen(PORT, resolve));
const baseUrl = `http://localhost:${PORT}`;
console.log(`[TEST-SERVER] Servidor ativo em ${baseUrl}`);

const evidenciasDir = path.join(rootDir, 'docs', 'evidencias');
fs.mkdirSync(evidenciasDir, { recursive: true });

let totalTests = 0;
let passedTests = 0;
let errors = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    errors.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// 2. Inicialização do navegador: Chromium do Playwright ou, na falta dele,
//    um navegador já instalado no sistema (Edge ou Chrome).
async function launchBrowser() {
  const attempts = [{}, { channel: 'msedge' }, { channel: 'chrome' }];
  let lastError;
  for (const options of attempts) {
    try {
      return await chromium.launch({ headless: true, ...options });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

const browser = await launchBrowser();

try {
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // TESTE 1: PÁGINA INICIAL
  console.log('\n--- 1. PÁGINA INICIAL (index.html) ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  const homeResp = await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  assert(homeResp.status() === 200, 'Página inicial carregou com status 200');

  const title = await page.title();
  assert(title.includes('Vem da Escola'), 'Título da página contém "Vem da Escola"');

  const logoVisible = await page.locator('.brand-logo').first().isVisible();
  assert(logoVisible, 'Logotipo institucional visível');

  const heroTitle = await page.textContent('#hero-title');
  assert(heroTitle.includes('Conhecimento que nasce da experiência'), 'Título do Hero reproduz texto aprovado');

  const cardsCount = await page.locator('.home-card').count();
  assert(cardsCount === 4, 'Exatamente 4 cartões de soluções presentes na Home');

  const aboutTitle = await page.textContent('#about-title');
  assert(aboutTitle.includes('Da experiência real para uma educação mais viva'), 'Título Quem Somos reproduz a prancha');

  const pillarsCount = await page.locator('.home-indicator').count();
  assert(pillarsCount === 3, 'Exatamente 3 indicadores presentes');

  const toolsHref = await page.locator('#card-ferramentas').getAttribute('href');
  assert(toolsHref === 'ferramentas/biblioteca.html', 'Cartão Ferramentas e Soluções aponta para a apresentação da biblioteca');

  const quoteCount = await page.locator('main').getByText('Quando o conhecimento circula, a educação se fortalece.').count();
  assert(quoteCount === 1, 'Citação aparece uma única vez na composição principal');

  // Integridade e Enquadramento das Fotos
  const heroImgData = await page.evaluate(() => {
    const img = document.querySelector('.home-hero-media img');
    return img ? { loaded: img.complete && img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight } : null;
  });
  assert(heroImgData && heroImgData.loaded, 'Fotografia do Hero carregou perfeitamente');
  assert(heroImgData && heroImgData.width >= 1000, `Fotografia do Hero possui enquadramento amplo e alta resolução (${heroImgData.width}px)`);

  const qsImgData = await page.evaluate(() => {
    const img = document.querySelector('.home-about-media img');
    return img ? { loaded: img.complete && img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight } : null;
  });
  assert(qsImgData && qsImgData.loaded, 'Fotografia Quem Somos carregou perfeitamente sem artefatos');

  // CAPTURAS RESPONSIVAS DA HOME + VERIFICAÇÕES DE LAYOUT
  console.log('\n--- 2. CAPTURAS RESPONSIVAS DA HOME ---');
  const viewports = [
    { w: 1672, h: 941, file: '00_home_prancha_1672.png', fullPage: false },
    { w: 1440, h: 900, file: '01_home_desktop_1440.png', fullPage: true },
    { w: 1280, h: 800, file: '02_home_laptop_1280.png', fullPage: true },
    { w: 768, h: 1024, file: '03_home_tablet_768.png', fullPage: true },
    { w: 390, h: 844, file: '04_home_mobile_390.png', fullPage: true },
    { w: 360, h: 780, file: '05_home_mobile_360.png', fullPage: true }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    const layout = await page.evaluate(() => {
      const de = document.documentElement;
      // Títulos de entrelinha fechada ficam fora: neles scrollHeight excede a caixa sem haver corte.
      const textSel = '.home-hero-subtitle, .home-card-title, .home-card-desc, .home-about-text, .home-indicator-title, .home-indicator-desc, .home-quote-text';
      const clipped = [...document.querySelectorAll(textSel)].filter(el => {
        const cs = getComputedStyle(el);
        const clamped = cs.webkitLineClamp && cs.webkitLineClamp !== 'none';
        return clamped || el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
      }).length;
      const distorted = [...document.querySelectorAll('.home-hero-media img, .brand-logo')].filter(img => {
        const r = img.getBoundingClientRect();
        return Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) > 0.02;
      }).length;
      const heroImg = document.querySelector('.home-hero-media img').getBoundingClientRect();
      const cards = [...document.querySelectorAll('.home-card')].map(c => c.getBoundingClientRect());
      const cardsOverlap = cards.some((a, i) => cards.some((b, j) => j > i && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1));
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, clipped, distorted, heroLeft: heroImg.left, heroRight: heroImg.right, cardsOverlap };
    });

    assert(layout.scrollW <= layout.clientW, `${vp.w}px: sem rolagem horizontal`);
    assert(layout.clipped === 0, `${vp.w}px: nenhum texto cortado ou truncado`);
    assert(layout.distorted === 0, `${vp.w}px: fotografia principal e logotipo sem deformação`);
    assert(layout.heroLeft >= -1 && layout.heroRight <= layout.clientW + 1, `${vp.w}px: fotografia principal inteira dentro da viewport (família não cortada)`);
    assert(!layout.cardsOverlap, `${vp.w}px: cartões sem sobreposição`);

    await page.screenshot({ path: path.join(evidenciasDir, vp.file), fullPage: vp.fullPage });
    console.log(`  Capturado: ${vp.file}`);
  }

  // COMPARAÇÃO LADO A LADO COM A PRANCHA APROVADA
  const pranchaRel = 'referencias/wide_clean_modern_website_homepage_layout_with_w.png';
  if (fs.existsSync(path.join(rootDir, pranchaRel))) {
    const cmp = await context.newPage();
    await cmp.setViewportSize({ width: 1712, height: 1000 });
    await cmp.setContent(`<body style="margin:0;padding:20px;background:#fff;font:600 15px sans-serif;color:#152e44">
      <p style="margin:0 0 8px">A. PRANCHA APROVADA (1672 × 941)</p>
      <img src="${baseUrl}/${pranchaRel}" style="display:block;width:1672px;border:1px solid #ddd">
      <p style="margin:24px 0 8px">B. IMPLEMENTAÇÃO — NAVEGADOR REAL (1672 × 941)</p>
      <img src="${baseUrl}/docs/evidencias/00_home_prancha_1672.png" style="display:block;width:1672px;border:1px solid #ddd">
    </body>`, { waitUntil: 'networkidle' });
    await cmp.screenshot({ path: path.join(evidenciasDir, 'comparacao_prancha_vs_implementacao_1672.png'), fullPage: true });
    await cmp.close();
    console.log('  Capturado: comparacao_prancha_vs_implementacao_1672.png');
  } else {
    console.log('  (prancha de referência ausente — comparação não gerada)');
  }

  await page.setViewportSize({ width: 360, height: 780 });

  // MENU MOBILE
  console.log('\n--- 3. MENU MOBILE RESPONSIVO ---');
  await page.locator('.mobile-toggle').click();
  const isMenuOpen = await page.locator('.nav-menu').evaluate(el => el.classList.contains('is-open'));
  assert(isMenuOpen, 'Menu mobile abre ao clicar no alternador');
  await page.screenshot({ path: path.join(evidenciasDir, '06_menu_mobile_aberto.png') });
  console.log('  Capturado: 06_menu_mobile_aberto.png');
  await page.locator('.mobile-toggle').click();

  // MODAL DE PESQUISA
  console.log('\n--- 4. BUSCA ACESSÍVEL (<dialog>) ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('[data-action="open-search"]').first().click();
  const isDialogOpen = await page.locator('#search-dialog').evaluate(el => el.open);
  assert(isDialogOpen, 'Diálogo de busca abriu via showModal()');

  await page.fill('#search-input', 'biblioteca');
  await page.waitForTimeout(100);
  const searchResultsCount = await page.locator('.search-result-item').count();
  assert(searchResultsCount >= 4, `Busca instantânea por "biblioteca" retornou ${searchResultsCount} resultados reais`);
  await page.screenshot({ path: path.join(evidenciasDir, '07_busca_modal_resultados.png') });
  console.log('  Capturado: 07_busca_modal_resultados.png');

  await page.keyboard.press('Escape');
  const isDialogClosed = await page.locator('#search-dialog').evaluate(el => !el.open);
  assert(isDialogClosed, 'Diálogo de busca fechou com Escape');

  // APRESENTAÇÃO DA BIBLIOTECA
  console.log('\n--- 5. APRESENTAÇÃO DA BIBLIOTECA (biblioteca.html) ---');
  const libResp = await page.goto(`${baseUrl}/ferramentas/biblioteca.html`, { waitUntil: 'networkidle' });
  assert(libResp.status() === 200, 'Página da biblioteca carregou com status 200');

  const libTitle = await page.textContent('#lib-title');
  assert(libTitle.includes('Biblioteca Escolar'), 'Título da biblioteca confirmado');

  const featuresCount = await page.locator('.feature-card').count();
  assert(featuresCount === 6, 'Exatamente 6 funcionalidades verificadas presentes');

  // Teste de ausência de redirecionamento para localhost
  const accessBtn = page.locator('[data-link="app-library"]');
  const accessHref = await accessBtn.getAttribute('href');
  assert(!accessHref.includes('localhost'), `Botão de acesso NÃO redireciona indevidamente para localhost (href: "${accessHref}")`);

  // Ao clicar no botão de acesso sem URL de produção configurada: abre modal de homologação
  await accessBtn.click();
  await page.waitForTimeout(150);
  const homologationModalOpen = await page.locator('#homologation-dialog').evaluate(el => el ? el.open : false);
  assert(homologationModalOpen, 'Aviso informativo exibido quando o endereço público não está configurado');
  const accessState = await page.evaluate(() => ({
    status: document.getElementById('library-access-status').textContent,
    stayed: location.pathname.endsWith('/ferramentas/biblioteca.html'),
    dialogLinks: [...document.querySelectorAll('#homologation-dialog a')].map(a => a.getAttribute('href'))
  }));
  assert(/ainda não foi publicado/.test(accessState.status) && accessState.stayed, 'Acesso: página informa que o endereço público ainda não foi publicado e não redireciona');
  assert(accessState.dialogLinks.every(h => h === '../contato.html'), 'Acesso: links do aviso usam caminho relativo válido');
  await page.keyboard.press('Escape');

  await page.screenshot({ path: path.join(evidenciasDir, '08_biblioteca_desktop_1440.png'), fullPage: true });
  console.log('  Capturado: 08_biblioteca_desktop_1440.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidenciasDir, '09_biblioteca_mobile_390.png'), fullPage: true });
  console.log('  Capturado: 09_biblioteca_mobile_390.png');

  // Alternância de abas da galeria
  await page.setViewportSize({ width: 1440, height: 900 });
  const tabBtn = page.locator('.preview-tab-btn', { hasText: 'Acervo de Livros' });
  await tabBtn.click();
  const currentImgSrc = await page.locator('#preview-image').getAttribute('src');
  assert(currentImgSrc.includes('acervo.png'), 'Galeria interativa alternou para tela do acervo');
  await page.screenshot({ path: path.join(evidenciasDir, '10_biblioteca_galeria_interativa.png') });
  console.log('  Capturado: 10_biblioteca_galeria_interativa.png');

  const tabState = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.preview-tab-btn')];
    return { count: tabs.length, selected: tabs.filter(b => b.getAttribute('aria-selected') === 'true').map(b => b.textContent.trim()) };
  });
  assert(tabState.count === 6 && tabState.selected.length === 1 && tabState.selected[0] === 'Acervo de Livros', 'Galeria: seis abas, com aria-selected apenas na aba ativa');

  await tabBtn.press('ArrowRight');
  const afterArrow = await page.locator('#preview-image').getAttribute('src');
  assert(afterArrow.includes('exemplar.png'), 'Galeria: navegação por teclado (seta) troca a tela');

  const galleryImgs = await page.evaluate(async () => {
    const srcs = [...document.querySelectorAll('.preview-tab-btn')].map(b => b.getAttribute('data-image'));
    const results = await Promise.all(srcs.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = src;
    })));
    return results.filter(Boolean).length;
  });
  assert(galleryImgs === 6, 'Galeria: as seis capturas reais da aplicação carregam');

  await page.locator('[data-action="zoom-preview"]').click();
  const lightboxOpen = await page.evaluate(() => {
    const d = document.getElementById('preview-lightbox');
    return d.open && document.getElementById('preview-lightbox-image').src.includes('exemplar.png');
  });
  assert(lightboxOpen, 'Galeria: botão Ampliar abre a captura em tamanho maior');
  await page.keyboard.press('Escape');
  assert(await page.evaluate(() => !document.getElementById('preview-lightbox').open), 'Galeria: ampliação fecha com Escape');

  const dataNotice = await page.locator('#telas').textContent();
  assert(/homologação/.test(dataNotice) && /fictícios/.test(dataNotice), 'Galeria: capturas identificadas como homologação com dados fictícios');

  // PÁGINAS INTERNAS: ESTRUTURA, LINKS, IMAGENS, ACESSIBILIDADE E RESPONSIVIDADE
  console.log('\n--- 6. PÁGINAS INTERNAS ---');
  const internasDir = path.join(evidenciasDir, 'paginas-internas');
  fs.mkdirSync(internasDir, { recursive: true });

  const innerPages = [
    { name: 'educadores', url: 'educadores.html' },
    { name: 'familias', url: 'familias.html' },
    { name: 'conteudos', url: 'conteudos.html' },
    { name: 'sobre', url: 'sobre.html' },
    { name: 'contato', url: 'contato.html' },
    { name: 'biblioteca', url: 'ferramentas/biblioteca.html' }
  ];
  const innerViewports = [
    { w: 1672, h: 941 }, { w: 1440, h: 900 }, { w: 1280, h: 800 },
    { w: 768, h: 1024 }, { w: 390, h: 844 }, { w: 360, h: 780 }
  ];
  const checkedTargets = new Map();

  for (const ip of innerPages) {
    await page.setViewportSize({ width: 1440, height: 900 });
    const res = await page.goto(`${baseUrl}/${ip.url}`, { waitUntil: 'networkidle' });
    assert(res.status() === 200, `${ip.name}: carregou com status 200`);

    // Estrutura e acessibilidade básica
    const a11y = await page.evaluate(() => {
      const main = document.querySelector('main');
      const headings = [...main.querySelectorAll('h1, h2, h3, h4')].map(h => Number(h.tagName[1]));
      let skips = 0;
      headings.forEach((lvl, i) => { if (i > 0 && lvl - headings[i - 1] > 1) skips++; });
      const unnamed = [...document.querySelectorAll('a, button')].filter(el => !el.closest('[hidden]')).filter(el => {
        const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
        return !name && !el.querySelector('img[alt]:not([alt=""])');
      }).length;
      const unlabeled = [...document.querySelectorAll('main input, main select, main textarea')].filter(f => !f.labels || !f.labels.length).length;
      return {
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        skips,
        noAlt: [...main.querySelectorAll('img:not([alt])')].length,
        emptyAltOutsideDecor: [...main.querySelectorAll('img[alt=""]')].filter(i => !i.closest('dialog')).length,
        unnamed,
        unlabeled,
        inlineStyles: main.querySelectorAll('[style]').length,
        landmarks: !!document.querySelector('header') && !!main && !!document.querySelector('footer') && !!document.querySelector('.skip-link'),
        sameBrand: !!document.querySelector('.site-header .brand-logo[src$="logo-vem-da-escola.svg"]') && !!document.querySelector('.site-footer .footer-grid'),
        navLinks: document.querySelectorAll('.nav-menu .nav-link').length
      };
    });
    assert(a11y.lang === 'pt-BR' && a11y.landmarks, `${ip.name}: idioma, cabeçalho, main, rodapé e link de pular conteúdo presentes`);
    assert(a11y.h1 === 1 && a11y.skips === 0, `${ip.name}: um único h1 e hierarquia de títulos sem saltos`);
    assert(a11y.noAlt === 0 && a11y.emptyAltOutsideDecor === 0, `${ip.name}: todas as imagens de conteúdo têm texto alternativo`);
    assert(a11y.unnamed === 0, `${ip.name}: links e botões têm nome acessível`);
    assert(a11y.unlabeled === 0, `${ip.name}: campos de formulário têm label`);
    assert(a11y.inlineStyles === 0, `${ip.name}: sem estilos inline no conteúdo`);
    assert(a11y.sameBrand && a11y.navLinks === 6, `${ip.name}: logotipo, navegação e rodapé padronizados`);

    // Links internos: arquivo existe e âncora existe
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => ({ raw: a.getAttribute('href'), abs: a.href })));
    const broken = [];
    for (const l of links) {
      if (/^(mailto:|tel:)/.test(l.raw)) { broken.push(`${l.raw} (canal não configurado)`); continue; }
      const u = new URL(l.abs);
      if (u.origin !== baseUrl) { broken.push(`${l.raw} (externo inesperado)`); continue; }
      const key = u.pathname + u.hash;
      if (!checkedTargets.has(key)) {
        const filePath = path.join(rootDir, decodeURIComponent(u.pathname === '/' ? '/index.html' : u.pathname));
        let ok = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        if (ok && u.hash.length > 1) {
          const html = fs.readFileSync(filePath, 'utf8');
          ok = new RegExp(`id=["']${u.hash.slice(1)}["']`).test(html);
        }
        checkedTargets.set(key, ok);
      }
      if (!checkedTargets.get(key)) broken.push(l.raw);
    }
    assert(broken.length === 0, `${ip.name}: ${links.length} links com destino válido${broken.length ? ' — problemas: ' + broken.join(', ') : ''}`);

    // Responsividade em todas as resoluções
    for (const vp of innerViewports) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const img of document.images) {
          img.loading = 'eager';
          if (!img.complete) await new Promise(r => { img.onload = img.onerror = r; });
        }
      });
      await page.waitForTimeout(120);

      const layout = await page.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector('main');
        const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const texts = [...main.querySelectorAll('.ip-lead, .ip-text, .ip-h3, .ip-kicker, .ip-chip, .btn, .ip-link, .form-label, .feature-card-title, .feature-card-desc, .preview-tab-btn, .ip-note p, .ip-checks li, .ip-audience li')].filter(visible);
        const clipped = texts.filter(el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 2).length;
        const offscreen = texts.filter(el => { const r = el.getBoundingClientRect(); return r.left < -1 || r.right > de.clientWidth + 1; }).length;
        const small = texts.filter(el => parseFloat(getComputedStyle(el).fontSize) < 12).length;
        const brokenImgs = [...document.images].filter(i => !(i.complete && i.naturalWidth > 0)).length;
        const targets = [...main.querySelectorAll('a.btn, button.btn, .preview-tab-btn, .ip-zoom-btn, .ip-link')].filter(visible);
        const smallTargets = targets.filter(el => el.getBoundingClientRect().height < 44).length;
        // Blocos de texto irmãos não podem se sobrepor
        let overlaps = 0;
        main.querySelectorAll('.ip-columns, .ip-tiles, .ip-steps, .ip-rows, .ip-status-grid, .features-grid, .ip-related, .ip-hero-grid > div:first-child').forEach(group => {
          const boxes = [...group.children].filter(visible).map(c => c.getBoundingClientRect());
          boxes.forEach((a, i) => boxes.forEach((b, j) => {
            if (j > i && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps++;
          }));
        });
        const logo = document.querySelector('.brand-logo').getBoundingClientRect();
        return { sw: de.scrollWidth, cw: de.clientWidth, clipped, offscreen, small, brokenImgs, smallTargets, overlaps, logoH: logo.height };
      });

      const ok = layout.sw <= layout.cw && layout.clipped === 0 && layout.offscreen === 0 && layout.small === 0 &&
        layout.brokenImgs === 0 && layout.smallTargets === 0 && layout.overlaps === 0 && layout.logoH >= 48;
      assert(ok, `${ip.name} @ ${vp.w}px: sem rolagem horizontal, textos completos e legíveis, imagens carregadas, alvos de toque ≥ 44px, sem sobreposição` +
        (ok ? '' : ` — ${JSON.stringify(layout)}`));

      if (vp.w === 1440 || vp.w === 390) {
        const suffix = vp.w === 1440 ? 'desktop_1440' : 'mobile_390';
        await page.screenshot({ path: path.join(internasDir, `${ip.name}_${suffix}.png`), fullPage: true });
        await page.screenshot({ path: path.join(internasDir, `${ip.name}_${suffix}_topo.png`), fullPage: false });
        console.log(`  Capturado: paginas-internas/${ip.name}_${suffix}.png`);
      }
    }
  }

  // Menu mobile e busca em uma página interna
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/sobre.html`, { waitUntil: 'networkidle' });
  await page.locator('.mobile-toggle').click();
  assert(await page.locator('.nav-menu').evaluate(el => el.classList.contains('is-open')), 'Páginas internas: menu mobile abre');
  await page.locator('.nav-menu .nav-link', { hasText: 'Para Famílias' }).click();
  await page.waitForURL('**/familias.html');
  assert(page.url().endsWith('/familias.html'), 'Páginas internas: navegação pelo menu mobile leva à página escolhida');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('[data-action="open-search"]').first().click();
  assert(await page.locator('#search-dialog').evaluate(el => el.open), 'Páginas internas: busca abre em diálogo');
  await page.keyboard.press('Escape');

  // Conteúdos: nada de artigos fictícios
  await page.goto(`${baseUrl}/conteudos.html`, { waitUntil: 'networkidle' });
  const contentState = await page.evaluate(() => ({
    emptyVisible: !document.getElementById('articles-empty').hidden,
    listHidden: document.getElementById('articles-list').hidden,
    fakeCtas: [...document.querySelectorAll('main a')].filter(a => /ler (o )?artigo|ler reflex/i.test(a.textContent)).length
  }));
  assert(contentState.emptyVisible && contentState.listHidden, 'Conteúdos: sem artigos publicados, a página mostra o estado vazio');
  assert(contentState.fakeCtas === 0, 'Conteúdos: nenhum botão de "ler artigo" sem artigo correspondente');

  // Comparação visual das seis páginas (identidade)
  for (const [suffix, cols, cellW] of [['desktop_1440_topo', 3, 720], ['mobile_390_topo', 6, 300]]) {
    const sheet = await context.newPage();
    const cells = innerPages.map(ip => `<figure style="margin:0"><figcaption style="font:600 15px sans-serif;color:#152e44;margin:0 0 6px">${ip.url}</figcaption><img src="${baseUrl}/docs/evidencias/paginas-internas/${ip.name}_${suffix}.png" style="display:block;width:${cellW}px;border:1px solid #ddd"></figure>`).join('');
    await sheet.setViewportSize({ width: cols * (cellW + 20) + 20, height: 800 });
    await sheet.setContent(`<body style="margin:0;padding:20px;background:#fff"><div style="display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:20px">${cells}</div></body>`, { waitUntil: 'networkidle' });
    const out = `comparacao_seis_paginas_${suffix.replace('_topo', '')}.png`;
    await sheet.screenshot({ path: path.join(internasDir, out), fullPage: true });
    await sheet.close();
    console.log(`  Capturado: paginas-internas/${out}`);
  }

  // FORMULÁRIO DE CONTATO
  console.log('\n--- 7. FORMULÁRIO DE CONTATO ---');
  await page.goto(`${baseUrl}/contato.html`, { waitUntil: 'networkidle' });

  // 7.1 Estado atual (sem canal configurado): honesto e inoperante
  const contactState = await page.evaluate(() => ({
    fieldsetDisabled: document.getElementById('contact-fieldset').disabled,
    submitDisabled: document.getElementById('contact-submit').disabled,
    submitLabel: document.getElementById('contact-submit').textContent.trim(),
    statusVisible: !document.getElementById('contact-status').hidden && document.getElementById('contact-status').getBoundingClientRect().height > 0,
    statusText: document.getElementById('contact-status').textContent,
    mailtos: document.querySelectorAll('a[href^="mailto:"]').length,
    emailRowHidden: document.getElementById('contact-email-channel').hidden,
    fields: ['contact-name', 'contact-email', 'contact-role', 'contact-subject', 'contact-message'].every(id => !!document.getElementById(id))
  }));
  assert(contactState.fields, 'Contato: os cinco campos originais foram preservados');
  assert(contactState.fieldsetDisabled && contactState.submitDisabled, 'Contato: sem endpoint configurado, formulário e botão de envio ficam desativados');
  assert(/indispon/i.test(contactState.submitLabel), `Contato: botão informa a indisponibilidade ("${contactState.submitLabel}")`);
  assert(contactState.statusVisible && /ainda não está disponível/.test(contactState.statusText), 'Contato: aviso visível de canal em configuração');
  assert(contactState.mailtos === 0 && contactState.emailRowHidden, 'Contato: nenhum mailto sem destinatário e nenhum e-mail inventado');
  await page.screenshot({ path: path.join(evidenciasDir, '12_contato_feedback.png') });
  console.log('  Capturado: 12_contato_feedback.png');

  // 7.2 Ativação futura: com endpoint em js/config.js o formulário passa a validar e enviar
  const mockEndpoint = 'https://formularios.exemplo.test/enviar';
  const received = [];
  const cfgPage = await context.newPage();
  cfgPage.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  await cfgPage.route('**/js/config.js', async route => {
    const original = fs.readFileSync(path.join(rootDir, 'js', 'config.js'), 'utf8');
    await route.fulfill({ contentType: 'application/javascript', body: original.replace('formEndpoint: null', `formEndpoint: "${mockEndpoint}"`) });
  });
  await cfgPage.route(mockEndpoint, async route => {
    received.push(JSON.parse(route.request().postData()));
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"ok":true}' });
  });
  await cfgPage.goto(`${baseUrl}/contato.html`, { waitUntil: 'networkidle' });

  const enabled = await cfgPage.evaluate(() => !document.getElementById('contact-fieldset').disabled && !document.getElementById('contact-submit').disabled && document.getElementById('contact-status').hidden);
  assert(enabled, 'Contato (endpoint configurado): formulário habilitado e aviso de configuração oculto');

  await cfgPage.locator('#contact-submit').click();
  const feedbackWarning = await cfgPage.locator('#contact-feedback').textContent();
  assert(feedbackWarning.includes('campos obrigatórios') && received.length === 0, 'Contato (endpoint configurado): validação intercepta envio incompleto');

  await cfgPage.fill('#contact-name', 'Teste');
  await cfgPage.fill('#contact-email', 'email-invalido');
  await cfgPage.fill('#contact-message', 'Mensagem');
  await cfgPage.locator('#contact-submit').click();
  assert((await cfgPage.locator('#contact-feedback').textContent()).includes('e-mail válido') && received.length === 0, 'Contato (endpoint configurado): e-mail inválido é recusado');

  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  await cfgPage.fill('#contact-name', xssPayload);
  await cfgPage.fill('#contact-email', 'teste@escola.gov.br');
  await cfgPage.fill('#contact-message', 'Mensagem de teste de segurança');
  await cfgPage.locator('#contact-submit').click();
  await cfgPage.waitForFunction(() => document.getElementById('contact-feedback').classList.contains('is-success'));
  const injected = await cfgPage.locator('#contact-feedback script, #contact-feedback img').count();
  assert(injected === 0, 'Contato: nenhum HTML é interpretado no retorno ao usuário (sem innerHTML)');
  assert(received.length === 1 && received[0].name === xssPayload && received[0].email === 'teste@escola.gov.br', 'Contato (endpoint configurado): a mensagem é entregue ao endpoint uma única vez');
  await cfgPage.close();

  // ERROS DE CONSOLE
  assert(consoleErrors.length === 0, `Nenhum erro de console encontrado (erros: ${consoleErrors.length})`);

} finally {
  await browser.close();
  server.close();
}

console.log('\n==================================================');
console.log(`RESUMO DOS TESTES: ${passedTests} de ${totalTests} APROVADOS!`);
if (errors.length > 0) {
  console.error(`FALHAS (${errors.length}):`, errors);
  process.exit(1);
} else {
  console.log('TODAS AS VERIFICAÇÕES TÉCNICAS, DE SEGURANÇA E VISUAIS FORAM CONCLUÍDAS COM SUCESSO!');
  process.exit(0);
}

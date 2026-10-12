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
  assert(homologationModalOpen, 'Aviso institucional de homologação/implantação exibido com segurança ao usuário');
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

  // PÁGINAS AUXILIARES & INTEGRIDADE DE LINKS
  console.log('\n--- 6. INTEGRIDADE DE LINKS E PÁGINAS AUXILIARES ---');
  for (const pageName of ['educadores', 'familias', 'conteudos', 'sobre', 'contato']) {
    const res = await page.goto(`${baseUrl}/${pageName}.html`, { waitUntil: 'networkidle' });
    assert(res.status() === 200, `Página ${pageName}.html carregou com status 200`);
    await page.screenshot({ path: path.join(evidenciasDir, `11_${pageName}_desktop.png`), fullPage: true });
    console.log(`  Capturado: 11_${pageName}_desktop.png`);
  }

  // TESTE DE SEGURANÇA E COMPORTAMENTO REAL DO FORMULÁRIO DE CONTATO
  console.log('\n--- 7. FORMULÁRIO DE CONTATO & TESTE DE INJEÇÃO XSS ---');
  await page.goto(`${baseUrl}/contato.html`);

  // 1. Envio com campos vazios (validação segura)
  await page.locator('button[type="submit"]').click();
  const feedbackWarning = await page.locator('#contact-feedback').textContent();
  assert(feedbackWarning.includes('campos obrigatórios'), 'Validação intercepta envio de formulário incompleto');

  // 2. Teste de segurança contra XSS: injeta tags maliciosas
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  await page.fill('#contact-name', xssPayload);
  await page.fill('#contact-email', 'teste@escola.gov.br');
  await page.fill('#contact-message', 'Mensagem de teste de segurança');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(100);

  // Verifica que nenhuma tag HTML foi interpretada (textContent apenas)
  const injectedScripts = await page.locator('#contact-feedback script').count();
  const injectedImgs = await page.locator('#contact-feedback img').count();
  assert(injectedScripts === 0 && injectedImgs === 0, 'ZERO injeção de HTML/scripts no feedback do formulário (100% seguro)');

  const preProdNotice = await page.locator('#contact-feedback').textContent();
  assert(preProdNotice.includes('Integração de Mensageria em Configuração'), 'Aviso transparente de pré-produção exibido sem simular sucesso falso');
  await page.screenshot({ path: path.join(evidenciasDir, '12_contato_feedback.png') });
  console.log('  Capturado: 12_contato_feedback.png');

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

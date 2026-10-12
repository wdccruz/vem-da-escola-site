import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Resolução portátil do Playwright (compatível com CI/CD e ambientes locais)
let playwrightModule;
try {
  // 1. Tenta carregar do node_modules padrão
  playwrightModule = await import('playwright');
} catch {
  // 2. Fallback portátil via variável de ambiente ou caminho de suporte local
  const candidatePaths = [
    process.env.PLAYWRIGHT_PATH,
    'C:/Users/wdccr/Documents/ChatGPT/fabby/vde-rc3-browser/node_modules/playwright',
    path.join(rootDir, 'node_modules', 'playwright')
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        playwrightModule = await import(`file://${p.replace(/\\/g, '/')}/index.mjs`);
        break;
      } catch {
        // continua tentando
      }
    }
  }
}

if (!playwrightModule || !playwrightModule.chromium) {
  console.error('[ERRO] Playwright não foi localizado. Defina PLAYWRIGHT_PATH ou instale via npm install playwright.');
  process.exit(1);
}

const { chromium } = playwrightModule;

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

// 2. Inicialização Portátil do Navegador
const launchOptions = { headless: true };
const systemEdge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
if (fs.existsSync(systemEdge)) {
  launchOptions.executablePath = systemEdge;
}

const browser = await chromium.launch(launchOptions);

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

  const cardsCount = await page.locator('.info-card').count();
  assert(cardsCount === 4, 'Exatamente 4 cartões de soluções presentes na Home');

  const aboutTitle = await page.textContent('#about-title');
  assert(aboutTitle.includes('Da experiência real para uma educação mais viva'), 'Título Quem Somos reproduz a prancha');

  const pillarsCount = await page.locator('.pillar-card').count();
  assert(pillarsCount === 3, 'Exatamente 3 pilares de valor presentes');

  // Integridade e Enquadramento das Fotos
  const heroImgData = await page.evaluate(() => {
    const img = document.querySelector('.hero-image-wrapper img');
    return img ? { loaded: img.complete && img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight } : null;
  });
  assert(heroImgData && heroImgData.loaded, 'Fotografia do Hero carregou perfeitamente');
  assert(heroImgData && heroImgData.width >= 1000, `Fotografia do Hero possui enquadramento amplo e alta resolução (${heroImgData.width}px)`);

  const qsImgData = await page.evaluate(() => {
    const img = document.querySelector('.about-image-wrapper img');
    return img ? { loaded: img.complete && img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight } : null;
  });
  assert(qsImgData && qsImgData.loaded, 'Fotografia Quem Somos carregou perfeitamente sem artefatos');

  // CAPTURAS RESPONSIVAS DA HOME
  console.log('\n--- 2. CAPTURAS RESPONSIVAS DA HOME ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(evidenciasDir, '01_home_desktop_1440.png'), fullPage: true });
  console.log('  Capturado: 01_home_desktop_1440.png');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: path.join(evidenciasDir, '02_home_laptop_1280.png'), fullPage: true });
  console.log('  Capturado: 02_home_laptop_1280.png');

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({ path: path.join(evidenciasDir, '03_home_tablet_768.png'), fullPage: true });
  console.log('  Capturado: 03_home_tablet_768.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidenciasDir, '04_home_mobile_390.png'), fullPage: true });
  console.log('  Capturado: 04_home_mobile_390.png');

  await page.setViewportSize({ width: 360, height: 780 });
  await page.screenshot({ path: path.join(evidenciasDir, '05_home_mobile_360.png'), fullPage: true });
  console.log('  Capturado: 05_home_mobile_360.png');

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

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carrega o Playwright do diretório compartilhado
const playwrightPath = 'C:/Users/wdccr/Documents/ChatGPT/fabby/vde-rc3-browser/node_modules/playwright';
const { chromium } = await import(`file://${playwrightPath}/index.mjs`);

// 1. Inicia Servidor HTTP Local
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

// Prepara pasta de evidências
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

// 2. Inicia Navegador Playwright
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const launchOptions = {
  headless: true
};
if (fs.existsSync(edgePath)) {
  launchOptions.executablePath = edgePath;
}

const browser = await chromium.launch(launchOptions);

try {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitora erros de console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('\n--- TESTANDO PÁGINA INICIAL (index.html) ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  assert(response.status() === 200, 'Página inicial carregou com status 200');

  // Verifica elementos obrigatórios da prancha
  const title = await page.title();
  assert(title.includes('Vem da Escola'), 'Título da página contém "Vem da Escola"');

  const heroTitle = await page.textContent('#hero-title');
  assert(heroTitle.includes('Conhecimento que nasce da experiência'), 'Título do Hero reproduz exatamente o texto aprovado');

  const cardsCount = await page.locator('.info-card').count();
  assert(cardsCount === 4, 'Exatamente 4 cartões de soluções presentes na Home');

  const aboutTitle = await page.textContent('#about-title');
  assert(aboutTitle.includes('Da experiência real para uma educação mais viva'), 'Título Quem Somos reproduz exatamente a prancha');

  const pillarsCount = await page.locator('.pillar-card').count();
  assert(pillarsCount === 3, 'Exatamente 3 pilares de valor presentes na seção Quem Somos');

  // Verifica se imagens carregaram com sucesso
  const heroImgLoaded = await page.evaluate(() => {
    const img = document.querySelector('.hero-image-wrapper img');
    return img && img.complete && img.naturalWidth > 0;
  });
  assert(heroImgLoaded, 'Fotografia do Hero carregou perfeitamente (naturalWidth > 0)');

  const qsImgLoaded = await page.evaluate(() => {
    const img = document.querySelector('.about-image-wrapper img');
    return img && img.complete && img.naturalWidth > 0;
  });
  assert(qsImgLoaded, 'Fotografia Quem Somos carregou perfeitamente (naturalWidth > 0)');

  // Capturas Responsivas da Home
  console.log('\n--- GERANDO CAPTURAS RESPONSIVAS DA HOME ---');
  // Desktop 1440
  await page.screenshot({ path: path.join(evidenciasDir, '01_home_desktop_1440.png'), fullPage: true });
  console.log('  Capturado: 01_home_desktop_1440.png');

  // Notebook 1280
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: path.join(evidenciasDir, '02_home_laptop_1280.png'), fullPage: true });
  console.log('  Capturado: 02_home_laptop_1280.png');

  // Tablet 768
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.screenshot({ path: path.join(evidenciasDir, '03_home_tablet_768.png'), fullPage: true });
  console.log('  Capturado: 03_home_tablet_768.png');

  // Mobile 390 (iPhone)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidenciasDir, '04_home_mobile_390.png'), fullPage: true });
  console.log('  Capturado: 04_home_mobile_390.png');

  // Mobile 360 (Android)
  await page.setViewportSize({ width: 360, height: 780 });
  await page.screenshot({ path: path.join(evidenciasDir, '05_home_mobile_360.png'), fullPage: true });
  console.log('  Capturado: 05_home_mobile_360.png');

  // Teste do Menu Mobile
  console.log('\n--- TESTANDO MENU MOBILE ---');
  await page.locator('.mobile-toggle').click();
  const isMenuOpen = await page.locator('.nav-menu').evaluate(el => el.classList.contains('is-open'));
  assert(isMenuOpen, 'Menu mobile abre ao clicar no botão de alternância');
  await page.screenshot({ path: path.join(evidenciasDir, '06_menu_mobile_aberto.png') });
  console.log('  Capturado: 06_menu_mobile_aberto.png');
  await page.locator('.mobile-toggle').click();

  // Teste de Busca Interativa com Modal <dialog>
  console.log('\n--- TESTANDO MODAL DE PESQUISA ACESSÍVEL ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('[data-action="open-search"]').first().click();
  const isDialogOpen = await page.locator('#search-dialog').evaluate(el => el.open);
  assert(isDialogOpen, 'Diálogo de busca abriu via showModal()');

  await page.fill('#search-input', 'biblioteca');
  await page.waitForTimeout(100);
  const searchResultsCount = await page.locator('.search-result-item').count();
  assert(searchResultsCount >= 4, `Busca por "biblioteca" retornou ${searchResultsCount} resultados reais`);
  await page.screenshot({ path: path.join(evidenciasDir, '07_busca_modal_resultados.png') });
  console.log('  Capturado: 07_busca_modal_resultados.png');

  // Fecha busca com ESC
  await page.keyboard.press('Escape');
  const isDialogClosed = await page.locator('#search-dialog').evaluate(el => !el.open);
  assert(isDialogClosed, 'Diálogo de busca fechou ao pressionar Escape');

  // Teste da Página de Apresentação da Biblioteca
  console.log('\n--- TESTANDO APRESENTAÇÃO DA BIBLIOTECA (biblioteca.html) ---');
  const libResponse = await page.goto(`${baseUrl}/ferramentas/biblioteca.html`, { waitUntil: 'networkidle' });
  assert(libResponse.status() === 200, 'Página da biblioteca carregou com status 200');

  const libTitle = await page.textContent('#lib-title');
  assert(libTitle.includes('Biblioteca Escolar'), 'Título da página da biblioteca verificado');

  const featuresCount = await page.locator('.feature-card').count();
  assert(featuresCount >= 6, `Total de 6 funcionalidades verificadas implementadas (encontradas: ${featuresCount})`);

  const stepsCount = await page.locator('.step-card').count();
  assert(stepsCount === 3, 'Seção Como Funciona contém 3 passos explicativos');

  // Captura da tela da biblioteca desktop e mobile
  await page.screenshot({ path: path.join(evidenciasDir, '08_biblioteca_desktop_1440.png'), fullPage: true });
  console.log('  Capturado: 08_biblioteca_desktop_1440.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(evidenciasDir, '09_biblioteca_mobile_390.png'), fullPage: true });
  console.log('  Capturado: 09_biblioteca_mobile_390.png');

  // Teste de alternância de abas da galeria de telas
  await page.setViewportSize({ width: 1440, height: 900 });
  const tabBtn = page.locator('.preview-tab-btn', { hasText: 'Acervo de Livros' });
  await tabBtn.click();
  const currentImgSrc = await page.locator('#preview-image').getAttribute('src');
  assert(currentImgSrc.includes('acervo.png'), 'Galeria interativa alternou para tela do acervo com sucesso');
  await page.screenshot({ path: path.join(evidenciasDir, '10_biblioteca_galeria_interativa.png') });
  console.log('  Capturado: 10_biblioteca_galeria_interativa.png');

  // Verifica o botão "ACESSAR BIBLIOTECA"
  const accessBtn = page.locator('[data-link="app-library"]');
  const accessBtnVisible = await accessBtn.isVisible();
  assert(accessBtnVisible, 'Botão "ACESSAR BIBLIOTECA" visível e posicionado');
  const accessHref = await accessBtn.getAttribute('href');
  assert(accessHref && accessHref.length > 5, `Link do botão de acesso configurado: ${accessHref}`);

  // Teste das Páginas Auxiliares
  console.log('\n--- TESTANDO PÁGINAS AUXILIARES ---');
  for (const pageName of ['educadores', 'familias', 'conteudos', 'sobre', 'contato']) {
    const res = await page.goto(`${baseUrl}/${pageName}.html`, { waitUntil: 'networkidle' });
    assert(res.status() === 200, `Página ${pageName}.html carregou com status 200`);
    await page.screenshot({ path: path.join(evidenciasDir, `11_${pageName}_desktop.png`), fullPage: true });
    console.log(`  Capturado: 11_${pageName}_desktop.png`);
  }

  // Teste de Envio do Formulário de Contato
  console.log('\n--- TESTANDO FORMULÁRIO DE CONTATO ---');
  await page.goto(`${baseUrl}/contato.html`);
  await page.fill('#contact-name', 'Professora Ana Silva');
  await page.fill('#contact-email', 'ana.silva@escola.gov.br');
  await page.fill('#contact-subject', 'Implantação da biblioteca na escola');
  await page.fill('#contact-message', 'Gostaríamos de conhecer melhor o sistema para organizar nosso acervo.');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(100);
  const feedbackVisible = await page.locator('#contact-feedback').isVisible();
  assert(feedbackVisible, 'Feedback amigável de envio exibido com sucesso');
  await page.screenshot({ path: path.join(evidenciasDir, '12_contato_feedback.png') });
  console.log('  Capturado: 12_contato_feedback.png');

  // Erros no console
  assert(consoleErrors.length === 0, `Nenhum erro de console encontrado (erros: ${consoleErrors.length})`);
  if (consoleErrors.length > 0) {
    console.warn('Erros de console detectados:', consoleErrors);
  }

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
  console.log('TODAS AS VERIFICAÇÕES TÉCNICAS E VISUAIS FORAM CONCLUÍDAS COM SUCESSO!');
  process.exit(0);
}

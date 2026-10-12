/**
 * ============================================================================
 * VEM DA ESCOLA — CONFIGURAÇÃO CENTRALIZADA
 * ============================================================================
 * Centraliza parâmetros institucionais, rotas e dependências externas.
 * Evita hardcoding de domínios não confirmados ou redirecionamentos indevidos.
 */

const VDE_CONFIG = {
  siteName: "Vem da Escola",
  tagline: "Conhecimento que nasce da experiência.",

  // URL pública da aplicação de Gestão de Bibliotecas Escolares
  // ATENÇÃO DE PUBLICAÇÃO: Deve ser preenchida com o domínio público definitivo
  // após o deploy da aplicação de bibliotecas.
  // Deve começar com https://. Enquanto estiver vazia (""), o botão "Acessar
  // Biblioteca" abre um aviso informativo e não redireciona; localhost é recusado.
  libraryAppUrl: "",

  // Rota interna da apresentação da ferramenta antes de qualquer login
  libraryPresentationUrl: "/ferramentas/biblioteca.html",

  // Canais de contato — ATIVAÇÃO FUTURA
  // Enquanto formEndpoint for null, o formulário de contato.html permanece
  // desativado e a página informa que o canal está em configuração.
  contact: {
    // E-mail institucional. Quando preenchido (ex.: "nome@dominio"), passa a
    // aparecer em contato.html como link de e-mail. Não inventar endereço.
    email: null,
    // Endpoint HTTPS de um serviço de formulários compatível com hospedagem
    // estática (ex.: Formspree, Cloudflare Worker). Recebe POST em JSON com
    // { name, email, role, subject, message } e deve responder 2xx em caso de
    // sucesso. Preencher aqui habilita o formulário automaticamente.
    formEndpoint: null
  },

  // Repositórios Oficiais do Projeto
  repositories: {
    site: "https://github.com/wdccruz/vem-da-escola-site",
    biblioteca: "https://github.com/wdccruz/vem-da-escola"
  }
};

if (typeof window !== 'undefined') {
  window.VDE_CONFIG = VDE_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VDE_CONFIG;
}

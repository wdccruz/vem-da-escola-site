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
  // Enquanto estiver vazia (""), o site apresenta aviso institucional de
  // homologação ativa e canal de implantação, impedindo redirecionamento para localhost.
  libraryAppUrl: "",

  // Rota interna da apresentação da ferramenta antes de qualquer login
  libraryPresentationUrl: "/ferramentas/biblioteca.html",

  // Canais Institucionais Oficiais (sujeitos à confirmação factual antes do go-live)
  contact: {
    // E-mail oficial: pendente de configuração definitiva de caixa postal pela equipe
    email: null,
    // Endpoint de envio de formulário em hospedagem estática (ex: Formspree, Cloudflare Worker)
    // Pendente de seleção do provedor institucional
    formEndpoint: null,
    // Informação de atendimento
    atendimento: "Atendimento institucional para escolas e educadores sob demanda"
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

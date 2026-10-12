/**
 * ============================================================================
 * VEM DA ESCOLA — CONFIGURAÇÃO CENTRALIZADA
 * ============================================================================
 * Centraliza URLs externas, parâmetros de contato e configurações do sistema.
 * Permite alterar o destino da aplicação de bibliotecas em um único ponto.
 */

const VDE_CONFIG = {
  // Nome da Plataforma
  siteName: "Vem da Escola",
  tagline: "Conhecimento que nasce da experiência.",
  
  // URL da Aplicação de Gestão de Bibliotecas Escolares
  // Por padrão, aponta para a instância local/documentada do sistema de bibliotecas.
  // Em produção, esta URL deve ser atualizada para o domínio público da VPS.
  libraryAppUrl: "http://localhost:8000/login",
  
  // Caminho da página interna de apresentação institucional da Biblioteca
  libraryPresentationUrl: "/ferramentas/biblioteca.html",

  // Contato Institucional
  contact: {
    email: "contato@vemvamdaescola.com.br", // Configurável
    instagram: "@vemdaescola",
    atendimento: "Segunda a sexta-feira, em horário escolar"
  },

  // Repositórios Oficiais
  repositories: {
    site: "https://github.com/wdccruz/vem-da-escola-site",
    biblioteca: "https://github.com/wdccruz/vem-da-escola"
  }
};

// Exporta globalmente para uso no browser e módulos
if (typeof window !== 'undefined') {
  window.VDE_CONFIG = VDE_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VDE_CONFIG;
}

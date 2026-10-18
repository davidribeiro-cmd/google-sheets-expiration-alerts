/**
 * @fileoverview Montagem do e-mail de alerta a partir do EmailTemplate.html.
 */

/**
 * Preenche o template do e-mail com os itens críticos de um setor.
 *
 * @param {ItemCritico[]} itens Itens críticos, já ordenados por urgência.
 * @returns {string} HTML pronto para o corpo do e-mail.
 */
function montarCorpoEmail(itens) {
  const template = HtmlService.createTemplateFromFile("EmailTemplate");

  template.itens = itens;
  template.bannerUrl = bannerConfigurado() ? BANNER_URL : "";
  template.corPrincipal = COR_PRINCIPAL;

  return template.evaluate().getContent();
}

/**
 * Indica se BANNER_URL foi configurado em Config.gs. Sem banner configurado,
 * o e-mail é enviado sem a imagem, em vez de mostrar uma imagem quebrada.
 *
 * @returns {boolean}
 */
function bannerConfigurado() {
  return Boolean(BANNER_URL) && !BANNER_URL.startsWith("COLE_AQUI");
}

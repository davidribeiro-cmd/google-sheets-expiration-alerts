// =========================================
// E-MAIL DE ALERTA
// =========================================
// Preenche o template EmailTemplate.html com os
// itens críticos de um setor e devolve o HTML
// pronto para o corpo do e-mail.

function montarCorpoEmail(itens) {

  const template = HtmlService.createTemplateFromFile("EmailTemplate");

  template.itens = itens;
  template.bannerUrl = bannerConfigurado() ? BANNER_URL : "";
  template.corPrincipal = COR_PRINCIPAL;

  return template.evaluate().getContent();

}

// =========================================
// BANNER
// =========================================
// O banner só aparece se BANNER_URL estiver
// configurado em Config.gs. Assim o e-mail nunca
// mostra uma imagem quebrada.

function bannerConfigurado() {

  return Boolean(BANNER_URL) && BANNER_URL.indexOf("COLE_AQUI") !== 0;

}

/**
 * getIframeWindow
 * returns the window instance of an iframe
 */
Cypress.Commands.add('getIframeWindow', (num = 0) => {
  cy.wait(100);
  return cy
    .get('iframe')
    .eq(num)
    .its('0.contentWindow')
    .should('exist');
});
/**
 * getIframeWithLuigiClient
 * returns the window instance of an iframe, checks if LuigiClient is active
 */
Cypress.Commands.add('getIframeWithLuigiClient', (num = 0) => {
  cy.get('iframe', { timeout: 10000 })
    .eq(num)
    .its('0.contentWindow.LuigiClient.uxManager')
    .should('exist');

  cy.wait(100);

  return cy
    .get('iframe', { timeout: 10000 })
    .eq(num)
    .its('0.contentWindow');
});

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

Cypress.env('RETRIES', 1);
describe('Basic tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  describe('Core & Client', () => {
    it('Verify dirty status and navigation', () => {
      cy.get('.fd-shellbar').should('be.visible');

      cy.wait(100); // Luigi initialization takes its time
      cy.getIframeWindow().then(win => {
        cy.log('setDirtyStatus true');
        win.LuigiClient.uxManager().setDirtyStatus(true);
      });
      cy.wait(100); // Post message processing time

      cy.window().then(win => {
        cy.log('Trying to navigate away');
        win.Luigi.navigation().navigate('/');
      });
      cy.log('Checking confirm button and confirm');
      cy.get('[data-testid="luigi-modal-confirm"]').should('be.visible');
      cy.get('[data-testid="luigi-modal-confirm"]').click();
      cy.get('[data-testid="luigi-modal-confirm"]').should('not.exist');
    });
  });
});

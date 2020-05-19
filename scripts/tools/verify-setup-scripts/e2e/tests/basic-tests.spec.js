Cypress.env('RETRIES', 1);
describe('Basic tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  describe('Core & Client', () => {
    it('Verify dirty status and navigation', () => {
      cy.get('.fd-shellbar').should('be.visible');

      cy.getIframeWindow().then(win => {
        win.LuigiClient.uxManager().setDirtyStatus(true);
      });
      cy.wait(50);
      cy.window().then(win => {
        win.Luigi.navigation().navigate('/');
      });
      cy.get('[data-testid="luigi-modal-confirm"]').should('be.visible');
      cy.get('[data-testid="luigi-modal-confirm"]').click();
      cy.get('[data-testid="luigi-modal-confirm"]').should('not.exist');
    });
  });
});

Cypress.env('RETRIES', 1);
describe('Basic tests', () => {
  beforeEach(() => {
    const basepath = Cypress.env('VISITPREFIX') || '';
    cy.log(`Navigate to ${basepath}/`);
    cy.visit(`${basepath}/`);
  });
  describe('Core & Client', () => {
    it('Verify dirty status and navigation', () => {
      cy.get('.fd-shellbar').should('be.visible');
      cy.getIframeWithLuigiClient().then(win => {
        cy.log('setDirtyStatus to true');
        win.LuigiClient.uxManager().setDirtyStatus(true);
        cy.wait(150); // Post message processing time
      });

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

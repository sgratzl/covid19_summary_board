describe('selection', () => {
  it('sort by name desc', () => {
    cy.visit('./index.html');
    cy.get('.loading').should('be.hidden');

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th'))
      .click();

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('tbody > tr > td'))
      .should('contain.text', 'Zimbabwe');

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th'))
      .click();

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('tbody > tr > td'))
      .should('contain.text', 'Afghanistan');
  });
});

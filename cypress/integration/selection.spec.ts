import data from './data/summary_response';

describe('selection', () => {
  beforeEach(() => {
    cy.server().route('https://api.covid19api.com/summary', data);
  });
  it('select the US and check whether the title changes', () => {
    cy.visit('./index.html');
    cy.get('.loading').should('be.hidden');

    cy.get('#pie-header').should('contain.text', 'Worldwide');
    cy.get('#pie-clear').should('be.disabled');
    cy.wait(10)
      .get('#table-chart')
      .then((table) =>
        Cypress.$(table[0].shadowRoot!).find('tbody > tr').has('td:contains("United States of America")')
      )
      .click();

    cy.get('#pie-header').should('contain.text', 'United States of America');
    cy.wait(10)
      .get('#table-chart')
      .then((table) =>
        Cypress.$(table[0].shadowRoot!).find('tbody > tr').has('td:contains("United States of America")')
      )
      .should('have.class', 'selected');

    cy.get('#pie-clear').should('not.be.disabled');

    // deselect again
    cy.get('#pie-clear').click();
    cy.get('#pie-header').should('contain.text', 'Worldwide');
    cy.wait(10)
      .get('#table-chart')
      .then((table) =>
        Cypress.$(table[0].shadowRoot!).find('tbody > tr').has('td:contains("United States of America")')
      )
      .should('not.have.class', 'selected');
    cy.get('#pie-clear').should('be.disabled');
  });
  it('deselect by clicking same country', () => {
    cy.visit('./index.html');
    cy.get('.loading').should('be.hidden');

    cy.get('#pie-header').should('contain.text', 'Worldwide');
    cy.get('#pie-clear').should('be.disabled');
    cy.wait(10)
      .get('#table-chart')
      .then((table) =>
        Cypress.$(table[0].shadowRoot!).find('tbody > tr').has('td:contains("United States of America")')
      )
      .click();

    cy.get('#pie-header').should('contain.text', 'United States of America');
    cy.wait(10)
      .get('#table-chart')
      .then((table) =>
        Cypress.$(table[0].shadowRoot!).find('tbody > tr').has('td:contains("United States of America")')
      )
      .should('have.class', 'selected')
      .click();

    cy.get('#pie-header').should('contain.text', 'Worldwide');
    cy.wait(10)
      .get('#table-chart')
      .then((table) =>
        Cypress.$(table[0].shadowRoot!).find('tbody > tr').has('td:contains("United States of America")')
      )
      .should('not.have.class', 'selected');
    cy.get('#pie-clear').should('be.disabled');
  });
});

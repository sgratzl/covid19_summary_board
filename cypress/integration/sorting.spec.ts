import data from './data/summary_response';

describe('selection', () => {
  beforeEach(() => {
    cy.server().route('https://api.covid19api.com/summary', data);
  });
  it('sort by name', () => {
    cy.visit('./index.html');
    cy.get('.loading').should('be.hidden');

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th'))
      .first()
      .click();

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('tbody > tr > td'))
      .first()
      .should('contain.text', 'Afghanistan');

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th'))
      .first()
      .click();

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('tbody > tr > td'))
      .first()
      .should('contain.text', 'Zimbabwe');
  });

  it('sort by total', () => {
    cy.visit('./index.html');
    cy.get('.loading').should('be.hidden');

    // sort by name to have a proper default
    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th'))
      .first()
      .click();

    // sort desc
    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th:contains("Total Confirmed")'))
      .first()
      .click();

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('tbody > tr > td'))
      .first()
      .should('contain.text', 'United States of America');

    // sort asc
    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('thead > tr > th:contains("Total Confirmed")'))
      .first()
      .click();

    cy.wait(10)
      .get('#table-chart')
      .then((table) => Cypress.$(table[0].shadowRoot!).find('tbody > tr > td'))
      .first()
      .should('contain.text', 'Lesotho');
  });
});

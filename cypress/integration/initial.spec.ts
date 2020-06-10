import data from './data/summary_response';

describe('hash test', () => {
  beforeEach(() => {
    cy.server().route('https://api.covid19api.com/summary', data);
  });
  it('initial load no selection', () => {
    cy.visit('./index.html');
    cy.get('#pie-header').should('contain.text', 'Worldwide');
  });

  it('select an invalid country by hash', () => {
    cy.visit('./index.html#FALSE');
    cy.get('#pie-header').should('contain.text', 'Worldwide');
  });

  it('select a country by hash', () => {
    cy.visit('./index.html#AT');
    cy.get('#pie-header').should('contain.text', 'Austria');
    cy.wait(10)
      .get('#table-chart')
      .then((table) => {
        // find Austria within the virtual dom
        return Cypress.$(table[0].shadowRoot!).find('td:contains("Austria")');
      })
      .should('have.length', 1);
  });
});

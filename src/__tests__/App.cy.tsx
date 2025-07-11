/// <reference types="cypress" />

import App from '../../src/App';

describe('App Component (Landing Page only)', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Landing Page', '/');
    cy.mount(<App />);
  });

  it.skip("renders 'Start For Free' button", () => {
    cy.get('a').contains('Start For Free').should('be.visible');
  });

  it.skip('renders pricing section', () => {
    cy.contains('PRICING PLANS').scrollIntoView().should('be.visible');
  });
});

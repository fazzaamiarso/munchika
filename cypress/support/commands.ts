/* eslint-disable no-unused-vars */
/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

import '@testing-library/cypress/add-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login;
      uiLogin: () => void;
      goToProfile: () => void;
    }
  }
}

const loginUser = {
  email: Cypress.env('login_email'),
  password: Cypress.env('login_password'),
};

function login({ email, password }: { email: string; password: string }) {
  cy.request('POST', '__test/login', {
    email,
    password,
  });
}
//Still have  weird edge case where I don't know the solution
Cypress.Commands.add('login', login);

Cypress.Commands.add('uiLogin', () => {
  cy.intercept('POST', '/login*').as('login');
  cy.visit('/login');
  cy.findByRole('main').within(() => {
    cy.findByRole('textbox', { name: /email/i }).type(loginUser.email, { log: false });
    cy.get('input[type="password"]').type(loginUser.password, { log: false }); //had to use cy.get because findByRole can't find the pass field.
    cy.findByRole('button', { name: /log in/i }).click();
  });
  cy.wait('@login');
});

Cypress.Commands.add('goToProfile', () => {
  cy.findByRole('button', { name: /open user/i }).click();
  cy.findByRole('menuitem', { name: /my post/i }).click();
  cy.findByRole('link', { name: /edit/i });
});

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

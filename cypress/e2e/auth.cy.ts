const testUser = {
  username: 'suguro',
  email: 'ryuji.suguro@gmail.com',
  password: '123456',
};


describe('general user auth flow', () => {
  const loginUser = {
    email: Cypress.env('login_email'),
    password: Cypress.env('login_password'),
  };

  it.skip('register a user succesfully', () => {
    //TODO: Figure out best way to handle testing registration
    cy.visit('/register');
    cy.findByRole('heading', { level: 1 }).should('be.focused');
    cy.findByRole('main').within(() => {
      cy.findByRole('textbox', { name: /username/i }).type(testUser.username);
      cy.findByRole('textbox', { name: /email/i }).type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password); //had to use cy.get because findByRole can't find the pass field.
      cy.findByRole('button', { name: /register/i }).click();
    });
  });

  context('login flow', () => {
    it('redirect to login page if trying to acccess profile without session', () => {
      cy.visit('/user/posts');
      cy.location('pathname').should('contain', '/login');
    });

    it('log a user in successfully', () => {
      cy.visit('/login');
      cy.findByRole('heading', { level: 1 }).should('be.focused');
      cy.findByRole('main').within(() => {
        cy.findByRole('textbox', { name: /email/i }).type(loginUser.email, { log: false });
        cy.get('input[type="password"]').type(loginUser.password, { log: false }); //had to use cy.get because findByRole can't find the pass field.
        cy.findByRole('button', { name: /log in/i }).click();
      });
      cy.getCookie('auth_session').should('exist');
    });

    it('log a user out successfully', () => {
      cy.clearCookies();
      cy.uiLogin();
      cy.getCookie('auth_session').should('exist');
      cy.findByRole('button', { name: /open user menu/i }).click();
      cy.findByRole('menuitem', { name: /logout/i }).click();
    });
  });
});

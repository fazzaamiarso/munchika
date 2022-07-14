describe('profile', () => {
  const loginUser = {
    email: Cypress.env('login_email'),
    password: Cypress.env('login_password'),
  };
  it('show the correct profile', () => {
    cy.login({ email: loginUser.email, password: loginUser.password });
    cy.getCookie('auth_session').should('exist');

    cy.visit('/');
    cy.reload();
    // cy.visit('/user');
    // cy.findByRole('img').as('avatar');
  });
});

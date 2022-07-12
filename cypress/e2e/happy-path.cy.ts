it('Run the test!!', () => {
  cy.visit('/');
  cy.findByRole('heading', { level: 1, name: /thought/i });
  cy.findByRole('link', { name: /add a thought/i }).click();
  cy.location('pathname').should('contain', '/post/select');
});

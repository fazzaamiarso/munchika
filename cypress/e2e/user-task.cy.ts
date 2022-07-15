describe('general user task', () => {
  it("can search and go to the right song's page", () => {
    cy.visit('/search/track');

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox').should('be.focused').type('charlie puth');
      cy.findByRole('button', { name: 'Search' }).click();

      cy.intercept('GET', '*').as('search');
      cy.wait('@search');

      cy.findAllByText(/detail/i)
        .first()
        .click({ force: true });
      cy.location('pathname').should('contain', '/track/');
    });
  });

  it('clear the searched page', () => {
    let initialHref: string;

    cy.visit('/search/track');
    cy.location('href').then(href => {
      initialHref = href;
    });

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox').should('be.focused').type('charlie puth');
      cy.findByRole('button', { name: 'Search' }).click();
      cy.location('href').should('contain', 'search/track?term=charlie+puth');

      cy.findByRole('button', { name: /clear/i }).click();
      cy.location('href').should('equal', initialHref);
    });
  });

  it('can load more tracks', () => {
    cy.visit('/search/track');

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox').should('be.focused').type('justin bieber');
      cy.findByRole('button', { name: 'Search' }).click();
      cy.findAllByText(/detail/i).should('have.length', 10);

      cy.findByRole('button', { name: /load more/i }).click();
      cy.findAllByText(/detail/i).should('have.length', 20);
    });
  });
});

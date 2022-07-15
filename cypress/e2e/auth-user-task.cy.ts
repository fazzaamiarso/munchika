beforeEach(() => {
  cy.clearCookies();
  cy.uiLogin();
});

describe('profile', () => {
  it('change the avatar successfully', () => {
    let oldAvatar: string;

    cy.findByRole('button', { name: /open user/i }).click();
    cy.findByRole('menuitem', { name: /my post/i }).click();
    cy.findByRole('link', { name: /edit/i }).click();

    cy.findByRole('heading', { level: 1 }).should('be.focused');
    cy.findByRole('main').within(() => {
      cy.findByRole('img').as('avatar');
      cy.get('@avatar')
        .invoke('attr', 'src')
        .then(val => {
          oldAvatar = val;
        });
    });

    cy.findByRole('button', { name: /randomize/i }).click();
    cy.findByRole('button', { name: /save/i }).click();
    cy.location('pathname').should('contain', '/user/posts');
    cy.findByRole('main').within(() => {
      cy.findByRole('img')
        .invoke('attr', 'src')
        .then(newAvatar => {
          expect(newAvatar).to.not.equal(oldAvatar);
        });
    });
  });
});

describe('posts', () => {
  it('should add new post', () => {
    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', { name: /add thought/i }).click();
      cy.location('pathname').should('contain', '/post/select');
    });

    cy.findByRole('searchbox').should('be.focused').type('bts');
    cy.findByRole('button', { name: /search/i }).click();
    cy.findAllByRole('link', { name: /select/i })
      .first()
      .click();

    cy.location('href').should('contain', '/post/new?trackId');
    cy.findByRole('textbox', { name: /lyrics/i }).should('be.focused');
    cy.findByRole('textbox', { name: /thought/i }).type(
      'Dynamite is a song from BTS that is written fully in english',
    );
    cy.get('input[name="trackId"]');
    cy.findByRole('button', { name: /post/i }).click();

    cy.location('pathname').should('contain', '/user/posts');
    cy.findByRole('link', { name: /edit/i });
    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length.at.least', 1);
    });
  });

  it('delete a post', () => {
    cy.goToProfile();
    cy.findByRole('main').within(() => {
      cy.get('button[data-cy="post-menu"]').as('post-menu');

      cy.get('@post-menu').first().click();
      cy.findByRole('menuitem', { name: /delete/i }).click();
    });

    cy.findByRole('dialog')
      .as('dialog')
      .within(() => {
        cy.findByRole('button', { name: /confirm/i }).click();
      });
    cy.get('@dialog').should('not.exist');

    cy.reload();
    cy.get('button[data-cy="post-menu"]').should('not.exist');
  });
});

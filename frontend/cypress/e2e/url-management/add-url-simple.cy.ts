describe('URL Management - Add URL', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
  });

  it('should open add URL dialog when clicking Add URL button', () => {
    cy.get('[data-testid="add-url-button"]').click();

    // Dialog should be visible
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');

    // Check form fields are present
    cy.get('[data-testid="url-input"]').should('be.visible');
    cy.get('[data-testid="title-input"]').should('be.visible');

    // Check action buttons
    cy.get('[data-testid="cancel-button"]').should('be.visible');
    cy.get('[data-testid="submit-url-button"]').should('be.visible');
  });

  it('should close dialog when clicking cancel button', () => {
    cy.get('[data-testid="add-url-button"]').click();
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');

    cy.get('[data-testid="cancel-button"]').click();

    cy.get('[data-testid="add-url-dialog"]').should('not.exist');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="add-url-button"]').click();

    // Try to type and clear fields to trigger validation
    cy.get('[data-testid="url-input"]').type('test').clear();
    cy.get('[data-testid="title-input"]').type('test').clear();

    // Click outside to trigger validation
    cy.get('[data-testid="add-url-dialog"]').click();

    // Check validation errors appear
    cy.get('[data-testid="url-error"]').should('be.visible');
    cy.get('[data-testid="title-error"]').should('be.visible');

    // Submit button should be disabled
    cy.get('[data-testid="submit-url-button"]').should('be.disabled');

    // Dialog should remain open
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
  });

  it('should successfully add a new URL', () => {
    cy.get('[data-testid="add-url-button"]').click();

    // Fill in the form
    cy.get('[data-testid="url-input"]').type('https://test.com');
    cy.get('[data-testid="title-input"]').type('Test Website');

    // Submit the form
    cy.get('[data-testid="submit-url-button"]').click();

    // Check API call was made
    cy.waitForApiCall('@createUrl');

    // Dialog should close
    cy.get('[data-testid="add-url-dialog"]').should('not.exist');
  });
});

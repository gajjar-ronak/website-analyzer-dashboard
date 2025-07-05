describe('URL Management - URL Listing', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
  });

  it('should display URLs in the table correctly', () => {
    cy.waitForTableLoad();

    // Check that URLs from fixture are displayed
    cy.get('[data-testid="url-row"]').should('have.length.greaterThan', 0);

    // Check first URL details
    cy.get('[data-testid="url-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="url-link"]').should('be.visible');
        cy.get('[data-testid="url-title"]').should('be.visible');
        cy.get('[data-testid="status-badge"]').should('be.visible');
      });
  });

  it('should show action buttons for each URL', () => {
    cy.waitForTableLoad();

    cy.get('[data-testid="url-row"]')
      .first()
      .within(() => {
        // Check that action buttons are present
        cy.get('[data-testid="analyze-url-button"]').should('be.visible');
        cy.get('[data-testid="delete-url-button"]').should('be.visible');
      });
  });

  it('should handle URL selection correctly', () => {
    cy.waitForTableLoad();

    // Select first URL
    cy.get('[data-testid="url-checkbox"]').first().check();

    // Check that selection counter appears
    cy.get('[data-testid="selection-counter"]')
      .should('be.visible')
      .and('contain.text', '1 URL selected');

    // Check that bulk operation buttons appear
    cy.get('[data-testid="bulk-analyze-button"]').should('be.visible');
    cy.get('[data-testid="bulk-delete-button"]').should('be.visible');
  });

  it('should handle select all functionality', () => {
    cy.waitForTableLoad();

    // Click select all checkbox
    cy.get('[data-testid="select-all-checkbox"]').check();

    // All URL checkboxes should be checked
    cy.get('[data-testid="url-checkbox"]').should('be.checked');

    // Selection counter should show all URLs
    cy.get('[data-testid="selection-counter"]')
      .should('be.visible')
      .and('contain.text', 'URLs selected');
  });
});

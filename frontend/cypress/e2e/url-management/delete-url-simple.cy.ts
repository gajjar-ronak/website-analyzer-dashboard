describe('URL Management - Delete URL', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
    cy.waitForTableLoad();
  });

  it('should show delete confirmation dialog when clicking delete button', () => {
    // Click delete button on first URL
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    // Confirmation dialog should appear
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    // Check action buttons
    cy.get('[data-testid="cancel-button"]').should('be.visible');
    cy.get('[data-testid="confirm-button"]').should('be.visible');
  });

  it('should cancel deletion when clicking cancel button', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    cy.get('[data-testid="cancel-button"]').click();
    
    // Dialog should close
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist');
  });

  it('should successfully delete URL when confirming', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    cy.get('[data-testid="confirm-button"]').click();
    
    // Check API call was made
    cy.waitForApiCall('@deleteUrl');
    
    // Dialog should close
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist');
  });
});

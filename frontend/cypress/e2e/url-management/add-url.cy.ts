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
    
    // Check dialog title
    cy.get('[data-testid="dialog-title"]')
      .should('contain.text', 'Add New URL');
    
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

  it('should close dialog when clicking outside', () => {
    cy.get('[data-testid="add-url-button"]').click();
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
    
    // Click on backdrop
    cy.get('[data-testid="dialog-backdrop"]').click({ force: true });
    
    cy.get('[data-testid="add-url-dialog"]').should('not.exist');
  });

  it('should close dialog when pressing Escape key', () => {
    cy.get('[data-testid="add-url-button"]').click();
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
    
    cy.get('body').type('{esc}');
    
    cy.get('[data-testid="add-url-dialog"]').should('not.exist');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="add-url-button"]').click();
    
    // Try to submit without filling fields
    cy.get('[data-testid="submit-url-button"]').click();
    
    // Check validation errors
    cy.get('[data-testid="url-error"]')
      .should('be.visible')
      .and('contain.text', 'URL is required');
    
    cy.get('[data-testid="title-error"]')
      .should('be.visible')
      .and('contain.text', 'Title is required');
    
    // Dialog should remain open
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
  });

  it('should validate URL format', () => {
    cy.get('[data-testid="add-url-button"]').click();
    
    // Enter invalid URL
    cy.get('[data-testid="url-input"]').type('invalid-url');
    cy.get('[data-testid="title-input"]').type('Test Title');
    
    cy.get('[data-testid="submit-url-button"]').click();
    
    // Check URL validation error
    cy.get('[data-testid="url-error"]')
      .should('be.visible')
      .and('contain.text', 'Please enter a valid URL');
    
    // Dialog should remain open
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
  });

  it('should accept valid URL formats', () => {
    const validUrls = [
      'https://example.com',
      'http://example.com',
      'https://www.example.com',
      'https://subdomain.example.com',
      'https://example.com/path',
      'https://example.com:8080',
      'https://example.com/path?query=value'
    ];

    validUrls.forEach((url, index) => {
      cy.get('[data-testid="add-url-button"]').click();
      
      cy.get('[data-testid="url-input"]').type(url);
      cy.get('[data-testid="title-input"]').type(`Test Title ${index + 1}`);
      
      cy.get('[data-testid="submit-url-button"]').click();
      
      // Should not show URL validation error
      cy.get('[data-testid="url-error"]').should('not.exist');
      
      // Wait for API call and close dialog
      cy.waitForApiCall('@createUrl');
      cy.get('[data-testid="add-url-dialog"]').should('not.exist');
    });
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
    
    // Success toast should appear
    cy.verifyToast('URL added successfully', 'success');
    
    // Table should refresh (new API call)
    cy.waitForApiCall('@getUrls');
  });

  it('should show loading state during submission', () => {
    // Mock delayed response
    cy.intercept('POST', '**/api/urls', {
      delay: 2000,
      statusCode: 201,
      body: {
        id: 999,
        url: 'https://test.com',
        title: 'Test URL',
        status: 'pending'
      }
    }).as('createUrlDelayed');
    
    cy.get('[data-testid="add-url-button"]').click();
    
    cy.get('[data-testid="url-input"]').type('https://test.com');
    cy.get('[data-testid="title-input"]').type('Test Website');
    
    cy.get('[data-testid="submit-url-button"]').click();
    
    // Check loading state
    cy.get('[data-testid="submit-url-button"]')
      .should('be.disabled')
      .and('contain.text', 'Adding...');
    
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    // Cancel button should also be disabled
    cy.get('[data-testid="cancel-button"]').should('be.disabled');
    
    cy.waitForApiCall('@createUrlDelayed');
    
    // Dialog should close after successful submission
    cy.get('[data-testid="add-url-dialog"]').should('not.exist');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '**/api/urls', {
      statusCode: 400,
      body: { error: 'URL already exists' }
    }).as('createUrlError');
    
    cy.get('[data-testid="add-url-button"]').click();
    
    cy.get('[data-testid="url-input"]').type('https://existing.com');
    cy.get('[data-testid="title-input"]').type('Existing Website');
    
    cy.get('[data-testid="submit-url-button"]').click();
    
    cy.waitForApiCall('@createUrlError');
    
    // Dialog should remain open
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
    
    // Error toast should appear
    cy.verifyToast('URL already exists', 'error');
    
    // Form should be re-enabled
    cy.get('[data-testid="submit-url-button"]')
      .should('not.be.disabled')
      .and('contain.text', 'Add URL');
  });

  it('should handle network errors', () => {
    // Mock network error
    cy.intercept('POST', '**/api/urls', { forceNetworkError: true }).as('createUrlNetworkError');
    
    cy.get('[data-testid="add-url-button"]').click();
    
    cy.get('[data-testid="url-input"]').type('https://test.com');
    cy.get('[data-testid="title-input"]').type('Test Website');
    
    cy.get('[data-testid="submit-url-button"]').click();
    
    cy.waitForApiCall('@createUrlNetworkError');
    
    // Dialog should remain open
    cy.get('[data-testid="add-url-dialog"]').should('be.visible');
    
    // Error toast should appear
    cy.verifyToast('Network error. Please try again.', 'error');
  });

  it('should clear form when dialog is reopened', () => {
    cy.get('[data-testid="add-url-button"]').click();
    
    // Fill in some data
    cy.get('[data-testid="url-input"]').type('https://test.com');
    cy.get('[data-testid="title-input"]').type('Test Website');
    
    // Close dialog
    cy.get('[data-testid="cancel-button"]').click();
    
    // Reopen dialog
    cy.get('[data-testid="add-url-button"]').click();
    
    // Form should be cleared
    cy.get('[data-testid="url-input"]').should('have.value', '');
    cy.get('[data-testid="title-input"]').should('have.value', '');
    
    // No validation errors should be visible
    cy.get('[data-testid="url-error"]').should('not.exist');
    cy.get('[data-testid="title-error"]').should('not.exist');
  });

  it('should auto-focus URL input when dialog opens', () => {
    cy.get('[data-testid="add-url-button"]').click();
    
    cy.get('[data-testid="url-input"]').should('be.focused');
  });

  it('should support keyboard navigation', () => {
    cy.get('[data-testid="add-url-button"]').click();
    
    // Tab through form fields
    cy.get('[data-testid="url-input"]').should('be.focused');
    
    cy.get('[data-testid="url-input"]').tab();
    cy.get('[data-testid="title-input"]').should('be.focused');
    
    cy.get('[data-testid="title-input"]').tab();
    cy.get('[data-testid="cancel-button"]').should('be.focused');
    
    cy.get('[data-testid="cancel-button"]').tab();
    cy.get('[data-testid="submit-url-button"]').should('be.focused');
  });

  it('should submit form when pressing Enter in input fields', () => {
    cy.get('[data-testid="add-url-button"]').click();
    
    cy.get('[data-testid="url-input"]').type('https://test.com');
    cy.get('[data-testid="title-input"]').type('Test Website{enter}');
    
    cy.waitForApiCall('@createUrl');
    cy.get('[data-testid="add-url-dialog"]').should('not.exist');
  });
});

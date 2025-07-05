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
    
    // Check dialog content
    cy.get('[data-testid="dialog-title"]')
      .should('contain.text', 'Delete URL');
    
    cy.get('[data-testid="dialog-message"]')
      .should('contain.text', 'Are you sure you want to delete')
      .and('contain.text', 'Example Website');
    
    // Check action buttons
    cy.get('[data-testid="cancel-button"]')
      .should('be.visible')
      .and('contain.text', 'Cancel');
    
    cy.get('[data-testid="confirm-button"]')
      .should('be.visible')
      .and('contain.text', 'Delete')
      .and('have.class', 'bg-red-600');
  });

  it('should cancel deletion when clicking cancel button', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    cy.get('[data-testid="cancel-button"]').click();
    
    // Dialog should close
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist');
    
    // URL should still be in the table
    cy.get('[data-testid="url-row"]').should('have.length', 5);
  });

  it('should cancel deletion when clicking outside dialog', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    // Click on backdrop
    cy.get('[data-testid="dialog-backdrop"]').click({ force: true });
    
    // Dialog should close
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist');
  });

  it('should cancel deletion when pressing Escape key', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    cy.get('body').type('{esc}');
    
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
    
    // Success toast should appear
    cy.verifyToast('URL deleted successfully', 'success');
    
    // Table should refresh
    cy.waitForApiCall('@getUrls');
  });

  it('should show loading state during deletion', () => {
    // Mock delayed delete response
    cy.intercept('DELETE', '**/api/urls/*', {
      delay: 2000,
      statusCode: 200,
      body: { message: 'URL deleted successfully' }
    }).as('deleteUrlDelayed');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirm-button"]').click();
    
    // Check loading state
    cy.get('[data-testid="confirm-button"]')
      .should('be.disabled')
      .and('contain.text', 'Deleting...');
    
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    // Cancel button should also be disabled
    cy.get('[data-testid="cancel-button"]').should('be.disabled');
    
    cy.waitForApiCall('@deleteUrlDelayed');
    
    // Dialog should close after successful deletion
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist');
  });

  it('should handle delete API errors gracefully', () => {
    // Mock API error
    cy.intercept('DELETE', '**/api/urls/*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('deleteUrlError');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirm-button"]').click();
    
    cy.waitForApiCall('@deleteUrlError');
    
    // Dialog should remain open
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    
    // Error toast should appear
    cy.verifyToast('Failed to delete URL', 'error');
    
    // Buttons should be re-enabled
    cy.get('[data-testid="confirm-button"]')
      .should('not.be.disabled')
      .and('contain.text', 'Delete');
    
    cy.get('[data-testid="cancel-button"]').should('not.be.disabled');
  });

  it('should handle network errors during deletion', () => {
    // Mock network error
    cy.intercept('DELETE', '**/api/urls/*', { forceNetworkError: true }).as('deleteUrlNetworkError');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    cy.get('[data-testid="confirm-button"]').click();
    
    cy.waitForApiCall('@deleteUrlNetworkError');
    
    // Error toast should appear
    cy.verifyToast('Network error. Please try again.', 'error');
  });

  it('should show correct URL information in delete dialog', () => {
    // Test with different URLs
    const urlsToTest = [
      { index: 0, title: 'Example Website', url: 'https://example.com' },
      { index: 1, title: 'Google', url: 'https://google.com' },
      { index: 2, title: 'Test Site', url: 'https://test-site.com' }
    ];
    
    urlsToTest.forEach(({ index, title, url }) => {
      cy.get('[data-testid="url-row"]').eq(index).within(() => {
        cy.get('[data-testid="delete-url-button"]').click();
      });
      
      cy.get('[data-testid="dialog-message"]')
        .should('contain.text', title);
      
      cy.get('[data-testid="cancel-button"]').click();
    });
  });

  it('should disable delete button during other operations', () => {
    // Mock analyzing state
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    // Delete button should be disabled during analysis
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').should('be.disabled');
    });
  });

  it('should support keyboard navigation in delete dialog', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    // Cancel button should be focused by default
    cy.get('[data-testid="cancel-button"]').should('be.focused');
    
    // Tab to confirm button
    cy.get('[data-testid="cancel-button"]').tab();
    cy.get('[data-testid="confirm-button"]').should('be.focused');
    
    // Shift+Tab back to cancel
    cy.get('[data-testid="confirm-button"]').tab({ shift: true });
    cy.get('[data-testid="cancel-button"]').should('be.focused');
  });

  it('should confirm deletion with Enter key on confirm button', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    // Tab to confirm button and press Enter
    cy.get('[data-testid="cancel-button"]').tab();
    cy.get('[data-testid="confirm-button"]').type('{enter}');
    
    cy.waitForApiCall('@deleteUrl');
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist');
  });

  it('should show appropriate delete button states for different URL statuses', () => {
    cy.waitForTableLoad();
    
    // All URLs should have delete buttons regardless of status
    cy.get('[data-testid="url-row"]').each(($row) => {
      cy.wrap($row).within(() => {
        cy.get('[data-testid="delete-url-button"]')
          .should('be.visible')
          .and('not.be.disabled');
      });
    });
  });

  it('should handle multiple rapid delete attempts gracefully', () => {
    // Click delete multiple times rapidly
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').click();
    });
    
    // Only one dialog should appear
    cy.get('[data-testid="confirmation-dialog"]').should('have.length', 1);
    
    cy.get('[data-testid="confirm-button"]').click();
    
    // Try to click delete on another URL while first is processing
    cy.get('[data-testid="url-row"]').eq(1).within(() => {
      cy.get('[data-testid="delete-url-button"]').should('be.disabled');
    });
    
    cy.waitForApiCall('@deleteUrl');
  });
});

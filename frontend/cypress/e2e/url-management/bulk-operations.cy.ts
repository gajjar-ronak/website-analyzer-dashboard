describe('URL Management - Bulk Operations', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
    cy.waitForTableLoad();
  });

  describe('Bulk Selection', () => {
    it('should show bulk operation buttons when URLs are selected', () => {
      // Initially, bulk operation buttons should not be visible
      cy.get('[data-testid="bulk-analyze-button"]').should('not.exist');
      cy.get('[data-testid="bulk-delete-button"]').should('not.exist');
      
      // Select first URL
      cy.get('[data-testid="url-checkbox"]').first().check();
      
      // Bulk operation buttons should appear
      cy.get('[data-testid="bulk-analyze-button"]')
        .should('be.visible')
        .and('contain.text', 'Re-run Analysis');
      
      cy.get('[data-testid="bulk-delete-button"]')
        .should('be.visible')
        .and('contain.text', 'Delete URLs');
      
      // Add URL and Bulk Import buttons should be hidden
      cy.get('[data-testid="add-url-button"]').should('not.exist');
      cy.get('[data-testid="bulk-import-button"]').should('not.exist');
    });

    it('should update selection counter correctly', () => {
      // Select first URL
      cy.get('[data-testid="url-checkbox"]').first().check();
      
      cy.get('[data-testid="selection-counter"]')
        .should('be.visible')
        .and('contain.text', '1 URL selected');
      
      // Select second URL
      cy.get('[data-testid="url-checkbox"]').eq(1).check();
      
      cy.get('[data-testid="selection-counter"]')
        .should('contain.text', '2 URLs selected');
      
      // Unselect first URL
      cy.get('[data-testid="url-checkbox"]').first().uncheck();
      
      cy.get('[data-testid="selection-counter"]')
        .should('contain.text', '1 URL selected');
    });

    it('should handle select all functionality', () => {
      // Click select all
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      // All URLs should be selected
      cy.get('[data-testid="url-checkbox"]').should('be.checked');
      
      cy.get('[data-testid="selection-counter"]')
        .should('contain.text', '5 URLs selected');
      
      // Uncheck select all
      cy.get('[data-testid="select-all-checkbox"]').uncheck();
      
      // All URLs should be unselected
      cy.get('[data-testid="url-checkbox"]').should('not.be.checked');
      
      cy.get('[data-testid="selection-counter"]').should('not.exist');
    });

    it('should handle partial selection with select all checkbox', () => {
      // Select some URLs manually
      cy.get('[data-testid="url-checkbox"]').first().check();
      cy.get('[data-testid="url-checkbox"]').eq(1).check();
      
      // Select all checkbox should be in indeterminate state
      cy.get('[data-testid="select-all-checkbox"]')
        .should('have.prop', 'indeterminate', true);
      
      // Click select all to select remaining
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      // All should be selected
      cy.get('[data-testid="url-checkbox"]').should('be.checked');
      cy.get('[data-testid="select-all-checkbox"]')
        .should('be.checked')
        .and('have.prop', 'indeterminate', false);
    });
  });

  describe('Bulk Delete', () => {
    it('should show bulk delete confirmation dialog', () => {
      // Select multiple URLs
      cy.selectUrlsInTable([0, 1, 2]);
      
      cy.get('[data-testid="bulk-delete-button"]').click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="bulk-delete-dialog"]').should('be.visible');
      
      cy.get('[data-testid="dialog-title"]')
        .should('contain.text', 'Delete URLs');
      
      cy.get('[data-testid="dialog-message"]')
        .should('contain.text', 'Are you sure you want to delete 3 URLs?')
        .and('contain.text', 'This action cannot be undone');
    });

    it('should cancel bulk delete when clicking cancel', () => {
      cy.selectUrlsInTable([0, 1]);
      
      cy.get('[data-testid="bulk-delete-button"]').click();
      cy.get('[data-testid="bulk-delete-dialog"]').should('be.visible');
      
      cy.get('[data-testid="cancel-button"]').click();
      
      // Dialog should close
      cy.get('[data-testid="bulk-delete-dialog"]').should('not.exist');
      
      // Selection should be maintained
      cy.get('[data-testid="selection-counter"]')
        .should('contain.text', '2 URLs selected');
    });

    it('should successfully perform bulk delete', () => {
      cy.selectUrlsInTable([0, 1, 2]);
      
      cy.get('[data-testid="bulk-delete-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      // Check API call was made
      cy.waitForApiCall('@bulkDeleteUrls');
      
      // Dialog should close
      cy.get('[data-testid="bulk-delete-dialog"]').should('not.exist');
      
      // Success toast should appear
      cy.verifyToast('URLs deleted successfully', 'success');
      
      // Selection should be cleared
      cy.get('[data-testid="selection-counter"]').should('not.exist');
      
      // Table should refresh
      cy.waitForApiCall('@getUrls');
    });

    it('should show loading state during bulk delete', () => {
      // Mock delayed response
      cy.intercept('DELETE', '**/api/urls/bulk', {
        delay: 2000,
        statusCode: 200,
        body: { message: 'URLs deleted successfully' }
      }).as('bulkDeleteDelayed');
      
      cy.selectUrlsInTable([0, 1]);
      
      cy.get('[data-testid="bulk-delete-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      // Check loading state
      cy.get('[data-testid="confirm-button"]')
        .should('be.disabled')
        .and('contain.text', 'Deleting...');
      
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      // Table should show loading overlay
      cy.get('[data-testid="table-loading-overlay"]').should('be.visible');
      
      cy.waitForApiCall('@bulkDeleteDelayed');
    });

    it('should handle bulk delete errors', () => {
      // Mock API error
      cy.intercept('DELETE', '**/api/urls/bulk', {
        statusCode: 500,
        body: { error: 'Failed to delete URLs' }
      }).as('bulkDeleteError');
      
      cy.selectUrlsInTable([0, 1]);
      
      cy.get('[data-testid="bulk-delete-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      cy.waitForApiCall('@bulkDeleteError');
      
      // Error toast should appear
      cy.verifyToast('Failed to delete URLs', 'error');
      
      // Dialog should remain open
      cy.get('[data-testid="bulk-delete-dialog"]').should('be.visible');
      
      // Selection should be maintained
      cy.get('[data-testid="selection-counter"]')
        .should('contain.text', '2 URLs selected');
    });
  });

  describe('Bulk Analysis', () => {
    it('should trigger bulk analysis', () => {
      cy.selectUrlsInTable([0, 1, 3]); // Select completed, completed, and failed URLs
      
      cy.get('[data-testid="bulk-analyze-button"]').click();
      
      // Check API call was made
      cy.waitForApiCall('@bulkAnalyzeUrls');
      
      // Success toast should appear
      cy.verifyToast('Bulk analysis started', 'success');
      
      // Selection should be cleared
      cy.get('[data-testid="selection-counter"]').should('not.exist');
      
      // Table should refresh
      cy.waitForApiCall('@getUrls');
    });

    it('should show loading state during bulk analysis', () => {
      // Mock delayed response
      cy.intercept('POST', '**/api/urls/bulk/analyze', {
        delay: 2000,
        statusCode: 200,
        body: { message: 'Bulk analysis started' }
      }).as('bulkAnalyzeDelayed');
      
      cy.selectUrlsInTable([0, 1]);
      
      cy.get('[data-testid="bulk-analyze-button"]').click();
      
      // Check loading state
      cy.get('[data-testid="bulk-analyze-button"]')
        .should('be.disabled')
        .and('contain.text', 'Analyzing...');
      
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      // Table should show loading overlay
      cy.get('[data-testid="table-loading-overlay"]').should('be.visible');
      
      cy.waitForApiCall('@bulkAnalyzeDelayed');
    });

    it('should handle bulk analysis errors', () => {
      // Mock API error
      cy.intercept('POST', '**/api/urls/bulk/analyze', {
        statusCode: 500,
        body: { error: 'Failed to start bulk analysis' }
      }).as('bulkAnalyzeError');
      
      cy.selectUrlsInTable([0, 1]);
      
      cy.get('[data-testid="bulk-analyze-button"]').click();
      
      cy.waitForApiCall('@bulkAnalyzeError');
      
      // Error toast should appear
      cy.verifyToast('Failed to start bulk analysis', 'error');
      
      // Selection should be maintained
      cy.get('[data-testid="selection-counter"]')
        .should('contain.text', '2 URLs selected');
    });

    it('should show immediate visual feedback for bulk analysis', () => {
      cy.selectUrlsInTable([0, 1]);
      
      cy.get('[data-testid="bulk-analyze-button"]').click();
      
      // Selected URLs should immediately show analyzing state
      cy.get('[data-testid="url-row"]').first().within(() => {
        cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
      });
      
      cy.get('[data-testid="url-row"]').eq(1).within(() => {
        cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
      });
    });
  });

  describe('Bulk Import', () => {
    it('should open bulk import dialog', () => {
      cy.get('[data-testid="bulk-import-button"]').click();
      
      cy.get('[data-testid="bulk-import-dialog"]').should('be.visible');
      
      cy.get('[data-testid="dialog-title"]')
        .should('contain.text', 'Bulk Import URLs');
      
      cy.get('[data-testid="file-upload-area"]').should('be.visible');
      cy.get('[data-testid="upload-instructions"]')
        .should('contain.text', 'Upload a CSV or Excel file');
    });

    it('should handle file upload', () => {
      cy.get('[data-testid="bulk-import-button"]').click();
      
      // Create a test CSV file
      const csvContent = 'url,title\nhttps://test1.com,Test 1\nhttps://test2.com,Test 2';
      const file = new File([csvContent], 'test-urls.csv', { type: 'text/csv' });
      
      // Upload file
      cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      
      cy.get('[data-testid="import-button"]').click();
      
      // Check API call was made
      cy.waitForApiCall('@bulkImportUrls');
      
      // Dialog should close
      cy.get('[data-testid="bulk-import-dialog"]').should('not.exist');
      
      // Success toast should appear
      cy.verifyToast('Import successful', 'success');
      
      // Table should refresh
      cy.waitForApiCall('@getUrls');
    });

    it('should validate file format', () => {
      cy.get('[data-testid="bulk-import-button"]').click();
      
      // Try to upload invalid file type
      const txtContent = 'This is not a CSV file';
      const file = new File([txtContent], 'test.txt', { type: 'text/plain' });
      
      cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      
      // Error message should appear
      cy.get('[data-testid="file-error"]')
        .should('be.visible')
        .and('contain.text', 'Please upload a CSV or Excel file');
    });

    it('should show import progress', () => {
      // Mock delayed import response
      cy.intercept('POST', '**/api/urls/bulk/import', {
        delay: 3000,
        statusCode: 200,
        body: { message: 'Import successful', imported: 5, failed: 0 }
      }).as('bulkImportDelayed');
      
      cy.get('[data-testid="bulk-import-button"]').click();
      
      const csvContent = 'url,title\nhttps://test1.com,Test 1';
      const file = new File([csvContent], 'test-urls.csv', { type: 'text/csv' });
      
      cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      cy.get('[data-testid="import-button"]').click();
      
      // Dialog should close immediately
      cy.get('[data-testid="bulk-import-dialog"]').should('not.exist');
      
      // Table should show loading state
      cy.get('[data-testid="table-loading-overlay"]').should('be.visible');
      
      cy.waitForApiCall('@bulkImportDelayed');
    });
  });

  describe('Mixed Operations', () => {
    it('should disable bulk operations during individual operations', () => {
      // Start individual analysis
      cy.get('[data-testid="url-row"]').first().within(() => {
        cy.get('[data-testid="analyze-url-button"]').click();
      });
      
      // Select URLs
      cy.selectUrlsInTable([1, 2]);
      
      // Bulk operation buttons should be disabled
      cy.get('[data-testid="bulk-analyze-button"]').should('be.disabled');
      cy.get('[data-testid="bulk-delete-button"]').should('be.disabled');
    });

    it('should maintain selection across different operations', () => {
      // Select URLs
      cy.selectUrlsInTable([0, 1, 2]);
      
      // Perform bulk analysis
      cy.get('[data-testid="bulk-analyze-button"]').click();
      cy.waitForApiCall('@bulkAnalyzeUrls');
      
      // Selection should be cleared after successful operation
      cy.get('[data-testid="selection-counter"]').should('not.exist');
      
      // Select again for delete
      cy.selectUrlsInTable([0, 1]);
      
      // Should be able to perform bulk delete
      cy.get('[data-testid="bulk-delete-button"]').should('be.visible');
    });
  });
});

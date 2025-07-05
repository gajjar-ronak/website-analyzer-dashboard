describe('URL Management - Search and Filter', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
    cy.waitForTableLoad();
  });

  describe('Search Functionality', () => {
    it('should search URLs by URL text', () => {
      // Mock search results
      cy.intercept('GET', '**/api/urls*search=example*', {
        body: {
          data: [{
            id: 1,
            url: 'https://example.com',
            title: 'Example Website',
            status: 'completed'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('searchByUrl');
      
      // Type in search box
      cy.get('[data-testid="search-input"]').type('example');
      
      // Wait for debounced search
      cy.wait(1000);
      cy.waitForApiCall('@searchByUrl');
      
      // Should show filtered results
      cy.get('[data-testid="url-row"]').should('have.length', 1);
      cy.get('[data-testid="url-row"]').first().within(() => {
        cy.get('[data-testid="url-link"]')
          .should('contain.text', 'https://example.com');
      });
    });

    it('should search URLs by title', () => {
      // Mock search results
      cy.intercept('GET', '**/api/urls*search=Google*', {
        body: {
          data: [{
            id: 2,
            url: 'https://google.com',
            title: 'Google',
            status: 'completed'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('searchByTitle');
      
      cy.get('[data-testid="search-input"]').type('Google');
      
      cy.wait(1000);
      cy.waitForApiCall('@searchByTitle');
      
      cy.get('[data-testid="url-row"]').should('have.length', 1);
      cy.get('[data-testid="url-row"]').first().within(() => {
        cy.get('[data-testid="url-title"]')
          .should('contain.text', 'Google');
      });
    });

    it('should handle empty search results', () => {
      // Mock empty search results
      cy.intercept('GET', '**/api/urls*search=nonexistent*', {
        body: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, total_pages: 0 }
        }
      }).as('searchEmpty');
      
      cy.get('[data-testid="search-input"]').type('nonexistent');
      
      cy.wait(1000);
      cy.waitForApiCall('@searchEmpty');
      
      // Should show empty state
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', 'No URLs found');
      
      cy.get('[data-testid="empty-state-description"]')
        .should('contain.text', 'Try adjusting your search terms');
    });

    it('should clear search results when search is cleared', () => {
      // First search for something
      cy.get('[data-testid="search-input"]').type('example');
      cy.wait(1000);
      
      // Clear search
      cy.get('[data-testid="search-input"]').clear();
      cy.wait(1000);
      
      // Should show all URLs again
      cy.waitForApiCall('@getUrls');
      cy.get('[data-testid="url-row"]').should('have.length', 5);
    });

    it('should debounce search input', () => {
      // Type rapidly
      cy.get('[data-testid="search-input"]')
        .type('e')
        .type('x')
        .type('a')
        .type('m')
        .type('p')
        .type('l')
        .type('e');
      
      // Should not make API calls until debounce period
      cy.wait(500);
      cy.get('@getUrls.all').should('have.length', 1); // Only initial load
      
      // Wait for debounce
      cy.wait(500);
      
      // Now should make search API call
      cy.get('@getUrls.all').should('have.length.greaterThan', 1);
    });

    it('should show search loading indicator', () => {
      // Mock delayed search response
      cy.intercept('GET', '**/api/urls*search=*', {
        delay: 2000,
        fixture: 'urls.json'
      }).as('searchDelayed');
      
      cy.get('[data-testid="search-input"]').type('test');
      
      cy.wait(1000); // Wait for debounce
      
      // Should show loading indicator
      cy.get('[data-testid="search-loading"]').should('be.visible');
      
      cy.waitForApiCall('@searchDelayed');
      
      // Loading indicator should disappear
      cy.get('[data-testid="search-loading"]').should('not.exist');
    });

    it('should reset page to 1 when searching', () => {
      // Go to page 2 first (if pagination exists)
      cy.get('[data-testid="pagination-next"]').click({ force: true });
      
      // Now search
      cy.get('[data-testid="search-input"]').type('example');
      
      cy.wait(1000);
      
      // Should be back on page 1
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Page 1');
    });
  });

  describe('Status Filter', () => {
    it('should filter by completed status', () => {
      // Mock completed URLs
      cy.intercept('GET', '**/api/urls*status=completed*', {
        body: {
          data: [{
            id: 1,
            url: 'https://example.com',
            title: 'Example Website',
            status: 'completed'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('filterCompleted');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      cy.waitForApiCall('@filterCompleted');
      
      // Should show only completed URLs
      cy.get('[data-testid="url-row"]').should('have.length', 1);
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'completed');
    });

    it('should filter by analyzing status', () => {
      // Mock analyzing URLs
      cy.intercept('GET', '**/api/urls*status=analyzing*', {
        body: {
          data: [{
            id: 3,
            url: 'https://test-site.com',
            title: 'Test Site',
            status: 'analyzing'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('filterAnalyzing');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Analyzing').click();
      
      cy.waitForApiCall('@filterAnalyzing');
      
      cy.get('[data-testid="url-row"]').should('have.length', 1);
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'analyzing');
    });

    it('should filter by failed status', () => {
      // Mock failed URLs
      cy.intercept('GET', '**/api/urls*status=failed*', {
        body: {
          data: [{
            id: 4,
            url: 'https://broken-site.com',
            title: 'Broken Site',
            status: 'failed'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('filterFailed');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Failed').click();
      
      cy.waitForApiCall('@filterFailed');
      
      cy.get('[data-testid="url-row"]').should('have.length', 1);
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'failed');
    });

    it('should filter by pending status', () => {
      // Mock pending URLs
      cy.intercept('GET', '**/api/urls*status=pending*', {
        body: {
          data: [{
            id: 5,
            url: 'https://pending-site.com',
            title: 'Pending Site',
            status: 'pending'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('filterPending');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Pending').click();
      
      cy.waitForApiCall('@filterPending');
      
      cy.get('[data-testid="url-row"]').should('have.length', 1);
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'pending');
    });

    it('should show all URLs when selecting "All Status"', () => {
      // First filter by completed
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      // Then select all
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('All Status').click();
      
      cy.waitForApiCall('@getUrls');
      
      // Should show all URLs
      cy.get('[data-testid="url-row"]').should('have.length', 5);
    });

    it('should reset page to 1 when filtering', () => {
      // Go to page 2 first
      cy.get('[data-testid="pagination-next"]').click({ force: true });
      
      // Apply filter
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      // Should be back on page 1
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Page 1');
    });
  });

  describe('Combined Search and Filter', () => {
    it('should combine search and status filter', () => {
      // Mock combined search and filter
      cy.intercept('GET', '**/api/urls*search=example*status=completed*', {
        body: {
          data: [{
            id: 1,
            url: 'https://example.com',
            title: 'Example Website',
            status: 'completed'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      }).as('searchAndFilter');
      
      // Apply search
      cy.get('[data-testid="search-input"]').type('example');
      cy.wait(1000);
      
      // Apply status filter
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      cy.waitForApiCall('@searchAndFilter');
      
      cy.get('[data-testid="url-row"]').should('have.length', 1);
    });

    it('should clear all filters with clear button', () => {
      // Apply search and filter
      cy.get('[data-testid="search-input"]').type('example');
      cy.wait(1000);
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      // Clear all filters
      cy.get('[data-testid="clear-filters-button"]').click();
      
      // Should show all URLs
      cy.get('[data-testid="search-input"]').should('have.value', '');
      cy.get('[data-testid="status-filter"]').should('contain.text', 'All Status');
      
      cy.waitForApiCall('@getUrls');
      cy.get('[data-testid="url-row"]').should('have.length', 5);
    });

    it('should show active filter indicators', () => {
      // Apply search
      cy.get('[data-testid="search-input"]').type('example');
      cy.wait(1000);
      
      // Should show search filter indicator
      cy.get('[data-testid="active-search-filter"]')
        .should('be.visible')
        .and('contain.text', 'Search: example');
      
      // Apply status filter
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      // Should show status filter indicator
      cy.get('[data-testid="active-status-filter"]')
        .should('be.visible')
        .and('contain.text', 'Status: Completed');
    });

    it('should maintain filters across page navigation', () => {
      // Apply filters
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(1000);
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      // Navigate to different page (if available)
      cy.get('[data-testid="pagination-next"]').click({ force: true });
      
      // Filters should be maintained
      cy.get('[data-testid="search-input"]').should('have.value', 'test');
      cy.get('[data-testid="status-filter"]').should('contain.text', 'Completed');
    });
  });

  describe('Filter Performance', () => {
    it('should handle rapid filter changes', () => {
      // Rapidly change filters
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Failed').click();
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Pending').click();
      
      // Should handle gracefully without errors
      cy.get('[data-testid="url-table"]').should('be.visible');
    });

    it('should handle filter errors gracefully', () => {
      // Mock API error for filter
      cy.intercept('GET', '**/api/urls*status=completed*', {
        statusCode: 500,
        body: { error: 'Filter failed' }
      }).as('filterError');
      
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      cy.waitForApiCall('@filterError');
      
      // Should show error message
      cy.get('[data-testid="filter-error"]')
        .should('be.visible')
        .and('contain.text', 'Failed to apply filter');
    });
  });
});

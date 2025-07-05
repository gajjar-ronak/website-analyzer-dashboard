describe('URL Management - Sorting', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
    cy.waitForTableLoad();
  });

  describe('Column Sorting', () => {
    it('should sort by URL column', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=url*sort_order=asc*', {
        body: {
          data: [
            { id: 1, url: 'https://a-site.com', title: 'A Site', status: 'completed' },
            { id: 2, url: 'https://b-site.com', title: 'B Site', status: 'completed' },
            { id: 3, url: 'https://c-site.com', title: 'C Site', status: 'completed' }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByUrlAsc');
      
      // Click URL column header
      cy.get('[data-testid="sort-url"]').click();
      
      cy.waitForApiCall('@sortByUrlAsc');
      
      // Check sort indicator
      cy.get('[data-testid="sort-url"]')
        .should('have.class', 'sort-asc')
        .find('[data-testid="sort-icon"]')
        .should('be.visible');
      
      // Check URLs are sorted
      cy.get('[data-testid="url-link"]').first()
        .should('contain.text', 'https://a-site.com');
    });

    it('should toggle sort order when clicking same column', () => {
      // First click - ascending
      cy.get('[data-testid="sort-url"]').click();
      
      // Mock descending response
      cy.intercept('GET', '**/api/urls*sort_by=url*sort_order=desc*', {
        body: {
          data: [
            { id: 3, url: 'https://z-site.com', title: 'Z Site', status: 'completed' },
            { id: 2, url: 'https://y-site.com', title: 'Y Site', status: 'completed' },
            { id: 1, url: 'https://x-site.com', title: 'X Site', status: 'completed' }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByUrlDesc');
      
      // Second click - descending
      cy.get('[data-testid="sort-url"]').click();
      
      cy.waitForApiCall('@sortByUrlDesc');
      
      // Check sort indicator
      cy.get('[data-testid="sort-url"]')
        .should('have.class', 'sort-desc')
        .find('[data-testid="sort-icon"]')
        .should('be.visible');
      
      // Check URLs are sorted descending
      cy.get('[data-testid="url-link"]').first()
        .should('contain.text', 'https://z-site.com');
    });

    it('should sort by title column', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=title*sort_order=asc*', {
        body: {
          data: [
            { id: 1, url: 'https://site1.com', title: 'Alpha Site', status: 'completed' },
            { id: 2, url: 'https://site2.com', title: 'Beta Site', status: 'completed' },
            { id: 3, url: 'https://site3.com', title: 'Gamma Site', status: 'completed' }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByTitleAsc');
      
      cy.get('[data-testid="sort-title"]').click();
      
      cy.waitForApiCall('@sortByTitleAsc');
      
      // Check titles are sorted
      cy.get('[data-testid="url-title"]').first()
        .should('contain.text', 'Alpha Site');
    });

    it('should sort by status column', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=status*sort_order=asc*', {
        body: {
          data: [
            { id: 1, url: 'https://site1.com', title: 'Site 1', status: 'analyzing' },
            { id: 2, url: 'https://site2.com', title: 'Site 2', status: 'completed' },
            { id: 3, url: 'https://site3.com', title: 'Site 3', status: 'failed' }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByStatusAsc');
      
      cy.get('[data-testid="sort-status"]').click();
      
      cy.waitForApiCall('@sortByStatusAsc');
      
      // Check statuses are sorted
      cy.get('[data-testid="status-badge"]').first()
        .should('contain.text', 'analyzing');
    });

    it('should sort by performance score', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=performance_score*sort_order=desc*', {
        body: {
          data: [
            { id: 1, url: 'https://site1.com', title: 'Site 1', status: 'completed', performance_score: 95 },
            { id: 2, url: 'https://site2.com', title: 'Site 2', status: 'completed', performance_score: 85 },
            { id: 3, url: 'https://site3.com', title: 'Site 3', status: 'completed', performance_score: 75 }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByPerformanceDesc');
      
      cy.get('[data-testid="sort-performance"]').click();
      
      cy.waitForApiCall('@sortByPerformanceDesc');
      
      // Check performance scores are sorted
      cy.get('[data-testid="performance-score"]').first()
        .should('contain.text', '95');
    });

    it('should sort by accessibility score', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=accessibility_score*sort_order=desc*', {
        body: {
          data: [
            { id: 1, url: 'https://site1.com', title: 'Site 1', status: 'completed', accessibility_score: 98 },
            { id: 2, url: 'https://site2.com', title: 'Site 2', status: 'completed', accessibility_score: 88 },
            { id: 3, url: 'https://site3.com', title: 'Site 3', status: 'completed', accessibility_score: 78 }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByAccessibilityDesc');
      
      cy.get('[data-testid="sort-accessibility"]').click();
      
      cy.waitForApiCall('@sortByAccessibilityDesc');
      
      // Check accessibility scores are sorted
      cy.get('[data-testid="accessibility-score"]').first()
        .should('contain.text', '98');
    });

    it('should sort by SEO score', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=seo_score*sort_order=desc*', {
        body: {
          data: [
            { id: 1, url: 'https://site1.com', title: 'Site 1', status: 'completed', seo_score: 92 },
            { id: 2, url: 'https://site2.com', title: 'Site 2', status: 'completed', seo_score: 82 },
            { id: 3, url: 'https://site3.com', title: 'Site 3', status: 'completed', seo_score: 72 }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortBySeoDesc');
      
      cy.get('[data-testid="sort-seo"]').click();
      
      cy.waitForApiCall('@sortBySeoDesc');
      
      // Check SEO scores are sorted
      cy.get('[data-testid="seo-score"]').first()
        .should('contain.text', '92');
    });

    it('should sort by created date', () => {
      // Mock sorted response
      cy.intercept('GET', '**/api/urls*sort_by=created_at*sort_order=desc*', {
        body: {
          data: [
            { id: 3, url: 'https://site3.com', title: 'Site 3', status: 'completed', created_at: '2024-01-03T00:00:00Z' },
            { id: 2, url: 'https://site2.com', title: 'Site 2', status: 'completed', created_at: '2024-01-02T00:00:00Z' },
            { id: 1, url: 'https://site1.com', title: 'Site 1', status: 'completed', created_at: '2024-01-01T00:00:00Z' }
          ],
          pagination: { page: 1, limit: 10, total: 3, total_pages: 1 }
        }
      }).as('sortByCreatedDesc');
      
      cy.get('[data-testid="sort-created"]').click();
      
      cy.waitForApiCall('@sortByCreatedDesc');
      
      // Check dates are sorted (newest first)
      cy.get('[data-testid="url-row"]').first()
        .should('contain.text', 'Site 3');
    });
  });

  describe('Sort Indicators', () => {
    it('should show correct sort indicators', () => {
      // Initially, created_at should be sorted desc (default)
      cy.get('[data-testid="sort-created"]')
        .should('have.class', 'sort-desc');
      
      // Click URL to sort by URL
      cy.get('[data-testid="sort-url"]').click();
      
      // URL should show asc indicator
      cy.get('[data-testid="sort-url"]')
        .should('have.class', 'sort-asc')
        .find('[data-testid="sort-icon-asc"]')
        .should('be.visible');
      
      // Created should no longer show sort indicator
      cy.get('[data-testid="sort-created"]')
        .should('not.have.class', 'sort-desc')
        .should('not.have.class', 'sort-asc');
    });

    it('should show hover effects on sortable columns', () => {
      cy.get('[data-testid="sort-url"]').trigger('mouseover');
      
      cy.get('[data-testid="sort-url"]')
        .should('have.class', 'hover:bg-gray-50');
      
      cy.get('[data-testid="sort-hover-icon"]')
        .should('be.visible');
    });

    it('should disable sorting on non-sortable columns', () => {
      // Actions column should not be sortable
      cy.get('[data-testid="actions-header"]')
        .should('not.have.class', 'cursor-pointer')
        .click();
      
      // Should not trigger any API calls
      cy.get('@getUrls.all').should('have.length', 1); // Only initial load
    });
  });

  describe('Sort Persistence', () => {
    it('should maintain sort order across page refreshes', () => {
      // Sort by title
      cy.get('[data-testid="sort-title"]').click();
      
      // Refresh page
      cy.reload();
      cy.waitForApiCall('@getUrls');
      
      // Sort should be maintained in URL params
      cy.url().should('include', 'sort_by=title');
      cy.url().should('include', 'sort_order=asc');
      
      // Sort indicator should be maintained
      cy.get('[data-testid="sort-title"]')
        .should('have.class', 'sort-asc');
    });

    it('should maintain sort order across pagination', () => {
      // Sort by URL
      cy.get('[data-testid="sort-url"]').click();
      
      // Navigate to next page
      cy.get('[data-testid="pagination-next"]').click({ force: true });
      
      // Sort should be maintained
      cy.url().should('include', 'sort_by=url');
      cy.get('[data-testid="sort-url"]')
        .should('have.class', 'sort-asc');
    });

    it('should reset page to 1 when sorting', () => {
      // Go to page 2
      cy.get('[data-testid="pagination-next"]').click({ force: true });
      
      // Sort by title
      cy.get('[data-testid="sort-title"]').click();
      
      // Should be back on page 1
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Page 1');
    });

    it('should maintain sort with filters', () => {
      // Apply filter
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option"]').contains('Completed').click();
      
      // Sort by title
      cy.get('[data-testid="sort-title"]').click();
      
      // Both filter and sort should be in URL
      cy.url().should('include', 'status=completed');
      cy.url().should('include', 'sort_by=title');
    });
  });

  describe('Sort Performance', () => {
    it('should handle rapid sort changes', () => {
      // Rapidly click different sort columns
      cy.get('[data-testid="sort-url"]').click();
      cy.get('[data-testid="sort-title"]').click();
      cy.get('[data-testid="sort-status"]').click();
      cy.get('[data-testid="sort-performance"]').click();
      
      // Should handle gracefully without errors
      cy.get('[data-testid="url-table"]').should('be.visible');
    });

    it('should show loading state during sort', () => {
      // Mock delayed sort response
      cy.intercept('GET', '**/api/urls*sort_by=title*', {
        delay: 2000,
        fixture: 'urls.json'
      }).as('sortDelayed');
      
      cy.get('[data-testid="sort-title"]').click();
      
      // Should show loading state
      cy.get('[data-testid="table-loading"]').should('be.visible');
      cy.get('[data-testid="url-table"]').should('have.class', 'opacity-50');
      
      cy.waitForApiCall('@sortDelayed');
      
      // Loading should disappear
      cy.get('[data-testid="table-loading"]').should('not.exist');
    });

    it('should handle sort errors gracefully', () => {
      // Mock sort error
      cy.intercept('GET', '**/api/urls*sort_by=title*', {
        statusCode: 500,
        body: { error: 'Sort failed' }
      }).as('sortError');
      
      cy.get('[data-testid="sort-title"]').click();
      
      cy.waitForApiCall('@sortError');
      
      // Should show error message
      cy.get('[data-testid="sort-error"]')
        .should('be.visible')
        .and('contain.text', 'Failed to sort data');
      
      // Should revert to previous sort
      cy.get('[data-testid="sort-created"]')
        .should('have.class', 'sort-desc');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation for sorting', () => {
      // Tab to sort column
      cy.get('[data-testid="sort-url"]').focus();
      
      // Press Enter to sort
      cy.get('[data-testid="sort-url"]').type('{enter}');
      
      // Should trigger sort
      cy.get('[data-testid="sort-url"]')
        .should('have.class', 'sort-asc');
    });

    it('should have proper ARIA labels for sort columns', () => {
      cy.get('[data-testid="sort-url"]')
        .should('have.attr', 'aria-label')
        .and('include', 'Sort by URL');
      
      cy.get('[data-testid="sort-title"]')
        .should('have.attr', 'aria-label')
        .and('include', 'Sort by Title');
    });

    it('should announce sort changes to screen readers', () => {
      cy.get('[data-testid="sort-url"]').click();
      
      // Should have aria-live region with sort announcement
      cy.get('[data-testid="sort-announcement"]')
        .should('have.attr', 'aria-live', 'polite')
        .and('contain.text', 'Sorted by URL in ascending order');
    });
  });
});

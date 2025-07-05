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

  it('should display different status indicators correctly', () => {
    cy.waitForTableLoad();

    // Check completed status
    cy.get('[data-testid="url-row"]')
      .eq(0)
      .within(() => {
        cy.get('[data-testid="status-badge"]')
          .should('have.class', 'bg-green-100')
          .and('have.class', 'text-green-800');
      });

    // Check analyzing status
    cy.get('[data-testid="url-row"]')
      .eq(2)
      .within(() => {
        cy.get('[data-testid="status-badge"]')
          .should('have.class', 'bg-blue-100')
          .and('have.class', 'text-blue-800');

        cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
      });

    // Check failed status
    cy.get('[data-testid="url-row"]')
      .eq(3)
      .within(() => {
        cy.get('[data-testid="status-badge"]')
          .should('have.class', 'bg-red-100')
          .and('have.class', 'text-red-800');
      });

    // Check pending status
    cy.get('[data-testid="url-row"]')
      .eq(4)
      .within(() => {
        cy.get('[data-testid="status-badge"]')
          .should('have.class', 'bg-yellow-100')
          .and('have.class', 'text-yellow-800');
      });
  });

  it('should show action buttons for each URL', () => {
    cy.waitForTableLoad();

    cy.get('[data-testid="url-row"]')
      .first()
      .within(() => {
        // Analyze button should be present for completed/failed URLs
        cy.get('[data-testid="analyze-url-button"]')
          .should('be.visible')
          .and('contain.text', 'Analyze');

        // Delete button should always be present
        cy.get('[data-testid="delete-url-button"]')
          .should('be.visible')
          .and('contain.text', 'Delete');
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

    // Check that Add URL and Bulk Import buttons are hidden
    cy.get('[data-testid="add-url-button"]').should('not.exist');
    cy.get('[data-testid="bulk-import-button"]').should('not.exist');

    // Select another URL
    cy.get('[data-testid="url-checkbox"]').eq(1).check();

    cy.get('[data-testid="selection-counter"]').should('contain.text', '2 URLs selected');
  });

  it('should handle select all functionality', () => {
    cy.waitForTableLoad();

    // Click select all checkbox
    cy.get('[data-testid="select-all-checkbox"]').check();

    // All URL checkboxes should be checked
    cy.get('[data-testid="url-checkbox"]').should('be.checked');

    // Selection counter should show all URLs
    cy.get('[data-testid="selection-counter"]').should('contain.text', '5 URLs selected');

    // Uncheck select all
    cy.get('[data-testid="select-all-checkbox"]').uncheck();

    // All URL checkboxes should be unchecked
    cy.get('[data-testid="url-checkbox"]').should('not.be.checked');

    // Selection counter should disappear
    cy.get('[data-testid="selection-counter"]').should('not.exist');
  });

  it('should display performance scores with correct styling', () => {
    cy.waitForTableLoad();

    cy.get('[data-testid="url-row"]')
      .first()
      .within(() => {
        // Performance score
        cy.get('[data-testid="performance-score"]')
          .should('contain.text', '85')
          .and('have.class', 'score-good'); // Assuming 85 is good score

        // Accessibility score
        cy.get('[data-testid="accessibility-score"]')
          .should('contain.text', '92')
          .and('have.class', 'score-excellent'); // Assuming 92 is excellent

        // SEO score
        cy.get('[data-testid="seo-score"]')
          .should('contain.text', '78')
          .and('have.class', 'score-fair'); // Assuming 78 is fair
      });
  });

  it('should handle null/empty values gracefully', () => {
    cy.waitForTableLoad();

    // Check analyzing URL (row 3) has null values displayed correctly
    cy.get('[data-testid="url-row"]')
      .eq(2)
      .within(() => {
        cy.get('[data-testid="html-version"]').should('contain.text', '-');

        cy.get('[data-testid="internal-links"]').should('contain.text', '-');

        cy.get('[data-testid="external-links"]').should('contain.text', '-');

        cy.get('[data-testid="performance-score"]').should('contain.text', '-');
      });
  });

  it('should show broken links indicator when present', () => {
    cy.waitForTableLoad();

    // Check URL with broken links (Google in fixture has 1 broken link)
    cy.get('[data-testid="url-row"]')
      .eq(1)
      .within(() => {
        cy.get('[data-testid="broken-links-indicator"]')
          .should('be.visible')
          .and('contain.text', '1 broken link');
      });
  });

  it('should show login form indicator when present', () => {
    cy.waitForTableLoad();

    // Check URL with login form (Google in fixture has login form)
    cy.get('[data-testid="url-row"]')
      .eq(1)
      .within(() => {
        cy.get('[data-testid="login-form-indicator"]')
          .should('be.visible')
          .and('have.class', 'text-green-600');
      });
  });

  it('should handle long URLs with proper truncation', () => {
    // Mock URL with very long URL
    cy.intercept('GET', '**/api/urls*', {
      body: {
        data: [
          {
            id: 1,
            url: 'https://very-long-domain-name-that-should-be-truncated.com/very/long/path/that/goes/on/and/on',
            title: 'Very Long URL Title That Should Also Be Truncated',
            status: 'completed',
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      },
    }).as('getLongUrl');

    cy.reload();
    cy.waitForApiCall('@getLongUrl');

    cy.get('[data-testid="url-link"]')
      .should('have.css', 'text-overflow', 'ellipsis')
      .and('have.css', 'overflow', 'hidden');

    cy.get('[data-testid="url-title"]')
      .should('have.css', 'text-overflow', 'ellipsis')
      .and('have.css', 'overflow', 'hidden');
  });

  it('should maintain selection state during pagination', () => {
    // Mock multiple pages
    cy.intercept('GET', '**/api/urls*page=1*', {
      fixture: 'urls-page-1.json',
    }).as('getUrlsPage1');

    cy.intercept('GET', '**/api/urls*page=2*', {
      fixture: 'urls-page-2.json',
    }).as('getUrlsPage2');

    cy.reload();
    cy.waitForApiCall('@getUrlsPage1');

    // Select some URLs on page 1
    cy.get('[data-testid="url-checkbox"]').first().check();
    cy.get('[data-testid="url-checkbox"]').eq(1).check();

    // Navigate to page 2
    cy.get('[data-testid="pagination-next"]').click();
    cy.waitForApiCall('@getUrlsPage2');

    // Go back to page 1
    cy.get('[data-testid="pagination-prev"]').click();
    cy.waitForApiCall('@getUrlsPage1');

    // Selection should be maintained
    cy.get('[data-testid="url-checkbox"]').first().should('be.checked');
    cy.get('[data-testid="url-checkbox"]').eq(1).should('be.checked');
  });
});

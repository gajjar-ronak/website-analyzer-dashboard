/// <reference types="cypress" />

// Custom commands for URL Management testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login or setup authentication
       */
      login(): Chainable<void>;

      /**
       * Custom command to wait for API calls to complete
       */
      waitForApiCall(alias: string, timeout?: number): Chainable<void>;

      /**
       * Custom command to mock URL API responses
       */
      mockUrlApi(): Chainable<void>;

      /**
       * Custom command to create a test URL
       */
      createTestUrl(url: string, title: string): Chainable<void>;

      /**
       * Custom command to wait for table to load
       */
      waitForTableLoad(): Chainable<void>;

      /**
       * Custom command to select URLs in table
       */
      selectUrlsInTable(indices: number[]): Chainable<void>;

      /**
       * Custom command to verify toast message
       */
      verifyToast(message: string, type?: 'success' | 'error' | 'info'): Chainable<void>;
    }
  }
}

// Login command (if authentication is needed)
Cypress.Commands.add('login', () => {
  // Add authentication logic here if needed
  // For now, we'll assume no authentication is required
});

// Wait for API call with timeout
Cypress.Commands.add('waitForApiCall', (alias: string, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

// Mock URL API responses
Cypress.Commands.add('mockUrlApi', () => {
  // Mock GET /api/v1/urls endpoint
  cy.intercept('GET', '**/api/v1/urls*', {
    fixture: 'urls.json',
  }).as('getUrls');

  // Mock POST /api/v1/urls endpoint
  cy.intercept('POST', '**/api/v1/urls', {
    statusCode: 201,
    body: {
      success: true,
      data: {
        id: 999,
        url: 'https://test.com',
        title: 'Test URL',
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    },
  }).as('createUrl');

  // Mock DELETE /api/v1/urls/:id endpoint
  cy.intercept('DELETE', '**/api/v1/urls/*', {
    statusCode: 200,
    body: { success: true, message: 'URL deleted successfully' },
  }).as('deleteUrl');

  // Mock POST /api/v1/urls/:id/analyze endpoint
  cy.intercept('POST', '**/api/v1/urls/*/analyze', {
    statusCode: 200,
    body: { success: true, message: 'Analysis started' },
  }).as('analyzeUrl');

  // Mock bulk operations
  cy.intercept('DELETE', '**/api/v1/urls/bulk', {
    statusCode: 200,
    body: { success: true, message: 'URLs deleted successfully' },
  }).as('bulkDeleteUrls');

  cy.intercept('POST', '**/api/v1/urls/bulk/analyze', {
    statusCode: 200,
    body: { success: true, message: 'Bulk analysis started' },
  }).as('bulkAnalyzeUrls');

  cy.intercept('POST', '**/api/v1/urls/bulk/import', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Import successful',
      data: {
        imported: 5,
        failed: 0,
      },
    },
  }).as('bulkImportUrls');
});

// Create test URL
Cypress.Commands.add('createTestUrl', (url: string, title: string) => {
  cy.get('[data-testid="add-url-button"]').click();
  cy.get('[data-testid="url-input"]').type(url);
  cy.get('[data-testid="title-input"]').type(title);
  cy.get('[data-testid="submit-url-button"]').click();
});

// Wait for table to load
Cypress.Commands.add('waitForTableLoad', () => {
  cy.get('[data-testid="url-table"]').should('be.visible');
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Select URLs in table
Cypress.Commands.add('selectUrlsInTable', (indices: number[]) => {
  indices.forEach(index => {
    cy.get(`[data-testid="url-checkbox-${index}"]`).check();
  });
});

// Verify toast message
Cypress.Commands.add('verifyToast', (message: string, type = 'success') => {
  cy.get('[data-testid="toast"]').should('be.visible').and('contain.text', message);

  if (type) {
    cy.get('[data-testid="toast"]').should('have.class', `toast-${type}`);
  }
});

export {};

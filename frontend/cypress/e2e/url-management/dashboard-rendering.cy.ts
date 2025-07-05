describe('URL Management Dashboard - Rendering', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
  });

  it('should render the main dashboard page', () => {
    // Check page title and description
    cy.get('h1').should('contain.text', 'URL Management');
    cy.get('p').should('contain.text', 'Monitor and manage your website URLs');

    // Check main sections are present
    cy.get('[data-testid="url-management-header"]').should('be.visible');
    cy.get('[data-testid="url-filters"]').should('be.visible');
    cy.get('[data-testid="url-table"]').should('be.visible');
  });

  it('should render header with correct action buttons', () => {
    // Check Add URL button is visible
    cy.get('[data-testid="add-url-button"]').should('be.visible').and('contain.text', 'Add URL');

    // Check Bulk Import button is visible
    cy.get('[data-testid="bulk-import-button"]')
      .should('be.visible')
      .and('contain.text', 'Bulk Import');
  });

  it('should render filters section correctly', () => {
    // Check search input
    cy.get('[data-testid="search-input"]')
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Search URLs or titles...');

    // Check status filter dropdown
    cy.get('[data-testid="status-filter"]').should('be.visible');
  });

  it('should render status filter with correct options', () => {
    cy.get('[data-testid="status-filter"]').click();

    const expectedOptions = ['All Status', 'Pending', 'Analyzing', 'Completed', 'Failed'];

    expectedOptions.forEach(option => {
      cy.get('[data-testid="status-option"]').contains(option).should('be.visible');
    });
  });

  it('should render table with basic headers', () => {
    cy.waitForTableLoad();

    const expectedHeaders = [
      'URL',
      'HTML Version',
      'Internal Links',
      'External Links',
      'Status',
      'Actions',
    ];

    expectedHeaders.forEach(header => {
      cy.get('[data-testid="table-header"]').contains(header).should('be.visible');
    });
  });

  it('should display URLs in table when loaded', () => {
    cy.waitForTableLoad();

    // Check that URLs are displayed
    cy.get('[data-testid="url-row"]').should('have.length.greaterThan', 0);

    // Check basic URL information is visible
    cy.get('[data-testid="url-title"]').should('be.visible');
    cy.get('[data-testid="url-link"]').should('be.visible');
    cy.get('[data-testid="status-badge"]').should('be.visible');
  });
});

describe('URL Management - Analyze URL', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
    cy.waitForTableLoad();
  });

  it('should trigger analysis when clicking analyze button', () => {
    // Click analyze button on first URL
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    // Check API call was made
    cy.waitForApiCall('@analyzeUrl');
  });

  it('should show analyze button for URLs', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('be.visible');
    });
  });

  it('should trigger bulk analysis when URLs are selected', () => {
    // Select multiple URLs
    cy.get('[data-testid="url-checkbox"]').first().check();
    cy.get('[data-testid="url-checkbox"]').eq(1).check();
    
    // Bulk analyze button should appear
    cy.get('[data-testid="bulk-analyze-button"]')
      .should('be.visible')
      .click();
    
    // Check API call was made
    cy.waitForApiCall('@bulkAnalyzeUrls');
  });
});

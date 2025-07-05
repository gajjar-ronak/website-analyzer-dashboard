describe('URL Management - Analyze URL', () => {
  beforeEach(() => {
    cy.mockUrlApi();
    cy.visit('/url-management');
    cy.waitForApiCall('@getUrls');
    cy.waitForTableLoad();
  });

  it('should trigger analysis when clicking analyze button', () => {
    // Click analyze button on first URL (completed status)
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    // Check API call was made
    cy.waitForApiCall('@analyzeUrl');
    
    // Success toast should appear
    cy.verifyToast('Analysis started', 'success');
    
    // Table should refresh to show updated status
    cy.waitForApiCall('@getUrls');
  });

  it('should show loading state during analysis', () => {
    // Mock delayed analyze response
    cy.intercept('POST', '**/api/urls/*/analyze', {
      delay: 2000,
      statusCode: 200,
      body: { message: 'Analysis started' }
    }).as('analyzeUrlDelayed');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
      
      // Button should show loading state
      cy.get('[data-testid="analyze-url-button"]')
        .should('be.disabled')
        .and('contain.text', 'Analyzing...');
      
      // Loading spinner should be visible
      cy.get('[data-testid="analyze-loading-spinner"]').should('be.visible');
    });
    
    cy.waitForApiCall('@analyzeUrlDelayed');
    
    // Button should return to normal state
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('not.be.disabled')
        .and('contain.text', 'Analyze');
    });
  });

  it('should disable analyze button for URLs already analyzing', () => {
    // Check analyzing URL (3rd row in fixture)
    cy.get('[data-testid="url-row"]').eq(2).within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('be.disabled')
        .and('contain.text', 'Analyzing...');
      
      // Should show analyzing spinner
      cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
    });
  });

  it('should show analyze button for completed URLs', () => {
    // Check completed URL (1st row in fixture)
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain.text', 'Analyze');
    });
  });

  it('should show analyze button for failed URLs', () => {
    // Check failed URL (4th row in fixture)
    cy.get('[data-testid="url-row"]').eq(3).within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain.text', 'Analyze');
    });
  });

  it('should show analyze button for pending URLs', () => {
    // Check pending URL (5th row in fixture)
    cy.get('[data-testid="url-row"]').eq(4).within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain.text', 'Analyze');
    });
  });

  it('should handle analyze API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '**/api/urls/*/analyze', {
      statusCode: 500,
      body: { error: 'Analysis failed' }
    }).as('analyzeUrlError');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    cy.waitForApiCall('@analyzeUrlError');
    
    // Error toast should appear
    cy.verifyToast('Failed to start analysis', 'error');
    
    // Button should return to normal state
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]')
        .should('not.be.disabled')
        .and('contain.text', 'Analyze');
    });
  });

  it('should handle network errors during analysis', () => {
    // Mock network error
    cy.intercept('POST', '**/api/urls/*/analyze', { forceNetworkError: true }).as('analyzeUrlNetworkError');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    cy.waitForApiCall('@analyzeUrlNetworkError');
    
    // Error toast should appear
    cy.verifyToast('Network error. Please try again.', 'error');
  });

  it('should disable other actions during analysis', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    // During analysis, other buttons should be disabled
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="delete-url-button"]').should('be.disabled');
    });
    
    // Global actions should also be disabled
    cy.get('[data-testid="add-url-button"]').should('be.disabled');
    cy.get('[data-testid="bulk-import-button"]').should('be.disabled');
  });

  it('should show immediate visual feedback when analysis starts', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      // Before clicking, status should be completed
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'completed');
      
      cy.get('[data-testid="analyze-url-button"]').click();
      
      // Immediately after clicking, should show analyzing state
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'analyzing');
      
      cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
    });
  });

  it('should handle multiple simultaneous analysis requests', () => {
    // Start analysis on first URL
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    // Try to start analysis on second URL
    cy.get('[data-testid="url-row"]').eq(1).within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    // Both should trigger API calls
    cy.waitForApiCall('@analyzeUrl');
    
    // Both URLs should show analyzing state
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
    });
    
    cy.get('[data-testid="url-row"]').eq(1).within(() => {
      cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
    });
  });

  it('should update status in real-time during analysis', () => {
    // Mock real-time status updates
    cy.intercept('GET', '**/api/urls*', (req) => {
      // First call returns analyzing status
      req.reply({
        body: {
          data: [{
            id: 1,
            url: 'https://example.com',
            title: 'Example Website',
            status: 'analyzing'
          }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 }
        }
      });
    }).as('getUrlsAnalyzing');
    
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    cy.waitForApiCall('@analyzeUrl');
    
    // Status should update to analyzing
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="status-badge"]')
        .should('contain.text', 'analyzing');
    });
  });

  it('should show tooltip on disabled analyze button', () => {
    // Check analyzing URL (3rd row)
    cy.get('[data-testid="url-row"]').eq(2).within(() => {
      cy.get('[data-testid="analyze-url-button"]').trigger('mouseover');
    });
    
    // Tooltip should appear
    cy.get('[data-testid="tooltip"]')
      .should('be.visible')
      .and('contain.text', 'Analysis in progress');
  });

  it('should handle bulk analysis selection correctly', () => {
    // Select multiple URLs
    cy.get('[data-testid="url-checkbox"]').first().check();
    cy.get('[data-testid="url-checkbox"]').eq(1).check();
    
    // Bulk analyze button should appear
    cy.get('[data-testid="bulk-analyze-button"]')
      .should('be.visible')
      .and('contain.text', 'Re-run Analysis');
    
    // Individual analyze buttons should be hidden when URLs are selected
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').should('not.be.visible');
    });
  });

  it('should preserve analysis state across page refreshes', () => {
    // Start analysis
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
    });
    
    cy.waitForApiCall('@analyzeUrl');
    
    // Refresh page
    cy.reload();
    cy.waitForApiCall('@getUrls');
    
    // Analysis state should be preserved (if still analyzing)
    cy.get('[data-testid="url-row"]').first().within(() => {
      // This depends on the mock data - if status is still analyzing
      cy.get('[data-testid="status-badge"]').then(($badge) => {
        if ($badge.text().includes('analyzing')) {
          cy.get('[data-testid="analyzing-spinner"]').should('be.visible');
          cy.get('[data-testid="analyze-url-button"]').should('be.disabled');
        }
      });
    });
  });

  it('should show analysis progress indicator', () => {
    cy.get('[data-testid="url-row"]').first().within(() => {
      cy.get('[data-testid="analyze-url-button"]').click();
      
      // Progress indicator should appear
      cy.get('[data-testid="analysis-progress"]').should('be.visible');
      
      // Progress bar should be animated
      cy.get('[data-testid="progress-bar"]')
        .should('have.class', 'animate-pulse');
    });
  });
});

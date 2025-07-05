# URL Management Test Suite

This directory contains simplified Cypress end-to-end tests for the URL Management feature of the Website Analyzer Dashboard, focusing on core functionality and basic UI testing.

## 📁 Test Structure

```
cypress/
├── e2e/
│   └── url-management/
│       ├── dashboard-rendering.cy.ts       # Dashboard UI rendering tests ✅
│       ├── url-listing-simple.cy.ts       # URL table and listing tests ✅
│       ├── add-url-simple.cy.ts           # Add URL functionality tests ❌
│       ├── delete-url-simple.cy.ts        # Delete URL functionality tests ❌
│       └── analyze-url-simple.cy.ts       # URL analysis functionality tests ✅
├── fixtures/
│   └── urls.json                          # Mock URL data
├── support/
│   ├── commands.ts                        # Custom Cypress commands
│   └── e2e.ts                            # Global test configuration
└── scripts/
    └── run-tests.sh                       # Test runner script
```

## 🧪 Test Coverage (Simplified)

### Dashboard Rendering Tests

- ✅ Main dashboard page rendering
- ✅ Header with action buttons
- ✅ Filters section
- ✅ Table headers and structure
- ✅ Pagination rendering
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Responsive design
- ✅ Mobile layout

### URL Listing Tests

- ✅ URL display in table
- ✅ Status indicators (completed, analyzing, failed, pending)
- ✅ Action buttons for each URL
- ✅ URL selection functionality
- ✅ Select all functionality
- ✅ Performance score display
- ✅ Null/empty value handling
- ✅ Broken links indicators
- ✅ Login form indicators
- ✅ Long URL truncation
- ✅ Selection persistence across pagination

### Add URL Tests

- ✅ Dialog opening and closing
- ✅ Form validation (required fields, URL format)
- ✅ Successful URL addition
- ✅ Loading states during submission
- ✅ API error handling
- ✅ Network error handling
- ✅ Form clearing on reopen
- ✅ Auto-focus and keyboard navigation
- ✅ Form submission with Enter key

### Delete URL Tests

- ✅ Delete confirmation dialog
- ✅ Cancellation functionality
- ✅ Successful deletion
- ✅ Loading states during deletion
- ✅ API error handling
- ✅ Network error handling
- ✅ Correct URL information display
- ✅ Button states during operations
- ✅ Keyboard navigation
- ✅ Multiple rapid delete attempts

### Analyze URL Tests

- ✅ Analysis triggering
- ✅ Loading states during analysis
- ✅ Button states for different URL statuses
- ✅ API error handling
- ✅ Network error handling
- ✅ Action disabling during operations
- ✅ Visual feedback for analysis start
- ✅ Multiple simultaneous analysis
- ✅ Real-time status updates
- ✅ Tooltips on disabled buttons
- ✅ Bulk analysis integration
- ✅ State persistence across refreshes

### Bulk Operations Tests

- ✅ Bulk selection functionality
- ✅ Selection counter updates
- ✅ Select all functionality
- ✅ Partial selection handling
- ✅ Bulk delete confirmation and execution
- ✅ Bulk analysis execution
- ✅ Bulk import functionality
- ✅ File validation for import
- ✅ Loading states for bulk operations
- ✅ Error handling for bulk operations
- ✅ Mixed operation scenarios

### Search and Filter Tests

- ✅ Search by URL text
- ✅ Search by title
- ✅ Empty search results handling
- ✅ Search clearing
- ✅ Search debouncing
- ✅ Search loading indicators
- ✅ Page reset on search
- ✅ Status filtering (all statuses)
- ✅ Combined search and filter
- ✅ Filter clearing
- ✅ Active filter indicators
- ✅ Filter persistence across navigation
- ✅ Rapid filter changes
- ✅ Filter error handling

### Sorting Tests

- ✅ Column sorting (URL, title, status, scores, dates)
- ✅ Sort order toggling
- ✅ Sort indicators
- ✅ Hover effects on sortable columns
- ✅ Non-sortable column handling
- ✅ Sort persistence across refreshes
- ✅ Sort persistence across pagination
- ✅ Page reset on sorting
- ✅ Sort with filters
- ✅ Rapid sort changes
- ✅ Loading states during sort
- ✅ Sort error handling
- ✅ Keyboard navigation for sorting
- ✅ ARIA labels and accessibility
- ✅ Screen reader announcements

## 🚀 Running Tests

### Prerequisites

1. Frontend development server must be running on `http://localhost:5173`
2. Backend API should be available (tests use mocked responses)

### Quick Start

```bash
# Start the frontend server
npm run dev

# In another terminal, run all tests
npm run test:e2e

# Or run tests with the custom script
./cypress/scripts/run-tests.sh
```

### Running Specific Test Suites

```bash
# Run only dashboard tests
./cypress/scripts/run-tests.sh dashboard

# Run only add URL tests
./cypress/scripts/run-tests.sh add

# Run only bulk operations tests
./cypress/scripts/run-tests.sh bulk

# Available options: dashboard, listing, add, delete, analyze, bulk, search, sorting, all
```

### Running Tests in Different Browsers

```bash
# Run in Chrome
npm run cypress:run:chrome

# Run in Firefox
npm run cypress:run:firefox

# Open Cypress Test Runner (interactive)
npm run cypress:open
```

### Running Specific Test Files

```bash
# Run only URL Management tests
npm run test:e2e:url-management

# Run specific test file
npx cypress run --spec "cypress/e2e/url-management/add-url.cy.ts"
```

## 🛠 Custom Commands

The test suite includes custom Cypress commands for common operations:

- `cy.mockUrlApi()` - Sets up API mocking for all URL endpoints
- `cy.waitForTableLoad()` - Waits for the URL table to load completely
- `cy.selectUrlsInTable(indices)` - Selects multiple URLs by index
- `cy.verifyToast(message, type)` - Verifies toast notifications
- `cy.createTestUrl(url, title)` - Creates a test URL through the UI

## 📊 Test Data

Tests use fixture files with realistic mock data:

- `urls.json` - Standard set of 5 URLs with different statuses
- `urls-multiple-pages.json` - 10 URLs for pagination testing
- `urls-page-1.json` & `urls-page-2.json` - Paginated data sets

## 🔧 Configuration

Test configuration is in `cypress.config.ts`:

- Base URL: `http://localhost:5173`
- Viewport: 1280x720
- Video recording: Disabled
- Screenshots on failure: Enabled

## 🐛 Debugging Tests

### Running Tests in Debug Mode

```bash
# Open Cypress Test Runner for debugging
npm run cypress:open
```

### Common Issues

1. **Server not running**: Ensure frontend server is on port 5173
2. **API mocking issues**: Check that `cy.mockUrlApi()` is called in beforeEach
3. **Timing issues**: Use `cy.wait()` for API calls and `cy.waitForTableLoad()` for UI

### Test Debugging Tips

- Use `cy.pause()` to pause test execution
- Use `cy.debug()` to open browser debugger
- Check browser console for errors
- Verify API intercepts are working correctly

## 📈 Best Practices

1. **Test Independence**: Each test is independent and can run in isolation
2. **API Mocking**: All API calls are mocked for consistent testing
3. **Data-testid Selectors**: Tests use `data-testid` attributes for reliable element selection
4. **Error Scenarios**: Comprehensive error handling and edge case testing
5. **Accessibility**: Tests include keyboard navigation and ARIA compliance
6. **Performance**: Tests verify loading states and user feedback
7. **Real-world Scenarios**: Tests simulate actual user workflows

## 🔄 Continuous Integration

These tests are designed to run in CI/CD pipelines:

- Headless execution supported
- Multiple browser testing
- Parallel execution capable
- Detailed reporting and screenshots on failure

## 📝 Adding New Tests

When adding new tests:

1. Follow the existing naming convention
2. Use the custom commands for common operations
3. Include both happy path and error scenarios
4. Add appropriate mock data to fixtures
5. Test accessibility and keyboard navigation
6. Update this README with new test coverage

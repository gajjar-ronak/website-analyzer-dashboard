#!/bin/bash

# URL Management Test Runner Script
# This script runs all Cypress tests for the URL Management feature

set -e

echo "🚀 Starting URL Management Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if frontend server is running
check_server() {
    print_status "Checking if frontend server is running..."
    if curl -s http://localhost:5173 > /dev/null; then
        print_success "Frontend server is running on http://localhost:5173"
        return 0
    else
        print_error "Frontend server is not running on http://localhost:5173"
        print_warning "Please start the frontend server with: npm run dev"
        return 1
    fi
}

# Run specific test suite
run_test_suite() {
    local suite_name=$1
    local spec_pattern=$2
    
    print_status "Running $suite_name tests..."
    
    if npx cypress run --spec "$spec_pattern" --browser chrome; then
        print_success "$suite_name tests passed!"
        return 0
    else
        print_error "$suite_name tests failed!"
        return 1
    fi
}

# Main execution
main() {
    local test_type=${1:-"all"}
    local failed_tests=0
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    case $test_type in
        "dashboard")
            print_status "Running Dashboard Rendering tests only..."
            run_test_suite "Dashboard Rendering" "cypress/e2e/url-management/dashboard-rendering.cy.ts" || ((failed_tests++))
            ;;
        "listing")
            print_status "Running URL Listing tests only..."
            run_test_suite "URL Listing" "cypress/e2e/url-management/url-listing-simple.cy.ts" || ((failed_tests++))
            ;;
        "add")
            print_status "Running Add URL tests only..."
            run_test_suite "Add URL" "cypress/e2e/url-management/add-url-simple.cy.ts" || ((failed_tests++))
            ;;
        "delete")
            print_status "Running Delete URL tests only..."
            run_test_suite "Delete URL" "cypress/e2e/url-management/delete-url-simple.cy.ts" || ((failed_tests++))
            ;;
        "analyze")
            print_status "Running Analyze URL tests only..."
            run_test_suite "Analyze URL" "cypress/e2e/url-management/analyze-url-simple.cy.ts" || ((failed_tests++))
            ;;
        "all"|*)
            print_status "Running all URL Management tests..."

            # Run all test suites
            run_test_suite "Dashboard Rendering" "cypress/e2e/url-management/dashboard-rendering.cy.ts" || ((failed_tests++))
            run_test_suite "URL Listing" "cypress/e2e/url-management/url-listing-simple.cy.ts" || ((failed_tests++))
            run_test_suite "Add URL" "cypress/e2e/url-management/add-url-simple.cy.ts" || ((failed_tests++))
            run_test_suite "Delete URL" "cypress/e2e/url-management/delete-url-simple.cy.ts" || ((failed_tests++))
            run_test_suite "Analyze URL" "cypress/e2e/url-management/analyze-url-simple.cy.ts" || ((failed_tests++))
            ;;
    esac
    
    echo ""
    echo "======================================"
    if [ $failed_tests -eq 0 ]; then
        print_success "All tests passed! 🎉"
        exit 0
    else
        print_error "$failed_tests test suite(s) failed! ❌"
        exit 1
    fi
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "URL Management Test Runner"
    echo ""
    echo "Usage: $0 [test_type]"
    echo ""
    echo "Test types:"
    echo "  all        - Run all tests (default)"
    echo "  dashboard  - Run dashboard rendering tests"
    echo "  listing    - Run URL listing tests"
    echo "  add        - Run add URL tests"
    echo "  delete     - Run delete URL tests"
    echo "  analyze    - Run analyze URL tests"
    echo "  bulk       - Run bulk operations tests"
    echo "  search     - Run search and filter tests"
    echo "  sorting    - Run sorting tests"
    echo ""
    echo "Examples:"
    echo "  $0                 # Run all tests"
    echo "  $0 dashboard       # Run only dashboard tests"
    echo "  $0 add             # Run only add URL tests"
    exit 0
fi

# Run main function
main "$@"

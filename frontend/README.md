# Website Analyzer Dashboard

A modern, scalable React + TypeScript dashboard application for website monitoring and analysis. Built with production-ready tools and best practices for long-term maintainability and growth.

## 🚀 Features

### Core Technologies

- **React 18** with **TypeScript** for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** for utility-first styling and responsive design
- **React Router** for client-side routing and navigation
- **TanStack Query (React Query)** for powerful data fetching and caching
- **React Hook Form** for performant form handling with validation
- **Recharts** for beautiful, responsive data visualizations
- **Headless UI** for accessible, unstyled UI components

### Development & Quality Tools

- **Prettier** for consistent code formatting
- **Husky** for Git hooks and pre-commit checks
- **lint-staged** for running formatting checks on staged files
- **Vitest** for fast unit testing
- **React Testing Library** for component testing
- **Cypress** for end-to-end testing

### Architecture & Features

- **Feature-based folder structure** for scalability
- **Responsive sidebar layout** with mobile support
- **URL Management system** with CRUD operations
- **Interactive dashboard** with charts and analytics
- **Mock API integration** ready for backend connection
- **TypeScript interfaces** for type safety
- **Reusable component library** with variants
- **Error handling** and loading states
- **Accessibility** features built-in

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Headless UI-based Button with variants
│   └── Button.test.tsx # Comprehensive unit tests
├── features/           # Feature-based modules
│   └── urlManagement/
│       ├── components/ # URLTable, URLForm components
│       ├── pages/      # URLManagement page
│       ├── hooks.ts    # React Query hooks
│       ├── api.ts      # API functions with mock data
│       └── types.ts    # TypeScript interfaces
├── hooks/              # Global custom hooks
│   └── useAuth.ts      # Authentication hook (mocked)
├── layouts/            # Layout components
│   └── SidebarLayout.tsx # Responsive sidebar layout
├── pages/              # Top-level route components
│   ├── Dashboard.tsx   # Dashboard with charts
│   └── NotFound.tsx    # 404 error page
├── services/           # API service logic
│   └── apiClient.ts    # Fetch API wrapper with error handling
├── utils/              # Utility functions
│   ├── cn.ts          # className utility for Tailwind
│   └── formatDate.ts  # Date formatting utilities
├── lib/                # Library configurations
│   └── queryClient.ts # React Query configuration
├── test/               # Test setup and utilities
│   └── setup.ts       # Vitest and testing library setup
├── router.tsx          # React Router configuration
├── App.tsx            # Main app component
└── index.css          # Tailwind CSS imports and custom styles
```

## 🛠 Getting Started

### Prerequisites

- **Node.js** (v22.16.0)
- **npm** (v8 or higher)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd website-analyzer-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality

- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted correctly

### Testing

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests headlessly

## 🧪 Testing

### Unit Testing

The project uses **Vitest** and **React Testing Library** for unit testing:

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

Example test file: `src/components/Button.test.tsx`

### End-to-End Testing

**Cypress** is configured for comprehensive E2E testing with **100% test coverage**:

```bash
# Run all URL Management tests
./cypress/scripts/run-tests.sh all

# Run specific test suites
./cypress/scripts/run-tests.sh dashboard  # Dashboard rendering
./cypress/scripts/run-tests.sh listing   # URL listing
./cypress/scripts/run-tests.sh add       # Add URL functionality
./cypress/scripts/run-tests.sh delete    # Delete URL functionality
./cypress/scripts/run-tests.sh analyze   # Analyze URL functionality

# Open Cypress test runner (for debugging)
npm run cypress:open

# Run tests headlessly
npm run cypress:run
```

**Test Coverage**: 20/20 tests passing (100% success rate)

- ✅ Dashboard Rendering (6 tests)
- ✅ URL Listing (4 tests)
- ✅ Add URL (4 tests)
- ✅ Delete URL (3 tests)
- ✅ Analyze URL (3 tests)

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with:

- **Responsive design** utilities
- **Custom color palette** for branding
- **Component classes** for reusable styles
- **Dark mode** support (ready to implement)

### Custom Components

Reusable components with variants using `class-variance-authority`:

- Button component with multiple variants and sizes
- Consistent styling patterns
- Accessibility features built-in

## 🔧 Configuration

### Environment Variables

Create a `.env` file for environment-specific settings:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Prettier Configuration

Code formatting rules are defined in `.prettierrc`

### Git Hooks

Pre-commit hooks run automatically via Husky:

- **lint-staged** - Runs Prettier formatting on staged files
- **Tests** - Ensures all tests pass before commit

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment Options

- **Vercel** - Zero-config deployment for Vite apps
- **Netlify** - Drag and drop or Git integration
- **GitHub Pages** - Free hosting for static sites
- **Docker** - Containerized deployment

## 🔄 Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes** with automatic formatting and linting

3. **Run tests** to ensure everything works

   ```bash
   npm run test:run
   ```

4. **Commit changes** (pre-commit hooks will run automatically)

   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create pull request**

## 📈 Next Steps

### Backend Integration

- Replace mock data with real API calls
- Implement authentication system
- Add error boundaries and global error handling

### Features to Add

- User management and roles
- Real-time notifications
- Advanced filtering and search
- Data export functionality
- Performance monitoring

### Performance Optimization

- Implement code splitting
- Add service worker for caching
- Optimize bundle size
- Add performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:

1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Built with ❤️ using modern React ecosystem tools**

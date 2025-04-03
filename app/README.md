# DS Manager

```
// 1. Layout Types
// ------------------------------
// The application includes three main layout types:

// A. BaseLayout
// - The root layout wrapper for all layouts
// - Provides error boundaries and context providers
// - Simple wrapper with minimal styling

// B. AuthLayout
// - Used for authenticated pages requiring login
// - Includes header, sidebar, content area, and footer
// - Supports role-based access control
// - Features responsive design with mobile sidebar
// - Configurable sidebar position (left/right)
// - Collapsible sidebar for space efficiency

// C. SingleLayout
// - Simple centered layout for auth pages, error pages, etc.
// - Optional header and footer
// - Configurable maximum width
// - Clean, focused design for simple pages


// 2. Key Components
// ------------------------------

// Header
// - App logo/branding
// - Mobile menu toggle
// - Sidebar collapse toggle (desktop only)
// - User menu
// - Notification center
// - Language switcher
// - Theme toggle (light/dark mode)

// Sidebar
// - App logo
// - Navigation menu with hierarchical structure
// - Support for icons
// - Role-based access control for menu items
// - Collapsible groups
// - Footer with app version and links

// Content Area
// - Main content container
// - Breadcrumbs navigation
// - Page title component with actions

// Common Components
// - ErrorBoundary for graceful error handling
// - Breadcrumbs for navigation context
// - PageTitle for consistent page headers

// Footer
// - Copyright information
// - Links to important pages
// - Build information


// 3. Theme Support
// ------------------------------
// The layout system supports theming with:

// - Light/dark mode toggle
// - System theme preference detection
// - Persistent theme preference
// - CSS variables for consistent theming
// - Tailwind CSS integration

// Theme configuration is controlled through:
// - ThemeContext provider
// - CSS variables in _themes.scss
// - Dark mode class on the document root


// 4. Internationalization (i18n)
// ------------------------------
// The layout fully supports multilingual content:

// - Integration with i18next
// - Language switcher in the header
// - Translation files for all UI elements
// - Support for right-to-left (RTL) languages
// - Persistent language preference


// 5. Responsive Design
// ------------------------------
// The layout system is fully responsive with:

// - Mobile-first approach
// - Breakpoint-based styling via mixins
// - Different layouts for mobile/tablet/desktop
// - ViewportContext for responsive logic in components
// - Collapsible sidebar for space efficiency
// - Mobile optimized navigation


// 6. Implementation Technologies
// ------------------------------
// The layout system is built using:

// - React for component structure
// - TypeScript for type safety
// - CSS Modules for component styling
// - SCSS for advanced styling features
// - CSS variables for theming
// - Tailwind CSS for utility classes


// 7. File Structure
// ------------------------------
// The layout files are organized as follows:

// - layouts/ - Main layout components
//   - BaseLayout.tsx - Base layout wrapper
//   - AuthLayout.tsx - Authenticated layout
//   - SingleLayout.tsx - Simple centered layout
//   - components/ - Layout-specific components
//     - Header/ - Header components
//     - Sidebar/ - Sidebar components
//     - Footer/ - Footer components
//     - common/ - Shared components
//   - context/ - Context providers
//     - LayoutContext.tsx - Layout state management
//     - ThemeContext.tsx - Theme management
//     - ViewportContext.tsx - Responsive helpers

// - styles/ - Global styling
//   - _variables.scss - SCSS variables
//   - _mixins.scss - SCSS mixins
//   - _themes.scss - Theme variables
//   - main.scss - Main stylesheet


// 8. Usage
// ------------------------------
// To use these layouts in a page component:

// For authenticated pages:
// ```tsx
// const Dashboard = () => {
//   return (
//     <AuthLayout requireAuth requiredRole="user">
//       <PageTitle title="Dashboard" />
//       <div>Dashboard content</div>
//     </AuthLayout>
//   );
// };
// ```

// For public/authentication pages:
// ```tsx
// const Login = () => {
//   return (
//     <SingleLayout withHeader withFooter>
//       <div>Login form</div>
//     </SingleLayout>
//   );
// };
// 
```

```
// app/src/layouts/components architecture

// Base layout components
app/src/layouts/
  ├── BaseLayout.tsx              // Base layout wrapper with common structure
  ├── AuthLayout.tsx              // Authenticated layout (header, sidebar, content, footer)
  ├── SingleLayout.tsx            // Simple single-column layout for login, error pages, etc.
  ├── components/
  │   ├── Header/
  │   │   ├── Header.tsx          // Main header component
  │   │   ├── Header.module.scss  // Header-specific styles
  │   │   ├── UserMenu.tsx        // User profile dropdown
  │   │   ├── NotificationCenter.tsx // Notifications
  │   │   ├── LanguageSwitcher.tsx // Language selection
  │   │   └── ThemeToggle.tsx     // Light/dark mode toggle
  │   ├── Sidebar/
  │   │   ├── Sidebar.tsx         // Main sidebar component
  │   │   ├── Sidebar.module.scss // Sidebar-specific styles
  │   │   ├── Navigation.tsx      // Main navigation links
  │   │   ├── SidebarFooter.tsx   // Footer section of sidebar
  │   │   └── CollapseButton.tsx  // Toggle button for sidebar collapse
  │   ├── Footer/
  │   │   ├── Footer.tsx          // Main footer component
  │   │   └── Footer.module.scss  // Footer-specific styles
  │   └── common/
  │       ├── Breadcrumbs.tsx     // Breadcrumb navigation
  │       ├── PageTitle.tsx       // Page title with actions
  │       └── ErrorBoundary.tsx   // Error boundary for catching UI errors
  └── context/
      ├── LayoutContext.tsx       // Context for managing layout state (sidebar open, etc.)
      ├── ThemeContext.tsx        // Context for managing theme (light/dark)
      └── ViewportContext.tsx     // Context for responsive design breakpoints

// Styles organization
app/src/styles/
  ├── _variables.scss             // Variables (already exists)
  ├── _mixins.scss                // Mixins (already exists)
  ├── _themes.scss                // Theme variables for light/dark mode
  ├── _typography.scss            // Typography styles
  ├── _animations.scss            // Animation keyframes and transitions
  ├── _utilities.scss             // Utility classes
  └── components/                 // Shared component styles
      ├── _buttons.scss           // Button styles
      ├── _cards.scss             // Card styles
      ├── _forms.scss             // Form element styles
      └── _tables.scss            // Table styles

// Routes organization
app/src/routes/
  ├── index.tsx                   // Route definitions and configuration
  ├── PrivateRoute.tsx            // Auth-protected route component
  ├── PublicRoute.tsx             // Public route component
  └── paths.ts                    // Route path constants

// Pages
app/src/pages/
  ├── auth/                       // Authentication pages
  │   ├── Login.tsx               // Login page
  │   ├── Signup.tsx              // Signup page
  │   ├── ForgotPassword.tsx      // Forgot password page
  │   └── ResetPassword.tsx       // Reset password page
  ├── dashboard/                  // Dashboard pages
  │   ├── Dashboard.tsx           // Main dashboard
  │   └── components/             // Dashboard-specific components
  ├── documents/                  // Document management pages
  │   ├── DocumentList.tsx        // Document listing page
  │   ├── DocumentDetail.tsx      // Document detail page
  │   └── components/             // Document-specific components
  ├── Error404.tsx                // 404 error page
  ├── Error500.tsx                // 500 error page
  ├── MaintenancePage.tsx         // Maintenance page
  └── LandingPage.tsx             // Public landing page
```
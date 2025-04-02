# DS Portal

Design System Portal - A modular design system with tools for document management.

## Overview

DS Portal is a comprehensive design system and document management toolkit built with modern web technologies. It provides reusable components, utilities, and tools for creating consistent user experiences across applications.

## Project Structure

The project follows a monorepo structure using Lerna with the following packages:

```
├── packages/
│   ├── core/           # Core functionality and data models
│   ├── utils/          # Utility functions
│   ├── eslint-config/  # Shared ESLint configuration
│   └── eslint-config-react/ # React-specific ESLint configuration
├── Demo/               # Demo application showcasing the design system
```

## Features

- **Modular Architecture**: Components are separated into individual packages for easy maintenance
- **TypeScript Support**: Full TypeScript support with types for all components
- **Document Management**: Built-in document handling capabilities
- **User Authentication**: User management and authentication utilities
- **React Integration**: Ready to use with React applications
- **Internationalization**: Support for multiple languages via i18next

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn (v1.22 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/ds-portal.git
   cd ds-portal
   ```

2. Install dependencies and bootstrap the project
   ```bash
   yarn install
   yarn bootstrap
   ```

3. Build all packages
   ```bash
   yarn build
   ```

### Running the Demo

```bash
cd Demo
yarn dev
```

The demo application will start at `http://localhost:3000`

## Development

### Available Scripts

- `yarn build` - Build all packages
- `yarn dev` - Start development mode for all packages
- `yarn test` - Run tests for all packages
- `yarn lint` - Run ESLint for all packages
- `yarn lint:fix` - Fix linting issues
- `yarn clean` - Clean build artifacts

### Creating a New Package

1. Create a new directory in the `packages` folder
2. Set up the package.json with appropriate dependencies
3. Add the package to the workspace in the root package.json
4. Run `yarn bootstrap` to link dependencies

### Testing

Tests are written using Vitest. Run tests with:

```bash
yarn test
```

For test coverage:

```bash
yarn test:coverage
```

## Package Documentation

### Core (@ds/core)

The core package provides fundamental functionality:

- User authentication and management
- Document handling
- Data types and interfaces

```bash
# Installation
yarn add @ds/core
```

Usage:

```typescript
import { getDocuments, getUserInfo } from '@ds/core';

// Get all documents
const documents = getDocuments();

// Get current user info
const user = getUserInfo();
```

### Utils (@ds/utils)

Utility functions for common tasks:

- Date formatting
- Text manipulation

```bash
# Installation
yarn add @ds/utils
```

Usage:

```typescript
import { formatDate, truncateText } from '@ds/utils';

// Format a date
const formattedDate = formatDate(new Date());

// Truncate long text
const shortText = truncateText('This is a long text that will be truncated', 20);
```

## Deployment

To build for production:

```bash
yarn build
```

This will generate optimized builds in the `dist` directory of each package.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

This project uses ESLint and Prettier to enforce code style.

- To check for issues: `yarn lint`
- To automatically fix issues: `yarn lint:fix`

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 DS Portal Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Project Status

This project is currently in active development. APIs may change without notice until version 1.0.0 is released.

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Lerna](https://lerna.js.org/)
- [Vitest](https://vitest.dev/)
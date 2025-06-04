# Micro Frontend Template

This is a template for creating new micro frontends in your application. It includes all the necessary configuration for Module Federation, TypeScript, React, and other essential tools.

## Features

- Module Federation setup for micro frontend architecture
- TypeScript configuration
- React with TypeScript support
- Webpack configuration with hot reloading
- Babel configuration for modern JavaScript features
- Basic component structure
- Development and production build scripts

## Project Structure

```
src/
├── assets/          # Static assets like images, fonts, etc.
├── components/      # Reusable React components
├── constants/       # Application constants and configuration
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── services/        # API services and external integrations
├── store/           # State management (Redux, Zustand, etc.)
├── styles/          # Global styles and CSS modules
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

### Directory Descriptions

- `assets/`: Store static files like images, fonts, and other media
- `components/`: Reusable React components organized by feature or type
- `constants/`: Application-wide constants and configuration values
- `context/`: React Context providers for global state management
- `hooks/`: Custom React hooks for shared logic
- `services/`: API calls and external service integrations
- `store/`: State management setup (Redux, Zustand, etc.)
- `styles/`: Global styles, CSS modules, and theme configuration
- `types/`: TypeScript type definitions and interfaces
- `utils/`: Helper functions and utility methods

## Configuration Files

This project uses several configuration files to manage different aspects of development:

### Package Management
- `package.json`: Defines project metadata, dependencies, and scripts
  - Core dependencies: React, React DOM, React Router, dotenv
  - Development tools: TypeScript, Webpack, Babel, ESLint, Prettier
  - Testing frameworks: Jest, Playwright
  - Styling: Tailwind CSS, PostCSS

### Build and Development
- `webpack.config.js`: Configures the build process
  - Module Federation setup for micro frontend architecture
  - Development server configuration
  - Asset handling and optimization
  - Environment-specific builds

- `.babelrc`: JavaScript/TypeScript transpilation
  - React and TypeScript presets
  - Modern JavaScript features support

### TypeScript
- `tsconfig.json`: TypeScript compiler configuration
  - Strict type checking
  - Module resolution
  - Path aliases
  - Target ECMAScript version

### Styling
- `tailwind.config.js`: Tailwind CSS configuration
  - Custom color variables
  - Content paths
  - Theme extensions
  - Custom plugins

- `postcss.config.js`: PostCSS configuration
  - Tailwind CSS integration
  - Autoprefixer for cross-browser compatibility

### Code Quality
- `.eslintrc.js`: ESLint configuration
  - TypeScript support
  - React and React Hooks rules
  - Accessibility (jsx-a11y) rules
  - Import ordering
  - Integration with Prettier

### Testing
- `jest.config.js`: Jest testing configuration
  - TypeScript support via ts-jest
  - Coverage thresholds
  - Module mapping
  - Test environment setup

- `playwright.config.ts`: Playwright E2E testing configuration
  - Browser configuration
  - Test retry logic
  - Screenshot and video capture
  - CI/CD integration

### Environment
- `.gitignore`: Git ignore rules
- `.env` files: Environment-specific variables (not tracked in git)

## How It Works

- **Development**: Start the development server using `npm start`, `pnpm start`, or `bun start`. This runs Webpack in development mode with hot reloading enabled.
- **Building**: Use `npm run build`, `pnpm build`, or `bun run build` to create a production build. The output is placed in the `dist` directory.
- **Module Federation**: The `webpack.config.js` file sets up Module Federation, allowing the micro frontend to expose components that can be consumed by other applications. It also shares common dependencies like React and React DOM to avoid duplication.
- **Environment Configuration**: The project uses environment variables to configure different environments (development, staging, production) and loads them using `dotenv`.

## Integration

To integrate this micro frontend with a parent application, you need to update the parent's Webpack configuration to include this micro frontend as a remote and import the exposed components using Module Federation syntax.

## Getting Started

1. Copy this template to create a new micro frontend:
   ```bash
   cp -r micro-frontend-template your-new-micro-frontend
   ```

2. Update the following files with your micro frontend's specific information:
   - `package.json`: Update name, description, and other metadata
   - `webpack.config.js`: Update port number and uniqueName
   - `src/App.tsx`: Replace with your micro frontend's main component

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   pnpm start
   # or
   bun start
   ```

## Development

- The development server runs on port 3000 by default
- Hot reloading is enabled
- TypeScript type checking is available via `npm run type-check`
- Code formatting is available via `npm run format`

## Building for Production

```bash
npm run build
# or
pnpm build
# or
bun run build
```

The build output will be in the `dist` directory.

## Testing

This project uses two testing frameworks to ensure code quality and reliability:

### Jest for Unit Testing

Jest is used for unit testing and component testing. It's configured with:
- `ts-jest` for TypeScript support
- `jsdom` for browser environment simulation
- Coverage thresholds set to 70% for branches, functions, lines, and statements
- Support for CSS/SCSS modules through `identity-obj-proxy`

To run Jest tests:
```bash
npm test
# or
pnpm test
# or
bun test
```

For coverage reports:
```bash
npm run test:coverage
# or
pnpm test:coverage
# or
bun test:coverage
```

### Playwright for End-to-End Testing

Playwright is used for end-to-end testing, providing:
- Cross-browser testing (currently configured for Chromium)
- Automatic screenshots on test failures
- Video recording for failed tests
- HTML test reports
- CI/CD integration with retry logic

To run Playwright tests:
```bash
npm run test:e2e
# or
pnpm test:e2e
# or
bun test:e2e
```

To view the Playwright report:
```bash
npm run test:e2e:report
# or
pnpm test:e2e:report
# or
bun test:e2e:report
```

The E2E tests are located in the `e2e/` directory, while unit tests are co-located with their respective components in `__tests__` directories or files with `.test.ts`/`.spec.ts` extensions.

## Notes

- Make sure to update the port number in `webpack.config.js` to avoid conflicts with other micro frontends
- The template uses the shared UI library from the parent project
- All shared dependencies are configured in the Module Federation plugin

## Using the Template from GitHub

1. **Clone the Repository**: Start by cloning the template repository to your local machine.
   ```bash
   git clone https://github.com/your-username/micro-frontend-template.git
   ```

2. **Navigate to the Project Directory**: Change into the project directory.
   ```bash
   cd micro-frontend-template
   ```

3. **Install Dependencies**: Install the necessary dependencies using your preferred package manager.
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

4. **Start the Development Server**: Run the development server to see the template in action.
   ```bash
   npm start
   # or
   pnpm start
   # or
   bun start
   ```

5. **Customize the Template**: Update the `package.json`, `webpack.config.js`, and `src/App.tsx` files to fit your project's needs.

6. **Build for Production**: When you're ready to deploy, build the project for production.
   ```bash
   npm run build
   # or
   pnpm build
   # or
   bun run build
   ```

7. **Integrate with Parent Application**: Follow the integration steps in the README to connect this micro frontend with your parent application.

This template is designed to be a starting point for your micro frontend projects, providing a solid foundation with modern tools and practices. # MrOven-Microfrontend
# mroven-microfrontend

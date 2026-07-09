# CI Pipeline

A modern React application scaffolded with Vite, featuring a professional CI/CD workflow with GitHub Actions.

## Tech Stack

- **React 19** – UI library
- **Vite 8** – Build tool and dev server
- **Vitest** – Unit testing framework
- **Testing Library** – Component testing utilities
- **ESLint** – Static code analysis
- **Prettier** – Code formatting
- **Husky + lint-staged** – Pre-commit hooks
- **GitHub Actions** – Continuous integration

## Project Structure

```
├── .github/workflows/     # CI workflow definitions
├── .husky/                 # Git hooks (pre-commit)
├── public/                 # Static assets
├── src/
│   ├── __tests__/          # Test files
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main application component
│   ├── App.css             # App-specific styles
│   ├── index.css           # Global styles
│   ├── main.jsx            # Application entry point
│   └── setupTests.js       # Test setup (jest-dom matchers)
├── .env.example            # Environment variable template
├── .gitignore
├── .prettierrc             # Prettier configuration
├── .prettierignore
├── eslint.config.js        # ESLint flat configuration
├── index.html
├── package.json
└── vite.config.js          # Vite + Vitest configuration
```

## Getting Started

### Prerequisites

- Node.js >= 22
- npm >= 10

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ci-pipeline

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Local Development

```bash
# Start the development server with HMR
npm run dev

# Lint source code
npm run lint

# Format code with Prettier
npm run format

# Run unit tests (single run)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

### Pre-commit Hooks

This project uses **Husky** and **lint-staged** to automatically format staged files and run ESLint before every commit. No extra steps required — if you stage files and commit, the hooks will run.

## CI Pipeline

The project includes a GitHub Actions workflow located at `.github/workflows/ci.yml`.

### Triggers

- **Push** to `main` or `develop`
- **Pull request** targeting `main`

### Pipeline Steps

| Step                  | Description                                    |
| --------------------- | ---------------------------------------------- |
| Checkout              | Clones the repository                          |
| Setup Node.js         | Installs the specified Node version            |
| Cache dependencies    | Caches `node_modules` via `actions/setup-node` |
| Install dependencies  | Runs `npm ci` (clean install)                  |
| Prettier check        | Verifies code formatting                       |
| ESLint                | Runs static analysis                           |
| Unit tests + coverage | Runs Vitest with coverage                      |
| Build                 | Creates production build                       |
| Upload artifacts      | Saves `dist/` and `coverage/` as artifacts     |

### Pipeline Badge

```markdown
[![CI Pipeline](https://github.com/<owner>/ci-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/ci-pipeline/actions/workflows/ci.yml)
```

## Environment Variables

| Variable         | Description          | Default                     |
| ---------------- | -------------------- | --------------------------- |
| `VITE_APP_TITLE` | Application title    | `CI Pipeline App`           |
| `VITE_API_URL`   | Backend API base URL | `http://localhost:3000/api` |

Copy `.env.example` to `.env` and fill in your values. All Vite environment variables must be prefixed with `VITE_`.

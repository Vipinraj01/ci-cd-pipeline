# CI Pipeline Explanation

## Overview

This project uses **GitHub Actions** to automate a Continuous Integration (CI) pipeline. Every time code is pushed to `main` or `develop`, the pipeline runs a series of checks to ensure code quality, formatting, and that tests pass before the code can be merged or deployed.

---

## CI Workflow File

**File:** `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci
        env:
          CI: true

      - name: Check code formatting with Prettier
        run: npx prettier --check .

      - name: Lint source code with ESLint
        run: npm run lint

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Build application
        run: npm run build
```

---

## Step-by-Step Breakdown

### 1. Trigger (`on:`)

The pipeline triggers on **push** events to the `main` or `develop` branches. This ensures every commit to these key branches is verified.

### 2. Job Definition

A single job named `ci` runs on `ubuntu-latest` (a fresh Ubuntu virtual machine).

### 3. Steps

#### Step 1 — Checkout repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

Pulls the latest code from the repository so the runner has access to the source files.

#### Step 2 — Install dependencies

```yaml
- name: Install dependencies
  run: npm ci
  env:
    CI: true
```

Runs `npm ci` (clean install) which installs exact versions from `package-lock.json`. Faster and more reproducible than `npm install`. The `CI: true` env var tells tools (like Vitest) they are in CI mode.

#### Step 3 — Check code formatting with Prettier

```yaml
- name: Check code formatting with Prettier
  run: npx prettier --check .
```

Checks that all files match the project's Prettier formatting rules. If any file is unformatted, the step fails. This enforces consistent code style without manual effort.

#### Step 4 — Lint source code with ESLint

```yaml
- name: Lint source code with ESLint
  run: npm run lint
```

Runs ESLint (configured in `eslint.config.js`) to catch code quality issues, potential bugs, and style violations beyond formatting.

#### Step 5 — Run unit tests with coverage

```yaml
- name: Run unit tests with coverage
  run: npm run test:coverage
```

Executes `vitest run --coverage`. This runs all unit tests (using Vitest + React Testing Library) and generates a coverage report showing what percentage of the codebase is exercised by tests.

#### Step 6 — Build application

```yaml
- name: Build application
  run: npm run build
```

Runs `vite build` to create a production-ready bundle. If the build fails (e.g., TypeScript errors, import issues), the pipeline fails, preventing broken code from being merged.

---

## Test File

**File:** `src/__tests__/App.test.jsx`

```jsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App.jsx'

describe('App', () => {
  it('returns status 200 and renders the header correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve([]),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeTruthy()
    })

    expect(mockFetch).toHaveBeenCalledOnce()
    const response = await mockFetch.mock.results[0].value
    expect(response.status).toBe(200)
    expect(screen.getByText('Users').tagName).toBe('H1')
  })
})
```

**What it tests:**

- Mocks the global `fetch` API to return a `200` status and an empty array
- Renders the `<App />` component
- Asserts that the text `"Users"` appears in the DOM (via `waitFor` for async rendering)
- Verifies `fetch` was called exactly once
- Asserts the response status is `200`
- Confirms the rendered `"Users"` element is an `<h1>` tag

**Test configuration** (from `vite.config.js`):

- **Environment:** `jsdom` (simulates browser DOM in Node)
- **Setup:** `setupTests.js` imports `@testing-library/jest-dom` for extra matchers
- **Coverage:** V8 provider, includes all `src/**/*.{js,jsx}` except test files and `main.jsx`

---

## Use Cases

| Use Case                                | How the Pipeline Handles It                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Enforce code consistency**            | Prettier checks formatting; ESLint checks code quality. Non-compliant code fails the pipeline.   |
| **Catch bugs early**                    | Unit tests run on every push, so regressions are caught before merging.                          |
| **Prevent broken builds**               | The `build` step fails if the app can't compile, keeping `main` and `develop` always deployable. |
| **Maintain test quality**               | Coverage reports show untested code, encouraging developers to write tests.                      |
| **Standardize dependency installation** | `npm ci` ensures all developers and CI use identical dependency versions.                        |
| **Pre-merge validation**                | Pipeline acts as a gate — code must pass all steps before PRs are merged.                        |
| **Automated feedback**                  | Developers see results in the GitHub UI (green checkmark or red X) without manual checks.        |

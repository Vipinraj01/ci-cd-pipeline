# React CI/CD Pipeline — Presentation Guide

> **Audience:** Developers / Tech Stakeholders
> **Goal:** Walk through the pipeline as if you're presenting it live — explaining _what_ each step does and _why_ it matters.

---

## Slide 1 — The Big Pictures

> _"Every time we push code to `main` or `develop`, this pipeline fires up automatically. It runs a gauntlet of checks — formatting, linting, testing, building — and if we're on `main`, it even deploys the result to GitHub Pages. No manual steps, no forgotten checks. Code goes from commit to production in one automated flow."_

| Aspect           | What We Use                         |
| ---------------- | ----------------------------------- |
| **CI Platform**  | GitHub Actions                      |
| **Trigger**      | Push to `main` or `develop`         |
| **Total Jobs**   | 2 — `ci` and `deploy`               |
| **Runner**       | `ubuntu-latest` (fresh VM each run) |
| **Node Version** | 22 (with npm cache for speed)       |

---

## Slide 2 — The CI Workflow

> _Let's walk through the `ci` job — the heart of the pipeline. It lives in `.github/workflows/ci.yml` and runs on every push to our main branches._

```yaml
name: React CI/CD Pipeline

on:
  push:
    branches: [main, develop]

jobs:
  ci:
    name: Build, Test & Lint
    runs-on: ubuntu-latest
```

---

### Step 1 — Checkout Repository

> _"First, we pull the latest code from GitHub onto the runner. Without this, the runner has nothing to work with."_

```yaml
- name: Checkout Repository
  uses: actions/checkout@v4
```

**Why it matters:** Gives the VM access to the full source tree — all our React components, configs, and tests.

---

### Step 2 — Setup Node.js

> _"We pin Node.js to version 22 and enable npm caching. Caching shaves seconds off every run by reusing `node_modules` from previous workflows."_

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
```

**Why it matters:** Reproducibility. Every developer and CI uses the exact same Node version. No more _"but it works on my machine!"_

---

### Step 3 — Install Dependencies

> _"`npm ci` is a clean install. It reads `package-lock.json` and installs exact versions — no surprises, no version drift."_

```yaml
- name: Install Dependencies
  run: npm ci
  env:
    CI: true
```

**Why `npm ci` instead of `npm install`?**

- `npm ci` deletes `node_modules` first — guarantees a fresh, deterministic install
- `npm install` can update versions; `npm ci` never does
- It's faster in CI because it skips dependency resolution

---

### Step 4 — Check Code Formatting (Prettier)

> _"Prettier is our formatting enforcer. This step checks every file in the project against our Prettier rules. If a single file is misformatted — wrong indentation, missing semicolon, whatever — the pipeline fails."_

```yaml
- name: Check Code Formatting (Prettier)
  run: npx prettier --check .
```

**Why it matters:** Eliminates formatting debates in code reviews. The machine decides, not egos. If it passes here, the formatting is consistent across the board.

---

### Step 5 — Lint Source Code (ESLint)

> _"ESLint catches what Prettier doesn't — logic bugs, unused variables, React hook violations, and code quality issues. Configuration lives in `eslint.config.js`."_

```yaml
- name: Lint Source Code (ESLint)
  run: npm run lint
```

**Why it matters:** Prevents common JavaScript pitfalls before they become runtime bugs. It's our first line of defense against logical errors.

---

### Step 6 — Run Unit Tests

> _"We run our Vitest test suite with coverage enabled. The test file at `src/__tests__/App.test.jsx` mocks the `fetch` API and verifies that `<App />` renders a users list correctly — status 200, proper heading, correct DOM structure."_

```yaml
- name: Run Unit Tests
  run: npm run test:coverage
```

**What the test does:**

- Mocks `fetch` to return a `200` status with empty data
- Renders the `<App />` component
- Asserts `"Users"` text appears in an `<h1>` tag
- Verifies `fetch` was called exactly once
- Confirms the response status is `200`

**Why it matters:** Every push gets test feedback in under a minute. If a change breaks existing functionality, we catch it immediately — not after merging.

---

### Step 7 — Build React Application

> _"If all checks pass, we run `vite build` to create a production bundle in the `dist/` folder. This is our final smoke test — if TypeScript types are wrong, imports are broken, or the bundle can't compile, this step fails."_

```yaml
- name: Build React Application
  run: npm run build
```

**Why it matters:** Guarantees `main` and `develop` are always in a deployable state. No more broken builds after merge.

---

### Step 8 — Upload Build Artifact

> _"We upload the `dist/` folder as a GitHub Pages artifact. This passes the built files to the deploy job so it can publish them."_

```yaml
- name: Upload Build Artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist
```

**Why it matters:** Decouples build from deploy. The `ci` job builds; the `deploy` job publishes. Clean separation of concerns.

---

## Slide 3 — The Deploy Job

> _"The second job, `deploy`, is conditional — it only runs on pushes to `main`. It depends on `ci` passing first. This is our CD layer."_

```yaml
deploy:
  name: Deploy to GitHub Pages
  if: github.ref == 'refs/heads/main'
  needs: ci
  runs-on: ubuntu-latest

  steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

**Permissions required:**

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Concurrency setting:**

```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

> _The concurrency group ensures only one deploy runs at a time. If a new push comes while a deploy is in progress, the in-progress one gets cancelled — we always deploy the latest commit._

**Why it matters:** Fully automated deployments. Push to `main` → pipeline verifies everything → site goes live on GitHub Pages. Zero manual intervention.

---

## Slide 4 — Local Safeguards (Husky + lint-staged)

> _"We don't wait for CI to catch basic issues. Husky runs a `pre-commit` hook that triggers lint-staged, which auto-formats and lints only the files we're committing."_

**`.husky/pre-commit`:**

```
npx lint-staged
```

**`package.json` config:**

```json
"lint-staged": {
  "*.{js,jsx}": ["prettier --write", "eslint --fix"],
  "*.{json,css,md}": ["prettier --write"]
}
```

> _This means by the time code reaches CI, it's already formatted and lint-free. CI becomes a safety net, not a gatekeeper._

---

## Slide 5 — Config & Coverage

> _Our Vite config doubles as Vitest config. Here's what it sets up:_

| Setting               | Value                                               |
| --------------------- | --------------------------------------------------- |
| **Environment**       | `jsdom` — simulates a browser in Node               |
| **Globals**           | `true` — `describe`, `it`, `expect` without imports |
| **Setup File**        | `src/setupTests.js` — imports jest-dom matchers     |
| **Coverage Provider** | V8 (native, fast)                                   |
| **Coverage Targets**  | All `src/**/*.{js,jsx}` except tests & `main.jsx`   |

```js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/setupTests.js',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    include: ['src/**/*.{js,jsx}'],
    exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}',
              'src/**/__tests__/**', 'src/setupTests.js'],
  },
}
```

---

## Slide 6 — End-to-End Flow (Quick Recap)

> _"Let's trace a commit's journey from push to production:"_

```
Developer pushes to main
        │
        ▼
  ┌─────────────────────────────────────────┐
  │  Checkout Repository                     │
  │  Setup Node.js (v22, cached)            │
  │  Install Dependencies (npm ci)          │
  │  Prettier — Formatting Check            │
  │  ESLint — Code Quality Check            │
  │  Vitest — Unit Tests + Coverage         │
  │  Vite Build — Production Bundle         │
  │  Upload Artifact (dist/)                │
  └───────────────┬─────────────────────────┘
                  │ (all passed)
                  ▼
  ┌─────────────────────────────────────────┐
  │  Deploy to GitHub Pages                 │
  └─────────────────────────────────────────┘
                  │
                  ▼
           Site is live 🚀
```

---

## Slide 7 — Use Cases Summary

| Scenario                       | How the Pipeline Handles It                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| **Consistent code style**      | Prettier checks on every push; lint-staged auto-formats on commit |
| **Catch bugs before merge**    | Unit tests run automatically; coverage shows untested code        |
| **Never ship a broken build**  | `vite build` step fails if the app can't compile                  |
| **Deterministic dependencies** | `npm ci` with lockfile — identical installs everywhere            |
| **Automated deployments**      | Push to `main` → CI verifies → CD deploys to GitHub Pages         |
| **Fast feedback loop**         | Husky catches issues locally; CI confirms within minutes          |
| **No deploy queue conflicts**  | Concurrency group cancels stale in-progress deploys               |

---

## The One-Liner Takeaway

> **"Push code. The pipeline formats, lints, tests, builds, and deploys — automatically. Every time."**

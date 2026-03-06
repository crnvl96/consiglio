# Consiglio

A monorepo application built with React, Vite, and TanStack Router.

## Project Structure

```
consiglio/
├── api/                        # Backend workspace
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Frontend workspace
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx        # Page components
│   │   ├── routes/
│   │   │   ├── __root.tsx      # Root layout route
│   │   │   └── index.tsx       # "/" route definition
│   │   ├── index.css           # Tailwind + Tokyo Night palette
│   │   ├── main.tsx            # App entry point, router setup
│   │   ├── routeTree.gen.ts    # Route tree wiring
│   │   └── vite-env.d.ts       # Vite client type declarations
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.js
├── package.json                # Root workspace config
├── tsconfig.json               # Root TypeScript project references
└── package-lock.json
```

## Monorepo Architecture

The project uses **npm workspaces** to manage multiple packages from a single repository.

### Root `package.json`

```json
{
  "private": true,
  "workspaces": ["api", "frontend"]
}
```

- **`private: true`** - Prevents the root package from being accidentally published to npm.
- **`workspaces`** - Declares `api/` and `frontend/` as workspace packages. npm hoists shared dependencies to the root `node_modules/` and symlinks each workspace, so they can reference each other. All workspace dependencies are installed with a single `npm install` from the root.

### Workspace packages

Each workspace has its own `package.json` with a scoped name (`@consiglio/frontend`, `@consiglio/api`). The `@consiglio/` scope groups them under a shared namespace and avoids name collisions.

Commands target a specific workspace with the `-w` flag:

```bash
npm run -w frontend dev     # Run dev server for frontend
npm install -w api express  # Install a dependency in the api workspace
```

## Configuration

### TypeScript - Root `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "frontend" },
    { "path": "api" }
  ]
}
```

- **`files: []`** - The root config compiles nothing on its own. It exists solely to orchestrate the workspaces.
- **`references`** - Uses [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) to delegate type checking to each workspace's own `tsconfig.json`. Running `tsgo` (or `tsc --build`) from the root will check all referenced projects in dependency order.

### TypeScript - Frontend `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "composite": true,
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationDir": "dist"
  },
  "include": ["src"]
}
```

- **`target: "ES2024"`** - Emit modern JavaScript syntax. Vite handles downleveling for browser compatibility via its own build step.
- **`lib: ["ES2024", "DOM", "DOM.Iterable"]`** - Include type definitions for modern JS APIs, browser DOM APIs (`document`, `window`, etc.), and iterable DOM collections (`NodeList.forEach`, etc.).
- **`module: "ESNext"`** - Use ES module syntax (`import`/`export`). Required for Vite which expects native ESM.
- **`moduleResolution: "bundler"`** - Resolves imports the way bundlers like Vite do: supports extensionless imports, `package.json` `exports` field, and path aliases. Unlike `node16`/`nodenext`, it doesn't require explicit `.js` extensions on relative imports.
- **`jsx: "react-jsx"`** - Uses React 17+ automatic JSX transform. No need to `import React` in every file — the compiler injects the JSX runtime automatically.
- **`strict: true`** - Enables all strict type checking flags (`strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc.).
- **`esModuleInterop: true`** - Allows default imports from CommonJS modules (e.g., `import React from "react"` instead of `import * as React from "react"`).
- **`skipLibCheck: true`** - Skips type checking of `.d.ts` files from `node_modules`. Speeds up compilation and avoids conflicts between incompatible type declaration versions.
- **`isolatedModules: true`** - Ensures each file can be transpiled independently. Required by Vite/esbuild which process files one at a time without full program context.
- **`composite: true`** - Required for TypeScript project references. Enables incremental compilation and makes this project referenceable from the root `tsconfig.json`.
- **`emitDeclarationOnly: true`** / **`declaration: true`** / **`declarationDir: "dist"`** - Only emit `.d.ts` type declaration files (no `.js`). Vite handles the actual JS bundling. The `composite` option requires some form of emit, so declaration-only output satisfies that constraint without interfering with Vite's build.

### TypeScript - API `api/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["ES2024"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "composite": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- **`lib: ["ES2024"]`** - Only JS standard library types. No DOM — this is a Node.js backend.
- **`module: "nodenext"`** / **`moduleResolution: "nodenext"`** - Uses Node.js native ESM resolution rules. Requires explicit file extensions on relative imports (e.g., `./foo.js`) and respects `package.json` `exports`/`type` fields. This matches how Node.js actually resolves modules at runtime.
- **`outDir: "dist"`** - Emits compiled JS to `dist/`. Unlike the frontend, the API needs actual JS output since there's no bundler — Node.js runs the compiled files directly.

### Vite - `frontend/vite.config.js`

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
  },
});
```

- **`tailwindcss()`** - Tailwind CSS v4 Vite plugin. Processes `@tailwind` directives and scans source files for utility classes at build time. Replaces the PostCSS-based setup from Tailwind v3.
- **`react()`** - `@vitejs/plugin-react` adds React Fast Refresh for HMR during development and handles JSX transformation via Babel.
- **`server.port: 3000`** - Dev server listens on port 3000 instead of Vite's default 5173.

## Getting Started

```bash
npm install
```

### Frontend

```bash
npm run -w frontend dev
```

Runs the frontend dev server on [http://localhost:3000](http://localhost:3000).

```bash
npm run -w frontend build
```

Builds the frontend for production.

## Type Checking

```bash
tsgo
```

## License

[MIT](LICENSE)

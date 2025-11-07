# Tutorial 03: Core Package Implementation

Implement the core framework package with Vinxi, Vite, and Nitro integration.

---

## 🎯 What We're Building

The core package that provides:

- Vinxi configuration
- Vite integration
- Nitro server setup
- Entry point generation
- Build orchestration

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01 & 02
- ✅ All packages structured
- ✅ Dependencies installed

---

## 📁 Core Package Structure

```
packages/core/
├── src/
│   ├── build/
│   │   ├── vinxi.ts          # Vinxi configuration
│   │   ├── vite.ts           # Vite configuration
│   │   ├── nitro.ts          # Nitro configuration
│   │   └── index.ts
│   ├── runtime/
│   │   ├── entry-client.ts   # Client entry template
│   │   ├── entry-server.ts   # Server entry template
│   │   └── index.ts
│   ├── types/
│   │   ├── config.ts         # Configuration types
│   │   ├── build.ts          # Build types
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## 🚀 Step 1: Define Configuration Types

**packages/core/src/types/config.ts:**

```typescript
import type { UserConfig as ViteConfig } from "vite";
import type { NitroConfig } from "nitropack";

export interface ReactFlowConfig {
  /**
   * Root directory of the application
   * @default process.cwd()
   */
  root?: string;

  /**
   * Output directory for build
   * @default '.output'
   */
  outDir?: string;

  /**
   * Routes directory
   * @default 'app/routes'
   */
  routesDir?: string;

  /**
   * Server directory
   * @default 'app/server'
   */
  serverDir?: string;

  /**
   * Public directory for static assets
   * @default 'public'
   */
  publicDir?: string;

  /**
   * Vite configuration
   */
  vite?: ViteConfig;

  /**
   * Nitro configuration
   */
  nitro?: NitroConfig;

  /**
   * Server port
   * @default 3000
   */
  port?: number;

  /**
   * Enable SSR
   * @default true
   */
  ssr?: boolean;
}

export interface ResolvedConfig extends Required<ReactFlowConfig> {
  // Resolved absolute paths
  rootDir: string;
  outDir: string;
  routesDir: string;
  serverDir: string;
  publicDir: string;
}
```

**packages/core/src/types/build.ts:**

```typescript
export interface BuildContext {
  config: ResolvedConfig;
  mode: "development" | "production";
}

export interface BuildResult {
  success: boolean;
  errors?: Error[];
  warnings?: string[];
}
```

**packages/core/src/types/index.ts:**

```typescript
export * from "./config";
export * from "./build";
```

---

## 🚀 Step 2: Implement Vinxi Configuration

**packages/core/src/build/vinxi.ts:**

```typescript
import { createApp } from "vinxi";
import type { ReactFlowConfig } from "../types";
import { createViteConfig } from "./vite";

export function createVinxiApp(config: ReactFlowConfig) {
  return createApp({
    routers: [
      // Client router - Browser bundle
      {
        name: "client",
        type: "client",
        handler: "./app/entry-client.tsx",
        target: "browser",
        base: "/_build",
        plugins: () => createViteConfig(config, "client"),
      },

      // SSR router - Server-side rendering
      {
        name: "ssr",
        type: "http",
        handler: "./app/entry-server.tsx",
        target: "server",
        plugins: () => createViteConfig(config, "server"),
      },

      // API router - Backend routes
      {
        name: "api",
        type: "http",
        base: "/api",
        handler: "./app/server/**/*.ts",
        target: "server",
      },
    ],
  });
}

export function defineConfig(config: ReactFlowConfig) {
  return config;
}
```

---

## 🚀 Step 3: Implement Vite Configuration

**packages/core/src/build/vite.ts:**

```typescript
import { defineConfig, type Plugin, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ReactFlowConfig } from "../types";

export function createViteConfig(config: ReactFlowConfig, target: "client" | "server"): UserConfig {
  const isClient = target === "client";

  return defineConfig({
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
      ...createReactFlowPlugins(config, target),
    ],

    resolve: {
      alias: {
        "@": config.root || process.cwd(),
      },
    },

    build: {
      target: isClient ? "es2020" : "node20",
      outDir: isClient ? ".output/public" : ".output/server",
      ssr: !isClient,
      rollupOptions: {
        external: isClient ? [] : ["react", "react-dom"],
      },
    },

    ssr: {
      noExternal: isClient ? [] : ["react", "react-dom"],
    },

    ...(config.vite || {}),
  });
}

function createReactFlowPlugins(config: ReactFlowConfig, target: "client" | "server"): Plugin[] {
  const plugins: Plugin[] = [];

  // Add route generation plugin
  plugins.push(createRoutePlugin(config));

  // Add server function plugin for client
  if (target === "client") {
    plugins.push(createServerFunctionPlugin());
  }

  return plugins;
}

function createRoutePlugin(config: ReactFlowConfig): Plugin {
  return {
    name: "reactflow:routes",
    configResolved() {
      // TODO: Scan routes directory and generate route manifest
      console.log("Scanning routes...");
    },
  };
}

function createServerFunctionPlugin(): Plugin {
  return {
    name: "reactflow:server-functions",
    transform(code, id) {
      // TODO: Transform server function calls to RPC
      return code;
    },
  };
}
```

---

## 🚀 Step 4: Implement Nitro Configuration

**packages/core/src/build/nitro.ts:**

```typescript
import { defineNitroConfig } from "nitropack/config";
import type { ReactFlowConfig } from "../types";

export function createNitroConfig(config: ReactFlowConfig) {
  return defineNitroConfig({
    preset: "node-server",

    srcDir: config.serverDir || "app/server",

    output: {
      dir: config.outDir || ".output",
      serverDir: ".output/server",
      publicDir: ".output/public",
    },

    handlers: [
      {
        route: "/**",
        handler: ".output/server/entry.js",
      },
    ],

    devServer: {
      watch: [config.routesDir || "app/routes", config.serverDir || "app/server"],
    },

    experimental: {
      wasm: true,
    },

    ...(config.nitro || {}),
  });
}
```

---

## 🚀 Step 5: Create Build System

**packages/core/src/build/index.ts:**

```typescript
import { resolve } from "pathe";
import type { ReactFlowConfig, ResolvedConfig, BuildContext } from "../types";

export * from "./vinxi";
export * from "./vite";
export * from "./nitro";

export function resolveConfig(config: ReactFlowConfig = {}): ResolvedConfig {
  const root = config.root || process.cwd();

  return {
    root,
    rootDir: resolve(root),
    outDir: resolve(root, config.outDir || ".output"),
    routesDir: resolve(root, config.routesDir || "app/routes"),
    serverDir: resolve(root, config.serverDir || "app/server"),
    publicDir: resolve(root, config.publicDir || "public"),
    port: config.port || 3000,
    ssr: config.ssr !== false,
    vite: config.vite || {},
    nitro: config.nitro || {},
  };
}

export function createBuildContext(
  config: ReactFlowConfig,
  mode: "development" | "production" = "development",
): BuildContext {
  return {
    config: resolveConfig(config),
    mode,
  };
}

export async function build(config: ReactFlowConfig) {
  const ctx = createBuildContext(config, "production");

  console.log("Building ReactFlow app...");
  console.log("Config:", ctx.config);

  // TODO: Implement actual build process
  // 1. Generate routes
  // 2. Build client with Vite
  // 3. Build server with Vite
  // 4. Build Nitro server

  return {
    success: true,
  };
}

export async function dev(config: ReactFlowConfig) {
  const ctx = createBuildContext(config, "development");

  console.log("Starting ReactFlow dev server...");
  console.log("Config:", ctx.config);

  // TODO: Implement dev server
  // 1. Start Vinxi dev server
  // 2. Watch for file changes
  // 3. Hot reload

  return {
    success: true,
  };
}
```

---

## 🚀 Step 6: Create Runtime Templates

**packages/core/src/runtime/entry-client.ts:**

```typescript
/**
 * Client entry point template
 * This will be used to generate the actual entry-client.tsx
 */

export const clientEntryTemplate = `
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

// Import generated routes
import { routes } from 'virtual:reactflow-routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

// Restore server data
const initialData = (window as any).__REACTFLOW_DATA__;

// Hydrate
hydrateRoot(
  document.getElementById('root')!,
  <App />
);
`;

export function generateClientEntry(routes: any[]) {
  return clientEntryTemplate;
}
```

**packages/core/src/runtime/entry-server.ts:**

```typescript
/**
 * Server entry point template
 * This will be used to generate the actual entry-server.tsx
 */

export const serverEntryTemplate = `
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import { defineEventHandler } from 'h3';

// Import generated routes
import { routes } from 'virtual:reactflow-routes';

export default defineEventHandler((event) => {
  const url = event.node.req.url || '/';

  // Render React to string
  const html = renderToString(
    <StaticRouter location={url}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </StaticRouter>
  );

  // Generate full HTML
  const fullHtml = \`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ReactFlow App</title>
      </head>
      <body>
        <div id="root">\${html}</div>
        <script type="module" src="/@id/__x00__virtual:vinxi/client"></script>
      </body>
    </html>
  \`;

  return fullHtml;
});
`;

export function generateServerEntry(routes: any[]) {
  return serverEntryTemplate;
}
```

**packages/core/src/runtime/index.ts:**

```typescript
export * from "./entry-client";
export * from "./entry-server";

export function createRuntime() {
  return {
    generateClientEntry,
    generateServerEntry,
  };
}
```

---

## 🚀 Step 7: Export Everything

**packages/core/src/index.ts:**

```typescript
// Build system
export * from "./build";

// Runtime
export * from "./runtime";

// Types
export * from "./types";

// Main exports
export { defineConfig } from "./build/vinxi";
export { build, dev } from "./build";
```

---

## 🚀 Step 8: Update package.json

**packages/core/package.json:**

```json
{
  "name": "@reactflow/core",
  "version": "0.0.1",
  "description": "ReactFlow framework core",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./build": {
      "types": "./dist/build/index.d.ts",
      "import": "./dist/build/index.js"
    },
    "./runtime": {
      "types": "./dist/runtime/index.d.ts",
      "import": "./dist/runtime/index.js"
    },
    "./config": {
      "types": "./dist/types/config.d.ts",
      "import": "./dist/types/config.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "vinxi": "^0.4.0",
    "nitropack": "^2.9.0",
    "vite": "^5.2.0",
    "h3": "^1.11.0",
    "@vitejs/plugin-react": "^4.2.0",
    "pathe": "^1.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/node": "^20.12.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

---

## 🚀 Step 9: Build the Package

```bash
cd packages/core
pnpm build
```

You should see:

```
CLI Building entry: src/index.ts
CLI Building entry: src/build/index.ts
CLI Building entry: src/runtime/index.ts
✓ Built in XXXms
```

---

## 🚀 Step 10: Test the Package

Create a test file:

**packages/core/test.ts:**

```typescript
import { defineConfig, resolveConfig } from "./src/index";

const config = defineConfig({
  root: process.cwd(),
  port: 3000,
});

const resolved = resolveConfig(config);
console.log("Resolved config:", resolved);
```

Run it:

```bash
tsx test.ts
```

---

## ✅ Verification Checklist

- [ ] All types defined
- [ ] Vinxi configuration created
- [ ] Vite configuration created
- [ ] Nitro configuration created
- [ ] Build system implemented
- [ ] Runtime templates created
- [ ] Package builds successfully
- [ ] Test file runs

---

## 📁 Final Core Package Structure

```
packages/core/
├── src/
│   ├── build/
│   │   ├── vinxi.ts          ✅
│   │   ├── vite.ts           ✅
│   │   ├── nitro.ts          ✅
│   │   └── index.ts          ✅
│   ├── runtime/
│   │   ├── entry-client.ts   ✅
│   │   ├── entry-server.ts   ✅
│   │   └── index.ts          ✅
│   ├── types/
│   │   ├── config.ts         ✅
│   │   ├── build.ts          ✅
│   │   └── index.ts          ✅
│   └── index.ts              ✅
├── dist/                     ✅ (generated)
├── package.json              ✅
├── tsconfig.json             ✅
└── tsup.config.ts            ✅
```

---

## 🎉 Success!

The core package is now implemented with:

- ✅ Vinxi orchestration
- ✅ Vite configuration
- ✅ Nitro integration
- ✅ Entry point templates
- ✅ Type-safe configuration

---

## 📚 What's Next?

Continue to **[04-Vinxi-Configuration.md](./04-Vinxi-Configuration.md)** to dive deeper into Vinxi setup and routing.

---

## 📖 Additional Resources

- [Vinxi Documentation](https://vinxi.vercel.app/)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Nitro Configuration](https://nitro.unjs.io/config)

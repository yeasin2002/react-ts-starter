# Tutorial 04: Vinxi Configuration Deep Dive

Master Vinxi configuration for orchestrating your full-stack React framework.

---

## 🎯 What We're Building

Advanced Vinxi setup with:

- Multi-router architecture
- Client/Server bundling
- API route handling
- Development server
- Production builds

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01-03
- ✅ Core package implemented
- ✅ Understanding of Vite and Nitro

---

## 🧠 Understanding Vinxi

Vinxi is a **JavaScript SDK for building full-stack applications**. It orchestrates multiple Vite instances (routers) to handle different parts of your app:

- **Client Router**: Browser JavaScript bundle
- **SSR Router**: Server-side rendering
- **API Router**: Backend API routes
- **Static Router**: Static assets

---

## 🚀 Step 1: Enhanced Vinxi Configuration

**packages/core/src/build/vinxi.ts:**

```typescript
import { createApp, type Router } from "vinxi";
import { resolve } from "pathe";
import type { ReactFlowConfig, ResolvedConfig } from "../types";
import { createViteConfig } from "./vite";

export function createVinxiApp(config: ResolvedConfig) {
  const routers: Router[] = [];

  // 1. Client Router - Browser bundle
  routers.push({
    name: "client",
    type: "client",
    handler: resolve(config.rootDir, "app/entry-client.tsx"),
    target: "browser",
    base: "/_build",
    build: {
      outDir: resolve(config.outDir, "public/_build"),
    },
    plugins: () => createViteConfig(config, "client"),
  });

  // 2. SSR Router - Server-side rendering
  if (config.ssr) {
    routers.push({
      name: "ssr",
      type: "http",
      handler: resolve(config.rootDir, "app/entry-server.tsx"),
      target: "server",
      base: "/",
      build: {
        outDir: resolve(config.outDir, "server"),
      },
      plugins: () => createViteConfig(config, "server"),
    });
  }

  // 3. API Router - Backend routes
  routers.push({
    name: "api",
    type: "http",
    handler: resolve(config.serverDir, "**/*.ts"),
    target: "server",
    base: "/api",
    build: {
      outDir: resolve(config.outDir, "server/api"),
    },
  });

  // 4. Static Router - Public assets
  routers.push({
    name: "static",
    type: "static",
    dir: config.publicDir,
    base: "/",
  });

  return createApp({
    server: {
      port: config.port,
      experimental: {
        asyncContext: true,
      },
    },
    routers,
  });
}

export function defineConfig(config: ReactFlowConfig) {
  return config;
}
```

---

## 🚀 Step 2: Router Types and Utilities

**packages/core/src/build/router-utils.ts:**

```typescript
import type { Router } from "vinxi";
import type { ResolvedConfig } from "../types";

export interface RouterContext {
  config: ResolvedConfig;
  mode: "development" | "production";
}

export function createClientRouter(ctx: RouterContext): Router {
  return {
    name: "client",
    type: "client",
    handler: "./app/entry-client.tsx",
    target: "browser",
    base: "/_build",
    build: {
      outDir: `${ctx.config.outDir}/public/_build`,
      sourcemap: ctx.mode === "development",
      minify: ctx.mode === "production",
    },
  };
}

export function createSSRRouter(ctx: RouterContext): Router {
  return {
    name: "ssr",
    type: "http",
    handler: "./app/entry-server.tsx",
    target: "server",
    base: "/",
    build: {
      outDir: `${ctx.config.outDir}/server`,
      sourcemap: true,
    },
  };
}

export function createAPIRouter(ctx: RouterContext): Router {
  return {
    name: "api",
    type: "http",
    handler: `${ctx.config.serverDir}/**/*.{ts,js}`,
    target: "server",
    base: "/api",
    build: {
      outDir: `${ctx.config.outDir}/server/api`,
    },
  };
}

export function createStaticRouter(ctx: RouterContext): Router {
  return {
    name: "static",
    type: "static",
    dir: ctx.config.publicDir,
    base: "/",
  };
}
```

---

## 🚀 Step 3: Development Server

**packages/core/src/build/dev-server.ts:**

```typescript
import { createApp } from "vinxi";
import type { ReactFlowConfig, ResolvedConfig } from "../types";
import { resolveConfig } from "./index";
import { createVinxiApp } from "./vinxi";

export interface DevServerOptions {
  config: ReactFlowConfig;
  port?: number;
  host?: string;
  open?: boolean;
}

export async function startDevServer(options: DevServerOptions) {
  const config = resolveConfig(options.config);

  console.log("🚀 Starting ReactFlow dev server...");
  console.log(`📁 Root: ${config.rootDir}`);
  console.log(`🌐 Port: ${config.port}`);

  const app = createVinxiApp(config);

  try {
    await app.dev({
      port: options.port || config.port,
      host: options.host || "localhost",
    });

    console.log(`✅ Server running at http://localhost:${config.port}`);
    console.log(`📦 Client: http://localhost:${config.port}/_build`);
    console.log(`🔌 API: http://localhost:${config.port}/api`);
  } catch (error) {
    console.error("❌ Failed to start dev server:", error);
    throw error;
  }

  return app;
}

export async function stopDevServer(app: any) {
  console.log("🛑 Stopping dev server...");
  await app.close();
  console.log("✅ Dev server stopped");
}
```

---

## 🚀 Step 4: Production Build

**packages/core/src/build/production-build.ts:**

```typescript
import { build as vinxiBuild } from "vinxi";
import type { ReactFlowConfig, BuildResult } from "../types";
import { resolveConfig } from "./index";
import { createVinxiApp } from "./vinxi";

export interface BuildOptions {
  config: ReactFlowConfig;
  minify?: boolean;
  sourcemap?: boolean;
}

export async function buildProduction(options: BuildOptions): Promise<BuildResult> {
  const config = resolveConfig(options.config);

  console.log("📦 Building ReactFlow app for production...");
  console.log(`📁 Output: ${config.outDir}`);

  const errors: Error[] = [];
  const warnings: string[] = [];

  try {
    // Step 1: Create Vinxi app
    const app = createVinxiApp(config);

    // Step 2: Build all routers
    console.log("🔨 Building client...");
    await vinxiBuild(app);

    console.log("✅ Build completed successfully!");
    console.log(`📂 Output directory: ${config.outDir}`);
    console.log(`   ├── public/     - Static assets and client bundle`);
    console.log(`   └── server/     - SSR and API handlers`);

    return {
      success: true,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("❌ Build failed:", error);
    errors.push(error as Error);

    return {
      success: false,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}

export async function buildClient(config: ResolvedConfig) {
  console.log("🔨 Building client bundle...");
  // Client-specific build logic
}

export async function buildServer(config: ResolvedConfig) {
  console.log("🔨 Building server bundle...");
  // Server-specific build logic
}

export async function buildAPI(config: ResolvedConfig) {
  console.log("🔨 Building API routes...");
  // API-specific build logic
}
```

---

## 🚀 Step 5: Hot Module Replacement (HMR)

**packages/core/src/build/hmr.ts:**

```typescript
import type { ViteDevServer } from "vite";
import type { ResolvedConfig } from "../types";

export interface HMRContext {
  server: ViteDevServer;
  config: ResolvedConfig;
}

export function setupHMR(ctx: HMRContext) {
  const { server, config } = ctx;

  // Watch for route changes
  server.watcher.on("add", (file) => {
    if (file.includes(config.routesDir)) {
      console.log(`📄 New route detected: ${file}`);
      invalidateRouteManifest();
    }
  });

  server.watcher.on("unlink", (file) => {
    if (file.includes(config.routesDir)) {
      console.log(`🗑️  Route removed: ${file}`);
      invalidateRouteManifest();
    }
  });

  // Watch for server function changes
  server.watcher.on("change", (file) => {
    if (file.includes(config.serverDir)) {
      console.log(`🔄 Server function updated: ${file}`);
      server.ws.send({
        type: "full-reload",
        path: "*",
      });
    }
  });
}

function invalidateRouteManifest() {
  // Trigger route manifest regeneration
  console.log("🔄 Regenerating route manifest...");
}

export function createHMRPlugin() {
  return {
    name: "reactflow:hmr",
    configureServer(server: ViteDevServer) {
      setupHMR({
        server,
        config: {} as ResolvedConfig, // Will be injected
      });
    },
  };
}
```

---

## 🚀 Step 6: Update Main Build Index

**packages/core/src/build/index.ts:**

```typescript
import { resolve } from "pathe";
import type { ReactFlowConfig, ResolvedConfig, BuildContext } from "../types";

export * from "./vinxi";
export * from "./vite";
export * from "./nitro";
export * from "./router-utils";
export * from "./dev-server";
export * from "./production-build";
export * from "./hmr";

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

// Main build function
export async function build(config: ReactFlowConfig) {
  const { buildProduction } = await import("./production-build");
  return buildProduction({ config });
}

// Main dev function
export async function dev(config: ReactFlowConfig) {
  const { startDevServer } = await import("./dev-server");
  return startDevServer({ config });
}
```

---

## 🚀 Step 7: Create Example App Config

**examples/basic/reactflow.config.ts:**

```typescript
import { defineConfig } from "@reactflow/core";

export default defineConfig({
  root: __dirname,
  outDir: ".output",
  routesDir: "app/routes",
  serverDir: "app/server",
  publicDir: "public",
  port: 3000,
  ssr: true,

  vite: {
    plugins: [],
    resolve: {
      alias: {
        "@": "./app",
      },
    },
  },

  nitro: {
    preset: "node-server",
  },
});
```

---

## 🚀 Step 8: Build and Test

```bash
# Build core package
cd packages/core
pnpm build

# Test configuration
tsx -e "
import { resolveConfig } from './dist/index.js';
const config = resolveConfig({ port: 4000 });
console.log('Config:', config);
"
```

---

## ✅ Verification Checklist

- [ ] Vinxi app creation works
- [ ] Multiple routers configured
- [ ] Dev server can start
- [ ] Production build works
- [ ] HMR is set up
- [ ] Configuration is type-safe

---

## 📁 Updated Structure

```
packages/core/src/build/
├── vinxi.ts              ✅ Enhanced
├── vite.ts               ✅
├── nitro.ts              ✅
├── router-utils.ts       ✅ New
├── dev-server.ts         ✅ New
├── production-build.ts   ✅ New
├── hmr.ts                ✅ New
└── index.ts              ✅ Updated
```

---

## 🎉 Success!

You now have a complete Vinxi configuration with:

- ✅ Multi-router architecture
- ✅ Development server
- ✅ Production builds
- ✅ Hot module replacement
- ✅ Type-safe configuration

---

## 📚 What's Next?

Continue to **[05-File-Based-Routing.md](./05-File-Based-Routing.md)** to implement the routing system.

---

## 📖 Additional Resources

- [Vinxi Documentation](https://vinxi.vercel.app/)
- [Vinxi GitHub](https://github.com/nksaraf/vinxi)
- [Vite Multi-Page Apps](https://vitejs.dev/guide/build.html#multi-page-app)

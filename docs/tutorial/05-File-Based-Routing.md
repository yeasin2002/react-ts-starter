# Tutorial 05: File-Based Routing System

Implement a powerful file-based routing system for your React framework.

---

## 🎯 What We're Building

A routing system with:

- File-based route generation
- Dynamic routes ([id])
- Nested routes
- Catch-all routes ([...slug])
- Route manifest generation
- Type-safe routing

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01-04
- ✅ Core package with Vinxi setup
- ✅ Understanding of React Router

---

## 🚀 Step 1: Router Package Structure

**packages/router/src/types/route.ts:**

```typescript
export interface Route {
  path: string;
  filePath: string;
  component: string;
  children?: Route[];
  layout?: string;
  loader?: string;
  action?: string;
  meta?: RouteMeta;
}

export interface RouteMeta {
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface RouteManifest {
  routes: Route[];
  version: string;
}

export type RouteParams = Record<string, string>;
```

---

## 🚀 Step 2: Route Scanner

**packages/router/src/scanner/index.ts:**

```typescript
import { glob } from "fast-glob";
import { resolve, relative, parse } from "pathe";
import type { Route } from "../types";

export interface ScanOptions {
  routesDir: string;
  extensions?: string[];
}

export async function scanRoutes(options: ScanOptions): Promise<Route[]> {
  const { routesDir, extensions = ["tsx", "ts", "jsx", "js"] } = options;

  // Find all route files
  const pattern = `**/*.{${extensions.join(",")}}`;
  const files = await glob(pattern, {
    cwd: routesDir,
    absolute: false,
    ignore: ["**/_*", "**/*.test.*", "**/*.spec.*"],
  });

  // Convert files to routes
  const routes = files.map((file) => fileToRoute(file, routesDir));

  // Build route tree
  return buildRouteTree(routes);
}

function fileToRoute(file: string, routesDir: string): Route {
  const parsed = parse(file);
  const segments = parsed.dir ? parsed.dir.split("/") : [];
  const filename = parsed.name;

  // Build path from segments
  let path = "/";

  if (segments.length > 0) {
    path += segments
      .map((seg) => {
        // Dynamic segment: [id] -> :id
        if (seg.startsWith("[") && seg.endsWith("]")) {
          return `:${seg.slice(1, -1)}`;
        }
        // Catch-all: [...slug] -> *
        if (seg.startsWith("[...") && seg.endsWith("]")) {
          return "*";
        }
        return seg;
      })
      .join("/");
  }

  // Handle filename
  if (filename !== "index") {
    if (filename.startsWith("[") && filename.endsWith("]")) {
      // Dynamic: [id].tsx -> :id
      path += `/:${filename.slice(1, -1)}`;
    } else if (filename.startsWith("[...") && filename.endsWith("]")) {
      // Catch-all: [...slug].tsx -> /*
      path += "/*";
    } else {
      path += `/${filename}`;
    }
  }

  return {
    path: path.replace(/\/+/g, "/"),
    filePath: file,
    component: resolve(routesDir, file),
  };
}

function buildRouteTree(routes: Route[]): Route[] {
  // Sort routes by specificity
  routes.sort((a, b) => {
    const aDepth = a.path.split("/").length;
    const bDepth = b.path.split("/").length;
    return bDepth - aDepth;
  });

  return routes;
}
```

---

## 🚀 Step 3: Route Generator

**packages/router/src/generator/index.ts:**

```typescript
import type { Route, RouteManifest } from "../types";
import { scanRoutes, type ScanOptions } from "../scanner";

export async function generateRouteManifest(options: ScanOptions): Promise<RouteManifest> {
  const routes = await scanRoutes(options);

  return {
    routes,
    version: "1.0.0",
  };
}

export function generateRouteCode(manifest: RouteManifest): string {
  const imports = manifest.routes
    .map((route, index) => {
      return `import Route${index} from '${route.component}';`;
    })
    .join("\n");

  const routeObjects = manifest.routes
    .map((route, index) => {
      return `{
    path: '${route.path}',
    component: Route${index},
    filePath: '${route.filePath}'
  }`;
    })
    .join(",\n  ");

  return `
// Auto-generated route manifest
${imports}

export const routes = [
  ${routeObjects}
];

export default routes;
`;
}
```

---

## 🚀 Step 4: Virtual Module Plugin

**packages/router/src/vite-plugin/index.ts:**

```typescript
import type { Plugin } from "vite";
import { generateRouteManifest, generateRouteCode } from "../generator";

export interface RoutesPluginOptions {
  routesDir: string;
}

export function routesPlugin(options: RoutesPluginOptions): Plugin {
  const virtualModuleId = "virtual:reactflow-routes";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  let routeCode: string;

  return {
    name: "reactflow:routes",

    async buildStart() {
      // Generate routes on build start
      const manifest = await generateRouteManifest({
        routesDir: options.routesDir,
      });

      routeCode = generateRouteCode(manifest);
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        return routeCode;
      }
    },

    async handleHotUpdate({ file, server }) {
      // Regenerate routes on file changes
      if (file.includes(options.routesDir)) {
        const manifest = await generateRouteManifest({
          routesDir: options.routesDir,
        });

        routeCode = generateRouteCode(manifest);

        // Trigger HMR
        const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (module) {
          server.moduleGraph.invalidateModule(module);
          server.ws.send({
            type: "full-reload",
          });
        }
      }
    },
  };
}
```

---

## 🚀 Step 5: Route Matcher

**packages/router/src/matcher/index.ts:**

```typescript
import type { Route, RouteParams } from "../types";

export function matchRoute(path: string, routes: Route[]): Route | null {
  for (const route of routes) {
    const params = matchPath(path, route.path);
    if (params !== null) {
      return route;
    }
  }
  return null;
}

export function matchPath(pathname: string, pattern: string): RouteParams | null {
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    // Check for catch-all
    if (pattern.endsWith("/*")) {
      return extractParams(pathname, pattern);
    }
    return null;
  }

  return extractParams(pathname, pattern);
}

function extractParams(pathname: string, pattern: string): RouteParams | null {
  const params: RouteParams = {};
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i];
    const pathSeg = pathSegments[i];

    if (patternSeg.startsWith(":")) {
      // Dynamic segment
      params[patternSeg.slice(1)] = pathSeg;
    } else if (patternSeg === "*") {
      // Catch-all
      params.slug = pathSegments.slice(i).join("/");
      break;
    } else if (patternSeg !== pathSeg) {
      return null;
    }
  }

  return params;
}
```

---

## 🚀 Step 6: Export Everything

**packages/router/src/index.ts:**

```typescript
export * from "./types";
export * from "./scanner";
export * from "./generator";
export * from "./matcher";
export * from "./vite-plugin";
```

---

## 🚀 Step 7: Integrate with Core

**packages/core/src/build/vite.ts (update):**

```typescript
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { routesPlugin } from "@reactflow/router";
import type { ReactFlowConfig } from "../types";

export function createViteConfig(config: ReactFlowConfig, target: "client" | "server"): UserConfig {
  const isClient = target === "client";

  return defineConfig({
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
      routesPlugin({
        routesDir: config.routesDir || "app/routes",
      }),
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
    },

    ...(config.vite || {}),
  });
}
```

---

## 🚀 Step 8: Create Example Routes

**examples/basic/app/routes/index.tsx:**

```typescript
export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to ReactFlow!</p>
    </div>
  );
}
```

**examples/basic/app/routes/about.tsx:**

```typescript
export default function About() {
  return (
    <div>
      <h1>About Page</h1>
    </div>
  );
}
```

**examples/basic/app/routes/users/[id].tsx:**

```typescript
import { useParams } from "react-router-dom";

export default function UserDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>User: {id}</h1>
    </div>
  );
}
```

---

## 🚀 Step 9: Build and Test

```bash
# Build router package
cd packages/router
pnpm build

# Test route scanning
tsx -e "
import { scanRoutes } from './dist/index.js';
const routes = await scanRoutes({ routesDir: './test-routes' });
console.log('Routes:', routes);
"
```

---

## ✅ Verification Checklist

- [ ] Route scanner works
- [ ] Dynamic routes supported
- [ ] Nested routes work
- [ ] Catch-all routes work
- [ ] Virtual module plugin works
- [ ] HMR updates routes

---

## 📚 What's Next?

Continue to **[06-Server-Functions.md](./06-Server-Functions.md)** to implement server-side data fetching.

---

## 📖 Additional Resources

- [React Router](https://reactrouter.com/)
- [Vite Virtual Modules](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention)
- [File-Based Routing Patterns](https://nextjs.org/docs/routing/introduction)

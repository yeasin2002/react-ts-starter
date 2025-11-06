# Building a Full-Stack SSR Framework with Nitro

A detailed guide on how Nitro-based frameworks like TanStack Start achieve SSR, and how to transform your current starter into a full-stack SSR framework like Next.js or Nuxt.

---

## Table of Contents

1. [How Nitro-Based SSR Works](#how-nitro-based-ssr-works)
2. [Key Components Needed](#key-components-needed)
3. [Architecture Overview](#architecture-overview)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Advanced Features](#advanced-features)
6. [Comparison with Next.js/Nuxt](#comparison-with-nextjsnuxt)

---

## How Nitro-Based SSR Works

### The Magic Behind TanStack Start, Nuxt, and Others

Nitro-based frameworks achieve SSR through a sophisticated build and runtime system:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BUILD TIME                                               │
│                                                             │
│  Vite + Nitro Plugin                                        │
│  ├─ Client Build (Browser Bundle)                           │
│  │  └─ React components → JavaScript bundle                 │
│  │                                                          │
│  └─ Server Build (Node.js/Edge Runtime)                     │
│     ├─ React components → Server-renderable code            │
│     ├─ Server functions → API endpoints                     │
│     └─ Routing manifest → Server routing logic              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. RUNTIME (Request Handling)                               │
│                                                             │
│  Browser Request → Nitro Server                             │
│                    │                                        │
│                    ├─ Match Route                           │
│                    ├─ Execute Server Functions              │
│                    ├─ Fetch Data                            │
│                    ├─ Render React to HTML String           │
│                    ├─ Inject Client Bundle Scripts          │
│                    └─ Send Full HTML Response               │
│                                                             │
│  Browser Receives HTML → Hydrate with React                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Technologies

1. **Vinxi** - The build orchestrator (used by TanStack Start)
2. **Nitro** - Universal server framework
3. **React Server Rendering** - `renderToPipeableStream` or `renderToString`
4. **Vite SSR** - Server-side module resolution
5. **File-based Routing** - Automatic route generation

---

## Key Components Needed

To build a full-stack SSR framework, you need:

### 1. Dual Build System

```typescript
// Build both client and server bundles
{
  client: {
    entry: 'src/entry-client.tsx',
    output: 'dist/client'
  },
  server: {
    entry: 'src/entry-server.tsx',
    output: 'dist/server'
  }
}
```

### 2. Server Entry Point

```typescript
// src/entry-server.tsx
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function render(url: string, context: any) {
  return renderToPipeableStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
```

### 3. Client Entry Point

```typescript
// src/entry-client.tsx
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### 4. Nitro Handler

```typescript
// server/handler.ts
import { defineEventHandler } from "h3";
import { render } from "../dist/server/entry-server.js";

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "/";

  // Render React to HTML
  const { pipe } = render(url, {});

  // Stream HTML to client
  setHeader(event, "Content-Type", "text/html");
  return pipe(event.node.res);
});
```

### 5. HTML Template

```typescript
// server/template.ts
export function createHtmlTemplate(content: string, scripts: string[]) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
        <div id="root">${content}</div>
        ${scripts.map((src) => `<script type="module" src="${src}"></script>`).join("\n")}
      </body>
    </html>
  `;
}
```

---

## Architecture Overview

### How TanStack Start Does It

TanStack Start uses **Vinxi** (a Vite-based build orchestrator) to manage multiple builds:

```typescript
// app.config.ts (TanStack Start style)
import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  server: {
    preset: "node-server", // or 'cloudflare', 'vercel', etc.
  },
  routers: {
    // Client router
    client: {
      entry: "./src/entry-client.tsx",
      base: "/",
    },
    // Server router
    ssr: {
      entry: "./src/entry-server.tsx",
    },
    // API router
    api: {
      entry: "./routes/**/*.ts",
      base: "/api",
    },
  },
});
```

### How Nuxt Does It

Nuxt uses Nitro directly with a custom build system:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: "node-server",
    serveStatic: true,
  },
  vite: {
    // Vite config for client build
  },
});
```

Nuxt's build process:

1. **Analyze** - Scan pages, components, composables
2. **Build Client** - Bundle for browser
3. **Build Server** - Bundle for Node.js with Vue SSR
4. **Generate Nitro** - Create server handler

---

## Step-by-Step Implementation

Let's transform your current starter into an SSR framework!

### Phase 1: Setup Dual Build System

#### Step 1: Install Dependencies

```bash
npm install -D vinxi @vinxi/react vite-plugin-ssr
npm install react-dom@latest
```

#### Step 2: Create Vinxi Config

**app.config.ts:**

```typescript
import { createApp } from "vinxi";
import { config } from "vinxi/plugins/config";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default createApp({
  routers: [
    // Client router - Browser bundle
    {
      name: "client",
      type: "client",
      handler: "./src/entry-client.tsx",
      target: "browser",
      plugins: () => [react(), tailwindcss()],
      base: "/_build",
    },

    // SSR router - Server-side rendering
    {
      name: "ssr",
      type: "http",
      handler: "./src/entry-server.tsx",
      target: "server",
      plugins: () => [react()],
    },

    // API router - Backend routes
    {
      name: "api",
      type: "http",
      base: "/api",
      handler: "./routes/**/*.ts",
      target: "server",
    },
  ],
});
```

### Phase 2: Create Entry Points

#### Step 3: Server Entry Point

**src/entry-server.tsx:**

```typescript
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { eventHandler, setHeader } from 'vinxi/http';
import App from './App';

// Import client manifest for script injection
import { getManifest } from 'vinxi/manifest';

export default eventHandler(async (event) => {
  const url = event.node.req.url || '/';

  // Get client assets
  const clientManifest = getManifest('client');
  const assets = await clientManifest.inputs[clientManifest.handler].assets();

  // Render React to stream
  const { pipe } = renderToPipeableStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
    {
      bootstrapScripts: assets.scripts.map(s => s.src),
      onShellReady() {
        setHeader(event, 'Content-Type', 'text/html');

        // Send HTML shell
        event.node.res.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>My App</title>
              ${assets.styles.map(s => `<link rel="stylesheet" href="${s.src}">`).join('\n')}
            </head>
            <body>
              <div id="root">
        `);

        // Pipe React content
        pipe(event.node.res);
      },
      onAllReady() {
        // Close HTML
        event.node.res.write(`
              </div>
            </body>
          </html>
        `);
        event.node.res.end();
      },
      onError(error) {
        console.error('SSR Error:', error);
      },
    }
  );
});
```

#### Step 4: Client Entry Point

**src/entry-client.tsx:**

```typescript
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Hydrate the server-rendered HTML
hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

#### Step 5: Update App Component

**src/App.tsx:**

```typescript
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}

export default App;
```

### Phase 3: Data Fetching

#### Step 6: Create Server Functions

**src/lib/server-functions.ts:**

```typescript
"use server"; // Mark as server-only code

import { createServerFn } from "@tanstack/start";

// Server function for data fetching
export const getUsers = createServerFn("GET", async () => {
  // This runs ONLY on the server
  const response = await fetch("https://api.example.com/users");
  return response.json();
});

export const createUser = createServerFn("POST", async (data: any) => {
  // Server-side mutation
  const response = await fetch("https://api.example.com/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
});
```

#### Step 7: Use Server Functions in Components

**src/pages/Home.tsx:**

```typescript
import { useServerFn } from '@tanstack/start';
import { getUsers } from '../lib/server-functions';

export default function Home() {
  // This will fetch on server during SSR
  // and on client during navigation
  const users = useServerFn(getUsers);

  return (
    <div>
      <h1>Users</h1>
      {users.data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Phase 4: File-Based Routing

#### Step 8: Create Route Generator

**scripts/generate-routes.ts:**

```typescript
import fs from "fs";
import path from "path";
import { glob } from "glob";

function generateRoutes() {
  const pagesDir = path.join(process.cwd(), "src/pages");
  const files = glob.sync("**/*.tsx", { cwd: pagesDir });

  const routes = files.map((file) => {
    const route = file
      .replace(/\.tsx$/, "")
      .replace(/index$/, "")
      .replace(/\[([^\]]+)\]/g, ":$1"); // [id] -> :id

    const componentPath = `./pages/${file}`;

    return {
      path: `/${route}`,
      component: componentPath,
    };
  });

  // Generate routes file
  const routesCode = `
    // Auto-generated routes
    import { lazy } from 'react';
    
    export const routes = [
      ${routes
        .map(
          (r) => `
        {
          path: '${r.path}',
          component: lazy(() => import('${r.component}')),
        }
      `,
        )
        .join(",\n")}
    ];
  `;

  fs.writeFileSync(path.join(process.cwd(), "src/generated-routes.ts"), routesCode);
}

generateRoutes();
```

#### Step 9: Use Generated Routes

**src/App.tsx:**

```typescript
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { routes } from './generated-routes';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </Suspense>
  );
}

export default App;
```

### Phase 5: Streaming and Suspense

#### Step 10: Enable Streaming SSR

**src/entry-server.tsx (updated):**

```typescript
import { renderToPipeableStream } from 'react-dom/server';

export default eventHandler(async (event) => {
  const { pipe } = renderToPipeableStream(
    <App />,
    {
      // Send shell immediately
      onShellReady() {
        setHeader(event, 'Content-Type', 'text/html');
        pipe(event.node.res);
      },
      // Stream suspense boundaries as they resolve
      onAllReady() {
        event.node.res.end();
      },
    }
  );
});
```

#### Step 11: Use Suspense for Data

**src/pages/Users.tsx:**

```typescript
import { Suspense } from 'react';

function UserList() {
  // This will suspend during SSR
  const users = use(fetchUsers());

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

export default function Users() {
  return (
    <div>
      <h1>Users</h1>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserList />
      </Suspense>
    </div>
  );
}
```

---

## Advanced Features

### Middleware

**server/middleware/auth.ts:**

```typescript
import { defineEventHandler } from "h3";

export default defineEventHandler((event) => {
  const token = getCookie(event, "auth-token");

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  // Add user to context
  event.context.user = verifyToken(token);
});
```

### Server Context

**src/lib/context.ts:**

```typescript
import { createServerContext } from "@tanstack/start";

export const UserContext = createServerContext<User | null>(null);

// Use in server functions
export const getCurrentUser = createServerFn("GET", async (_, ctx) => {
  return ctx.user;
});
```

### Static Pre-rendering

**vite.config.ts:**

```typescript
import { defineConfig } from "vite";
import { prerender } from "vite-plugin-ssr/plugin";

export default defineConfig({
  plugins: [
    prerender({
      routes: ["/", "/about", "/contact"],
    }),
  ],
});
```

---

## Comparison with Next.js/Nuxt

### Feature Parity

| Feature            | Your SSR Framework | Next.js             | Nuxt              |
| ------------------ | ------------------ | ------------------- | ----------------- |
| SSR                | ✅                 | ✅                  | ✅                |
| SSG                | ✅                 | ✅                  | ✅                |
| File-based Routing | ✅                 | ✅                  | ✅                |
| API Routes         | ✅ (Nitro)         | ✅                  | ✅                |
| Server Functions   | ✅                 | ✅ (Server Actions) | ✅ (Server Utils) |
| Streaming          | ✅                 | ✅                  | ✅                |
| Middleware         | ✅                 | ✅                  | ✅                |
| Edge Runtime       | ✅ (Nitro)         | ✅                  | ✅                |
| Image Optimization | ❌                 | ✅                  | ✅                |
| Built-in Auth      | ❌                 | ❌                  | ✅ (Nuxt Auth)    |

### Architecture Comparison

**Your Framework:**

```
Vinxi → Vite → React SSR → Nitro → Deploy
```

**Next.js:**

```
Next.js Compiler → React SSR → Node.js/Edge → Deploy
```

**Nuxt:**

```
Nuxt Build → Vue SSR → Nitro → Deploy
```

---

## Complete Package.json Scripts

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start",
    "preview": "vinxi preview",
    "generate": "vinxi build --preset=static"
  }
}
```

---

## Deployment

### Node.js Server

```bash
npm run build
npm run start
```

### Cloudflare Workers

```typescript
// app.config.ts
export default createApp({
  server: {
    preset: "cloudflare-pages",
  },
});
```

### Vercel

```typescript
// app.config.ts
export default createApp({
  server: {
    preset: "vercel",
  },
});
```

---

## Conclusion

Building a full-stack SSR framework requires:

1. ✅ Dual build system (client + server)
2. ✅ Server-side React rendering
3. ✅ Client-side hydration
4. ✅ File-based routing
5. ✅ Server functions
6. ✅ Streaming support
7. ✅ Universal deployment

**Recommendation:** Unless you have very specific needs, use TanStack Start instead of building your own. It provides all these features out of the box with excellent DX.

---

## Next Steps

1. Read [TanStack Start Documentation](https://tanstack.com/start)
2. Try the [TanStack Start Quick Start](https://tanstack.com/router/latest/docs/framework/react/start/getting-started)
3. Explore [Vinxi Documentation](https://vinxi.vercel.app/)
4. Check out [Nitro Presets](https://nitro.unjs.io/deploy)

---

**Want to see a working implementation?** Check out the next guide: `Implementing-SSR-Step-by-Step.md`

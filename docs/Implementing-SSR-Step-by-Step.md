# Implementing SSR: Step-by-Step Guide

A practical, hands-on guide to transform your current React + Vite + Nitro starter into a full-stack SSR framework.

---

## ⚠️ Important Decision

Before starting, understand that:

**Option A: Build Your Own SSR Framework**

- ⏱️ Time: 2-4 weeks
- 🔧 Maintenance: Ongoing
- 📚 Learning: Deep understanding
- ⚠️ Risk: Bugs and edge cases

**Option B: Use TanStack Start**

- ⏱️ Time: 1-2 days
- 🔧 Maintenance: Community-supported
- 📚 Learning: Framework-specific
- ✅ Risk: Production-ready

**Recommendation:** Use TanStack Start unless you have very specific requirements.

---

## Part 1: Minimal SSR Implementation

Let's start with the absolute minimum to get SSR working.

### Step 1: Install Core Dependencies

```bash
npm install react-dom@latest
npm install -D @types/react-dom
```

### Step 2: Create Server Entry

**src/entry-server.tsx:**

```typescript
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  return { html };
}
```

### Step 3: Create Nitro Handler

**routes/[...].ts:**

```typescript
import { defineEventHandler, setHeader } from "h3";
import { render } from "../src/entry-server";

export default defineEventHandler((event) => {
  const url = event.node.req.url || "/";

  // Skip API routes
  if (url.startsWith("/api")) {
    return;
  }

  try {
    const { html } = render(url);

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>My App</title>
        </head>
        <body>
          <div id="root">${html}</div>
          <script type="module" src="/src/entry-client.tsx"></script>
        </body>
      </html>
    `;

    setHeader(event, "Content-Type", "text/html");
    return fullHtml;
  } catch (error) {
    console.error("SSR Error:", error);
    throw error;
  }
});
```

### Step 4: Create Client Entry

**src/entry-client.tsx:**

```typescript
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### Step 5: Update Vite Config

**vite.config.ts:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    react(),
    nitro({
      // Enable SSR mode
      ssr: true,
    }),
  ],
  ssr: {
    // Don't externalize these packages
    noExternal: ["react", "react-dom", "react-router-dom"],
  },
});
```

### Step 6: Update package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build && vite build --ssr",
    "preview": "vite preview"
  }
}
```

### Step 7: Test

```bash
npm run dev
```

Visit `http://localhost:5000` - You should see server-rendered HTML!

**Check by:**

1. View page source (Ctrl+U)
2. You should see actual HTML content, not just `<div id="root"></div>`

---

## Part 2: Add Data Fetching

### Step 8: Create Data Loader

**src/lib/loader.ts:**

```typescript
// Simple data loader
export interface LoaderContext {
  url: string;
  params: Record<string, string>;
}

export type Loader<T> = (context: LoaderContext) => Promise<T>;

// Store for server-side data
export const loaderData = new Map<string, any>();

export function createLoader<T>(loader: Loader<T>) {
  return loader;
}
```

### Step 9: Add Loader to Page

**src/pages/Users.tsx:**

```typescript
import { createLoader } from '../lib/loader';

// Define loader
export const loader = createLoader(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  return response.json();
});

// Component
export default function Users() {
  // Get data from loader
  const users = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 10: Update Server Entry

**src/entry-server.tsx:**

```typescript
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { matchRoutes } from 'react-router-dom';
import App from './App';
import { routes } from './routes';
import { loaderData } from './lib/loader';

export async function render(url: string) {
  // Match routes
  const matches = matchRoutes(routes, url);

  // Load data for matched routes
  if (matches) {
    for (const match of matches) {
      const route = match.route as any;
      if (route.loader) {
        const data = await route.loader({
          url,
          params: match.params,
        });
        loaderData.set(match.route.path!, data);
      }
    }
  }

  // Render with data
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  // Serialize data for client
  const serializedData = JSON.stringify(Object.fromEntries(loaderData));

  return {
    html,
    data: serializedData,
  };
}
```

### Step 11: Update Nitro Handler

**routes/[...].ts:**

```typescript
export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "/";

  if (url.startsWith("/api")) return;

  const { html, data } = await render(url);

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          window.__INITIAL_DATA__ = ${data};
        </script>
        <script type="module" src="/src/entry-client.tsx"></script>
      </body>
    </html>
  `;

  setHeader(event, "Content-Type", "text/html");
  return fullHtml;
});
```

### Step 12: Hydrate with Data

**src/entry-client.tsx:**

```typescript
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { loaderData } from './lib/loader';

// Restore server data
const initialData = (window as any).__INITIAL_DATA__;
if (initialData) {
  Object.entries(initialData).forEach(([key, value]) => {
    loaderData.set(key, value);
  });
}

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

---

## Part 3: Streaming SSR

### Step 13: Enable Streaming

**src/entry-server.tsx:**

```typescript
import { renderToPipeableStream } from 'react-dom/server';

export function renderStream(url: string) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>,
      {
        onShellReady() {
          resolve({ pipe });
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          console.error('Stream error:', error);
        },
      }
    );
  });
}
```

### Step 14: Update Handler for Streaming

**routes/[...].ts:**

```typescript
import { Readable } from "stream";

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "/";

  if (url.startsWith("/api")) return;

  setHeader(event, "Content-Type", "text/html");
  setHeader(event, "Transfer-Encoding", "chunked");

  // Send HTML shell
  event.node.res.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
        <div id="root">
  `);

  // Stream React content
  const { pipe } = await renderStream(url);

  // Create writable stream
  const stream = new Readable({
    read() {},
  });

  stream.pipe(event.node.res, { end: false });
  pipe(stream);

  stream.on("end", () => {
    event.node.res.write(`
        </div>
        <script type="module" src="/src/entry-client.tsx"></script>
      </body>
    </html>
    `);
    event.node.res.end();
  });
});
```

---

## Part 4: Production Build

### Step 15: Create Build Script

**scripts/build.ts:**

```typescript
import { build } from "vite";
import { build as buildNitro } from "nitropack";

async function buildApp() {
  console.log("Building client...");
  await build({
    build: {
      outDir: "dist/client",
      ssrManifest: true,
    },
  });

  console.log("Building server...");
  await build({
    build: {
      ssr: true,
      outDir: "dist/server",
    },
  });

  console.log("Building Nitro...");
  await buildNitro({
    preset: "node-server",
  });

  console.log("Build complete!");
}

buildApp();
```

### Step 16: Update package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsx scripts/build.ts",
    "start": "node .output/server/index.mjs",
    "preview": "npm run build && npm run start"
  }
}
```

---

## Part 5: Advanced Features

### Step 17: Add Server Functions

**src/lib/server-fn.ts:**

```typescript
export function createServerFn<T extends (...args: any[]) => any>(fn: T): T {
  // Mark function as server-only
  if (typeof window !== "undefined") {
    // Client-side: make RPC call
    return (async (...args: any[]) => {
      const response = await fetch("/__server-fn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fn: fn.name,
          args,
        }),
      });
      return response.json();
    }) as T;
  }

  // Server-side: execute directly
  return fn;
}
```

**Usage:**

```typescript
// src/lib/api.ts
export const getUser = createServerFn(async (id: string) => {
  // This runs ONLY on server
  const db = await connectDatabase();
  return db.users.findById(id);
});

// src/pages/User.tsx
export default function User({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser(id).then(setUser);
  }, [id]);

  return <div>{user?.name}</div>;
}
```

### Step 18: Add Middleware

**server/middleware/timing.ts:**

```typescript
export default defineEventHandler((event) => {
  const start = Date.now();

  event.node.res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${event.node.req.method} ${event.node.req.url} - ${duration}ms`);
  });
});
```

### Step 19: Add Error Boundaries

**src/components/ErrorBoundary.tsx:**

```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Part 6: Testing

### Step 20: Test SSR

**tests/ssr.test.ts:**

```typescript
import { render } from "../src/entry-server";

describe("SSR", () => {
  it("renders home page", async () => {
    const { html } = await render("/");
    expect(html).toContain("<h1>");
  });

  it("renders with data", async () => {
    const { html } = await render("/users");
    expect(html).toContain("Users");
  });
});
```

### Step 21: Test Hydration

**tests/hydration.test.ts:**

```typescript
import { screen, waitFor } from "@testing-library/react";

describe("Hydration", () => {
  it("hydrates without errors", async () => {
    // Set server HTML
    document.body.innerHTML = `
      <div id="root">
        <h1>Hello</h1>
      </div>
    `;

    // Hydrate
    await import("../src/entry-client");

    // Check hydration
    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Hydration Mismatch

**Error:** "Hydration failed because the initial UI does not match..."

**Solution:**

```typescript
// Ensure server and client render the same
// Avoid:
const now = new Date(); // Different on server/client

// Use:
const [now, setNow] = useState(null);
useEffect(() => setNow(new Date()), []);
```

#### 2. Module Not Found

**Error:** "Cannot find module 'react-dom/server'"

**Solution:**

```bash
npm install react-dom@latest
```

#### 3. CSS Not Loading

**Solution:**

```typescript
// In entry-server.tsx
import { getManifest } from "vinxi/manifest";

const manifest = getManifest("client");
const styles = manifest.inputs[manifest.handler].assets().styles;

// Inject in HTML
styles.forEach((style) => {
  html += `<link rel="stylesheet" href="${style.src}">`;
});
```

---

## Performance Optimization

### 1. Code Splitting

```typescript
// Use lazy loading
const Users = lazy(() => import("./pages/Users"));
```

### 2. Caching

```typescript
// Cache rendered pages
const cache = new Map<string, string>();

export default defineEventHandler(async (event) => {
  const url = event.node.req.url!;

  if (cache.has(url)) {
    return cache.get(url);
  }

  const html = await render(url);
  cache.set(url, html);

  return html;
});
```

### 3. Streaming

Already implemented in Step 13-14!

---

## Deployment

### Node.js

```bash
npm run build
npm run start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY .output ./output
CMD ["node", ".output/server/index.mjs"]
```

### Cloudflare Workers

```typescript
// wrangler.toml
name = "my-app";
main = ".output/server/index.mjs";
compatibility_date = "2024-01-01";
```

---

## Conclusion

You now have a working SSR implementation! 🎉

**What you've built:**

- ✅ Server-side rendering
- ✅ Client-side hydration
- ✅ Data fetching
- ✅ Streaming
- ✅ Server functions
- ✅ Error handling

**Next steps:**

1. Add authentication
2. Implement caching
3. Add monitoring
4. Deploy to production

**Or... just use TanStack Start** 😉

It has all of this and more, battle-tested and production-ready!

---

## Resources

- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)
- [Nitro Documentation](https://nitro.unjs.io/)
- [TanStack Start](https://tanstack.com/start)

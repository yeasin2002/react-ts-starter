# Technology Stack

Complete breakdown of all tools, packages, and technologies used in building ReactFlow framework.

---

## Core Technologies

### 1. Vinxi - Build Orchestrator

**Version:** `^0.4.x`  
**Purpose:** Multi-build coordination and asset management  
**GitHub:** https://github.com/nksaraf/vinxi

**What it does:**

- Manages multiple Vite builds (client, server, API)
- Generates build manifests
- Handles asset references between builds
- Provides router abstraction

**Key Features:**

```typescript
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "client",
      type: "client",
      handler: "./app/entry-client.tsx",
      target: "browser",
    },
    {
      name: "ssr",
      type: "http",
      handler: "./app/entry-server.tsx",
      target: "server",
    },
  ],
});
```

**Why we chose it:**

- Used by TanStack Start (proven)
- Designed for SSR frameworks
- Excellent Vite integration
- Active development

---

### 2. Nitro - Universal Server

**Version:** `^2.9.x`  
**Purpose:** Server runtime and deployment  
**GitHub:** https://github.com/unjs/nitro

**What it does:**

- HTTP server with H3
- Universal deployment (Node, Edge, Serverless)
- API routes
- Middleware system
- Built-in optimizations

**Key Features:**

```typescript
import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "node-server", // or 'cloudflare', 'vercel', etc.
  handlers: [
    {
      route: "/**",
      handler: "./dist/server/entry.js",
    },
  ],
});
```

**Deployment Presets:**

- `node-server` - Node.js server
- `cloudflare` - Cloudflare Workers
- `vercel` - Vercel Serverless
- `netlify` - Netlify Functions
- `aws-lambda` - AWS Lambda
- `deno` - Deno Deploy
- And 20+ more!

**Why we chose it:**

- Powers Nuxt 3 (battle-tested)
- Deploy anywhere
- H3 is fast and modern
- Built-in optimizations

---

### 3. Vite - Build Tool

**Version:** `^5.x`  
**Purpose:** Fast bundling and development  
**GitHub:** https://github.com/vitejs/vite

**What it does:**

- Lightning-fast HMR
- ESM-based development
- Optimized production builds
- Plugin ecosystem

**Key Features:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true, // Enable SSR build
    rollupOptions: {
      input: "./app/entry-server.tsx",
    },
  },
});
```

**Why we chose it:**

- Industry standard
- Fast development
- Great plugin ecosystem
- SSR support built-in

---

### 4. React 19 - UI Library

**Version:** `^19.x`  
**Purpose:** Component-based UI  
**GitHub:** https://github.com/facebook/react

**What it does:**

- Component rendering
- Server Components (future)
- Suspense and streaming
- Concurrent features

**Key Features:**

```typescript
// Server-side rendering
import { renderToPipeableStream } from 'react-dom/server';

// Client-side hydration
import { hydrateRoot } from 'react-dom/client';

// Suspense for streaming
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

**Why we chose it:**

- Most popular UI library
- Server Components support
- Excellent streaming
- Large ecosystem

---

## Build Tools

### 5. esbuild - Fast Compiler

**Version:** `^0.20.x`  
**Purpose:** Fast TypeScript/JSX compilation  
**GitHub:** https://github.com/evanw/esbuild

**What it does:**

- Compiles TypeScript
- Transforms JSX
- Minifies code
- Tree shaking

**Why we chose it:**

- 10-100x faster than alternatives
- Used by Vite internally
- Native Go implementation

---

### 6. unplugin-auto-import - Auto Imports

**Version:** `^0.17.x`  
**Purpose:** Automatic imports for common APIs  
**GitHub:** https://github.com/unplugin/unplugin-auto-import

**What it does:**

- Auto-import React hooks
- Auto-import utilities
- Generate TypeScript definitions

**Example:**

```typescript
// No imports needed!
export default function Counter() {
  const [count, setCount] = useState(0); // auto-imported

  useEffect(() => {
    console.log('Count changed');
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Why we chose it:**

- Better DX
- Less boilerplate
- Type-safe

---

### 7. vite-plugin-inspect - Build Inspector

**Version:** `^0.8.x`  
**Purpose:** Debug Vite build process  
**GitHub:** https://github.com/antfu/vite-plugin-inspect

**What it does:**

- Visualize build process
- Inspect transformations
- Debug plugins

**Why we chose it:**

- Essential for debugging
- Great visualization
- Free and open source

---

## Routing

### 8. React Router - Client Routing

**Version:** `^6.x`  
**Purpose:** Client-side navigation  
**GitHub:** https://github.com/remix-run/react-router

**What it does:**

- Client-side routing
- Nested routes
- Data loading
- Navigation

**Key Features:**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

**Why we chose it:**

- Industry standard
- Excellent API
- Nested routing
- Data loading support

---

### 9. Custom Route Generator

**Purpose:** File-based routing  
**Implementation:** Custom

**What it does:**

- Scans `app/routes/` directory
- Generates route manifest
- Handles dynamic routes
- Creates route types

**Example:**

```
app/routes/
├── index.tsx          → /
├── about.tsx          → /about
├── users/
│   ├── index.tsx      → /users
│   └── [id].tsx       → /users/:id
└── [...404].tsx       → /* (catch-all)
```

**Why custom:**

- Full control
- Framework-specific needs
- Type generation

---

## Optimization

### 10. sharp - Image Optimization

**Version:** `^0.33.x`  
**Purpose:** Fast image processing  
**GitHub:** https://github.com/lovell/sharp

**What it does:**

- Resize images
- Convert formats (WebP, AVIF)
- Optimize quality
- Generate placeholders

**Example:**

```typescript
import sharp from "sharp";

await sharp("input.jpg").resize(800, 600).webp({ quality: 80 }).toFile("output.webp");
```

**Why we chose it:**

- Fastest image processor
- Native performance
- Comprehensive features

---

### 11. lightningcss - CSS Optimization

**Version:** `^1.x`  
**Purpose:** Fast CSS processing  
**GitHub:** https://github.com/parcel-bundler/lightningcss

**What it does:**

- Parse and minify CSS
- Autoprefixer
- CSS modules
- Modern CSS transforms

**Why we chose it:**

- 100x faster than PostCSS
- Native Rust implementation
- Modern CSS support

---

### 12. @vercel/og - OG Image Generation

**Version:** `^0.6.x`  
**Purpose:** Generate Open Graph images  
**GitHub:** https://github.com/vercel/og-image

**What it does:**

- Generate social media images
- Dynamic text rendering
- Custom fonts and styles

**Example:**

```typescript
import { ImageResponse } from '@vercel/og';

export default function handler() {
  return new ImageResponse(
    <div style={{ fontSize: 60 }}>
      Hello World
    </div>
  );
}
```

**Why we chose it:**

- Used by Vercel/Next.js
- Edge-compatible
- Great DX

---

## Server Utilities

### 13. H3 - HTTP Framework

**Version:** `^1.x`  
**Purpose:** HTTP utilities  
**GitHub:** https://github.com/unjs/h3

**What it does:**

- Request/response handling
- Middleware
- Cookie management
- Body parsing

**Example:**

```typescript
import { defineEventHandler, readBody, getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = getCookie(event, "auth");

  return { success: true };
});
```

**Why we chose it:**

- Used by Nitro
- Modern API
- Type-safe
- Fast

---

### 14. unjs Ecosystem

**Purpose:** Universal JavaScript utilities  
**GitHub:** https://github.com/unjs

**Key Packages:**

- `ofetch` - Universal fetch
- `unstorage` - Universal storage
- `uncrypto` - Universal crypto
- `ufo` - URL utilities
- `defu` - Deep merge
- `pathe` - Path utilities

**Why we chose it:**

- Universal (Node, Browser, Edge)
- Consistent API
- Well-maintained
- Used by Nuxt

---

## Development Tools

### 15. TypeScript - Type Safety

**Version:** `^5.x`  
**Purpose:** Static typing

**Configuration:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  }
}
```

---

### 16. ESLint - Code Linting

**Version:** `^9.x`  
**Purpose:** Code quality

**Plugins:**

- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`

---

### 17. Prettier - Code Formatting

**Version:** `^3.x`  
**Purpose:** Consistent formatting

**Plugins:**

- `prettier-plugin-tailwindcss`

---

## Testing

### 18. Vitest - Unit Testing

**Version:** `^1.x`  
**Purpose:** Fast unit tests  
**GitHub:** https://github.com/vitest-dev/vitest

**Why we chose it:**

- Vite-native
- Fast
- Jest-compatible API

---

### 19. Playwright - E2E Testing

**Version:** `^1.x`  
**Purpose:** End-to-end testing  
**GitHub:** https://github.com/microsoft/playwright

**Why we chose it:**

- Cross-browser
- Fast and reliable
- Great DX

---

## Complete Package List

### Core Dependencies

```json
{
  "dependencies": {
    "vinxi": "^0.4.x",
    "nitro": "^2.9.x",
    "vite": "^5.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-router-dom": "^6.x",
    "h3": "^1.x",
    "ofetch": "^1.x",
    "defu": "^6.x",
    "pathe": "^1.x",
    "ufo": "^1.x"
  }
}
```

### Build Dependencies

```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "unplugin-auto-import": "^0.17.x",
    "vite-plugin-inspect": "^0.8.x",
    "esbuild": "^0.20.x",
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "@types/node": "^20.x"
  }
}
```

### Optimization Dependencies

```json
{
  "dependencies": {
    "sharp": "^0.33.x",
    "lightningcss": "^1.x",
    "@vercel/og": "^0.6.x"
  }
}
```

### Testing Dependencies

```json
{
  "devDependencies": {
    "vitest": "^1.x",
    "playwright": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/user-event": "^14.x"
  }
}
```

### Linting Dependencies

```json
{
  "devDependencies": {
    "eslint": "^9.x",
    "@typescript-eslint/eslint-plugin": "^7.x",
    "@typescript-eslint/parser": "^7.x",
    "eslint-plugin-react": "^7.x",
    "eslint-plugin-react-hooks": "^4.x",
    "prettier": "^3.x",
    "prettier-plugin-tailwindcss": "^0.5.x"
  }
}
```

---

## Technology Comparison

### vs Next.js

| Feature            | ReactFlow | Next.js           |
| ------------------ | --------- | ----------------- |
| Build Tool         | Vite      | Turbopack/Webpack |
| Server             | Nitro     | Node.js           |
| Deployment         | Universal | Vercel-optimized  |
| File Routing       | Custom    | Built-in          |
| Image Optimization | sharp     | @next/image       |

### vs TanStack Start

| Feature     | ReactFlow    | TanStack Start  |
| ----------- | ------------ | --------------- |
| Build Tool  | Vinxi        | Vinxi           |
| Server      | Nitro        | Nitro           |
| Router      | React Router | TanStack Router |
| Type Safety | TypeScript   | TypeScript      |
| Maturity    | New          | RC              |

### vs Nuxt

| Feature      | ReactFlow | Nuxt     |
| ------------ | --------- | -------- |
| Framework    | React     | Vue      |
| Build Tool   | Vite      | Vite     |
| Server       | Nitro     | Nitro    |
| File Routing | Custom    | Built-in |
| Maturity     | New       | Stable   |

---

## Installation Guide

### Step 1: Create Package

```bash
mkdir reactflow-framework
cd reactflow-framework
npm init -y
```

### Step 2: Install Core

```bash
npm install vinxi nitro vite react react-dom react-router-dom h3
```

### Step 3: Install Build Tools

```bash
npm install -D @vitejs/plugin-react unplugin-auto-import vite-plugin-inspect
npm install -D typescript @types/react @types/react-dom @types/node
```

### Step 4: Install Optimization

```bash
npm install sharp lightningcss @vercel/og
```

### Step 5: Install Dev Tools

```bash
npm install -D eslint prettier vitest playwright
```

---

## Version Compatibility

### Node.js

- **Minimum:** 20.x
- **Recommended:** 22.x LTS
- **Maximum:** Latest

### Package Managers

- **npm:** >= 10.x
- **pnpm:** >= 8.x
- **yarn:** >= 4.x
- **bun:** >= 1.x

### Browsers

- **Chrome:** Last 2 versions
- **Firefox:** Last 2 versions
- **Safari:** Last 2 versions
- **Edge:** Last 2 versions

---

## Next Steps

Now that you understand the tech stack, proceed to:

**[03-Project-Setup.md](./03-Project-Setup.md)** - Set up the initial project structure

---

## Resources

- [Vinxi Docs](https://vinxi.vercel.app/)
- [Nitro Docs](https://nitro.unjs.io/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [unjs Ecosystem](https://unjs.io/)

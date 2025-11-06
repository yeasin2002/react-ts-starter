# Server-Side Rendering (SSR) & Static Site Generation (SSG) Guide

## Current Setup: Client-Side Rendering (CSR)

Your current stack uses **Client-Side Rendering (CSR)**:

- React renders in the browser
- Initial HTML is minimal
- JavaScript loads and renders the UI
- ❌ Not ideal for SEO
- ❌ Slower initial page load
- ✅ Great for interactive apps

---

## Can Nitro + Vite Support SSR/SSG?

### Short Answer: **Partially, but not recommended**

Nitro is primarily designed for:

- ✅ API routes
- ✅ Server functions
- ✅ Edge deployments
- ❌ **NOT** for React SSR out of the box

### Why Not?

1. **No React SSR Integration**: Nitro doesn't have built-in React rendering like Next.js
2. **Manual Setup Required**: You'd need to manually configure `renderToString` from React
3. **No Hydration Support**: Complex to set up client-side hydration
4. **No Routing Integration**: File-based routing won't work with SSR
5. **Maintenance Burden**: You'd be building your own framework

---

## Recommended Solutions

### Option 1: Use a Framework (Recommended ⭐)

Switch to a framework designed for SSR/SSG:

#### **Next.js** (Most Popular)

```bash
npx create-next-app@latest my-app --typescript
```

**Features:**

- ✅ SSR, SSG, ISR (Incremental Static Regeneration)
- ✅ File-based routing
- ✅ API routes
- ✅ Image optimization
- ✅ Built-in TypeScript support
- ✅ Excellent documentation

**When to use:** Production apps needing SEO, e-commerce, blogs

---

#### **Remix**

```bash
npx create-remix@latest
```

**Features:**

- ✅ SSR-first approach
- ✅ Nested routing
- ✅ Progressive enhancement
- ✅ Built-in data loading
- ✅ Great for forms and mutations

**When to use:** Data-heavy apps, dashboards, admin panels

---

#### **Astro** (Best for Content Sites)

```bash
npm create astro@latest
```

**Features:**

- ✅ SSG by default
- ✅ Partial hydration (Islands Architecture)
- ✅ Use React, Vue, Svelte together
- ✅ Zero JS by default
- ✅ Perfect for blogs/docs

**When to use:** Blogs, documentation, marketing sites

---

#### **TanStack Start** (New)

```bash
npm create @tanstack/start@latest
```

**Features:**

- ✅ Full-stack React framework
- ✅ Type-safe routing
- ✅ Built on Nitro + Vinxi
- ✅ SSR + SSG support
- ⚠️ Still in beta

**When to use:** Modern full-stack apps, if you want cutting-edge tech

---

### Option 2: Hybrid Approach (Keep Current Stack)

Use your current CSR app + optimize for SEO:

#### **Step 1: Pre-rendering with Vite**

Install vite-plugin-ssr or use static generation:

```bash
npm install vite-plugin-ssr
```

**vite.config.ts:**

```typescript
import { ssr } from "vite-plugin-ssr/plugin";

export default defineConfig({
  plugins: [
    react(),
    ssr({ prerender: true }), // Enable pre-rendering
    // ... other plugins
  ],
});
```

#### **Step 2: Meta Tags for SEO**

Use `react-helmet-async` for dynamic meta tags:

```bash
npm install react-helmet-async
```

**Usage:**

```tsx
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>My Page Title</title>
        <meta name="description" content="Page description" />
        <meta property="og:title" content="My Page Title" />
      </Helmet>
      <div>Your content</div>
    </>
  );
};
```

#### **Step 3: Dynamic Rendering for Bots**

Use a service like **Prerender.io** or **Rendertron** to serve pre-rendered HTML to search engine bots:

```typescript
// routes/middleware/prerender.ts
export default defineEventHandler((event) => {
  const userAgent = getHeader(event, "user-agent") || "";
  const isBot = /googlebot|bingbot|yandex|baiduspider/i.test(userAgent);

  if (isBot) {
    // Serve pre-rendered version
    // Redirect to prerender service
  }
});
```

---

### Option 3: Manual SSR with Nitro (Advanced ⚠️)

**Only if you really need it and understand the complexity.**

#### Step 1: Install React SSR Dependencies

```bash
npm install react-dom/server
```

#### Step 2: Create SSR Handler

**routes/index.ts:**

```typescript
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../src/App';

export default defineEventHandler((event) => {
  const url = event.node.req.url || '/';

  // Render React to string
  const html = renderToString(
    <StaticRouter location={url}></StaticRouter>/>
    </StaticRouter>
  );

  // Return full HTML
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
        <link rel="stylesheet" href="/assets/style.css">
      </head>
      <body>
        <div id="root">${html}</div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  `;
});
```

#### Step 3: Client-Side Hydration

**src/main.tsx:**

```tsx
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

hydrateRoot(
  document.getElementById("root")!,
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

#### ⚠️ Challenges:

- CSS-in-JS won't work easily
- File-based routing breaks
- No automatic code splitting
- Data fetching is complex
- Hydration mismatches
- Build process needs customization

---

## Static Site Generation (SSG) with Current Stack

### Using vite-plugin-ssg

```bash
npm install vite-plugin-ssg
```

**vite.config.ts:**

```typescript
import { ssg } from "vite-plugin-ssg";

export default defineConfig({
  plugins: [
    react(),
    ssg({
      // Define routes to pre-render
      routes: ["/", "/about", "/contact"],
    }),
  ],
});
```

**Build:**

```bash
npm run build
```

This generates static HTML files for each route.

**Limitations:**

- Only works for static routes
- No dynamic data fetching
- No server-side logic

---

## Comparison Table

| Feature        | CSR (Current) | Next.js      | Remix        | Astro        | Manual SSR |
| -------------- | ------------- | ------------ | ------------ | ------------ | ---------- |
| SEO            | ❌ Poor       | ✅ Excellent | ✅ Excellent | ✅ Excellent | ⚠️ Complex |
| Initial Load   | ❌ Slow       | ✅ Fast      | ✅ Fast      | ✅ Very Fast | ⚠️ Medium  |
| Interactivity  | ✅ Great      | ✅ Great     | ✅ Great     | ⚠️ Partial   | ✅ Great   |
| Setup Time     | ✅ Done       | ⚠️ Medium    | ⚠️ Medium    | ⚠️ Medium    | ❌ High    |
| Maintenance    | ✅ Easy       | ✅ Easy      | ✅ Easy      | ✅ Easy      | ❌ Hard    |
| Learning Curve | ✅ Low        | ⚠️ Medium    | ⚠️ Medium    | ⚠️ Medium    | ❌ High    |
| API Routes     | ✅ Nitro      | ✅ Built-in  | ✅ Built-in  | ✅ Built-in  | ✅ Nitro   |

---

## Decision Guide

### Stay with CSR if:

- ✅ Building a dashboard/admin panel
- ✅ App is behind authentication
- ✅ SEO is not important
- ✅ Users are on fast connections
- ✅ You want to keep current setup

### Switch to Next.js if:

- ✅ Need SEO (e-commerce, blog, marketing)
- ✅ Want best-in-class DX
- ✅ Need image optimization
- ✅ Want large community support

### Switch to Remix if:

- ✅ Building data-heavy apps
- ✅ Need progressive enhancement
- ✅ Want better form handling
- ✅ Prefer web standards

### Switch to Astro if:

- ✅ Building content-focused site
- ✅ Want minimal JavaScript
- ✅ Need best performance
- ✅ Want to use multiple frameworks

### Try Manual SSR if:

- ⚠️ You have very specific requirements
- ⚠️ You understand the complexity
- ⚠️ You have time to maintain it
- ❌ **Not recommended for most cases**

---

## Migration Path: CSR → Next.js

If you decide to migrate to Next.js:

### Step 1: Create New Next.js App

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
```

### Step 2: Copy Your Code

```bash
# Copy components
cp -r src/components my-app/components

# Copy styles
cp src/index.css my-app/app/globals.css

# Copy utils
cp -r src/utils my-app/lib
```

### Step 3: Convert Pages

**Before (Vite):**

```tsx
// src/pages/about.tsx
const About = () => {
  return <div>About</div>;
};
export default About;
```

**After (Next.js):**

```tsx
// app/about/page.tsx
export default function About() {
  return <div>About</div>;
}
```

### Step 4: Convert API Routes

**Before (Nitro):**

```typescript
// routes/api/users.ts
export default defineEventHandler(() => {
  return { users: [] };
});
```

**After (Next.js):**

```typescript
// app/api/users/route.ts
export async function GET() {
  return Response.json({ users: [] });
}
```

### Step 5: Update Imports

- Change `@/` imports to match Next.js structure
- Update component imports
- Remove `~react-pages` routing

---

## Conclusion

### For Your Current Project:

**If SEO is critical:** Migrate to Next.js or Remix

**If SEO is nice-to-have:** Add meta tags + prerendering service

**If SEO doesn't matter:** Keep your current CSR setup ✅

### Best Practice:

> "Use the right tool for the job. Don't force SSR if you don't need it."

Your current stack is **perfect for:**

- Internal tools
- Dashboards
- Admin panels
- Apps behind auth
- Highly interactive apps

**Need help deciding?** Ask yourself:

1. Do search engines need to index my content? → **Yes** = SSR/SSG
2. Is initial load speed critical? → **Yes** = SSR/SSG
3. Is my app behind authentication? → **Yes** = CSR is fine
4. Is it a SaaS dashboard? → **Yes** = CSR is fine

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Remix Documentation](https://remix.run/docs)
- [Astro Documentation](https://docs.astro.build)
- [TanStack Start](https://tanstack.com/start)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Vite SSR Guide](https://vitejs.dev/guide/ssr.html)

---

**Questions?** Open an issue or check the documentation of your chosen framework.

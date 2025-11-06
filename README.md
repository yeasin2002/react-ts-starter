# React + TypeScript + Nitro Full-Stack Starter

A production-ready full-stack starter template combining React 19 with TypeScript on the frontend and Nitro for the backend API. Built with Vite for blazing-fast development and optimized builds.

⭐ **Don't forget to star this repo if you find it useful!**

---

## Features

### Frontend

- ⚡ **React 19** with TypeScript and Vite
- 🎨 **Tailwind CSS 4** + **shadcn/ui** components
- 🗂️ **File-based routing** with `vite-plugin-pages`
- 🔄 **Auto-imports** for React hooks and components
- 🖼️ **SVG as React components** with `vite-plugin-svgr`
- 🔤 **Google Fonts** integration
- 📦 **Path aliases** (`@/components`, etc.)

### Backend

- 🚀 **Nitro 3** server with H3 handler
- 🛣️ **File-based API routing** in `/routes`
- ⚡ **Fast development** with hot module replacement
- 🔧 **TypeScript** support out of the box

### Developer Experience

- ✅ **ESLint** + **Prettier** configured
- 🪝 **Husky** pre-commit hooks
- 🐳 **Docker** setup included
- 🤖 **Dependabot** for dependency updates
- 📝 **Workspace settings** for team collaboration

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The dev server runs on:

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/\*

---

## Client-Side Routing (Frontend)

### File-Based Routing with vite-plugin-pages

Routes are automatically generated from files in `src/pages/`. Each `.tsx` file becomes a route.

**Documentation**: [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

### Route Structure

```
src/pages/
├── index.tsx           → /
├── about.tsx           → /about
├── users/
│   ├── index.tsx       → /users
│   ├── [id].tsx        → /users/:id (dynamic route)
│   └── profile.tsx     → /users/profile
└── [...all].tsx        → /* (catch-all/404)
```

### Creating Pages

All page components must use **default exports**:

```tsx
// src/pages/about.tsx
const About = () => {
  return (
    <div>
      <h1>About Page</h1>
    </div>
  );
};

export default About;
```

### Dynamic Routes

Use square brackets for dynamic segments:

```tsx
// src/pages/users/[id].tsx
const UserDetail = () => {
  const { id } = useParams(); // auto-imported from react-router

  return (
    <div>
      <h1>User ID: {id}</h1>
    </div>
  );
};

export default UserDetail;
```

### Catch-All Routes

Use `[...all].tsx` for 404 pages or catch-all routes:

```tsx
// src/pages/[...all].tsx or NotFound.tsx
const NotFound = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
    </div>
  );
};

export default NotFound;
```

### Navigation

Use React Router hooks (auto-imported):

```tsx
const MyComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return <button onClick={() => navigate("/about")}>Go to About</button>;
};
```

---

## Server-Side Routing (Backend API)

### File-Based API Routing with Nitro

API routes are automatically generated from files in `routes/`. Powered by [Nitro](https://nitro.unjs.io/) and [H3](https://h3.unjs.io/).

**Documentation**:

- [Nitro Routing](https://nitro.unjs.io/guide/routing)
- [H3 Handlers](https://h3.unjs.io/guide)

### Route Structure

```
routes/
├── api/
│   ├── hello.ts        → GET/POST /api/hello
│   ├── users/
│   │   ├── index.ts    → GET/POST /api/users
│   │   └── [id].ts     → GET/POST /api/users/:id
│   └── auth/
│       ├── login.ts    → POST /api/auth/login
│       └── logout.ts   → POST /api/auth/logout
└── health.ts           → GET /health
```

### Creating API Handlers

Use `defineEventHandler` from H3:

```typescript
// routes/api/hello.ts
export default defineEventHandler((event) => {
  return {
    message: "Hello from API!",
    timestamp: new Date().toISOString(),
  };
});
```

### HTTP Methods

Handle different HTTP methods:

```typescript
// routes/api/users/index.ts
export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    return { users: [] };
  }

  if (method === "POST") {
    const body = await readBody(event);
    return { created: true, user: body };
  }

  return { error: "Method not allowed" };
});
```

Or use method-specific handlers:

```typescript
// routes/api/users/index.get.ts
export default defineEventHandler(() => {
  return { users: [] };
});

// routes/api/users/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return { created: true, user: body };
});
```

### Dynamic Routes

Use square brackets for dynamic parameters:

```typescript
// routes/api/users/[id].ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");

  return {
    user: {
      id,
      name: "John Doe",
    },
  };
});
```

### Request Handling

Common H3 utilities:

```typescript
import {
  readBody, // Parse request body
  getQuery, // Get query parameters
  getRouterParam, // Get route parameters
  getCookie, // Get cookies
  setCookie, // Set cookies
  getHeader, // Get headers
  setResponseStatus, // Set response status
  sendRedirect, // Send redirect
} from "h3";

export default defineEventHandler(async (event) => {
  // Get query params: /api/search?q=test
  const query = getQuery(event);
  console.log(query.q); // 'test'

  // Get route params: /api/users/123
  const id = getRouterParam(event, "id");

  // Parse JSON body
  const body = await readBody(event);

  // Get headers
  const auth = getHeader(event, "authorization");

  // Set response status
  setResponseStatus(event, 201);

  return { success: true };
});
```

### Error Handling

```typescript
export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  // Your logic here
  return { id };
});
```

### Middleware

Create middleware in `routes/` with `.ts` extension:

```typescript
// routes/middleware/auth.ts
export default defineEventHandler((event) => {
  const token = getHeader(event, "authorization");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Add user to context
  event.context.user = { name: "John" };
});
```

---

## Vite Plugins Guide

### vite-plugin-svgr

Import SVGs as React components by adding `?react` query:

```tsx
import Logo from "@/assets/react.svg?react";

export const App = () => {
  return (
    <div>
      <Logo />
    </div>
  );
};
```

### unplugin-fonts

Configure Google Fonts in `configs/fonts.config.ts`:

```typescript
export const fonts = [
  {
    name: "Inter",
    styles: "wght@300;400;500;600;700",
  },
  {
    name: "Space Grotesk",
    styles: "wght@300;400;500;700",
  },
];
```

[Documentation](https://github.com/cssninjaStudio/unplugin-fonts)

### unplugin-auto-import

Automatically imports React hooks and React Router hooks. No need to import `useState`, `useEffect`, `useNavigate`, etc.

```tsx
// No imports needed!
export function Counter() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>
    </div>
  );
}
```

To enable auto-import for shadcn/ui components, uncomment in `vite.config.ts`:

```typescript
AutoImport({
  imports: ["react", "react-router"],
  dirs: ["./src/components/ui"], // Uncomment this line
});
```

---

## Project Structure

```
.
├── src/
│   ├── assets/          # Static assets (images, SVGs)
│   ├── components/      # React components
│   │   └── ui/         # shadcn/ui components
│   ├── pages/          # Frontend routes (file-based)
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── constants/      # App constants
│   ├── data/           # Static data
│   ├── store/          # State management
│   └── main.tsx        # App entry point
├── routes/             # Backend API routes (file-based)
│   └── api/           # API endpoints
├── configs/            # Configuration files
│   └── fonts.config.ts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript config
└── package.json
```

---

## Path Aliases

Use `@/` to import from `src/`:

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { User } from "@/types";
```

---

## Docker Support

```bash
# Build image
docker build -t react-ts-starter .

# Run container
docker run -p 5000:5000 react-ts-starter
```

---

## Notes

- This is a **client-side rendered (CSR)** application
- For SEO or Server-Side Rendering, consider Next.js, Remix, or Astro
- The Nitro backend is perfect for APIs, serverless functions, and edge deployments

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License

MIT

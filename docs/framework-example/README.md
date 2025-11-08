# ReactFlow Framework - Usage Guide

Complete guide to using ReactFlow as your full-stack React framework.

---

## 🚀 Quick Start

```bash
# Create a new project
npx create-reactflow my-app

# Navigate to project
cd my-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Your app is now running at `http://localhost:3000`

---

## 📁 Project Structure

```
my-app/
├── app/
│   ├── routes/              # Frontend routes (file-based)
│   │   ├── index.tsx        # Home page (/)
│   │   ├── about.tsx        # About page (/about)
│   │   └── users/
│   │       ├── index.tsx    # Users list (/users)
│   │       └── [id].tsx     # User detail (/users/:id)
│   │
│   ├── server/              # Backend API (file-based)
│   │   ├── users.ts         # Server functions
│   │   └── auth.ts          # Authentication
│   │
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── entry-client.tsx     # Client entry point
│   └── entry-server.tsx     # Server entry point
│
├── public/                  # Static assets
│   ├── favicon.ico
│   └── images/
│
├── reactflow.config.ts      # Framework configuration
├── package.json
└── tsconfig.json
```

---

## 📖 Documentation Index

### Getting Started

- **[Installation](./01-installation.md)** - Setup and installation
- **[Configuration](./02-configuration.md)** - Framework configuration
- **[Project Structure](./03-project-structure.md)** - Understanding the structure

### Core Features

- **[Routing](./04-routing.md)** - File-based routing system
- **[Server Functions](./05-server-functions.md)** - Type-safe backend calls
- **[Data Fetching](./06-data-fetching.md)** - Loading and managing data
- **[Forms & Mutations](./07-forms-mutations.md)** - Handling user input

### Components & UI

- **[Components](./08-components.md)** - Building UI components
- **[Layouts](./09-layouts.md)** - Shared layouts
- **[Styling](./10-styling.md)** - CSS and styling options
- **[Assets](./11-assets.md)** - Images, fonts, and static files

### Advanced

- **[Authentication](./12-authentication.md)** - User authentication
- **[Middleware](./13-middleware.md)** - Request/response handling
- **[Error Handling](./14-error-handling.md)** - Error boundaries
- **[SEO & Meta Tags](./15-seo-meta.md)** - Search engine optimization
- **[Environment Variables](./16-environment-variables.md)** - Configuration
- **[Testing](./17-testing.md)** - Unit and integration tests

### Deployment

- **[Building](./18-building.md)** - Production builds
- **[Deployment](./19-deployment.md)** - Deploy to production
- **[Performance](./20-performance.md)** - Optimization tips

---

## 🎯 Common Use Cases

### Building a Blog

```typescript
// app/routes/blog/[slug].tsx
import { useServerQuery } from '@reactflow/server';
import { getPostBySlug } from '../../server/blog';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading } = useServerQuery(getPostBySlug, [slug]);

  if (loading) return <div>Loading...</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Creating an API

```typescript
// app/server/api.ts
import { createServerFn } from "@reactflow/server";

export const getUsers = createServerFn(async (ctx) => {
  const users = await db.users.findAll();
  return users;
});

export const createUser = createServerFn(async (ctx, data) => {
  const user = await db.users.create(data);
  return user;
});
```

### Building Forms

```typescript
// app/routes/contact.tsx
import { useServerFn } from '@reactflow/server';
import { sendContactEmail } from '../server/email';

export default function Contact() {
  const { execute: send, loading } = useServerFn(sendContactEmail);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await send(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button disabled={loading}>Send</button>
    </form>
  );
}
```

---

## 🛠️ CLI Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev --port 4000  # Custom port

# Building
pnpm build            # Build for production
pnpm build --analyze  # Analyze bundle size

# Production
pnpm start            # Start production server
pnpm start --port 80  # Custom port

# Utilities
pnpm lint             # Lint code
pnpm format           # Format code
pnpm type-check       # Check TypeScript
```

---

## 🔧 Configuration

**reactflow.config.ts:**

```typescript
import { defineConfig } from "@reactflow/core";

export default defineConfig({
  // Server
  port: 3000,
  ssr: true,

  // Directories
  routesDir: "app/routes",
  serverDir: "app/server",
  publicDir: "public",

  // Vite configuration
  vite: {
    plugins: [],
    resolve: {
      alias: {
        "@": "./app",
      },
    },
  },

  // Nitro configuration
  nitro: {
    preset: "node-server",
  },
});
```

---

## 📚 Learn More

- [Tutorial Series](../tutorial/README.md) - Build the framework from scratch
- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](./examples/) - Real-world examples
- [FAQ](./faq.md) - Frequently asked questions

---

## 🤝 Community

- [GitHub](https://github.com/yourusername/reactflow)
- [Discord](https://discord.gg/reactflow)
- [Twitter](https://twitter.com/reactflow)

---

## 📝 License

MIT

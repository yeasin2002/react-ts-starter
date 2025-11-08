# Quick Start Guide

Get your ReactFlow app running in 5 minutes.

---

## Step 1: Create Project (1 min)

```bash
pnpm create reactflow my-app
cd my-app
```

---

## Step 2: Install Dependencies (1 min)

```bash
pnpm install
```

---

## Step 3: Start Development Server (30 sec)

```bash
pnpm dev
```

Open `http://localhost:3000` - you should see the welcome page!

---

## Step 4: Create Your First Route (1 min)

**app/routes/hello.tsx:**

```typescript
export default function Hello() {
  return (
    <div>
      <h1>Hello, ReactFlow!</h1>
      <p>This is my first route.</p>
    </div>
  );
}
```

Visit `http://localhost:3000/hello`

---

## Step 5: Create Your First Server Function (1 min)

**app/server/hello.ts:**

```typescript
import { createServerFn } from "@reactflow/server";

export const getMessage = createServerFn(async (ctx) => {
  return { message: "Hello from the server!" };
});
```

**app/routes/hello.tsx:**

```typescript
import { useServerQuery } from '@reactflow/server';
import { getMessage } from '../server/hello';

export default function Hello() {
  const { data, loading } = useServerQuery(getMessage, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Hello, ReactFlow!</h1>
      <p>{data?.message}</p>
    </div>
  );
}
```

---

## Step 6: Build for Production (30 sec)

```bash
pnpm build
```

---

## Step 7: Start Production Server (30 sec)

```bash
pnpm start
```

---

## 🎉 Congratulations!

You've created your first ReactFlow app!

---

## What's Next?

### Learn the Basics

- [Routing](./04-routing.md) - Create more routes
- [Server Functions](./05-server-functions.md) - Backend logic
- [Components](./08-components.md) - Build UI components

### Build Something Real

- [Example: Blog](./examples/blog.md)
- [Example: Todo App](./examples/todo-app.md)
- [Example: E-commerce](./examples/ecommerce.md)

### Deploy Your App

- [Deployment Guide](./19-deployment.md)
- [Docker Setup](./19-deployment.md#docker)
- [VPS Deployment](./19-deployment.md#vps)

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev --port 4000  # Custom port

# Building
pnpm build            # Build for production

# Production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Lint code
pnpm format           # Format code
pnpm type-check       # Check types
```

---

## Project Structure

```
my-app/
├── app/
│   ├── routes/          # Your pages
│   │   ├── index.tsx    # Home page
│   │   └── hello.tsx    # Hello page
│   ├── server/          # Backend functions
│   │   └── hello.ts
│   └── components/      # React components
│
├── public/              # Static files
│   └── favicon.ico
│
├── reactflow.config.ts  # Configuration
└── package.json
```

---

## Getting Help

- [Documentation](./README.md)
- [GitHub Issues](https://github.com/yourusername/reactflow/issues)
- [Discord Community](https://discord.gg/reactflow)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactflow)

---

## Tips

### Hot Reload

Changes to files in `app/` automatically reload the browser.

### TypeScript

Full TypeScript support out of the box. Types are automatically inferred.

### File-Based Routing

Create a file in `app/routes/` and it becomes a route automatically.

### Server Functions

Write backend code that's called from the frontend with full type safety.

---

Happy coding! 🚀

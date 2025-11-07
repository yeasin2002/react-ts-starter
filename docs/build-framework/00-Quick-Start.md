# Quick Start Guide

Get started building your React framework in 30 minutes.

---

## 🎯 What We're Building

A full-stack React framework called **ReactFlow** with:

- ✅ Server-Side Rendering (SSR)
- ✅ File-based routing
- ✅ Client/Server components
- ✅ Type-safe server functions
- ✅ Universal deployment

---

## 📋 Prerequisites

```bash
# Check versions
node --version  # Should be >= 20.x
npm --version   # Should be >= 10.x
```

---

## 🚀 30-Minute MVP

### Step 1: Create Project (2 min)

```bash
mkdir reactflow-framework
cd reactflow-framework
npm init -y
```

### Step 2: Install Dependencies (3 min)

```bash
# Core
npm install vinxi nitro vite react react-dom react-router-dom h3

# Build tools
npm install -D @vitejs/plugin-react typescript @types/react @types/react-dom @types/node
```

### Step 3: Create Structure (2 min)

```bash
mkdir -p app/routes app/components
touch app.config.ts app/entry-client.tsx app/entry-server.tsx
touch app/routes/index.tsx
```

### Step 4: Configure Vinxi (5 min)

**app.config.ts:**

```typescript
import { createApp } from "vinxi";
import react from "@vitejs/plugin-react";

export default createApp({
  routers: [
    {
      name: "client",
      type: "client",
      handler: "./app/entry-client.tsx",
      target: "browser",
      plugins: () => [react()],
    },
    {
      name: "ssr",
      type: "http",
      handler: "./app/entry-server.tsx",
      target: "server",
      plugins: () => [react()],
    },
  ],
});
```

### Step 5: Create Entries (8 min)

**app/entry-client.tsx:**

```typescript
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Home from './routes/index';

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
);
```

**app/entry-server.tsx:**

```typescript
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import { eventHandler } from 'vinxi/http';
import Home from './routes/index';

export default eventHandler((event) => {
  const url = event.node.req.url || '/';

  const html = renderToString(
    <StaticRouter location={url}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </StaticRouter>
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ReactFlow</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script type="module" src="/@id/__x00__virtual:vinxi/client"></script>
      </body>
    </html>
  `;
});
```

### Step 6: Create First Route (3 min)

**app/routes/index.tsx:**

```typescript
import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Welcome to ReactFlow!</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

### Step 7: Add Scripts (2 min)

**package.json:**

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start"
  }
}
```

### Step 8: Run! (5 min)

```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## ✅ What You Have Now

- ✅ SSR working
- ✅ Client hydration
- ✅ Hot reload
- ✅ TypeScript support
- ✅ React 19

---

## 🎓 Next Steps

### Immediate (Today)

1. Add more routes
2. Create components
3. Style with CSS

### This Week

1. File-based routing
2. Server functions
3. Data loading

### This Month

1. Image optimization
2. Streaming
3. Deployment

---

## 📚 Full Documentation

Ready to go deeper? Read the complete guides:

1. **[README.md](./README.md)** - Overview and roadmap
2. **[01-Architecture.md](./01-Architecture.md)** - System design
3. **[02-Tech-Stack.md](./02-Tech-Stack.md)** - All packages explained
4. **[03-Project-Setup.md](./03-Project-Setup.md)** - Detailed setup
5. **[04-Build-System.md](./04-Build-System.md)** - Vinxi deep dive

---

## 🐛 Troubleshooting

### Error: Cannot find module 'vinxi'

```bash
npm install vinxi
```

### Error: React is not defined

Add to **app/entry-client.tsx** and **app/entry-server.tsx**:

```typescript
import React from "react";
```

### Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### Hydration mismatch

Make sure server and client render the same:

```typescript
// ❌ Bad - different on server/client
const now = new Date();

// ✅ Good - same on both
const [now, setNow] = useState(null);
useEffect(() => setNow(new Date()), []);
```

---

## 💡 Pro Tips

1. **Use TypeScript** - Catch errors early
2. **Start Simple** - Add features incrementally
3. **Test Often** - Run `npm run dev` frequently
4. **Read Docs** - Vinxi and Nitro docs are great
5. **Check Examples** - TanStack Start source code

---

## 🎯 Success Checklist

- [ ] Project created
- [ ] Dependencies installed
- [ ] Vinxi configured
- [ ] Entries created
- [ ] First route working
- [ ] Dev server running
- [ ] SSR confirmed (view source)
- [ ] Hydration working (button clicks)

---

## 🚀 You're Ready!

You now have a working SSR React framework!

Continue with the full documentation to add:

- File-based routing
- Server functions
- Image optimization
- Streaming
- Deployment

**Happy building! 🎉**

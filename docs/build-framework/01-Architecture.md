# Framework Architecture

A deep dive into the architecture of our full-stack React framework (ReactFlow).

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Build System Architecture](#build-system-architecture)
3. [Runtime Architecture](#runtime-architecture)
4. [Request Flow](#request-flow)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)

---

## High-Level Architecture

### The Three Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                    ReactFlow Framework                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │  Vinxi  │         │  Vite   │        │  Nitro  │
   │         │         │         │        │         │
   │ Build   │────────▶│ Bundle  │───────▶│ Server  │
   │ Orchestr│         │ Assets  │        │ Runtime │
   └─────────┘         └─────────┘        └─────────┘
```

### 1. Vinxi - The Orchestrator

**Role**: Manages multiple builds and coordinates the entire build process

**Responsibilities**:

- Coordinate client and server builds
- Manage build manifests
- Handle asset references
- Configure Vite instances
- Generate route manifests

**Why Vinxi?**

- Used by TanStack Start
- Designed for multi-build scenarios
- Excellent Vite integration
- Handles complex build orchestration

### 2. Vite - The Bundler

**Role**: Fast development and optimized production builds

**Responsibilities**:

- Bundle client code
- Bundle server code (SSR)
- Hot Module Replacement (HMR)
- Asset processing
- Code splitting

**Why Vite?**

- Lightning-fast HMR
- Native ESM support
- Excellent plugin ecosystem
- Used by modern frameworks

### 3. Nitro - The Server

**Role**: Universal server runtime

**Responsibilities**:

- Handle HTTP requests
- Server-side rendering
- API routes
- Middleware
- Universal deployment

**Why Nitro?**

- Powers Nuxt 3
- Deploy anywhere (Node, Edge, Serverless)
- Built-in optimizations
- H3 HTTP framework

---

## Build System Architecture

### Dual Build System

```
┌─────────────────────────────────────────────────────────────┐
│                      Source Code                             │
│                                                              │
│  app/                                                        │
│  ├── routes/          (File-based routing)                  │
│  ├── components/      (React components)                    │
│  ├── server/          (Server-only code)                    │
│  └── lib/             (Shared utilities)                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ Vinxi Orchestration
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼─────┐                  ┌────▼─────┐
   │  Client  │                  │  Server  │
   │  Build   │                  │  Build   │
   └────┬─────┘                  └────┬─────┘
        │                             │
        │ Vite (browser target)       │ Vite (node target)
        │                             │
   ┌────▼──────────────┐         ┌────▼──────────────┐
   │ dist/client/      │         │ dist/server/      │
   │ ├── assets/       │         │ ├── entry.js      │
   │ ├── chunks/       │         │ ├── routes.js     │
   │ └── manifest.json │         │ └── manifest.json │
   └───────────────────┘         └───────────────────┘
                                          │
                                          │ Nitro Build
                                          │
                                   ┌──────▼──────┐
                                   │ .output/    │
                                   │ └── server/ │
                                   └─────────────┘
```

### Build Phases

**Phase 1: Analysis**

```typescript
// Vinxi analyzes the project
{
  routes: scanRoutes('app/routes'),
  serverFunctions: scanServerFunctions('app/server'),
  components: scanComponents('app/components'),
  assets: scanAssets('public')
}
```

**Phase 2: Client Build**

```typescript
// Vite builds for browser
{
  target: 'browser',
  entry: 'app/entry-client.tsx',
  output: 'dist/client',
  plugins: [
    react(),
    clientManifest(),
  ]
}
```

**Phase 3: Server Build**

```typescript
// Vite builds for Node.js
{
  target: 'node',
  entry: 'app/entry-server.tsx',
  output: 'dist/server',
  ssr: true,
  plugins: [
    react(),
    serverManifest(),
  ]
}
```

**Phase 4: Nitro Build**

```typescript
// Nitro creates universal server
{
  preset: 'node-server', // or 'cloudflare', 'vercel', etc.
  handlers: [
    { route: '/**', handler: './dist/server/entry.js' }
  ],
  output: '.output'
}
```

---

## Runtime Architecture

### Server Runtime

```
┌─────────────────────────────────────────────────────────────┐
│                    Incoming Request                          │
│                    GET /users/123                            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                  ┌────▼────┐
                  │  Nitro  │
                  │ Handler │
                  └────┬────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │Middleware│    │  Route  │   │   API   │
   │         │    │ Matcher │   │  Route  │
   └────┬────┘    └────┬────┘   └────┬────┘
        │              │              │
        │         ┌────▼────┐         │
        │         │  SSR    │         │
        │         │ Handler │         │
        │         └────┬────┘         │
        │              │              │
        │    ┌─────────┴─────────┐   │
        │    │                   │   │
   ┌────▼────▼────┐         ┌────▼───▼────┐
   │ Server       │         │   JSON      │
   │ Functions    │         │  Response   │
   └────┬─────────┘         └─────────────┘
        │
   ┌────▼──────────────────┐
   │ React SSR             │
   │ renderToPipeableStream│
   └────┬──────────────────┘
        │
   ┌────▼──────────────────┐
   │ HTML Response         │
   │ + Client Scripts      │
   └───────────────────────┘
```

### Client Runtime

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Receives HTML                     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                  ┌────▼────────┐
                  │   Parse     │
                  │    HTML     │
                  └────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │  Load   │    │  Load   │   │  Load   │
   │  CSS    │    │   JS    │   │ Images  │
   └────┬────┘    └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                  ┌────▼────────┐
                  │   React     │
                  │  hydrateRoot│
                  └────┬────────┘
                       │
                  ┌────▼────────┐
                  │ Interactive │
                  │     App     │
                  └─────────────┘
```

---

## Request Flow

### SSR Request Flow (Detailed)

```
1. Browser Request
   │
   ├─▶ GET /users/123
   │
2. Nitro Server
   │
   ├─▶ Match Route
   │   └─▶ Found: app/routes/users/[id].tsx
   │
3. Execute Middleware
   │
   ├─▶ Auth Middleware
   ├─▶ Logging Middleware
   └─▶ Context Setup
   │
4. Load Route Data
   │
   ├─▶ Execute loader()
   │   └─▶ Fetch user from database
   │
5. Render React
   │
   ├─▶ Create React element tree
   ├─▶ renderToPipeableStream()
   │   ├─▶ Render shell (header, nav)
   │   ├─▶ Stream Suspense boundaries
   │   └─▶ Render footer
   │
6. Generate HTML
   │
   ├─▶ Inject client scripts
   ├─▶ Inject CSS links
   ├─▶ Inject preload hints
   └─▶ Serialize data for hydration
   │
7. Send Response
   │
   └─▶ Stream HTML to browser
       └─▶ Status: 200 OK
           Content-Type: text/html
```

### Client Navigation Flow

```
1. User Clicks Link
   │
   ├─▶ <Link to="/about">
   │
2. React Router Intercepts
   │
   ├─▶ Prevent default navigation
   ├─▶ Update URL (pushState)
   │
3. Load Route Data
   │
   ├─▶ Call server function
   │   └─▶ POST /__server-fn
   │       └─▶ Execute loader on server
   │
4. Update UI
   │
   ├─▶ Show loading state
   ├─▶ Render new route
   └─▶ Update document title
```

---

## Component Architecture

### Component Types

```
┌─────────────────────────────────────────────────────────────┐
│                      Components                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Server Component │         │ Client Component │         │
│  │                  │         │                  │         │
│  │ 'use server'     │         │ 'use client'     │         │
│  │                  │         │                  │         │
│  │ - Runs on server │         │ - Runs in browser│         │
│  │ - No hydration   │         │ - Interactive    │         │
│  │ - Direct DB      │         │ - Event handlers │         │
│  │ - Async          │         │ - State/Effects  │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │         Shared Component                     │          │
│  │                                              │          │
│  │ No directive                                 │          │
│  │                                              │          │
│  │ - Runs on both server and client            │          │
│  │ - Must be isomorphic                         │          │
│  │ - No browser-only APIs                       │          │
│  │ - No server-only APIs                        │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

```typescript
// Server Component (default)
// app/components/UserList.tsx
export default async function UserList() {
  // This runs ONLY on server
  const users = await db.users.findMany();

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// Client Component (explicit)
// app/components/Counter.tsx
'use client';

export default function Counter() {
  // This runs in browser
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Shared Component (isomorphic)
// app/components/UserCard.tsx
export default function UserCard({ user }) {
  // This runs on both server and client
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## Data Flow

### Server to Client Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Server (SSR)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Execute Loader                                          │
│     └─▶ const data = await fetchUsers()                     │
│                                                             │
│  2. Render with Data                                        │
│     └─▶ <UserList users={data} />                           │
│                                                             │
│  3. Serialize Data                                          │
│     └─▶ window.__INITIAL_DATA__ = { users: [...] }         │
│                                                             │
│  4. Send HTML                                               │
│     └─▶ <html>                                              │
│         <body>                                              │
│           <div id="root">                                   │
│             <div>User 1</div>                               │
│             <div>User 2</div>                               │
│           </div>                                            │
│           <script>                                          │
│             window.__INITIAL_DATA__ = {...}                 │
│           </script>                                         │
│         </body>                                             │
│         </html>                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Response
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Parse HTML                                              │
│     └─▶ See rendered content immediately                    │
│                                                             │
│  2. Load JavaScript                                         │
│     └─▶ Download and execute bundle                         │
│                                                             │
│  3. Restore Data                                            │
│     └─▶ const data = window.__INITIAL_DATA__                │
│                                                             │
│  4. Hydrate                                                 │
│     └─▶ hydrateRoot(root, <App data={data} />)             │
│                                                             │
│  5. Interactive                                             │
│     └─▶ Event handlers attached                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Client-Side Navigation Data Flow

```
1. User Action
   └─▶ Click <Link to="/about">

2. Router Intercepts
   └─▶ Prevent page reload

3. Call Server Function
   └─▶ POST /__server-fn
       Body: { fn: 'getAboutData', args: [] }

4. Server Executes
   └─▶ const data = await getAboutData()
   └─▶ return JSON.stringify(data)

5. Client Receives
   └─▶ const data = await response.json()

6. Update UI
   └─▶ <About data={data} />
```

---

## File System Architecture

### Project Structure

```
reactflow/
├── packages/
│   ├── core/              # Core framework code
│   │   ├── src/
│   │   │   ├── build/     # Build system
│   │   │   ├── runtime/   # Runtime code
│   │   │   ├── router/    # Routing system
│   │   │   └── server/    # Server utilities
│   │   └── package.json
│   │
│   ├── cli/               # CLI tool
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   └── templates/
│   │   └── package.json
│   │
│   └── plugins/           # Optional plugins
│       ├── image/         # Image optimization
│       ├── auth/          # Authentication
│       └── db/            # Database integration
│
├── examples/              # Example applications
│   ├── basic/
│   ├── with-auth/
│   └── e-commerce/
│
└── docs/                  # Documentation
    └── build-framework/   # This documentation
```

### User Project Structure

```
my-app/
├── app/
│   ├── routes/            # File-based routes
│   │   ├── index.tsx      # /
│   │   ├── about.tsx      # /about
│   │   └── users/
│   │       ├── index.tsx  # /users
│   │       └── [id].tsx   # /users/:id
│   │
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   └── layout/       # Layout components
│   │
│   ├── server/           # Server-only code
│   │   ├── db.ts         # Database
│   │   └── auth.ts       # Authentication
│   │
│   ├── lib/              # Shared utilities
│   │   └── utils.ts
│   │
│   ├── entry-client.tsx  # Client entry
│   └── entry-server.tsx  # Server entry
│
├── public/               # Static assets
│   ├── favicon.ico
│   └── images/
│
├── reactflow.config.ts   # Framework config
└── package.json
```

---

## Design Decisions

### 1. Why Vinxi Over Custom Build System?

**Pros:**

- ✅ Battle-tested (TanStack Start uses it)
- ✅ Handles complex multi-build scenarios
- ✅ Good Vite integration
- ✅ Active development

**Cons:**

- ⚠️ Less control over build process
- ⚠️ Learning curve

**Decision:** Use Vinxi for faster development

### 2. Why Nitro Over Express/Fastify?

**Pros:**

- ✅ Universal deployment (Node, Edge, Serverless)
- ✅ Built-in optimizations
- ✅ Powers Nuxt (proven at scale)
- ✅ H3 is modern and fast

**Cons:**

- ⚠️ Smaller ecosystem than Express

**Decision:** Use Nitro for universal deployment

### 3. File-Based Routing vs Manual Routes?

**Pros:**

- ✅ Better DX (no manual route config)
- ✅ Automatic code splitting
- ✅ Clear project structure

**Cons:**

- ⚠️ Less flexible
- ⚠️ Magic can be confusing

**Decision:** File-based routing (like Next.js/Nuxt)

---

## Next Steps

Now that you understand the architecture, proceed to:

**[02-Tech-Stack.md](./02-Tech-Stack.md)** - Detailed breakdown of all tools and packages

---

## References

- [Vinxi Architecture](https://vinxi.vercel.app/)
- [Nitro Architecture](https://nitro.unjs.io/guide)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [TanStack Start Source](https://github.com/TanStack/router)

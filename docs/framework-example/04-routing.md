# Routing

ReactFlow uses file-based routing for both frontend and backend routes.

---

## Frontend Routing

### Basic Routes

Create files in `app/routes/` to define routes:

```
app/routes/
├── index.tsx          → /
├── about.tsx          → /about
├── contact.tsx        → /contact
└── pricing.tsx        → /pricing
```

**app/routes/about.tsx:**

```typescript
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our about page!</p>
    </div>
  );
}
```

---

### Nested Routes

Create folders for nested routes:

```
app/routes/
├── blog/
│   ├── index.tsx      → /blog
│   ├── new.tsx        → /blog/new
│   └── [slug].tsx     → /blog/:slug
```

**app/routes/blog/index.tsx:**

```typescript
export default function BlogIndex() {
  return (
    <div>
      <h1>Blog Posts</h1>
      {/* List of posts */}
    </div>
  );
}
```

---

### Dynamic Routes

Use square brackets for dynamic segments:

**app/routes/users/[id].tsx:**

```typescript
import { useParams } from 'react-router-dom';

export default function UserProfile() {
  const { id } = useParams();

  return (
    <div>
      <h1>User Profile: {id}</h1>
    </div>
  );
}
```

**Multiple dynamic segments:**

```
app/routes/
└── posts/
    └── [category]/
        └── [slug].tsx  → /posts/:category/:slug
```

```typescript
export default function Post() {
  const { category, slug } = useParams();

  return (
    <div>
      <h1>Category: {category}</h1>
      <h2>Post: {slug}</h2>
    </div>
  );
}
```

---

### Catch-All Routes

Use `[...param]` for catch-all routes:

**app/routes/docs/[...slug].tsx:**

```typescript
import { useParams } from 'react-router-dom';

export default function Docs() {
  const { slug } = useParams();
  const path = slug || '';

  return (
    <div>
      <h1>Documentation</h1>
      <p>Path: {path}</p>
    </div>
  );
}
```

Matches:

- `/docs` → slug = undefined
- `/docs/getting-started` → slug = "getting-started"
- `/docs/api/reference` → slug = "api/reference"

---

### Optional Segments

Use double brackets for optional segments:

**app/routes/shop/[[category]].tsx:**

```typescript
export default function Shop() {
  const { category } = useParams();

  return (
    <div>
      <h1>Shop</h1>
      {category && <p>Category: {category}</p>}
    </div>
  );
}
```

Matches:

- `/shop` → category = undefined
- `/shop/electronics` → category = "electronics"

---

### Layouts

Create `_layout.tsx` for shared layouts:

**app/routes/\_layout.tsx:**

```typescript
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

**Nested layouts:**

```
app/routes/
├── _layout.tsx           # Root layout
└── dashboard/
    ├── _layout.tsx       # Dashboard layout
    ├── index.tsx
    └── settings.tsx
```

---

### Route Groups

Use parentheses for route groups (doesn't affect URL):

```
app/routes/
├── (marketing)/
│   ├── index.tsx         → /
│   ├── about.tsx         → /about
│   └── pricing.tsx       → /pricing
└── (app)/
    ├── dashboard.tsx     → /dashboard
    └── settings.tsx      → /settings
```

---

## Navigation

### Link Component

```typescript
import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/blog">Blog</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Login logic
    navigate('/dashboard');
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Navigation with State

```typescript
navigate("/profile", {
  state: { from: "/login" },
  replace: true,
});

// Access state in target route
const location = useLocation();
console.log(location.state.from);
```

---

## Route Metadata

### Page Titles

```typescript
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - My App</title>
        <meta name="description" content="Learn more about us" />
      </Helmet>

      <div>
        <h1>About Us</h1>
      </div>
    </>
  );
}
```

### Export Metadata

```typescript
export const meta = {
  title: 'About Us',
  description: 'Learn more about us',
};

export default function About() {
  return <div>About content</div>;
}
```

---

## Route Loading

### Data Loading

```typescript
import { useServerQuery } from '@reactflow/server';
import { getUser } from '../../server/users';

export default function UserProfile() {
  const { id } = useParams();
  const { data: user, loading, error } = useServerQuery(getUser, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Suspense Boundaries

```typescript
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>
      <Suspense fallback={<div>Loading chart...</div>}>
        <Chart />
      </Suspense>
    </div>
  );
}
```

---

## Protected Routes

### Auth Guard

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
```

**Usage:**

```typescript
// app/routes/dashboard.tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Dashboard content</div>
    </ProtectedRoute>
  );
}
```

---

## 404 Pages

**app/routes/[...all].tsx:**

```typescript
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}
```

---

## Route Prefetching

### Prefetch on Hover

```typescript
import { Link } from '@reactflow/link';

export function Navigation() {
  return (
    <nav>
      <Link to="/about" prefetch="hover">
        About
      </Link>
      <Link to="/blog" prefetch="visible">
        Blog
      </Link>
    </nav>
  );
}
```

### Manual Prefetch

```typescript
import { prefetch } from '@reactflow/router';

export function ProductCard({ product }) {
  const handleMouseEnter = () => {
    prefetch(`/products/${product.id}`);
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      <h3>{product.name}</h3>
    </div>
  );
}
```

---

## Backend Routing

### API Routes

Create files in `app/server/` for API endpoints:

```
app/server/
├── users.ts           # User-related functions
├── posts.ts           # Post-related functions
└── auth.ts            # Authentication
```

**app/server/users.ts:**

```typescript
import { createServerFn } from "@reactflow/server";

export const getUsers = createServerFn(async (ctx) => {
  const users = await db.users.findAll();
  return users;
});

export const getUserById = createServerFn(async (ctx, id: number) => {
  const user = await db.users.findById(id);
  return user;
});
```

---

## Route Configuration

### Custom Route Matching

**reactflow.config.ts:**

```typescript
export default defineConfig({
  router: {
    // Case sensitive routes
    caseSensitive: false,

    // Trailing slash behavior
    trailingSlash: "never", // 'always' | 'never' | 'preserve'

    // Base path
    basePath: "/app",
  },
});
```

---

## Next Steps

- [Server Functions](./05-server-functions.md) - Backend data fetching
- [Data Fetching](./06-data-fetching.md) - Loading data
- [Layouts](./09-layouts.md) - Shared layouts

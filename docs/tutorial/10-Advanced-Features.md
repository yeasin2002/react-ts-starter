# Tutorial 10: Advanced Features

Implement advanced features for your ReactFlow framework.

---

## 🎯 What We're Building

Advanced features:

- Middleware system
- Authentication
- Data caching
- Streaming SSR
- Error boundaries
- Meta tags & SEO

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01-09
- ✅ Framework fully functional
- ✅ Deployed to production

---

## 🚀 Step 1: Middleware System

**packages/core/src/middleware/types.ts:**

```typescript
export interface MiddlewareContext {
  request: Request;
  response: Response;
  params: Record<string, string>;
  locals: Record<string, any>;
}

export type MiddlewareHandler = (
  ctx: MiddlewareContext,
  next: () => Promise<void>,
) => Promise<void>;

export interface Middleware {
  name: string;
  handler: MiddlewareHandler;
}
```

**packages/core/src/middleware/compose.ts:**

```typescript
import type { Middleware, MiddlewareContext } from "./types";

export function composeMiddleware(middlewares: Middleware[]) {
  return async (ctx: MiddlewareContext) => {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }

      index = i;

      if (i >= middlewares.length) {
        return;
      }

      const middleware = middlewares[i];
      await middleware.handler(ctx, () => dispatch(i + 1));
    }

    await dispatch(0);
  };
}
```

**Example middleware:**

```typescript
import type { Middleware } from "@reactflow/core/middleware";

export const authMiddleware: Middleware = {
  name: "auth",
  handler: async (ctx, next) => {
    const token = ctx.request.headers.get("Authorization");

    if (!token) {
      throw new Error("Unauthorized");
    }

    // Verify token and add user to context
    ctx.locals.user = { id: 1, name: "John" };

    await next();
  },
};

export const loggingMiddleware: Middleware = {
  name: "logging",
  handler: async (ctx, next) => {
    const start = Date.now();

    await next();

    const duration = Date.now() - start;
    console.log(`${ctx.request.method} ${ctx.request.url} - ${duration}ms`);
  },
};
```

---

## 🚀 Step 2: Authentication System

**app/server/auth.ts:**

```typescript
import { createServerFn } from "@reactflow/server";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface User {
  id: number;
  email: string;
  name: string;
}

export const login = createServerFn(
  async (ctx, credentials: { email: string; password: string }) => {
    // Validate credentials (simplified)
    if (credentials.email === "user@example.com" && credentials.password === "password") {
      const user: User = {
        id: 1,
        email: credentials.email,
        name: "John Doe",
      };

      const token = sign(user, JWT_SECRET, { expiresIn: "7d" });

      return { user, token };
    }

    throw new Error("Invalid credentials");
  },
);

export const getCurrentUser = createServerFn(async (ctx) => {
  const token = ctx.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    const user = verify(token, JWT_SECRET) as User;
    return user;
  } catch {
    return null;
  }
});

export const logout = createServerFn(async (ctx) => {
  // Clear session/token
  return { success: true };
});
```

**Auth context provider:**

```typescript
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, type User } from "../server/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser()
        .then(setUser)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    getCurrentUser().then(setUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

---

## 🚀 Step 3: Data Caching

**packages/server/src/cache/index.ts:**

```typescript
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
}

const cache = new Map<string, { data: any; expires: number }>();

export function withCache<T>(fn: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
  const key = options.key || fn.toString();
  const ttl = (options.ttl || 60) * 1000; // Convert to ms

  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.data);
  }

  return fn().then((data) => {
    cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
    return data;
  });
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
```

**Usage:**

```typescript
import { createServerFn } from "@reactflow/server";
import { withCache } from "@reactflow/server/cache";

export const getExpensiveData = createServerFn(async (ctx) => {
  return withCache(
    async () => {
      // Expensive operation
      const data = await fetchFromDatabase();
      return data;
    },
    { ttl: 300, key: "expensive-data" },
  );
});
```

---

## 🚀 Step 4: Streaming SSR

**packages/core/src/runtime/streaming.ts:**

```typescript
import { renderToPipeableStream } from "react-dom/server";

export function renderToStream(app: React.ReactElement) {
  return new Promise<ReadableStream>((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(app, {
      onShellReady() {
        const stream = new ReadableStream({
          start(controller) {
            pipe({
              write(chunk: string) {
                controller.enqueue(new TextEncoder().encode(chunk));
              },
              end() {
                controller.close();
              },
            });
          },
          cancel() {
            abort();
          },
        });

        resolve(stream);
      },
      onError(error) {
        reject(error);
      },
    });
  });
}
```

---

## 🚀 Step 5: Error Boundaries

**app/components/ErrorBoundary.tsx:**

```typescript
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md p-8 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🚀 Step 6: Meta Tags & SEO

**packages/core/src/meta/index.ts:**

```typescript
export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  canonical?: string;
}

export function generateMetaTags(meta: PageMeta): MetaTag[] {
  const tags: MetaTag[] = [];

  if (meta.description) {
    tags.push({ name: "description", content: meta.description });
    tags.push({ property: "og:description", content: meta.description });
  }

  if (meta.keywords) {
    tags.push({ name: "keywords", content: meta.keywords.join(", ") });
  }

  if (meta.ogImage) {
    tags.push({ property: "og:image", content: meta.ogImage });
  }

  if (meta.ogType) {
    tags.push({ property: "og:type", content: meta.ogType });
  }

  if (meta.twitterCard) {
    tags.push({ name: "twitter:card", content: meta.twitterCard });
  }

  return tags;
}
```

**Usage in routes:**

```typescript
import { Helmet } from "react-helmet-async";

export default function BlogPost() {
  return (
    <>
      <Helmet>
        <title>My Blog Post - ReactFlow Blog</title>
        <meta name="description" content="An amazing blog post about ReactFlow" />
        <meta property="og:title" content="My Blog Post" />
        <meta property="og:image" content="https://example.com/image.jpg" />
      </Helmet>

      <article>{/* Content */}</article>
    </>
  );
}
```

---

## 🚀 Step 7: Rate Limiting

**packages/server/src/middleware/rate-limit.ts:**

```typescript
import type { Middleware } from "@reactflow/core/middleware";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

const requests = new Map<string, number[]>();

export function createRateLimiter(options: RateLimitOptions): Middleware {
  return {
    name: "rate-limit",
    handler: async (ctx, next) => {
      const ip = ctx.request.headers.get("x-forwarded-for") || "unknown";
      const now = Date.now();

      const userRequests = requests.get(ip) || [];
      const recentRequests = userRequests.filter((time) => now - time < options.windowMs);

      if (recentRequests.length >= options.max) {
        throw new Error("Too many requests");
      }

      recentRequests.push(now);
      requests.set(ip, recentRequests);

      await next();
    },
  };
}
```

---

## ✅ Advanced Features Checklist

- [ ] Middleware system implemented
- [ ] Authentication working
- [ ] Data caching functional
- [ ] Streaming SSR enabled
- [ ] Error boundaries in place
- [ ] Meta tags configured
- [ ] Rate limiting active

---

## 🎉 Congratulations!

You've built a complete full-stack React framework with Vite, Vinxi, and Nitro!

---

## 📚 Next Steps

- Add database integration (Prisma, Drizzle)
- Implement WebSocket support
- Add file upload handling
- Create admin dashboard
- Build plugin system
- Write comprehensive tests

---

## 📖 Additional Resources

- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Streaming SSR](https://react.dev/reference/react-dom/server/renderToPipeableStream)
- [JWT Authentication](https://jwt.io/)
- [Rate Limiting Strategies](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)

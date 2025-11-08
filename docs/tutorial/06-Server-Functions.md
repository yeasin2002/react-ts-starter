# Tutorial 06: Server Functions

Implement type-safe server functions for data fetching and mutations.

---

## 🎯 What We're Building

Server functions with:

- Type-safe RPC calls
- Automatic serialization
- Client-side hooks
- Error handling
- Loading states

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01-05
- ✅ Router package implemented
- ✅ Understanding of React hooks

---

## 🚀 Step 1: Server Package Types

**packages/server/src/types/index.ts:**

```typescript
export type ServerFunction<TArgs extends any[] = any[], TReturn = any> = {
  (...args: TArgs): Promise<TReturn>;
  $type: "server-function";
  $id: string;
};

export interface ServerFunctionContext {
  request: Request;
  headers: Headers;
}

export interface ServerFunctionOptions {
  method?: "GET" | "POST";
  cache?: RequestCache;
}
```

---

## 🚀 Step 2: Create Server Function

**packages/server/src/functions/create.ts:**

```typescript
import type { ServerFunction, ServerFunctionContext, ServerFunctionOptions } from "../types";

let functionCounter = 0;

export function createServerFn<TArgs extends any[], TReturn>(
  fn: (ctx: ServerFunctionContext, ...args: TArgs) => Promise<TReturn>,
  options: ServerFunctionOptions = {},
): ServerFunction<TArgs, TReturn> {
  const functionId = `fn_${++functionCounter}`;

  const clientFn = async (...args: TArgs): Promise<TReturn> => {
    // This runs on the client
    const response = await fetch(`/api/__fn/${functionId}`, {
      method: options.method || "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ args }),
      cache: options.cache,
    });

    if (!response.ok) {
      throw new Error(`Server function failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Mark as server function
  (clientFn as any).$type = "server-function";
  (clientFn as any).$id = functionId;
  (clientFn as any).$serverImpl = fn;

  return clientFn as ServerFunction<TArgs, TReturn>;
}
```

---

## 🚀 Step 3: Server Function Handler

**packages/server/src/functions/handler.ts:**

```typescript
import { defineEventHandler, readBody } from "h3";
import type { ServerFunction } from "../types";

const serverFunctions = new Map<string, Function>();

export function registerServerFunction(fn: ServerFunction) {
  serverFunctions.set(fn.$id, (fn as any).$serverImpl);
}

export const serverFunctionHandler = defineEventHandler(async (event) => {
  const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`);
  const functionId = url.pathname.split("/").pop();

  if (!functionId) {
    throw new Error("Function ID not provided");
  }

  const fn = serverFunctions.get(functionId);
  if (!fn) {
    throw new Error(`Server function not found: ${functionId}`);
  }

  const body = await readBody(event);
  const { args = [] } = body;

  const ctx = {
    request: event.node.req,
    headers: event.node.req.headers,
  };

  try {
    const result = await fn(ctx, ...args);
    return result;
  } catch (error) {
    console.error("Server function error:", error);
    throw error;
  }
});
```

---

## 🚀 Step 4: React Hooks

**packages/server/src/hooks/useServerFn.ts:**

```typescript
import { useState, useCallback } from "react";
import type { ServerFunction } from "../types";

export interface UseServerFnResult<TArgs extends any[], TReturn> {
  data: TReturn | null;
  error: Error | null;
  loading: boolean;
  execute: (...args: TArgs) => Promise<TReturn>;
}

export function useServerFn<TArgs extends any[], TReturn>(
  fn: ServerFunction<TArgs, TReturn>,
): UseServerFnResult<TArgs, TReturn> {
  const [data, setData] = useState<TReturn | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn> => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  return { data, error, loading, execute };
}
```

**packages/server/src/hooks/useServerQuery.ts:**

```typescript
import { useEffect } from "react";
import { useServerFn } from "./useServerFn";
import type { ServerFunction } from "../types";

export function useServerQuery<TArgs extends any[], TReturn>(
  fn: ServerFunction<TArgs, TReturn>,
  args: TArgs,
) {
  const { data, error, loading, execute } = useServerFn(fn);

  useEffect(() => {
    execute(...args);
  }, [execute, ...args]);

  return { data, error, loading, refetch: () => execute(...args) };
}
```

---

## 🚀 Step 5: Vite Plugin for Transformation

**packages/server/src/vite-plugin/index.ts:**

```typescript
import type { Plugin } from "vite";
import MagicString from "magic-string";

export function serverFunctionsPlugin(): Plugin {
  return {
    name: "reactflow:server-functions",

    transform(code, id) {
      // Only transform .ts/.tsx files
      if (!/\.(ts|tsx)$/.test(id)) {
        return null;
      }

      // Check if file uses createServerFn
      if (!code.includes("createServerFn")) {
        return null;
      }

      const s = new MagicString(code);

      // Find all createServerFn calls
      const regex = /createServerFn\s*<[^>]*>\s*\(/g;
      let match;

      while ((match = regex.exec(code)) !== null) {
        // Extract function implementation
        // This is a simplified version - real implementation would use AST
        console.log("Found server function at:", match.index);
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true }),
      };
    },
  };
}
```

---

## 🚀 Step 6: Export Everything

**packages/server/src/index.ts:**

```typescript
export * from "./types";
export * from "./functions/create";
export * from "./functions/handler";
export * from "./hooks/useServerFn";
export * from "./hooks/useServerQuery";
export * from "./vite-plugin";
```

---

## 🚀 Step 7: Example Usage

**examples/basic/app/server/users.ts:**

```typescript
import { createServerFn } from "@reactflow/server";

export const getUsers = createServerFn(async (ctx) => {
  // This runs on the server
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  return users;
});

export const getUserById = createServerFn(async (ctx, id: number) => {
  // Fetch from database
  return { id, name: "Alice" };
});
```

**examples/basic/app/routes/users.tsx:**

```typescript
import { useServerQuery } from "@reactflow/server";
import { getUsers } from "../server/users";

export default function Users() {
  const { data, loading, error } = useServerQuery(getUsers, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🚀 Step 8: Build and Test

```bash
# Build server package
cd packages/server
pnpm build

# Test server function
tsx -e "
import { createServerFn } from './dist/index.js';
const fn = createServerFn(async (ctx, name) => {
  return \`Hello, \${name}!\`;
});
console.log('Function ID:', fn.\$id);
"
```

---

## ✅ Verification Checklist

- [ ] Server functions can be created
- [ ] Type safety works
- [ ] Client-side hooks work
- [ ] Error handling works
- [ ] Loading states work

---

## 📚 What's Next?

Continue to **[07-CLI-Tool.md](./07-CLI-Tool.md)** to build the command-line interface.

---

## 📖 Additional Resources

- [tRPC](https://trpc.io/) - Similar RPC pattern
- [Server Actions](https://react.dev/reference/react/use-server)
- [H3 Event Handlers](https://h3.unjs.io/)

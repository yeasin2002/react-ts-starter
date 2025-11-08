# Server Functions

Type-safe server functions for data fetching and mutations.

---

## What are Server Functions?

Server functions allow you to write backend logic that can be called from the frontend with full type safety. They run on the server and automatically handle serialization, error handling, and network requests.

---

## Creating Server Functions

### Basic Server Function

**app/server/users.ts:**

```typescript
import { createServerFn } from "@reactflow/server";

export const getUsers = createServerFn(async (ctx) => {
  // This code runs on the server
  const users = await database.users.findAll();
  return users;
});
```

### With Parameters

```typescript
export const getUserById = createServerFn(async (ctx, id: number) => {
  const user = await database.users.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
});
```

### Multiple Parameters

```typescript
export const createUser = createServerFn(async (ctx, name: string, email: string, age: number) => {
  const user = await database.users.create({
    name,
    email,
    age,
  });

  return user;
});
```

### With Object Parameters

```typescript
interface CreateUserInput {
  name: string;
  email: string;
  age: number;
  role?: "user" | "admin";
}

export const createUser = createServerFn(async (ctx, input: CreateUserInput) => {
  // Validate input
  if (!input.email.includes("@")) {
    throw new Error("Invalid email");
  }

  const user = await database.users.create(input);
  return user;
});
```

---

## Using Server Functions

### In Components

```typescript
import { useServerQuery } from '@reactflow/server';
import { getUsers } from '../server/users';

export function UsersList() {
  const { data, loading, error } = useServerQuery(getUsers, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### With Parameters

```typescript
import { useServerQuery } from '@reactflow/server';
import { getUserById } from '../server/users';

export function UserProfile({ userId }: { userId: number }) {
  const { data: user, loading } = useServerQuery(getUserById, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
```

---

## Mutations

### Using useServerFn

```typescript
import { useServerFn } from '@reactflow/server';
import { createUser } from '../server/users';

export function CreateUserForm() {
  const { execute: create, loading, error } = useServerFn(createUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const user = await create({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        age: parseInt(formData.get('age') as string),
      });

      console.log('User created:', user);
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <input name="age" type="number" required />
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

### Optimistic Updates

```typescript
import { useServerFn } from '@reactflow/server';
import { useState } from 'react';

export function TodoList() {
  const [todos, setTodos] = useState([]);
  const { execute: addTodo } = useServerFn(createTodo);

  const handleAdd = async (text: string) => {
    // Optimistic update
    const tempId = Date.now();
    setTodos([...todos, { id: tempId, text, completed: false }]);

    try {
      const newTodo = await addTodo(text);
      // Replace temp todo with real one
      setTodos((prev) => prev.map((t) => (t.id === tempId ? newTodo : t)));
    } catch (error) {
      // Rollback on error
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  return <div>{/* Todo list UI */}</div>;
}
```

---

## Context & Headers

### Accessing Request Context

```typescript
export const getCurrentUser = createServerFn(async (ctx) => {
  // Access request headers
  const token = ctx.headers.get("Authorization");

  // Access cookies
  const sessionId = ctx.request.headers.get("cookie");

  // Access request URL
  const url = new URL(ctx.request.url);

  if (!token) {
    throw new Error("Unauthorized");
  }

  const user = await verifyToken(token);
  return user;
});
```

### Setting Response Headers

```typescript
export const downloadFile = createServerFn(async (ctx, fileId: string) => {
  const file = await getFile(fileId);

  // Set custom headers
  ctx.response.headers.set("Content-Type", file.mimeType);
  ctx.response.headers.set("Content-Disposition", `attachment; filename="${file.name}"`);

  return file.data;
});
```

---

## Error Handling

### Throwing Errors

```typescript
export const deleteUser = createServerFn(async (ctx, id: number) => {
  const user = await database.users.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Cannot delete admin users");
  }

  await database.users.delete(id);
  return { success: true };
});
```

### Custom Error Types

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export const updateUser = createServerFn(async (ctx, id: number, data: any) => {
  if (!data.email?.includes("@")) {
    throw new ValidationError("email", "Invalid email format");
  }

  const user = await database.users.update(id, data);
  return user;
});
```

### Handling Errors in Components

```typescript
export function UserForm() {
  const { execute: update, error } = useServerFn(updateUser);

  return (
    <form>
      {error && (
        <div className="error">
          {error instanceof ValidationError
            ? `${error.field}: ${error.message}`
            : error.message}
        </div>
      )}
    </form>
  );
}
```

---

## Authentication

### Protected Server Functions

```typescript
export const getPrivateData = createServerFn(async (ctx) => {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("Unauthorized");
  }

  const data = await database.privateData.findByUserId(user.id);
  return data;
});
```

### Role-Based Access

```typescript
function requireRole(role: string) {
  return async (ctx: ServerFunctionContext) => {
    const user = await getCurrentUser(ctx);

    if (!user || user.role !== role) {
      throw new Error("Forbidden");
    }

    return user;
  };
}

export const deleteUser = createServerFn(async (ctx, id: number) => {
  await requireRole("admin")(ctx);

  await database.users.delete(id);
  return { success: true };
});
```

---

## Caching

### Cache Server Function Results

```typescript
import { withCache } from "@reactflow/server/cache";

export const getExpensiveData = createServerFn(async (ctx) => {
  return withCache(
    async () => {
      // Expensive operation
      const data = await computeExpensiveData();
      return data;
    },
    {
      key: "expensive-data",
      ttl: 300, // 5 minutes
    },
  );
});
```

### Invalidate Cache

```typescript
import { clearCache } from "@reactflow/server/cache";

export const updateData = createServerFn(async (ctx, newData: any) => {
  await database.data.update(newData);

  // Invalidate cache
  clearCache("expensive-data");

  return { success: true };
});
```

---

## File Uploads

### Handle File Uploads

```typescript
export const uploadAvatar = createServerFn(async (ctx, file: File) => {
  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large (max 5MB)");
  }

  // Upload to storage
  const url = await storage.upload(file);

  return { url };
});
```

### In Component

```typescript
export function AvatarUpload() {
  const { execute: upload, loading } = useServerFn(uploadAvatar);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file);
    console.log('Uploaded:', result.url);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} disabled={loading} />
      {loading && <div>Uploading...</div>}
    </div>
  );
}
```

---

## Streaming Responses

### Stream Large Data

```typescript
export const streamLargeDataset = createServerFn(async (ctx) => {
  const stream = new ReadableStream({
    async start(controller) {
      const data = await database.largeDataset.stream();

      for await (const chunk of data) {
        controller.enqueue(chunk);
      }

      controller.close();
    },
  });

  return stream;
});
```

---

## Best Practices

### 1. Keep Functions Focused

```typescript
// ❌ Bad: Too many responsibilities
export const handleUser = createServerFn(async (ctx, action, data) => {
  if (action === "create") {
    // create logic
  } else if (action === "update") {
    // update logic
  } else if (action === "delete") {
    // delete logic
  }
});

// ✅ Good: Separate functions
export const createUser = createServerFn(async (ctx, data) => {
  // create logic
});

export const updateUser = createServerFn(async (ctx, id, data) => {
  // update logic
});

export const deleteUser = createServerFn(async (ctx, id) => {
  // delete logic
});
```

### 2. Validate Input

```typescript
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

export const createUser = createServerFn(async (ctx, input: unknown) => {
  // Validate input
  const data = CreateUserSchema.parse(input);

  const user = await database.users.create(data);
  return user;
});
```

### 3. Handle Errors Gracefully

```typescript
export const getUser = createServerFn(async (ctx, id: number) => {
  try {
    const user = await database.users.findById(id);
    return user;
  } catch (error) {
    console.error("Failed to get user:", error);
    throw new Error("Failed to fetch user");
  }
});
```

---

## Next Steps

- [Data Fetching](./06-data-fetching.md) - Advanced data loading
- [Forms & Mutations](./07-forms-mutations.md) - Form handling
- [Authentication](./12-authentication.md) - User authentication

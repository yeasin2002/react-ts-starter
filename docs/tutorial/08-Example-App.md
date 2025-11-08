# Tutorial 08: Example Application

Build a complete example application using your ReactFlow framework.

---

## 🎯 What We're Building

A full-featured blog app with:

- Multiple routes
- Server functions
- Data fetching
- Forms and mutations
- Layouts
- Error handling

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01-07
- ✅ CLI tool working
- ✅ All packages built

---

## 🚀 Step 1: Create Project

```bash
# Create new project
reactflow create blog-app

# Navigate to project
cd blog-app

# Install dependencies
pnpm install
```

---

## 🚀 Step 2: Project Structure

```
blog-app/
├── app/
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── about.tsx
│   │   ├── posts/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── new.tsx
│   │   └── _layout.tsx
│   ├── server/
│   │   ├── posts.ts
│   │   └── db.ts
│   └── components/
│       ├── Header.tsx
│       └── PostCard.tsx
├── public/
│   └── styles.css
├── reactflow.config.ts
└── package.json
```

---

## 🚀 Step 3: Database Setup

**app/server/db.ts:**

```typescript
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

// In-memory database
let posts: Post[] = [
  {
    id: 1,
    title: "Getting Started with ReactFlow",
    content: "ReactFlow is a modern full-stack React framework...",
    author: "John Doe",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    title: "Building APIs with Server Functions",
    content: "Server functions make it easy to build type-safe APIs...",
    author: "Jane Smith",
    createdAt: new Date("2024-01-02"),
  },
];

let nextId = 3;

export const db = {
  posts: {
    findAll: async () => posts,
    findById: async (id: number) => posts.find((p) => p.id === id),
    create: async (data: Omit<Post, "id" | "createdAt">) => {
      const post: Post = {
        ...data,
        id: nextId++,
        createdAt: new Date(),
      };
      posts.push(post);
      return post;
    },
    delete: async (id: number) => {
      posts = posts.filter((p) => p.id !== id);
    },
  },
};
```

---

## 🚀 Step 4: Server Functions

**app/server/posts.ts:**

```typescript
import { createServerFn } from "@reactflow/server";
import { db } from "./db";

export const getPosts = createServerFn(async (ctx) => {
  return db.posts.findAll();
});

export const getPostById = createServerFn(async (ctx, id: number) => {
  const post = await db.posts.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
});

export const createPost = createServerFn(
  async (ctx, data: { title: string; content: string; author: string }) => {
    return db.posts.create(data);
  },
);

export const deletePost = createServerFn(async (ctx, id: number) => {
  await db.posts.delete(id);
  return { success: true };
});
```

---

## 🚀 Step 5: Layout Component

**app/routes/\_layout.tsx:**

```typescript
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ReactFlow Blog
            </Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link to="/posts" className="text-gray-600 hover:text-gray-900">
                Posts
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          Built with ReactFlow
        </div>
      </footer>
    </div>
  );
}
```

---

## 🚀 Step 6: Home Page

**app/routes/index.tsx:**

```typescript
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to ReactFlow Blog</h1>
      <p className="text-xl text-gray-600 mb-8">A modern full-stack React framework</p>

      <div className="space-x-4">
        <Link to="/posts" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          View Posts
        </Link>
        <Link to="/posts/new" className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
          Create Post
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">File-Based Routing</h3>
          <p className="text-gray-600">Automatic route generation from your file structure</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Server Functions</h3>
          <p className="text-gray-600">Type-safe RPC calls between client and server</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Fast Development</h3>
          <p className="text-gray-600">Hot module replacement and instant feedback</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Step 7: Posts List Page

**app/routes/posts/index.tsx:**

```typescript
import { Link } from "react-router-dom";
import { useServerQuery } from "@reactflow/server";
import { getPosts } from "../../server/posts";

export default function Posts() {
  const { data: posts, loading, error } = useServerQuery(getPosts, []);

  if (loading) {
    return <div className="text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">All Posts</h1>
        <Link to="/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          New Post
        </Link>
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <Link to={`/posts/${post.id}`} className="text-2xl font-semibold text-blue-600 hover:text-blue-800">
              {post.title}
            </Link>
            <p className="text-gray-600 mt-2">{post.content.substring(0, 150)}...</p>
            <div className="mt-4 text-sm text-gray-500">
              By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 Step 8: Post Detail Page

**app/routes/posts/[id].tsx:**

```typescript
import { useParams, useNavigate } from "react-router-dom";
import { useServerQuery, useServerFn } from "@reactflow/server";
import { getPostById, deletePost } from "../../server/posts";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, loading, error } = useServerQuery(getPostById, [parseInt(id!)]);
  const { execute: handleDelete, loading: deleting } = useServerFn(deletePost);

  const onDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      await handleDelete(parseInt(id!));
      navigate("/posts");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-6">
          By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
        </div>
        <div className="prose max-w-none">{post.content}</div>
      </article>

      <div className="mt-6 space-x-4">
        <button onClick={() => navigate("/posts")} className="text-blue-600 hover:text-blue-800">
          ← Back to Posts
        </button>
        <button onClick={onDelete} disabled={deleting} className="text-red-600 hover:text-red-800">
          {deleting ? "Deleting..." : "Delete Post"}
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 Step 9: Create Post Page

**app/routes/posts/new.tsx:**

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServerFn } from "@reactflow/server";
import { createPost } from "../../server/posts";

export default function NewPost() {
  const navigate = useNavigate();
  const { execute: handleCreate, loading } = useServerFn(createPost);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const post = await handleCreate(formData);
    navigate(`/posts/${post.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

      <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/posts")}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🚀 Step 10: Run the App

```bash
# Start development server
pnpm dev

# Open browser to http://localhost:3000
```

---

## ✅ Verification Checklist

- [ ] Home page loads
- [ ] Posts list displays
- [ ] Can view post details
- [ ] Can create new posts
- [ ] Can delete posts
- [ ] Navigation works
- [ ] Server functions work

---

## 📚 What's Next?

Continue to **[09-Deployment.md](./09-Deployment.md)** to learn how to deploy your application.

---

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

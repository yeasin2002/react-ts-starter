# Example: Building a Blog

Build a complete blog with ReactFlow.

---

## Features

- List blog posts
- View individual posts
- Create new posts
- Markdown support
- SEO optimization

---

## Step 1: Database Setup

**app/server/db.ts:**

```typescript
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  tags: string[];
}

// In-memory database (replace with real database)
let posts: Post[] = [
  {
    id: 1,
    title: "Getting Started with ReactFlow",
    slug: "getting-started",
    content: "# Getting Started\n\nReactFlow is amazing...",
    excerpt: "Learn how to get started with ReactFlow",
    author: "John Doe",
    publishedAt: new Date("2024-01-01"),
    tags: ["tutorial", "beginner"],
  },
];

let nextId = 2;

export const db = {
  posts: {
    findAll: async () => posts,
    findBySlug: async (slug: string) => posts.find((p) => p.slug === slug),
    create: async (data: Omit<Post, "id" | "publishedAt">) => {
      const post: Post = {
        ...data,
        id: nextId++,
        publishedAt: new Date(),
      };
      posts.push(post);
      return post;
    },
  },
};
```

---

## Step 2: Server Functions

**app/server/blog.ts:**

```typescript
import { createServerFn } from "@reactflow/server";
import { db } from "./db";
import { marked } from "marked";

export const getPosts = createServerFn(async (ctx) => {
  const posts = await db.posts.findAll();
  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
});

export const getPostBySlug = createServerFn(async (ctx, slug: string) => {
  const post = await db.posts.findBySlug(slug);

  if (!post) {
    throw new Error("Post not found");
  }

  // Convert markdown to HTML
  const html = marked(post.content);

  return {
    ...post,
    html,
  };
});

export const createPost = createServerFn(
  async (
    ctx,
    data: {
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      author: string;
      tags: string[];
    },
  ) => {
    // Validate slug is unique
    const existing = await db.posts.findBySlug(data.slug);
    if (existing) {
      throw new Error("Slug already exists");
    }

    const post = await db.posts.create(data);
    return post;
  },
);
```

---

## Step 3: Blog List Page

**app/routes/blog/index.tsx:**

```typescript
import { Link } from 'react-router-dom';
import { useServerQuery } from '@reactflow/server';
import { getPosts } from '../../server/blog';

export default function BlogIndex() {
  const { data: posts, loading, error } = useServerQuery(getPosts, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Blog</h1>
        <Link
          to="/blog/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-8">
        {posts?.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow p-6">
            <Link to={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-bold text-blue-600 hover:text-blue-800 mb-2">
                {post.title}
              </h2>
            </Link>

            <div className="text-gray-600 text-sm mb-4">
              By {post.author} • {new Date(post.publishedAt).toLocaleDateString()}
            </div>

            <p className="text-gray-700 mb-4">{post.excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-800"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

---

## Step 4: Blog Post Page

**app/routes/blog/[slug].tsx:**

```typescript
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useServerQuery } from '@reactflow/server';
import { getPostBySlug } from '../../server/blog';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useServerQuery(getPostBySlug, [slug!]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Post not found</p>
          <Link to="/blog" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - My Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to blog
        </Link>

        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>

        <div className="text-gray-600 mb-4">
          By {post.author} • {new Date(post.publishedAt).toLocaleDateString()}
        </div>

        <div className="flex gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </>
  );
}
```

---

## Step 5: Create Post Page

**app/routes/blog/new.tsx:**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServerFn } from '@reactflow/server';
import { createPost } from '../../server/blog';

export default function NewPost() {
  const navigate = useNavigate();
  const { execute: create, loading, error } = useServerFn(createPost);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const post = await create({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()),
      });

      navigate(`/blog/${post.slug}`);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Create New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Content (Markdown)
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tutorial, beginner, react"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">{error.message}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/blog')}
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

## Step 6: Add Styling

**public/styles.css:**

```css
.prose {
  @apply text-gray-800;
}

.prose h1 {
  @apply mt-8 mb-4 text-3xl font-bold;
}

.prose h2 {
  @apply mt-6 mb-3 text-2xl font-bold;
}

.prose h3 {
  @apply mt-4 mb-2 text-xl font-bold;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose a {
  @apply text-blue-600 underline hover:text-blue-800;
}

.prose code {
  @apply rounded bg-gray-100 px-2 py-1 font-mono text-sm;
}

.prose pre {
  @apply mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100;
}

.prose ul {
  @apply mb-4 list-inside list-disc;
}

.prose ol {
  @apply mb-4 list-inside list-decimal;
}
```

---

## 🎉 Done!

You now have a fully functional blog with:

- ✅ Post listing
- ✅ Individual post pages
- ✅ Create new posts
- ✅ Markdown support
- ✅ SEO optimization
- ✅ Responsive design

---

## Next Steps

- Add authentication for post creation
- Add comments system
- Add search functionality
- Add RSS feed
- Add pagination
- Connect to real database (PostgreSQL, MongoDB)

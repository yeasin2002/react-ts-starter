# Documentation

Welcome to the documentation for this React + TypeScript + Nitro starter template.

## 📚 Available Guides

### [TL-DR.md](./TL-DR.md) 🚀 **START HERE IF YOU'RE BUSY**

**The shortest possible summary**

Everything you need to know in 2 minutes:

- Do you need SSR/SSG?
- Quick decision tree
- Action items
- Common mistakes

**Read this if:** You want the fastest answer possible.

---

### [Quick-Reference.md](./Quick-Reference.md) ⚡

**Quick reference for rendering strategies**

The fastest way to understand CSR vs SSR vs SSG. Includes decision tree and framework recommendations.

---

### [DIAGRAMS.md](./DIAGRAMS.md) 📊

**Visual diagrams and comparisons**

Visual representations of:

- How each rendering strategy works
- Performance timelines
- Architecture diagrams
- Cost comparisons
- Real-world examples

**Read this if:** You're a visual learner and want to see how things work.

---

### [SSR-SSG-Guide.md](./SSR-SSG-Guide.md)

**Complete guide to Server-Side Rendering and Static Site Generation**

Learn about:

- Current CSR setup and limitations
- Can Nitro support SSR/SSG?
- Recommended frameworks (Next.js, Remix, Astro)
- Hybrid approaches for SEO
- Manual SSR implementation (advanced)
- Migration paths
- Decision guide

**Read this if:** You're considering adding SSR/SSG to your project or migrating to a different framework.

---

### [Quick-Reference.md](./Quick-Reference.md)

**Quick reference for rendering strategies**

Includes:

- CSR vs SSR vs SSG vs ISR explained
- Visual comparisons
- When to use each strategy
- Framework recommendations
- Decision tree
- Performance comparison
- Common myths debunked

**Read this if:** You want a quick overview of rendering strategies and need help deciding.

---

### [SEO-Improvements-CSR.md](./SEO-Improvements-CSR.md)

**Practical SEO improvements for CSR apps**

Step-by-step guide:

- Add dynamic meta tags with react-helmet-async
- Implement structured data (JSON-LD)
- Create sitemap and robots.txt
- Prerendering for search engine bots
- Performance optimization
- Testing and validation

**Read this if:** You want to improve SEO without migrating to a new framework.

---

### [Building-SSR-Framework.md](./Building-SSR-Framework.md) 🏗️

**How Nitro-based SSR frameworks work**

Deep dive into architecture:

- How TanStack Start and Nuxt achieve SSR with Nitro
- Key components needed (dual build, server entry, client entry)
- Architecture comparison with Next.js/Nuxt
- Server functions and streaming
- Complete implementation overview

**Read this if:** You want to understand how SSR frameworks work under the hood.

---

### [Implementing-SSR-Step-by-Step.md](./Implementing-SSR-Step-by-Step.md) 🛠️

**Hands-on guide to building SSR**

Practical implementation:

- Minimal SSR setup (Part 1)
- Data fetching (Part 2)
- Streaming SSR (Part 3)
- Production build (Part 4)
- Advanced features (Part 5)
- Testing and deployment (Part 6)

**Read this if:** You want to actually implement SSR in your current project.

---

## 🏗️ Building Your Own Framework

Want to build a full-stack React framework like Next.js, TanStack Start, or Nuxt?

### [build-framework/](./build-framework/)

Complete guide to building a production-ready React framework:

- **[00-Quick-Start.md](./build-framework/00-Quick-Start.md)** - Get started in 30 minutes
- **[README.md](./build-framework/README.md)** - Complete roadmap and overview
- **[01-Architecture.md](./build-framework/01-Architecture.md)** - System architecture
- **[02-Tech-Stack.md](./build-framework/02-Tech-Stack.md)** - All tools and packages

**What you'll build:**

- ✅ Server-Side Rendering (SSR)
- ✅ File-based routing
- ✅ Client/Server components
- ✅ Server functions
- ✅ Image optimization
- ✅ Universal deployment

**Read this if:** You want to build your own framework using Vite, Nitro, and Vinxi.

---

## 🚀 Quick Start

### Current Setup (CSR)

Your project uses Client-Side Rendering, which is perfect for:

- ✅ Dashboards and admin panels
- ✅ Apps behind authentication
- ✅ Internal tools
- ✅ Highly interactive applications

### Need SEO?

If you need search engine optimization:

1. Read the [Quick Reference](./Quick-Reference.md) decision tree
2. Check the [SSR-SSG Guide](./SSR-SSG-Guide.md) for detailed options
3. Choose the right framework for your needs

---

## 🎯 Common Questions

### Q: Should I add SSR to this project?

**A:** Probably not. If you need SSR, it's better to use a framework designed for it (Next.js, Remix, Astro).

### Q: Can Nitro do SSR?

**A:** Nitro can serve HTML, but it's not designed for React SSR. You'd need significant manual setup.

### Q: What if I just need better SEO?

**A:** Check out [SEO-Improvements-CSR.md](./SEO-Improvements-CSR.md) for a complete guide with practical steps:

1. Adding meta tags with `react-helmet-async`
2. Implementing structured data (JSON-LD)
3. Using a prerendering service for bots
4. Creating sitemap and robots.txt
5. Performance optimization

### Q: When should I migrate to Next.js?

**A:** When:

- SEO is critical for your business
- You need server-side data fetching
- You want image optimization
- Initial load speed matters

### Q: Is CSR bad?

**A:** No! CSR is excellent for:

- Apps that don't need SEO
- Dashboards and internal tools
- Apps behind authentication
- Highly interactive experiences

---

## 📖 Additional Resources

### Official Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Nitro Documentation](https://nitro.unjs.io)
- [React Router Documentation](https://reactrouter.com)

### Framework Documentation

- [Next.js](https://nextjs.org/docs)
- [Remix](https://remix.run/docs)
- [Astro](https://docs.astro.build)
- [TanStack Start](https://tanstack.com/start)

### Learning Resources

- [Web.dev: Rendering Patterns](https://web.dev/rendering-on-the-web/)
- [Patterns.dev](https://www.patterns.dev/)
- [React Server Components](https://react.dev/reference/rsc/server-components)

---

## 🤝 Contributing

Found an error or want to improve the documentation?

1. Open an issue
2. Submit a pull request
3. Suggest improvements

---

## 📝 License

This documentation is part of the React-TS-Starter template and follows the same license.

# Quick Reference: Rendering Strategies

## What is CSR, SSR, SSG, ISR?

### 🖥️ CSR (Client-Side Rendering)

**What you have now**

```
Browser → Downloads HTML (empty) → Downloads JS → Renders UI
```

**Pros:**

- ✅ Simple setup
- ✅ Great for interactive apps
- ✅ Fast navigation after load

**Cons:**

- ❌ Poor SEO
- ❌ Slow initial load
- ❌ Blank screen while loading

**Best for:** Dashboards, admin panels, apps behind auth

---

### 🌐 SSR (Server-Side Rendering)

**Render on every request**

```
Browser → Server renders HTML → Sends full page → Hydrates with JS
```

**Pros:**

- ✅ Great SEO
- ✅ Fast initial load
- ✅ Dynamic content

**Cons:**

- ❌ Server load
- ❌ Slower than SSG
- ❌ Complex setup

**Best for:** E-commerce, social media, personalized content

**Frameworks:** Next.js, Remix, SvelteKit

---

### 📄 SSG (Static Site Generation)

**Pre-render at build time**

```
Build time → Generate HTML for all pages → Deploy static files
```

**Pros:**

- ✅ Excellent SEO
- ✅ Very fast
- ✅ Cheap hosting (CDN)

**Cons:**

- ❌ Rebuild for updates
- ❌ Not for dynamic data
- ❌ Long build times

**Best for:** Blogs, documentation, marketing sites

**Frameworks:** Next.js, Astro, Gatsby, Eleventy

---

### 🔄 ISR (Incremental Static Regeneration)

**SSG + automatic updates**

```
Build time → Generate static pages → Regenerate on schedule or demand
```

**Pros:**

- ✅ Fast like SSG
- ✅ Fresh content
- ✅ Best of both worlds

**Cons:**

- ⚠️ Only in Next.js
- ⚠️ Complex caching

**Best for:** News sites, product catalogs, blogs with frequent updates

**Frameworks:** Next.js (exclusive feature)

---

### 🏝️ Islands Architecture (Partial Hydration)

**Static HTML + interactive islands**

```
Server → Static HTML → Only hydrate interactive components
```

**Pros:**

- ✅ Minimal JavaScript
- ✅ Very fast
- ✅ Great performance

**Cons:**

- ⚠️ Different mental model
- ⚠️ Limited frameworks

**Best for:** Content sites with some interactivity

**Frameworks:** Astro, Fresh (Deno)

---

## Visual Comparison

```
CSR:  [Browser] ----JS----> [Render] -----> [Interactive]
      Slow initial load, then fast

SSR:  [Server] --HTML--> [Browser] --JS--> [Interactive]
      Fast initial load, fast interactive

SSG:  [Build] --HTML--> [CDN] -----> [Browser] --JS--> [Interactive]
      Instant load, fast interactive

ISR:  [Build] --HTML--> [CDN] --Revalidate--> [Update]
      Instant load + fresh content
```

---

## When to Use What?

### Use CSR (Your Current Setup) ✅

- [ ] Dashboard or admin panel
- [ ] App behind authentication
- [ ] Internal tools
- [ ] Highly interactive app (like Figma, Notion)
- [ ] SEO not important

### Use SSR 🌐

- [ ] E-commerce site
- [ ] Social media platform
- [ ] Personalized content
- [ ] Real-time data
- [ ] SEO critical

### Use SSG 📄

- [ ] Blog
- [ ] Documentation
- [ ] Marketing website
- [ ] Portfolio
- [ ] Content rarely changes

### Use ISR 🔄

- [ ] News website
- [ ] Product catalog
- [ ] Blog with frequent updates
- [ ] Need SSG speed + fresh content

### Use Islands 🏝️

- [ ] Content-heavy site
- [ ] Need minimal JS
- [ ] Some interactive components
- [ ] Performance is critical

---

## Framework Recommendations

### Next.js (Most Popular)

```bash
npx create-next-app@latest
```

- ✅ SSR, SSG, ISR, CSR
- ✅ Best documentation
- ✅ Largest community
- ✅ Vercel deployment

### Remix (Web Standards)

```bash
npx create-remix@latest
```

- ✅ SSR-first
- ✅ Great data loading
- ✅ Progressive enhancement
- ✅ Nested routing

### Astro (Content Sites)

```bash
npm create astro@latest
```

- ✅ SSG + Islands
- ✅ Minimal JS
- ✅ Use any framework
- ✅ Best performance

### TanStack Start (New)

```bash
npm create @tanstack/start@latest
```

- ✅ Type-safe routing
- ✅ Built on Nitro
- ✅ Modern DX
- ⚠️ Beta

---

## Can I Add SSR to My Current Project?

### Short Answer: **Not easily**

Your stack:

- Vite + React + Nitro
- Designed for CSR + API

To add SSR, you'd need:

1. Manual React rendering setup
2. Custom hydration logic
3. Routing integration
4. Build process changes
5. Ongoing maintenance

**Recommendation:** If you need SSR, use a framework designed for it.

---

## Quick Decision Tree

```
Do you need SEO?
├─ No → Keep CSR ✅
└─ Yes
   ├─ Content changes often?
   │  ├─ Yes → Use SSR (Next.js/Remix)
   │  └─ No → Use SSG (Astro/Next.js)
   └─ Is it a blog/docs?
      ├─ Yes → Use Astro
      └─ No → Use Next.js
```

---

## Performance Comparison

| Strategy | Initial Load | Navigation | SEO | Server Cost |
| -------- | ------------ | ---------- | --- | ----------- |
| CSR      | ❌ Slow      | ✅ Fast    | ❌  | ✅ Low      |
| SSR      | ✅ Fast      | ✅ Fast    | ✅  | ❌ High     |
| SSG      | ✅ Very Fast | ✅ Fast    | ✅  | ✅ Very Low |
| ISR      | ✅ Very Fast | ✅ Fast    | ✅  | ⚠️ Medium   |
| Islands  | ✅ Very Fast | ⚠️ Medium  | ✅  | ✅ Very Low |

---

## Common Myths

### ❌ "I need SSR for all apps"

**False.** Most dashboards and internal tools work great with CSR.

### ❌ "SSR is always faster"

**False.** SSG is faster than SSR. SSR is faster than CSR for initial load only.

### ❌ "I can't do SEO with CSR"

**Partially false.** You can use prerendering services or meta tags, but SSR/SSG is better.

### ❌ "SSG can't have dynamic content"

**False.** Use ISR or client-side fetching for dynamic parts.

---

## Next Steps

1. **Evaluate your needs** using the decision tree
2. **If staying with CSR:** Optimize with meta tags and prerendering
3. **If switching:** Choose a framework and follow migration guide
4. **Read full guide:** See `SSR-SSG-Guide.md` for detailed steps

---

## Resources

- [Web.dev: Rendering Patterns](https://web.dev/rendering-on-the-web/)
- [Next.js: Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Astro: Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Remix: Philosophy](https://remix.run/docs/en/main/discussion/philosophy)

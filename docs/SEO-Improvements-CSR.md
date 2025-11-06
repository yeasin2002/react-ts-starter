# SEO Improvements for CSR Apps

A practical guide to improve SEO in your current Client-Side Rendered application **without migrating** to a new framework.

---

## ⚠️ Important: Limitations

CSR will **never** be as good as SSR/SSG for SEO, but you can make significant improvements.

**What works:**

- ✅ Meta tags (title, description, Open Graph)
- ✅ Structured data (JSON-LD)
- ✅ Sitemap and robots.txt
- ✅ Prerendering for bots
- ✅ Performance optimization

**What doesn't work well:**

- ❌ Dynamic content indexing
- ❌ Social media previews (without prerendering)
- ❌ Fast initial page load

---

## Step 1: Add Dynamic Meta Tags

### Install react-helmet-async

```bash
npm install react-helmet-async
```

### Setup Provider

**src/main.tsx:**

```tsx
import { HelmetProvider } from "react-helmet-async";

app.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
```

### Use in Components

**src/pages/index.tsx:**

```tsx
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>Home | My Awesome App</title>
        <meta name="description" content="Welcome to my awesome app" />
        <meta name="keywords" content="react, typescript, vite" />

        {/* Open Graph (Facebook, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Home | My Awesome App" />
        <meta property="og:description" content="Welcome to my awesome app" />
        <meta property="og:image" content="https://myapp.com/og-image.jpg" />
        <meta property="og:url" content="https://myapp.com" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home | My Awesome App" />
        <meta name="twitter:description" content="Welcome to my awesome app" />
        <meta name="twitter:image" content="https://myapp.com/twitter-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://myapp.com" />
      </Helmet>

      <div>
        <h1>Welcome to My App</h1>
      </div>
    </>
  );
};

export default Home;
```

### Create Reusable SEO Component

**src/components/SEO.tsx:**

```tsx
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
}

export const SEO = ({
  title,
  description,
  image = "https://myapp.com/default-og.jpg",
  url = "https://myapp.com",
  type = "website",
  keywords,
}: SEOProps) => {
  const fullTitle = `${title} | My App`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <link rel="canonical" href={url} />
    </Helmet>
  );
};
```

**Usage:**

```tsx
const AboutPage = () => {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn more about our company and mission"
        url="https://myapp.com/about"
      />
      <div>About content...</div>
    </>
  );
};
```

---

## Step 2: Add Structured Data (JSON-LD)

Structured data helps search engines understand your content.

**src/components/StructuredData.tsx:**

```tsx
import { Helmet } from "react-helmet-async";

interface StructuredDataProps {
  data: object;
}

export const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
```

**Example: Organization Schema**

```tsx
const HomePage = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "My Company",
    url: "https://myapp.com",
    logo: "https://myapp.com/logo.png",
    sameAs: ["https://twitter.com/mycompany", "https://linkedin.com/company/mycompany"],
  };

  return (
    <>
      <SEO title="Home" description="Welcome" />
      <StructuredData data={organizationSchema} />
      <div>Content...</div>
    </>
  );
};
```

**Example: Article Schema**

```tsx
const BlogPost = () => {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "My Blog Post Title",
    description: "Post description",
    image: "https://myapp.com/post-image.jpg",
    author: {
      "@type": "Person",
      name: "John Doe",
    },
    publisher: {
      "@type": "Organization",
      name: "My Company",
      logo: {
        "@type": "ImageObject",
        url: "https://myapp.com/logo.png",
      },
    },
    datePublished: "2024-01-01",
    dateModified: "2024-01-15",
  };

  return (
    <>
      <SEO title="Blog Post" description="Post description" />
      <StructuredData data={articleSchema} />
      <article>Content...</article>
    </>
  );
};
```

---

## Step 3: Create Sitemap

**public/sitemap.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://myapp.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://myapp.com/about</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://myapp.com/contact</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**Or generate dynamically with Nitro:**

**routes/sitemap.xml.ts:**

```typescript
export default defineEventHandler(() => {
  const routes = ["/", "/about", "/contact", "/blog"];
  const baseUrl = "https://myapp.com";

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml");
  return sitemap;
});
```

---

## Step 4: Create robots.txt

**public/robots.txt:**

```txt
User-agent: *
Allow: /

Sitemap: https://myapp.com/sitemap.xml
```

---

## Step 5: Prerendering for Bots

### Option A: Use Prerender.io (Paid Service)

**routes/middleware/prerender.ts:**

```typescript
export default defineEventHandler(async (event) => {
  const userAgent = getHeader(event, "user-agent") || "";
  const isBot = /googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit/i.test(
    userAgent,
  );

  if (isBot) {
    const url = event.node.req.url;
    const prerenderUrl = `https://service.prerender.io/https://myapp.com${url}`;

    try {
      const response = await fetch(prerenderUrl, {
        headers: {
          "X-Prerender-Token": process.env.PRERENDER_TOKEN || "",
        },
      });

      const html = await response.text();
      return html;
    } catch (error) {
      // Fall through to normal rendering
    }
  }
});
```

### Option B: Self-Hosted Prerendering

Use **Puppeteer** or **Playwright** to pre-render pages:

```bash
npm install puppeteer
```

**scripts/prerender.ts:**

```typescript
import puppeteer from "puppeteer";
import fs from "fs";

const routes = ["/", "/about", "/contact"];

async function prerender() {
  const browser = await puppeteer.launch();

  for (const route of routes) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:5000${route}`, {
      waitUntil: "networkidle0",
    });

    const html = await page.content();
    const filename = route === "/" ? "index" : route.slice(1);
    fs.writeFileSync(`dist/prerendered/${filename}.html`, html);
  }

  await browser.close();
}

prerender();
```

---

## Step 6: Performance Optimization

### Lazy Load Images

```tsx
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
};
```

### Code Splitting

```tsx
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
};
```

### Optimize Bundle Size

```bash
# Analyze bundle
npm install -D vite-plugin-bundle-analyzer

# Add to vite.config.ts
import { visualizer } from 'vite-plugin-bundle-analyzer';

plugins: [
  visualizer({ open: true }),
]
```

---

## Step 7: Update index.html

**index.html:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Default Meta Tags (will be overridden by Helmet) -->
    <title>My Awesome App</title>
    <meta name="description" content="Default description" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <!-- Theme Color -->
    <meta name="theme-color" content="#000000" />

    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>

    <!-- Fallback for no-JS users -->
    <noscript>
      <div style="text-align: center; padding: 50px;">
        <h1>JavaScript Required</h1>
        <p>Please enable JavaScript to use this application.</p>
      </div>
    </noscript>
  </body>
</html>
```

---

## Step 8: Testing

### Test Meta Tags

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### Test Structured Data

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/

### Test Performance

1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **Lighthouse** (Chrome DevTools)

---

## Checklist

- [ ] Install and setup `react-helmet-async`
- [ ] Add meta tags to all pages
- [ ] Create reusable SEO component
- [ ] Add structured data (JSON-LD)
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Implement prerendering for bots (optional)
- [ ] Optimize images (lazy loading)
- [ ] Implement code splitting
- [ ] Update index.html with defaults
- [ ] Test with Facebook/Twitter validators
- [ ] Test with Google Rich Results
- [ ] Run Lighthouse audit

---

## Expected Results

**Before:**

- ❌ No meta tags
- ❌ Poor social media previews
- ❌ No structured data
- ❌ Slow initial load

**After:**

- ✅ Dynamic meta tags per page
- ✅ Good social media previews
- ✅ Structured data for search engines
- ✅ Better performance
- ⚠️ Still CSR limitations

---

## When This Isn't Enough

If after implementing these improvements you still need better SEO:

- Consider migrating to Next.js, Remix, or Astro
- See [SSR-SSG-Guide.md](./SSR-SSG-Guide.md) for migration paths

---

## Resources

- [react-helmet-async](https://github.com/staylor/react-helmet-async)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

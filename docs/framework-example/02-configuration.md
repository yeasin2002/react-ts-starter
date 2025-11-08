# Configuration

Configure ReactFlow to match your project needs.

---

## Configuration File

Create `reactflow.config.ts` in your project root:

```typescript
import { defineConfig } from "@reactflow/core";

export default defineConfig({
  // Your configuration here
});
```

---

## Basic Configuration

### Server Settings

```typescript
export default defineConfig({
  // Development server port
  port: 3000,

  // Server host
  host: "localhost",

  // Enable server-side rendering
  ssr: true,
});
```

### Directory Structure

```typescript
export default defineConfig({
  // Root directory
  root: process.cwd(),

  // Output directory for builds
  outDir: ".output",

  // Routes directory
  routesDir: "app/routes",

  // Server functions directory
  serverDir: "app/server",

  // Public assets directory
  publicDir: "public",
});
```

---

## Vite Configuration

Extend Vite configuration:

```typescript
export default defineConfig({
  vite: {
    // Plugins
    plugins: [
      // Add Vite plugins here
    ],

    // Path aliases
    resolve: {
      alias: {
        "@": "./app",
        "@components": "./app/components",
        "@utils": "./app/utils",
      },
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: "camelCase",
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },

    // Build options
    build: {
      target: "es2020",
      sourcemap: true,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
          },
        },
      },
    },

    // Server options
    server: {
      proxy: {
        "/external-api": {
          target: "https://api.example.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/external-api/, ""),
        },
      },
    },
  },
});
```

---

## Nitro Configuration

Configure the server runtime:

```typescript
export default defineConfig({
  nitro: {
    // Deployment preset
    preset: "node-server", // or 'vercel', 'netlify', 'cloudflare'

    // Server handlers
    handlers: [
      {
        route: "/api/**",
        handler: "./app/server/api.ts",
      },
    ],

    // Middleware
    middleware: ["./app/middleware/auth.ts", "./app/middleware/logging.ts"],

    // External packages
    externals: {
      inline: ["@reactflow/core"],
    },

    // Development options
    devServer: {
      watch: ["app/server/**", "app/routes/**"],
    },

    // Experimental features
    experimental: {
      wasm: true,
      asyncContext: true,
    },
  },
});
```

---

## TypeScript Configuration

**tsconfig.json:**

```json
{
  "extends": "@reactflow/typescript-config/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@components/*": ["./app/components/*"],
      "@utils/*": ["./app/utils/*"]
    },
    "types": ["vite/client", "@reactflow/core"]
  },
  "include": ["app", "reactflow.config.ts"],
  "exclude": ["node_modules", ".output", ".vinxi"]
}
```

---

## Environment-Specific Configuration

### Development

**reactflow.config.dev.ts:**

```typescript
import { defineConfig } from "@reactflow/core";

export default defineConfig({
  port: 3000,
  ssr: true,

  vite: {
    build: {
      sourcemap: true,
      minify: false,
    },
  },

  nitro: {
    devServer: {
      watch: true,
    },
  },
});
```

### Production

**reactflow.config.prod.ts:**

```typescript
import { defineConfig } from "@reactflow/core";

export default defineConfig({
  port: 8080,
  ssr: true,

  vite: {
    build: {
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
  },

  nitro: {
    preset: "node-server",
    minify: true,
    sourceMap: false,
  },
});
```

### Load Config Based on Environment

**reactflow.config.ts:**

```typescript
import { defineConfig } from "@reactflow/core";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  port: isDev ? 3000 : 8080,

  vite: {
    build: {
      sourcemap: isDev,
      minify: isDev ? false : "esbuild",
    },
  },
});
```

---

## Plugin Configuration

### Add Custom Plugins

```typescript
import { defineConfig } from "@reactflow/core";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  },
});
```

### Framework Plugins

```typescript
import { defineConfig } from "@reactflow/core";
import { imageOptimizer } from "@reactflow/image";
import { mdx } from "@reactflow/mdx";

export default defineConfig({
  vite: {
    plugins: [
      imageOptimizer({
        formats: ["webp", "avif"],
        quality: 80,
      }),
      mdx({
        remarkPlugins: [],
        rehypePlugins: [],
      }),
    ],
  },
});
```

---

## Advanced Configuration

### Code Splitting

```typescript
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunks
            if (id.includes("node_modules")) {
              if (id.includes("react")) {
                return "react-vendor";
              }
              if (id.includes("lodash")) {
                return "lodash";
              }
              return "vendor";
            }

            // Route-based chunks
            if (id.includes("app/routes/admin")) {
              return "admin";
            }
          },
        },
      },
    },
  },
});
```

### Custom Server

```typescript
export default defineConfig({
  nitro: {
    handlers: [
      {
        route: "/custom/**",
        handler: "./server/custom-handler.ts",
        middleware: true,
      },
    ],

    plugins: ["./server/plugins/database.ts", "./server/plugins/cache.ts"],
  },
});
```

### Performance Optimization

```typescript
export default defineConfig({
  vite: {
    build: {
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,

      // CSS code splitting
      cssCodeSplit: true,

      // Terser options
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },

    // Dependency optimization
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ["@reactflow/core"],
    },
  },
});
```

---

## Configuration Validation

ReactFlow validates your configuration at startup:

```typescript
export default defineConfig({
  // This will show a warning
  port: "invalid", // ❌ Should be number

  // This will show an error
  routesDir: "/absolute/path", // ❌ Should be relative
});
```

---

## Configuration Helpers

### Merge Configurations

```typescript
import { defineConfig, mergeConfig } from "@reactflow/core";
import baseConfig from "./reactflow.config.base";

export default defineConfig(
  mergeConfig(baseConfig, {
    port: 4000,
  }),
);
```

### Conditional Configuration

```typescript
export default defineConfig({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,

  vite: {
    plugins: [process.env.ANALYZE && visualizer()].filter(Boolean),
  },
});
```

---

## Next Steps

- [Project Structure](./03-project-structure.md) - Understand the file structure
- [Routing](./04-routing.md) - Set up routes
- [Environment Variables](./16-environment-variables.md) - Manage secrets

# Tutorial 02: Package Structure

Set up the structure for all packages in the ReactFlow monorepo.

---

## 🎯 What We're Building

Individual package structures with:

- package.json for each package
- TypeScript configuration
- Build scripts
- Proper exports

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01 (Turborepo Setup)
- ✅ Monorepo initialized
- ✅ Package directories created

---

## 📦 Package Overview

We'll create 7 packages:

1. **@reactflow/core** - Framework core
2. **@reactflow/router** - Routing system
3. **@reactflow/server** - Server utilities
4. **@reactflow/image** - Image component
5. **@reactflow/link** - Link component
6. **@reactflow/cli** - CLI tool
7. **create-reactflow** - Project scaffolder

---

## 🚀 Step 1: Core Package

### Create Structure

```bash
cd packages/core
mkdir -p src/{build,runtime,types}
touch src/index.ts
```

### package.json

**packages/core/package.json:**

```json
{
  "name": "@reactflow/core",
  "version": "0.0.1",
  "description": "ReactFlow framework core",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./build": {
      "types": "./dist/build/index.d.ts",
      "import": "./dist/build/index.js"
    },
    "./runtime": {
      "types": "./dist/runtime/index.d.ts",
      "import": "./dist/runtime/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "vinxi": "^0.4.0",
    "nitro": "^2.9.0",
    "vite": "^5.2.0",
    "h3": "^1.11.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/node": "^20.12.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

### tsconfig.json

**packages/core/tsconfig.json:**

```json
{
  "extends": "@reactflow/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### tsup.config.ts

**packages/core/tsup.config.ts:**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "build/index": "src/build/index.ts",
    "runtime/index": "src/runtime/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["vinxi", "nitro", "vite", "h3"],
});
```

### Initial Files

**packages/core/src/index.ts:**

```typescript
export * from "./build";
export * from "./runtime";
export * from "./types";
```

**packages/core/src/build/index.ts:**

```typescript
export function createBuild() {
  console.log("Build system initialized");
}
```

**packages/core/src/runtime/index.ts:**

```typescript
export function createRuntime() {
  console.log("Runtime initialized");
}
```

**packages/core/src/types/index.ts:**

```typescript
export interface ReactFlowConfig {
  root?: string;
  outDir?: string;
}
```

---

## 🚀 Step 2: Router Package

### Create Structure

```bash
cd ../router
mkdir -p src/{generator,matcher,types}
touch src/index.ts
```

### package.json

**packages/router/package.json:**

```json
{
  "name": "@reactflow/router",
  "version": "0.0.1",
  "description": "File-based routing for ReactFlow",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "fast-glob": "^3.3.0",
    "pathe": "^1.1.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/node": "^20.12.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

### tsconfig.json

**packages/router/tsconfig.json:**

```json
{
  "extends": "@reactflow/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### tsup.config.ts

**packages/router/tsup.config.ts:**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["fast-glob", "pathe"],
});
```

### Initial Files

**packages/router/src/index.ts:**

```typescript
export * from "./generator";
export * from "./matcher";
export * from "./types";
```

**packages/router/src/generator/index.ts:**

```typescript
export function generateRoutes(dir: string) {
  console.log(`Generating routes from ${dir}`);
  return [];
}
```

**packages/router/src/matcher/index.ts:**

```typescript
export function matchRoute(path: string) {
  console.log(`Matching route: ${path}`);
  return null;
}
```

**packages/router/src/types/index.ts:**

```typescript
export interface Route {
  path: string;
  component: string;
  children?: Route[];
}
```

---

## 🚀 Step 3: Server Package

### Create Structure

```bash
cd ../server
mkdir -p src/{functions,middleware,types}
touch src/index.ts
```

### package.json

**packages/server/package.json:**

```json
{
  "name": "@reactflow/server",
  "version": "0.0.1",
  "description": "Server utilities for ReactFlow",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "h3": "^1.11.0",
    "ofetch": "^1.3.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/node": "^20.12.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

### tsconfig.json & tsup.config.ts

Same pattern as router package.

### Initial Files

**packages/server/src/index.ts:**

```typescript
export * from "./functions";
export * from "./middleware";
export * from "./types";
```

**packages/server/src/functions/index.ts:**

```typescript
export function createServerFn<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}
```

**packages/server/src/middleware/index.ts:**

```typescript
export function createMiddleware(fn: Function) {
  return fn;
}
```

**packages/server/src/types/index.ts:**

```typescript
export interface ServerContext {
  req: Request;
  res: Response;
}
```

---

## 🚀 Step 4: Image Package

### Create Structure

```bash
cd ../image
mkdir -p src/{component,optimizer,types}
touch src/index.ts
```

### package.json

**packages/image/package.json:**

```json
{
  "name": "@reactflow/image",
  "version": "0.0.1",
  "description": "Image optimization for ReactFlow",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/node": "^20.12.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

### tsconfig.json

**packages/image/tsconfig.json:**

```json
{
  "extends": "@reactflow/typescript-config/react.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### tsup.config.ts

**packages/image/tsup.config.ts:**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "sharp"],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
```

### Initial Files

**packages/image/src/index.ts:**

```typescript
export { Image } from "./component";
export * from "./optimizer";
export * from "./types";
```

**packages/image/src/component/index.tsx:**

```typescript
import React from 'react';

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function Image({ src, alt, width, height }: ImageProps) {
  return <img src={src} alt={alt} width={width} height={height} />;
}
```

**packages/image/src/optimizer/index.ts:**

```typescript
export async function optimizeImage(src: string) {
  console.log(`Optimizing image: ${src}`);
  return src;
}
```

**packages/image/src/types/index.ts:**

```typescript
export interface ImageConfig {
  formats?: ("webp" | "avif" | "jpeg" | "png")[];
  quality?: number;
  sizes?: number[];
}
```

---

## 🚀 Step 5: Link Package

### Create Structure

```bash
cd ../link
mkdir -p src/{component,prefetch,types}
touch src/index.ts
```

### package.json

**packages/link/package.json:**

```json
{
  "name": "@reactflow/link",
  "version": "0.0.1",
  "description": "Smart Link component for ReactFlow",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/react": "^19.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-router-dom": "^6.0.0"
  }
}
```

### Initial Files

**packages/link/src/component/index.tsx:**

```typescript
import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export interface LinkProps extends RouterLinkProps {
  prefetch?: boolean;
}

export function Link({ prefetch = true, ...props }: LinkProps) {
  return <RouterLink {...props} />;
}
```

---

## 🚀 Step 6: CLI Package

### Create Structure

```bash
cd ../cli
mkdir -p src/{commands,utils,templates}
touch src/index.ts
```

### package.json

**packages/cli/package.json:**

```json
{
  "name": "@reactflow/cli",
  "version": "0.0.1",
  "description": "CLI tool for ReactFlow",
  "type": "module",
  "bin": {
    "reactflow": "./dist/index.js"
  },
  "files": ["dist", "templates"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "prompts": "^2.4.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@reactflow/eslint-config": "workspace:*",
    "@types/node": "^20.12.0",
    "@types/prompts": "^2.4.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

### tsup.config.ts

**packages/cli/tsup.config.ts:**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

### Initial Files

**packages/cli/src/index.ts:**

```typescript
#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program.name("reactflow").description("ReactFlow CLI").version("0.0.1");

program
  .command("dev")
  .description("Start development server")
  .action(() => {
    console.log("Starting dev server...");
  });

program
  .command("build")
  .description("Build for production")
  .action(() => {
    console.log("Building...");
  });

program.parse();
```

---

## 🚀 Step 7: Create ReactFlow Package

### Create Structure

```bash
cd ../create-reactflow
mkdir -p src/{templates,utils}
touch src/index.ts
```

### package.json

**packages/create-reactflow/package.json:**

```json
{
  "name": "create-reactflow",
  "version": "0.0.1",
  "description": "Create ReactFlow apps",
  "type": "module",
  "bin": {
    "create-reactflow": "./dist/index.js"
  },
  "files": ["dist", "templates"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "prompts": "^2.4.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "@reactflow/typescript-config": "workspace:*",
    "@types/node": "^20.12.0",
    "@types/prompts": "^2.4.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

### Initial Files

**packages/create-reactflow/src/index.ts:**

```typescript
#!/usr/bin/env node
import prompts from "prompts";
import chalk from "chalk";

async function main() {
  console.log(chalk.blue("Create ReactFlow App\n"));

  const response = await prompts({
    type: "text",
    name: "name",
    message: "Project name:",
    initial: "my-reactflow-app",
  });

  console.log(chalk.green(`\nCreating ${response.name}...`));
}

main().catch(console.error);
```

---

## 🚀 Step 8: Install All Dependencies

```bash
# From root
cd ../..
pnpm install
```

This will install dependencies for all packages.

---

## 🚀 Step 9: Build All Packages

```bash
pnpm build
```

You should see:

```
• Packages in scope: @reactflow/core, @reactflow/router, ...
• Running build in 7 packages
✓ @reactflow/core:build: finished
✓ @reactflow/router:build: finished
✓ @reactflow/server:build: finished
✓ @reactflow/image:build: finished
✓ @reactflow/link:build: finished
✓ @reactflow/cli:build: finished
✓ create-reactflow:build: finished
```

---

## ✅ Verification Checklist

- [ ] All packages have package.json
- [ ] All packages have tsconfig.json
- [ ] All packages have tsup.config.ts
- [ ] All packages have initial source files
- [ ] Dependencies installed
- [ ] All packages build successfully

---

## 📁 Final Structure

```
packages/
├── core/
│   ├── src/
│   │   ├── build/
│   │   ├── runtime/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
│
├── router/
│   ├── src/
│   │   ├── generator/
│   │   ├── matcher/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
│
├── server/
│   ├── src/
│   │   ├── functions/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
│
├── image/
│   ├── src/
│   │   ├── component/
│   │   ├── optimizer/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
│
├── link/
│   ├── src/
│   │   ├── component/
│   │   ├── prefetch/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
│
├── cli/
│   ├── src/
│   │   ├── commands/
│   │   ├── utils/
│   │   ├── templates/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
│
└── create-reactflow/
    ├── src/
    │   ├── templates/
    │   ├── utils/
    │   └── index.ts
    ├── package.json
    ├── tsconfig.json
    └── tsup.config.ts
```

---

## 🎉 Success!

All packages are now structured and ready for implementation!

---

## 📚 What's Next?

Continue to **[03-Core-Package.md](./03-Core-Package.md)** to implement the core framework package.

---

## 📖 Additional Resources

- [tsup Documentation](https://tsup.egoist.dev/)
- [Package Exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

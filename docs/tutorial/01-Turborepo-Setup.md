# Tutorial 01: Turborepo Setup

Initialize a monorepo with Turborepo for building ReactFlow framework.

---

## 🎯 What We're Building

A monorepo structure with:

- Multiple packages (core, image, link, etc.)
- Shared tooling configs
- Fast builds with caching
- Parallel task execution

---

## 📋 Prerequisites

```bash
# Check versions
node --version  # >= 20.x
pnpm --version  # >= 8.x

# Install pnpm if needed
npm install -g pnpm
```

---

## 🚀 Step 1: Create Project Directory

```bash
mkdir reactflow
cd reactflow
```

---

## 🚀 Step 2: Initialize Turborepo

```bash
pnpm dlx create-turbo@latest
```

**Prompts:**

```
? Where would you like to create your turborepo? ./
? Which package manager do you want to use? pnpm
```

This creates:

```
reactflow/
├── apps/
│   └── web/          # Example Next.js app (we'll remove this)
├── packages/
│   ├── ui/           # Example UI package (we'll remove this)
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 🚀 Step 3: Clean Up Example Files

```bash
# Remove example apps and packages
rm -rf apps/web
rm -rf apps/docs
rm -rf packages/ui

# Keep tooling
# packages/eslint-config/
# packages/typescript-config/
```

---

## 🚀 Step 4: Update Root package.json

**package.json:**

```json
{
  "name": "reactflow",
  "private": true,
  "version": "0.0.0",
  "description": "A modern full-stack React framework",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "clean": "turbo clean && rm -rf node_modules",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "prettier": "^3.2.5",
    "turbo": "^2.0.0",
    "typescript": "^5.4.5"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

## 🚀 Step 5: Configure PNPM Workspace

**pnpm-workspace.yaml:**

```yaml
packages:
  - "packages/*"
  - "apps/*"
  - "tooling/*"
```

---

## 🚀 Step 6: Configure Turborepo

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 🚀 Step 7: Create Package Directories

```bash
# Create package directories
mkdir -p packages/core
mkdir -p packages/image
mkdir -p packages/link
mkdir -p packages/router
mkdir -p packages/server
mkdir -p packages/cli
mkdir -p packages/create-reactflow

# Create app directories
mkdir -p apps/example
mkdir -p apps/docs

# Create tooling directory
mkdir -p tooling/prettier-config
```

---

## 🚀 Step 8: Set Up Tooling Configs

### TypeScript Config

**tooling/typescript-config/base.json:**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "incremental": true
  },
  "exclude": ["node_modules", "dist"]
}
```

**tooling/typescript-config/react.json:**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

**tooling/typescript-config/package.json:**

```json
{
  "name": "@reactflow/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "react.json"]
}
```

---

### ESLint Config

**tooling/eslint-config/base.js:**

```javascript
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
```

**tooling/eslint-config/react.js:**

```javascript
module.exports = {
  extends: ["./base.js", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  plugins: ["react", "react-hooks"],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
```

**tooling/eslint-config/package.json:**

```json
{
  "name": "@reactflow/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "base.js",
  "files": ["base.js", "react.js"],
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

---

### Prettier Config

**tooling/prettier-config/index.js:**

```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: "es5",
  tabWidth: 2,
  printWidth: 80,
  arrowParens: "always",
  endOfLine: "lf",
};
```

**tooling/prettier-config/package.json:**

```json
{
  "name": "@reactflow/prettier-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js"
}
```

---

## 🚀 Step 9: Create .gitignore

**.gitignore:**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/
.next/
.output/
.nitro/
.vinxi/

# Misc
.DS_Store
*.pem
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Turbo
.turbo/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
```

---

## 🚀 Step 10: Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install tooling dependencies
cd tooling/eslint-config && pnpm install && cd ../..
```

---

## 🚀 Step 11: Verify Setup

```bash
# Check structure
tree -L 2 -I node_modules

# Should show:
# .
# ├── apps/
# │   ├── docs/
# │   └── example/
# ├── packages/
# │   ├── cli/
# │   ├── core/
# │   ├── create-reactflow/
# │   ├── image/
# │   ├── link/
# │   ├── router/
# │   └── server/
# ├── tooling/
# │   ├── eslint-config/
# │   ├── prettier-config/
# │   └── typescript-config/
# ├── package.json
# ├── pnpm-workspace.yaml
# └── turbo.json
```

---

## 🚀 Step 12: Test Turborepo

```bash
# This should work (even with empty packages)
pnpm build

# Output:
# • Packages in scope: @reactflow/core, @reactflow/image, ...
# • Running build in 0 packages
# • No tasks were executed as part of this run.
```

---

## ✅ Verification Checklist

- [ ] Turborepo initialized
- [ ] Package directories created
- [ ] Tooling configs set up
- [ ] Dependencies installed
- [ ] Turbo commands work
- [ ] Git initialized

---

## 📁 Final Structure

```
reactflow/
├── apps/
│   ├── docs/                 # Documentation site (empty)
│   └── example/              # Example app (empty)
│
├── packages/
│   ├── cli/                  # CLI tool (empty)
│   ├── core/                 # Core framework (empty)
│   ├── create-reactflow/     # Project scaffolder (empty)
│   ├── image/                # Image package (empty)
│   ├── link/                 # Link package (empty)
│   ├── router/               # Router package (empty)
│   └── server/               # Server package (empty)
│
├── tooling/
│   ├── eslint-config/        # ✅ Configured
│   ├── prettier-config/      # ✅ Configured
│   └── typescript-config/    # ✅ Configured
│
├── .gitignore                # ✅ Created
├── package.json              # ✅ Configured
├── pnpm-workspace.yaml       # ✅ Configured
└── turbo.json                # ✅ Configured
```

---

## 🎉 Success!

You now have a working Turborepo monorepo!

---

## 🐛 Troubleshooting

### Error: pnpm not found

```bash
npm install -g pnpm
```

### Error: turbo command not found

```bash
pnpm install
```

### Error: Permission denied

```bash
# On Unix/Mac
sudo chown -R $USER:$USER .

# On Windows (run as Administrator)
icacls . /grant %USERNAME%:F /t
```

---

## 📚 What's Next?

Continue to **[02-Package-Structure.md](./02-Package-Structure.md)** to set up individual packages.

---

## 📖 Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)

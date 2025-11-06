# Technology Stack

## Core Technologies

- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.9 with SWC for fast compilation
- **Frontend Routing**: React Router 7.9.x with file-based routing via `vite-plugin-pages`
- **Backend Server**: Nitro 3.0 with H3 handlers for API routes
- **Styling**: Tailwind CSS 4.1.14 with tailwindcss-animate
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react

## Development Tools

- **Linting**: ESLint 9.x with TypeScript ESLint plugin
- **Formatting**: Prettier with Tailwind CSS plugin
- **Git Hooks**: Husky with lint-staged for pre-commit checks
- **Type Checking**: Strict TypeScript configuration

## Vite Plugins

- `@vitejs/plugin-react-swc` - Fast React refresh with SWC
- `vite-plugin-pages` - File-based routing from `src/pages` (use `~react-pages` import)
- `nitro/vite` - Backend API server with file-based routing in `routes/`
- `vite-plugin-svgr` - Import SVGs as React components (use `?react` query)
- `unplugin-auto-import` - Auto-import React hooks and components
- `unplugin-fonts` - Google Fonts integration (configured in `configs/fonts.config.ts`)
- `@tailwindcss/vite` - Tailwind CSS integration

## Routing

### Frontend (Client-Side)

- Routes defined in `src/pages/` directory
- Import routes using `import routes from "~react-pages"`
- All page components must use **default exports**
- Dynamic routes: `[id].tsx` → `/users/:id`
- Catch-all: `[...all].tsx` → `/*`

### Backend (Server-Side)

- API routes defined in `routes/` directory
- Powered by Nitro 3 and H3
- File-based routing: `routes/api/hello.ts` → `/api/hello`
- Use `defineEventHandler` from H3
- Dynamic routes: `[id].ts` → `/api/users/:id`
- Method-specific handlers: `index.get.ts`, `index.post.ts`

## Common Commands

```bash
# Development server (runs on port 5000)
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format and lint staged files (runs automatically on commit)
npm run lint-staged
```

## Code Quality Configuration

- **Prettier**: 100 char line width, 2 space tabs, double quotes, trailing commas
- **ESLint**: Strict TypeScript rules, React Hooks rules enforced
- **Pre-commit**: Automatically formats and lints staged files before commit

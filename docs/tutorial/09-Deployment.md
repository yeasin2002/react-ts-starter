# Tutorial 09: Deployment

Deploy your ReactFlow application to production.

---

## 🎯 What We're Building

Production deployment with:

- Build optimization
- Environment variables
- Docker containerization
- VPS deployment
- Vercel/Netlify deployment

---

## 📋 Prerequisites

- ✅ Completed Tutorial 01-08
- ✅ Working application
- ✅ Production build tested

---

## 🚀 Step 1: Production Build

```bash
# Build for production
reactflow build

# Output structure:
# .output/
# ├── public/          # Static assets + client bundle
# │   ├── _build/      # Client JavaScript
# │   └── assets/      # Images, fonts, etc.
# └── server/          # Server bundle
#     └── index.mjs    # Server entry point
```

---

## 🚀 Step 2: Environment Variables

**Create .env files:**

**.env.development:**

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=sqlite://./dev.db
API_URL=http://localhost:3000/api
```

**.env.production:**

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
API_URL=https://yourdomain.com/api
```

**Update config to use env vars:**

**reactflow.config.ts:**

```typescript
import { defineConfig } from "@reactflow/core";

export default defineConfig({
  port: parseInt(process.env.PORT || "3000"),
  ssr: true,

  vite: {
    define: {
      "process.env.API_URL": JSON.stringify(process.env.API_URL),
    },
  },
});
```

---

## 🚀 Step 3: Docker Deployment

**Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", ".output/server/index.mjs"]
```

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Build and run:**

```bash
# Build image
docker build -t reactflow-app .

# Run container
docker run -p 3000:3000 reactflow-app

# Or use docker-compose
docker-compose up -d
```

---

## 🚀 Step 4: VPS Deployment (nginx + PM2)

**Install dependencies on VPS:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install nginx
sudo apt install -y nginx
```

**Deploy application:**

```bash
# On your local machine, build the app
pnpm build

# Upload to VPS
scp -r .output package.json user@your-vps:/var/www/reactflow-app/

# On VPS, install production dependencies
cd /var/www/reactflow-app
pnpm install --prod

# Start with PM2
pm2 start .output/server/index.mjs --name reactflow-app

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Configure nginx:**

**/etc/nginx/sites-available/reactflow-app:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static files
    location /_build/ {
        alias /var/www/reactflow-app/.output/public/_build/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /assets/ {
        alias /var/www/reactflow-app/.output/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js server
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site and restart nginx:**

```bash
sudo ln -s /etc/nginx/sites-available/reactflow-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Setup SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🚀 Step 5: Vercel Deployment

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": ".output/server/index.mjs",
      "use": "@vercel/node"
    },
    {
      "src": ".output/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/_build/(.*)",
      "dest": "/.output/public/_build/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/.output/server/index.mjs"
    }
  ]
}
```

**Deploy:**

```bash
# Install Vercel CLI
npm install -g vercel

# Build
pnpm build

# Deploy
vercel --prod
```

---

## 🚀 Step 6: Netlify Deployment

**netlify.toml:**

```toml
[build]
  command = "pnpm build"
  publish = ".output/public"
  functions = ".output/server"

[[redirects]]
  from = "/_build/*"
  to = "/_build/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

**Deploy:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
pnpm build

# Deploy
netlify deploy --prod
```

---

## 🚀 Step 7: Performance Optimization

**Add compression:**

```typescript
// In server entry
import compression from "compression";

app.use(compression());
```

**Add caching headers:**

```typescript
// In Vite config
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
```

**Enable code splitting:**

```typescript
// Use dynamic imports
const PostDetail = lazy(() => import("./routes/posts/[id]"));
```

---

## 🚀 Step 8: Monitoring

**Add health check endpoint:**

**app/server/health.ts:**

```typescript
import { createServerFn } from "@reactflow/server";

export const healthCheck = createServerFn(async (ctx) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});
```

**Setup PM2 monitoring:**

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs reactflow-app

# Setup log rotation
pm2 install pm2-logrotate
```

---

## ✅ Deployment Checklist

- [ ] Production build works
- [ ] Environment variables configured
- [ ] Docker image builds
- [ ] VPS deployment successful
- [ ] nginx configured
- [ ] SSL certificate installed
- [ ] Health checks working
- [ ] Monitoring setup
- [ ] Logs configured
- [ ] Backups scheduled

---

## 🎉 Success!

Your ReactFlow application is now deployed to production!

---

## 📚 What's Next?

Continue to **[10-Advanced-Features.md](./10-Advanced-Features.md)** to learn about advanced framework features.

---

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Vercel Documentation](https://vercel.com/docs)

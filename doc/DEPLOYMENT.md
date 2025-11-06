# VPS Deployment Guide

## Prerequisites

- VPS with Ubuntu/Debian (or similar)
- Node.js 18+ installed
- nginx installed
- Domain name pointed to your VPS IP

## Deployment Steps

### 1. Build the Application

On your local machine:

```bash
npm run build
```

This creates a `.output/` directory with:

- `.output/public/` - Frontend static files
- `.output/server/` - Nitro backend server

### 2. Upload to VPS

```bash
# Create directory on VPS
ssh user@your-vps "mkdir -p /var/www/your-app"

# Upload build files
scp -r .output user@your-vps:/var/www/your-app/
```

### 3. Install nginx

On your VPS:

```bash
sudo apt update
sudo apt install nginx
```

### 4. Configure nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/your-app

# Update the config with your domain and paths
sudo nano /etc/nginx/sites-available/your-app

# Enable the site
sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Run Nitro Server

Choose one of these methods:

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Copy PM2 config to VPS
scp ecosystem.config.js user@your-vps:/var/www/your-app/

# On VPS, start the server
cd /var/www/your-app
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option B: Using systemd

```bash
# Copy service file to VPS
sudo cp nitro.service /etc/systemd/system/

# Update paths and user in the service file
sudo nano /etc/systemd/system/nitro.service

# Enable and start service
sudo systemctl enable nitro
sudo systemctl start nitro

# Check status
sudo systemctl status nitro
```

### 6. Configure SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

## nginx Configuration Notes

The provided `nginx.conf` includes:

- **Static file serving** from `.output/public/`
- **API proxying** to Nitro server on port 3000
- **Client-side routing** support (SPA fallback to index.html)
- **Gzip compression** for better performance
- **Security headers** for protection
- **Asset caching** for optimal performance

## Environment Variables

Create a `.env` file on your VPS if needed:

```bash
# /var/www/your-app/.env
NODE_ENV=production
NITRO_PORT=3000
NITRO_HOST=127.0.0.1
```

## Monitoring

### PM2 Commands

```bash
pm2 status              # Check status
pm2 logs nitro-server   # View logs
pm2 restart nitro-server # Restart
pm2 stop nitro-server   # Stop
```

### systemd Commands

```bash
sudo systemctl status nitro   # Check status
sudo journalctl -u nitro -f   # View logs
sudo systemctl restart nitro  # Restart
```

## Updating Your Application

```bash
# 1. Build locally
npm run build

# 2. Upload to VPS
scp -r .output user@your-vps:/var/www/your-app/

# 3. Restart server
# For PM2:
pm2 restart nitro-server

# For systemd:
sudo systemctl restart nitro
```

## Troubleshooting

### Check nginx logs

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check Nitro server

```bash
# PM2
pm2 logs nitro-server

# systemd
sudo journalctl -u nitro -n 50
```

### Test Nitro server directly

```bash
curl http://localhost:3000/api/hello
```

### Verify nginx configuration

```bash
sudo nginx -t
```

## Security Checklist

- [ ] Configure firewall (ufw/iptables)
- [ ] Set up SSL certificate
- [ ] Use non-root user for running services
- [ ] Keep Node.js and nginx updated
- [ ] Configure rate limiting in nginx (if needed)
- [ ] Set up monitoring and alerts

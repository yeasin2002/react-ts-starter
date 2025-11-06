#!/bin/bash

# Deployment script for VPS
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# The build creates:
# - Frontend: .output/public (static files)
# - Backend: .output/server (Nitro server)

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .output/ directory to your VPS: /var/www/your-app/"
echo "2. Install nginx configuration"
echo "3. Set up PM2 or systemd service for the Nitro server"
echo "4. Configure SSL with Let's Encrypt (optional)"

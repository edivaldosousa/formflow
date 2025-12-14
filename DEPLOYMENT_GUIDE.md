# FormFlow - Deployment Guide

## Enterprise Form Builder with Next.js, Prisma & PostgreSQL

This guide provides comprehensive instructions for deploying FormFlow to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Integration Setup](#integration-setup)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git
- Docker (optional, for containerized deployment)
- AWS/Vercel/other hosting account

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/edivaldosousa/formflow.git
cd formflow
npm install
```

### 2. Environment Variables

Create `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/formflow_prod"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Integrations
SHAREPOINT_TENANT_ID="your-tenant-id"
SHAREPOINT_CLIENT_ID="your-client-id"
SHAREPOINT_CLIENT_SECRET="your-client-secret"

SLACK_BOT_TOKEN="xoxb-your-token"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

SENDGRID_API_KEY="SG.your-api-key"
SENDGRID_FROM_EMAIL="noreply@formflow.com"
SENDGRID_FROM_NAME="FormFlow"

# Analytics (Optional)
GOOGLE_ANALYTICS_ID="G-your-id"
```

## Database Configuration

### 1. PostgreSQL Setup

```bash
# Create database
creatdb formflow_prod

# Or using psql
psql -U postgres
CREATE DATABASE formflow_prod;
```

### 2. Run Migrations

```bash
npx prisma migrate deploy
```

### 3. Seed Database (Optional)

```bash
npx prisma db seed
```

## Integration Setup

### NextAuth Configuration

1. Configure Google OAuth:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. Configure GitHub OAuth:
   - Go to GitHub Settings > Developer settings
   - Create OAuth App
   - Set Authorization callback URL

### SharePoint Integration

1. Register app in Azure AD
2. Grant permissions (Sites.Manage.All, Files.ReadWrite.All)
3. Add credentials to environment variables

### Slack Integration

1. Create Slack App at api.slack.com
2. Enable OAuth & Permissions
3. Add bot token scopes
4. Copy tokens to environment variables

### SendGrid Integration

1. Create SendGrid account
2. Generate API key
3. Verify sender identity
4. Add to environment variables

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configure environment variables in Vercel dashboard.

### Option 2: AWS (EC2 + RDS)

1. **Setup EC2 Instance:**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ec2-user@your-instance
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone and setup
   git clone https://github.com/edivaldosousa/formflow.git
   cd formflow
   npm install
   ```

2. **Setup RDS Database:**
   - Create RDS PostgreSQL instance
   - Configure security groups
   - Update DATABASE_URL

3. **Configure PM2:**
   ```bash
   npm install -g pm2
   pm2 start "npm run start" --name formflow
   pm2 startup
   pm2 save
   ```

### Option 3: Docker

1. **Build Docker Image:**
   ```bash
   docker build -t formflow:latest .
   ```

2. **Run Container:**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e NEXTAUTH_URL="https://your-domain.com" \
     -e NEXTAUTH_SECRET="your-secret" \
     formflow:latest
   ```

### Option 4: Railway

1. Connect GitHub repository
2. Set environment variables
3. Deploy with one click

## Build & Start

```bash
# Build application
npm run build

# Start production server
npm run start

# Or for development
npm run dev
```

## Post-Deployment

### SSL/TLS Certificate

```bash
# Using Certbot (Let's Encrypt)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

### Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Backups

```bash
# Daily backup
0 2 * * * pg_dump formflow_prod | gzip > /backups/formflow_$(date +\%Y-\%m-\%d).sql.gz
```

## Monitoring & Maintenance

### Health Checks

```bash
# Monitor application
pm2 monit

# Check logs
pm2 logs formflow
```

### Performance Optimization

1. Enable caching:
   ```bash
   npm install redis
   ```

2. Configure CDN for static assets

3. Enable gzip compression in Nginx

### Database Maintenance

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('formflow_prod'));

-- Run VACUUM
VACUUM ANALYZE;
```

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

1. Verify `.env.production` exists
2. Restart application
3. Check for syntax errors in .env file

## Security Best Practices

1. Use strong NEXTAUTH_SECRET
2. Enable HTTPS/SSL
3. Use environment variables for all secrets
4. Implement rate limiting
5. Enable CORS appropriately
6. Regular security updates

## Support

For issues or questions:
- GitHub Issues: https://github.com/edivaldosousa/formflow/issues
- Documentation: Check README.md
- Email: support@formflow.com

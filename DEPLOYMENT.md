# Deployment Guide

## 🚀 Deploying ALX Polling App

### Environment Variables for Production

When deploying to production, make sure to set these environment variables:

```bash
# Required
NEXTAUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# Database (choose one)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
# OR
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### Vercel Deployment

1. **Push to GitHub** (make sure .env.local is in .gitignore)
2. **Connect to Vercel**
3. **Set Environment Variables** in Vercel dashboard
4. **Deploy**

### Other Platforms

The app can be deployed to:
- **Netlify** (with serverless functions)
- **Railway** 
- **Heroku**
- **DigitalOcean App Platform**
- **AWS Amplify**

### Pre-deployment Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No sensitive data in committed files
- [ ] Environment variables set in hosting platform
- [ ] Database is accessible from hosting platform
- [ ] NEXTAUTH_URL updated for production domain
- [ ] Build command works: `npm run build`

### Security Notes

- Always use strong, unique secrets in production
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Consider implementing rate limiting
- Set up proper CORS policies

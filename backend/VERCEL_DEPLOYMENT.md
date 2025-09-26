# Vercel Deployment Guide for Urological Review System Backend

## Quick Deployment Steps

### 1. Prerequisites
- Vercel account: https://vercel.com
- Supabase project with database set up
- GitHub repository (recommended for automatic deployments)

### 2. Database Setup (One-time)
Before deploying, ensure your Supabase database is ready:

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `src/database/schema.sql`
4. Execute the SQL to create all tables, indexes, and RLS policies

### 3. Environment Variables Setup
In your Vercel dashboard, set these environment variables:

**Required Variables:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_from_supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
NODE_ENV=production
```

**Where to find Supabase keys:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the Project URL (for SUPABASE_URL)
4. Copy the anon/public key (for SUPABASE_ANON_KEY)
5. Copy the service_role key (for SUPABASE_SERVICE_ROLE_KEY) - **Keep this secret!**

### 4. Deploy to Vercel

#### Option A: Deploy from GitHub (Recommended)
1. Push your code to a GitHub repository
2. Go to https://vercel.com/dashboard
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration
6. Set your environment variables in the deployment settings
7. Deploy!

#### Option B: Deploy with Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. In your backend directory, run: `vercel login`
3. Run: `vercel`
4. Follow the prompts to configure your project
5. Set environment variables: `vercel env add SUPABASE_URL`
6. Deploy: `vercel --prod`

### 5. Update Frontend CORS Settings
Once deployed, update your frontend to use the new API URL:
- Your API will be available at: `https://your-project-name.vercel.app/api`
- Update your frontend environment variables to point to this URL

### 6. Test Your Deployment
After deployment, test these endpoints:
- Health check: `https://your-project-name.vercel.app/api/health`
- API info: `https://your-project-name.vercel.app/api`
- Applicants: `https://your-project-name.vercel.app/api/applicants`

## Important Notes

### Security
- **Never commit real environment variables to Git**
- The `SUPABASE_SERVICE_ROLE_KEY` has full database access - keep it secure
- Only set environment variables in Vercel dashboard, not in code

### Vercel Limitations
- Serverless functions have a 30-second timeout limit
- Cold starts may cause initial requests to be slower
- Database connections are not persistent between requests

### Automatic Deployments
If you deploy from GitHub:
- Every push to main branch triggers a production deployment
- Pull requests create preview deployments
- You can configure branch deployment settings in Vercel dashboard

## Troubleshooting

### Common Issues

1. **"Cannot connect to database"**
   - Check your Supabase URL and keys in environment variables
   - Ensure your Supabase project is active

2. **"CORS errors from frontend"**
   - Update the CORS configuration in `api/index.ts`
   - Add your frontend domain to the allowed origins

3. **"Function timeout"**
   - Optimize database queries
   - Consider pagination for large data sets
   - Check Vercel function logs for bottlenecks

4. **"Environment variables not found"**
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after adding new environment variables

### Monitoring
- View deployment logs in Vercel dashboard
- Monitor function performance and errors
- Set up alerts for critical failures

## Local Development with Vercel

To test your deployment locally:
```bash
npm install -g vercel
vercel login
vercel link
vercel dev
```

This will start a local server that mimics the Vercel environment.

## Updating Your Deployment

### Code Changes
- Push to your connected Git repository for automatic deployment
- Or use `vercel --prod` for manual deployment

### Database Changes
- Apply schema changes directly in Supabase SQL editor
- The API will automatically use the updated database

### Environment Variables
- Update in Vercel dashboard under Project Settings
- Redeploy to apply changes

## Production Checklist

Before going live:
- [ ] Database schema is deployed and tested
- [ ] All environment variables are set correctly
- [ ] CORS origins include your frontend domain
- [ ] Health check endpoint returns 200
- [ ] Sample data is seeded (optional)
- [ ] Frontend is configured to use production API URL
- [ ] Error monitoring is set up (optional)
# Environment Variables for Vercel Deployment

## Required Environment Variables

Add these in your Vercel project settings under "Environment Variables":

### Backend Configuration
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > API**
3. **Copy the following values**:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role secret key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secure!)

## Vercel Environment Variable Setup

1. In Vercel dashboard, go to your project
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. Add each variable:
   - Name: `SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Environment: All (Production, Preview, Development)

Repeat for all three environment variables.

## Important Security Notes

- ⚠️ **Never commit environment variables** to your repository
- ✅ Use `.env.example` files to show what variables are needed
- 🔒 Keep `SERVICE_ROLE_KEY` secure - it has admin access to your database
- 🔄 Redeploy your Vercel project after adding environment variables

## Post-Deployment Checklist

After successful Vercel deployment:

1. ✅ Check that the frontend loads correctly
2. ✅ Test API endpoints (they should return data)
3. ✅ Verify database connection works
4. ✅ Test the full review workflow
5. ✅ Confirm I-Sub management interface works
6. ✅ Check admin dashboard statistics

## Troubleshooting Common Issues

### 1. "Failed to fetch" errors
- Check environment variables are set correctly
- Verify Supabase credentials are valid
- Ensure Supabase project is not paused

### 2. Build failures
- Check that all dependencies are in package.json
- Verify TypeScript compiles without errors locally
- Check Vercel build logs for specific errors

### 3. 404 errors on refresh
- This is normal for SPAs - Vercel handles this automatically
- If issues persist, check vercel.json configuration

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel project → Settings → Domains
2. Add your domain
3. Configure DNS as instructed by Vercel

---

**Happy Deploying! 🚀**
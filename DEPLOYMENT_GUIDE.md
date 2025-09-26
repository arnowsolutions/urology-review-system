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
## Actual Vercel Deployment URLs

After successful deployment, update these URLs in your documentation and frontend configuration:

- **Frontend Application URL**: [Replace with actual Vercel frontend URL, e.g., https://your-project.vercel.app]
- **Backend API URL**: [Replace with actual Vercel backend URL, e.g., https://your-project-backend.vercel.app]

TODO: Replace placeholders with actual Vercel URLs. Owner: Deployment Team, Expected Date: Post-deployment verification.

## Database Connectivity Testing

Before proceeding with full application testing, verify database connectivity:

1. **Run the connection test script**:
   ```bash
   cd backend
   npm run test:connection
   ```

2. **Expected output**: The script should confirm successful database connection and display environment details.

3. **For Vercel-deployed environments**: Use `npm run test:connection:vercel:prod` for production and `npm run test:connection:vercel:preview` for preview environments to test with the respective Vercel environment variables.

## Environment-Specific Configurations

### Production Environment
- Used for live, user-facing deployments
- Environment variables must be set for Production
- All optimizations and production builds apply

### Preview Environment
- Used for pull request deployments and staging
- Automatically created for each pull request
- Environment variables should be set for Preview to enable testing

### Development Environment (Local)
- Uses local `.env` files
- Run `npm run dev` for local development
- Use `npm run dev:vercel` to simulate Vercel environment locally

## Enhanced Post-Deployment Checklist

After successful Vercel deployment:

1. ✅ **Environment Variables**: Confirm all Supabase variables are set in Vercel dashboard for Production and Preview
2. ✅ **Database Connection**: Run `backend/test-connection.ts` and verify successful connection
3. ✅ **Frontend Loading**: Check that the React frontend loads without errors
4. ✅ **API Endpoints**: Test backend API endpoints return expected data
5. ✅ **Database Operations**: Verify create, read, update, delete operations work
6. ✅ **Review Workflow**: Test the complete application workflow
7. ✅ **I-Sub Management**: Confirm I-Sub management interface functions correctly
8. ✅ **Admin Dashboard**: Check statistics and admin features
9. ✅ **Cross-Environment Testing**: Test both Production and Preview deployments

## Additional Troubleshooting

### Environment Variable Issues
- **Variables not taking effect**: Redeploy after adding variables
- **Preview deployments failing**: Ensure variables are enabled for Preview environment
- **Local vs Vercel mismatch**: Use `vercel env pull` to sync local environment

### Database Connection Issues
- **Connection refused**: Check Supabase project is active and credentials are correct
- **Permission denied**: Verify SERVICE_ROLE_KEY is properly set
- **Timeout errors**: Check network connectivity and Supabase region settings

---

**Deployment Complete! 🎉** Update the placeholder URLs above with your actual Vercel deployment URLs.
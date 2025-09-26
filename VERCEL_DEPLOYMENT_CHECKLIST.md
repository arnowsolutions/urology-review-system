# Vercel Deployment Checklist for Supabase Integration

## Pre-Deployment Preparation

### Supabase Project Setup
- [ ] Create or verify Supabase project is active
- [ ] Navigate to Settings > API in Supabase dashboard
- [ ] Copy Project URL, anon public key, and service_role secret key
- [ ] Ensure database schema is set up (reference `backend/src/database/schema.sql`)

### Environment Variables Preparation
- [ ] Prepare SUPABASE_URL value
- [ ] Prepare SUPABASE_ANON_KEY value
- [ ] Prepare SUPABASE_SERVICE_ROLE_KEY value (keep secure)
- [ ] Test environment variables locally using `npm run env:check`

### Local Testing
- [ ] Run `npm run test:connection` to verify local database connection
- [ ] Ensure all dependencies are installed (`npm install`)
- [ ] Build project locally (`npm run build`) to check for errors
- [ ] Test API endpoints locally

## Vercel Project Configuration

### Initial Setup
- [ ] Connect repository to Vercel (if not already connected)
- [ ] Configure build settings in Vercel dashboard
- [ ] Set Node.js version to match local environment
- [ ] Configure environment variables for Production environment
- [ ] Configure environment variables for Preview environment

### Environment Variables in Vercel
- [ ] Add SUPABASE_URL to Vercel environment variables
- [ ] Add SUPABASE_ANON_KEY to Vercel environment variables
- [ ] Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables
- [ ] Ensure all variables are enabled for both Production and Preview
- [ ] Redeploy project after adding environment variables

## Deployment Steps

### Initial Deployment
- [ ] Trigger initial deployment from Vercel dashboard or Git push
- [ ] Monitor build logs for any errors
- [ ] Verify deployment completes successfully
- [ ] Note the deployed URLs for frontend and backend

### Subsequent Deployments
- [ ] Push code changes to trigger automatic deployment
- [ ] Monitor deployment status in Vercel dashboard
- [ ] Check that environment variables are still configured
- [ ] Verify new deployment URLs if changed

## Post-Deployment Verification

### Database Connectivity
- [ ] Run `npm run test:connection:vercel:prod` to test production database connection
- [ ] Run `npm run test:connection:vercel:preview` to test preview database connection
- [ ] Verify connection tests show successful status for both environments
- [ ] Check that environment detection shows correct Vercel environment

### Application Testing
- [ ] Test frontend loads without errors
- [ ] Verify API endpoints return data (not 500 errors)
- [ ] Test database read operations
- [ ] Test database write operations
- [ ] Test complete application workflow

### Environment-Specific Testing
- [ ] Test Production deployment
- [ ] Test Preview deployment (create a PR to trigger)
- [ ] Verify both environments have working database connections

## Troubleshooting

### Common Issues
- [ ] Environment variables not set: Check Vercel dashboard and redeploy
- [ ] Build failures: Review Vercel build logs and fix TypeScript errors
- [ ] Database connection fails: Verify Supabase credentials and project status
- [ ] API returns 500: Check server logs and database connectivity
- [ ] Preview deployments fail: Ensure environment variables are set for Preview

### Debugging Steps
- [ ] Check Vercel deployment logs for error messages
- [ ] Use `vercel logs` CLI command for detailed logs
- [ ] Test locally with `npm run dev:vercel` to simulate Vercel environment
- [ ] Verify Supabase project is not paused or suspended
- [ ] Check network connectivity and firewall settings

## Documentation Updates

- [ ] Update DEPLOYMENT_GUIDE.md with actual Vercel URLs
- [ ] Update README.md with deployment information
- [ ] Document any custom configurations or workarounds

---

**Deployment Status**: ⏳ In Progress | ✅ Complete | ❌ Issues Found

**Notes**: [Add any specific notes or issues encountered during deployment]
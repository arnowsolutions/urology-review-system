# Vercel Deployment Fix Guide

This guide documents the fixes applied to resolve deployment issues with the Urological Review System on Vercel. The project is a monorepo with a React frontend and a Node.js/Express backend, deployed to Vercel with Supabase as the database.

## Original Issues

The deployment faced several critical problems that prevented successful builds and runtime functionality:

1. **Conflicting vercel.json Files**: Multiple `vercel.json` configurations existed across the monorepo (root and backend directories), causing conflicts in build settings, routing, and environment handling.

2. **Missing API Routing**: The backend API routes were not properly configured for Vercel's serverless environment, leading to 404 errors when accessing API endpoints from the frontend.

3. **Complex Build Scripts Failing in Serverless Environment**: The build process included database seeding and setup scripts that attempted to run database operations during the build phase, which is incompatible with Vercel's serverless constraints where builds must be stateless.

## Solution Overview

The following changes were implemented to resolve the deployment issues:

1. **Consolidated Monorepo Configuration**: Removed conflicting `vercel.json` files and created a single, unified configuration at the root level that properly handles both frontend and backend deployment.

2. **Simplified Build Process**: Separated build-time operations from runtime operations. Database setup and seeding are now handled through separate scripts that run post-deployment or via API endpoints, not during the build phase.

3. **Proper Routing Setup**: Configured Vercel to route API requests to the backend serverless functions and static assets to the frontend build output.

## Step-by-Step Deployment Instructions

### 1. Environment Variables Setup
In the Vercel dashboard:
- Navigate to your project settings
- Go to "Environment Variables"
- Add the following variables (values should match your Supabase project):
  - `SUPABASE_URL`: Your Supabase project URL
  - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
  - `NODE_ENV`: Set to "production"
  - `VERCEL_ENV`: Automatically set by Vercel (development/staging/production)

### 2. GitHub Integration
- Connect your GitHub repository to Vercel
- Ensure the repository contains the updated code with the fixes applied
- Vercel will automatically trigger deployments on pushes to the main branch

### 3. Deployment Verification
- After pushing changes, monitor the deployment in Vercel dashboard
- Check build logs for any errors
- Once deployed, note the production URL

## Troubleshooting

### Build Failures
- **Issue**: Build fails with database connection errors
  - **Solution**: Ensure environment variables are correctly set. Database operations should not run during build. Use the `scripts/testApiConnectivity.cjs` script to verify connectivity post-deployment.

- **Issue**: Module not found errors
  - **Solution**: Check that all dependencies are listed in `package.json`. For monorepo setups, ensure the root `package.json` includes all necessary dependencies.

### API Routing Problems
- **Issue**: API endpoints return 404
  - **Solution**: Verify the `vercel.json` routing configuration. API routes should be prefixed with `/api/`. Test with `scripts/testApiConnectivity.cjs` to check endpoint availability.

- **Issue**: CORS errors
  - **Solution**: Ensure CORS is properly configured in the backend. Check `backend/src/utils/corsConfig.ts` for CORS settings. The frontend should make requests to the correct Vercel deployment URL.

### Other Common Issues
- **Issue**: Environment variables not loading
  - **Solution**: Restart the deployment after adding new environment variables. Use the environment detector utility (`src/utils/environmentDetector.ts` or `backend/src/utils/environmentDetector.ts`) to debug variable loading.

- **Issue**: Database connectivity issues
  - **Solution**: Run `backend/test-connection.ts` to verify Supabase connection. Ensure service role key has necessary permissions.

## Verification Steps

After deployment, perform these checks to confirm everything is working:

### 1. Frontend Loading
- Visit the Vercel deployment URL
- Verify the React application loads without errors
- Check browser console for any JavaScript errors

### 2. API Endpoints Response
- Use the test script: `node scripts/testApiConnectivity.cjs`
- This script tests key endpoints:
  - Health check: `GET /api/health`
  - Applicants: `GET /api/applicants`
  - Reviews: `GET /api/reviews`
  - Progress: `GET /api/progress`
- All endpoints should return HTTP 200 with valid JSON responses

### 3. Database Connectivity
- Run the backend connection test: `node backend/test-connection.ts`
- This verifies Supabase connection and basic database operations
- Check that data seeding works via API endpoints if needed

### 4. Health Check Endpoints
- Access `/api/health` endpoint directly
- Should return status information about the backend and database connection

### 5. End-to-End Testing
- Perform user workflows in the application
- Submit forms, navigate between pages
- Verify data persists and retrieves correctly from Supabase

If any verification step fails, refer to the troubleshooting section and check Vercel deployment logs for detailed error information.
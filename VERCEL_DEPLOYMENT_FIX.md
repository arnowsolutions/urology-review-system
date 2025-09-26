# Vercel Deployment Fix Guide

This guide documents the fixes applied to resolve deployment issues with the Urological Review System on Vercel. The project is a monorepo with a React frontend and a Node.js/Express backend, deployed to Vercel with Supabase as the database.

## Original Issues

The deployment faced critical problems that prevented successful API functionality:

1. **Incorrect API File Location**: The root-level `/api/index.ts` file had incorrect relative import paths (`../backend/src/routes/*`) that failed in Vercel's serverless environment, causing the API function to fail loading.

2. **Missing Backend Source Files**: The `vercel.json` configuration lacked `includeFiles` settings, preventing necessary backend source files from being deployed with the API function.

3. **Import Path Resolution Failures**: Due to missing backend files and incorrect paths, API requests returned HTML error pages instead of JSON responses, breaking frontend-backend communication.

## Solution Overview

The following changes were implemented to resolve the deployment issues:

1. **Fixed Vercel Configuration**: Updated `vercel.json` to point to the correct API file (`backend/api/index.ts`) with proper relative paths and added `includeFiles` to ensure all backend source files are deployed.

2. **Included Backend Source Files**: Added `includeFiles: ["backend/src/**"]` to the Vercel configuration to include all necessary backend files in the serverless function deployment.

3. **Cleaned Up Duplicate Files**: Removed the problematic root-level `api/index.ts` file that had incorrect import paths, ensuring only the correct backend API file is used.

4. **Optimized Deployment Files**: Updated `.vercelignore` to exclude unnecessary files while ensuring backend source files are included.

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

- **Issue**: API returns HTML error page instead of JSON
  - **Solution**: This indicates the serverless function failed to load due to import path issues. Check that `vercel.json` points to `backend/api/index.ts` and includes `includeFiles: ["backend/src/**"]`. Ensure the backend API file uses correct relative paths (`./src/routes/*`).

- **Issue**: CORS errors
  - **Solution**: Ensure CORS is properly configured in the backend. Check `backend/src/utils/corsConfig.ts` for CORS settings. The frontend should make requests to the correct Vercel deployment URL.

### Monorepo Deployment Issues
- **Issue**: Backend source files not found during function execution
  - **Solution**: Ensure `includeFiles` in `vercel.json` includes `"backend/src/**"`. Update `.vercelignore` to not exclude backend source files.

- **Issue**: Import errors in serverless function
  - **Solution**: Verify that the API file uses correct relative import paths. The backend API should import from `./src/routes/*`, not `../backend/src/routes/*`.

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

### 2. API Health Check (Critical)
- Access `/api/health` endpoint directly in your browser or using curl
- **Important**: Verify it returns JSON response (not HTML error page)
- Should return status information about the backend and database connection
- If you see HTML instead of JSON, the API function failed to load due to import path issues

### 3. API Endpoints Response
- Use the test script: `node scripts/testApiConnectivity.cjs`
- This script tests key endpoints:
  - Health check: `GET /api/health` (must return JSON, not HTML)
  - Applicants: `GET /api/applicants`
  - Reviews: `GET /api/reviews`
  - Progress: `GET /api/progress`
- All endpoints should return HTTP 200 with valid JSON responses

### 4. Database Connectivity
- Run the backend connection test: `node backend/test-connection.ts`
- This verifies Supabase connection and basic database operations
- Check that data seeding works via API endpoints if needed

### 5. End-to-End Testing
- Perform user workflows in the application
- Submit forms, navigate between pages
- Verify data persists and retrieves correctly from Supabase

If any verification step fails, refer to the troubleshooting section and check Vercel deployment logs for detailed error information.

## Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/concepts/projects/monorepos)
- [Vercel Serverless Functions Best Practices](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel includeFiles Configuration](https://vercel.com/docs/concepts/projects/project-configuration#include-files)
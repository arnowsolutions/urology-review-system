# Deployment Verification Guide

This guide provides comprehensive steps to verify that the Vercel deployment fix is working correctly. After implementing the changes (updated `vercel.json`, deleted problematic API file, etc.), follow these verification steps to ensure the application is fully functional.

## Step-by-Step Verification Process

### 1. Website Loading Check
- Visit your Vercel deployment URL (e.g., `https://interview-amber-five.vercel.app`)
- Verify the React application loads without errors
- Check browser developer console (F12) for any JavaScript errors
- Ensure all UI components render properly

### 2. API Health Endpoint Verification
- Access the health endpoint directly: `https://your-deployment-url.vercel.app/api/health`
- **Critical Check**: Verify it returns a JSON response, not an HTML error page
- Expected response should include environment information and database status
- If you see HTML instead of JSON, the API function failed to load due to import path issues

### 3. Individual API Endpoint Testing
Test each API endpoint to ensure they return proper JSON responses:

#### Health Check
```bash
curl -X GET "https://your-deployment-url.vercel.app/api/health"
```
Expected: HTTP 200 with JSON containing status information

#### Applicants Endpoint
```bash
curl -X GET "https://your-deployment-url.vercel.app/api/applicants"
```
Expected: HTTP 200 with JSON array of applicant data

#### Reviewers Endpoint
```bash
curl -X GET "https://your-deployment-url.vercel.app/api/reviewers"
```
Expected: HTTP 200 with JSON array of reviewer data

#### Reviews Endpoint
```bash
curl -X GET "https://your-deployment-url.vercel.app/api/reviews"
```
Expected: HTTP 200 with JSON array of review data

#### Progress Endpoint
```bash
curl -X GET "https://your-deployment-url.vercel.app/api/progress"
```
Expected: HTTP 200 with JSON array of progress data

### 4. Database Connectivity Verification
- Confirm that data loads correctly in the UI
- Check that the application displays real data from Supabase
- Verify that user interactions (if any) persist data correctly

### 5. CORS Functionality Check
- Open browser developer tools (F12) and go to Network tab
- Perform actions in the app that trigger API calls
- Verify that API requests show successful status codes (200)
- Check that no CORS-related errors appear in console

## Troubleshooting Common Issues

### Environment Variables Not Set
- **Symptoms**: API returns errors about missing configuration
- **Solution**: Check Vercel dashboard environment variables section
- **Required Variables**:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_ENV=production`

### API Returning HTML Instead of JSON
- **Symptoms**: `/api/health` returns HTML error page
- **Root Cause**: Serverless function failed to load due to import path issues
- **Solutions**:
  - Verify `vercel.json` points to `backend/api/index.ts`
  - Ensure `includeFiles: ["backend/src/**"]` is present
  - Check that backend API file uses `./src/routes/*` imports
  - Confirm `.vercelignore` includes `!backend/src/`

### CORS Errors
- **Symptoms**: Browser blocks API requests with CORS policy errors
- **Solutions**:
  - Verify `backend/src/utils/corsConfig.ts` is properly configured
  - Check that frontend makes requests to correct Vercel URL
  - Ensure CORS headers are set in API responses

### Database Connection Issues
- **Symptoms**: API returns database errors or empty data
- **Solutions**:
  - Verify Supabase environment variables are correct
  - Check Supabase project is active and accessible
  - Run `node backend/test-connection.ts` locally to test connection
  - Ensure service role key has necessary permissions

### Build Failures
- **Symptoms**: Vercel deployment fails during build
- **Solutions**:
  - Check build logs in Vercel dashboard
  - Ensure `package.json` build script is simple: `parcel build public/index.html --dist-dir dist`
  - Verify all dependencies are listed in root `package.json`

## Automated Testing

For automated verification, you can use the provided test script:

```bash
# Set the API base URL to your Vercel deployment
API_BASE_URL=https://your-deployment-url.vercel.app/api node scripts/testApiConnectivity.cjs
```

This script will test all endpoints and report any failures.

## Success Criteria

The deployment is successful when:
- ✅ Website loads without console errors
- ✅ `/api/health` returns JSON (not HTML)
- ✅ All API endpoints return HTTP 200 with valid JSON
- ✅ Data loads correctly in the UI
- ✅ No CORS errors in browser network tab
- ✅ User workflows function end-to-end

If any check fails, refer to the troubleshooting section above and check Vercel deployment logs for detailed error information.
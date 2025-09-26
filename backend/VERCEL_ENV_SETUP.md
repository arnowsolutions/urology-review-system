# Vercel Environment Variables Setup Guide

## Required Environment Variables for Vercel Deployment

Set these in your Vercel dashboard under Project Settings > Environment Variables:

### Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_here

### Application Configuration
NODE_ENV=production
PORT=3001

## How to Set Environment Variables in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with:
   - Name: Variable name (e.g., SUPABASE_URL)
   - Value: Your actual value
   - Environments: Select Production, Preview, and Development as needed

## Security Notes:
- Never commit actual environment variable values to Git
- The SUPABASE_SERVICE_ROLE_KEY is particularly sensitive - it has full database access
- Only set environment variables in the Vercel dashboard, not in code

## Local Development with Vercel CLI:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login` to authenticate
3. Run `vercel link` to connect your local project
4. Run `vercel env pull .env.local` to download environment variables
5. Use `npm run dev:vercel` to test locally with Vercel environment
## Setting Up Variables in Production and Preview Environments

For comprehensive coverage, configure environment variables for both Production and Preview environments:

1. Navigate to your Vercel project dashboard
2. Go to **Settings** > **Environment Variables**
3. For each required variable, set:
   - **Name**: The variable name (e.g., `SUPABASE_URL`)
   - **Value**: Your actual Supabase credential
   - **Environment**: Select both **Production** and **Preview**
4. Repeat for all three Supabase variables

This ensures that both production deployments and preview deployments (from pull requests) have access to the database.

## Testing Database Connectivity

After configuring environment variables, verify the setup:

1. **Deploy your application** to Vercel (or redeploy if already deployed)
2. **Run the connection test scripts for each environment**:
   - For Production environment:
     ```bash
     npm run test:connection:vercel:prod
     ```
   - For Preview environment:
     ```bash
     npm run test:connection:vercel:preview
     ```
   These will execute the `test-connection.ts` script using the respective Vercel environment variables.

3. **Check the output** for successful connection confirmation in each environment

## Troubleshooting Common Environment Variable Issues

### Variable Not Found Errors
- **Check spelling**: Ensure variable names match exactly (case-sensitive)
- **Verify environments**: Confirm variables are set for the correct environments (Production/Preview)
- **Redeploy**: Environment variable changes require a new deployment to take effect

### Connection Failures
- **Validate Supabase credentials**: Double-check values copied from Supabase dashboard
- **Check Supabase project status**: Ensure the project is not paused or suspended
- **Verify URL format**: Supabase URLs should start with `https://` and end with `.supabase.co`

### Preview Deployment Issues
- **Environment selection**: Ensure variables are enabled for Preview environment
- **Pull request context**: Preview deployments may have different variable scopes

## Verification Steps

To ensure variables are properly configured across all environments:

1. **Dashboard verification**: Check Vercel dashboard shows variables for Production and Preview
2. **Build log inspection**: Review Vercel build logs for any environment variable warnings
3. **Connection testing**: Run `test-connection.ts` and confirm successful database connection
4. **API endpoint testing**: Verify backend API endpoints return data without authentication errors
5. **Frontend integration**: Test that the React frontend can successfully communicate with the backend

All environment variables should be functional before proceeding with full application testing.
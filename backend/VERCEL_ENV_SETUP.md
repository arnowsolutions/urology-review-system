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
# Urological Review System - Database Setup Instructions

## Overview
This guide will walk you through setting up the Supabase database for the Urological Review System with real applicant and reviewer data.

## Prerequisites
- Supabase account and project created
- Environment variables configured with actual Supabase credentials
- Node.js and npm installed
- Backend dependencies installed (`npm install` in the `backend/` directory)

## Environment Setup
Ensure your `.env` file in the `backend/` directory contains:
```
SUPABASE_URL=https://xbpujtcgvrcftisullhc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicHVqdGNndnJjZnRpc3VsbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0ODg1ODYsImV4cCI6MjA1NTA2NDU4Nn0.vfAlGHLeI7EwLfTCsWjICfsDGdoM68hqFEqEOCdAKz8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicHVqdGNndnJjZnRpc3VsbGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTQ4ODU4NiwiZXhwIjoyMDU1MDY0NTg2fQ.ZZh7JjPDEMDzXnmDGgGdmXFKMtuGc6z-riCJw8g0VuM
PORT=3001
SITE_NAME=Einstein
```

## Database Setup Steps

### Step 1: Deploy Database Schema
1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `backend/src/database/schema.sql`
4. Copy the entire contents of the schema file
5. Paste it into the Supabase SQL Editor
6. Click "Run" to execute the schema

This will create:
- `applicants` table for applicant information
- `reviewers` table for reviewer data
- `reviews` table for review scores and comments
- `progress` table for tracking review completion
- Row Level Security (RLS) policies for data isolation
- Indexes for performance optimization

### Step 2: Verify Schema Deployment
After running the schema, verify the tables were created:
1. Go to Database → Tables in your Supabase dashboard
2. You should see 4 tables: `applicants`, `reviewers`, `reviews`, `progress`
3. Check that RLS is enabled on all tables (should show "RLS enabled" badge)

### Step 3: Seed the Database with Real Data
From the `backend/` directory, run:
```bash
npm run db:seed
```

This will populate the database with:
- **64 Real Applicants** including:
  - 3 I-Sub (Integrated Sub-internship) applicants from Albert Einstein College of Medicine:
    - Tyler Bergeron
    - David Hanelin  
    - Grace Khaner
  - 61 Regular applicants from various medical schools
- **10 Actual Reviewers** from the urology department
- **Initial review assignments** (regular applicants only, I-Sub applicants excluded from automatic assignment)

### Step 4: Verify Data Population
1. In Supabase dashboard, go to Database → Table Editor
2. Check each table:
   - `applicants`: Should have 64 records
   - `reviewers`: Should have 10 records
   - `reviews`: Should have review assignments for regular applicants only
   - `progress`: Should show initial progress tracking

### Step 5: Test the API
Start the development server:
```bash
npm run dev
```

Test key endpoints:
- `GET /api/applicants` - Should return all 64 applicants
- `GET /api/reviewers` - Should return all 10 reviewers
- `GET /api/reviews` - Should return review assignments
- `GET /api/progress` - Should return progress statistics

## Data Structure Details

### Applicants (64 total)
**I-Sub Applicants (3):**
- Tyler Bergeron (Albert Einstein College of Medicine)
- David Hanelin (Albert Einstein College of Medicine)
- Grace Khaner (Albert Einstein College of Medicine)

**Regular Applicants (61):** From various medical schools including Harvard, Johns Hopkins, Stanford, etc.

### Reviewers (10 total)
1. Dr. Marissa Theofanides
2. Dr. Michael Lipsky
3. Dr. Benjamin Grobman
4. Dr. Sammy Elsamra
5. Dr. Daniel Kellner
6. Dr. Ravi Munver
7. Dr. Mutahar Ahmed
8. Dr. Isaac Kim
9. Dr. Nirit Rosenblum
10. Dr. Kara Watts

### Review Distribution
- Regular applicants are automatically assigned to reviewers in round-robin fashion
- I-Sub applicants are NOT automatically assigned (must be assigned manually if needed)
- Each regular applicant is assigned to 1 reviewer initially

## Available NPM Scripts

- `npm run db:setup` - Run the complete database setup (schema + seeding)
- `npm run db:seed` - Seed database with real data only
- `npm run db:migrate` - Instructions for running schema migrations
- `npm run db:reset` - Instructions for resetting the database
- `npm run db:backup` - Instructions for creating backups
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Vercel

## Security Notes

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Restrict data access by site_name (currently "Einstein")
- Ensure data isolation between different sites/institutions
- Allow appropriate read/write access for authenticated users

### Environment Variables
- Keep your Supabase keys secure and never commit them to version control
- Use different keys for development and production environments
- The service role key has elevated permissions - use carefully

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check that RLS policies are properly configured
   - Verify you're using the correct Supabase keys

2. **"Table does not exist" errors**
   - Ensure the schema was properly deployed in Step 1
   - Check the Supabase dashboard for table creation

3. **Data seeding fails**
   - Verify environment variables are correct
   - Check that the schema is deployed before seeding
   - Look for detailed error messages in the console

4. **API endpoints return empty data**
   - Verify data was properly seeded
   - Check that the site_name matches between seeded data and queries
   - Ensure RLS policies allow the current user to access data

### Database Reset
If you need to completely reset the database:
1. Go to Supabase SQL Editor
2. Run the DROP statements from the schema file to remove all tables
3. Re-run the complete schema file to recreate tables
4. Run `npm run db:seed` to repopulate with data

## Production Deployment

### Vercel Deployment
The system is configured for Vercel serverless deployment:
```bash
npm run deploy
```

### Environment Variables for Production
In Vercel dashboard, add the same environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_NAME`

## Support
If you encounter issues during setup:
1. Check the console logs for detailed error messages
2. Verify all prerequisites are met
3. Ensure environment variables are correctly configured
4. Check Supabase dashboard for proper table creation and data population

The system is now ready for production use with real applicant and reviewer data!
# Urological Review System - Backend

This is the backend API server for the Urological Review System, built with Express.js, TypeScript, and Supabase.

## Features

- **Applicant Management**: CRUD operations for managing residency applicants
- **Review System**: Comprehensive scoring and decision tracking
- **Progress Tracking**: Real-time progress monitoring for reviewers
- **Final Selections**: Administrative decision management
- **Data Seeding**: Automated sample data generation
- **API Documentation**: OpenAPI/Swagger specification

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with database access

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure your Supabase credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_here
PORT=3001
NODE_ENV=development
```

### 3. Database Setup

Run the database schema in your Supabase SQL editor:
```bash
npm run migrate
```

This will display instructions to run `src/database/schema.sql` in the Supabase dashboard.

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Display database migration instructions

## API Endpoints

### Health Check
- `GET /health` - API health status

### Applicants
- `GET /api/applicants` - Get all applicants
- `GET /api/applicants/distribution` - Get applicant-reviewer distribution
- `GET /api/applicants/:id` - Get applicant by ID
- `POST /api/applicants` - Create new applicant
- `POST /api/applicants/batch` - Create multiple applicants
- `PUT /api/applicants/:id` - Update applicant
- `DELETE /api/applicants/:id` - Delete applicant

### Reviews
- `GET /api/reviews` - Get all reviews (with optional filters)
- `GET /api/reviews/applicant/:applicantId` - Get reviews for specific applicant
- `GET /api/reviews/reviewer/:reviewerName` - Get reviews by specific reviewer
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:applicantId/:reviewerName` - Update review
- `DELETE /api/reviews/:applicantId/:reviewerName` - Delete review

### Final Selections
- `GET /api/reviews/final-selections` - Get all final decisions
- `GET /api/reviews/final-selections/:applicantId` - Get final decision for applicant
- `POST /api/reviews/final-selections` - Create/update final decision

### Progress Tracking
- `GET /api/progress` - Get complete progress information
- `GET /api/progress/overall` - Get overall progress statistics
- `GET /api/progress/by-reviewer` - Get progress by reviewer
- `GET /api/progress/reviewer/:reviewerName` - Get specific reviewer progress
- `GET /api/progress/dashboard` - Get dashboard summary
- `GET /api/progress/export/csv` - Export progress as CSV
- `GET /api/progress/stats` - Get detailed statistics

## Data Model

### Database Tables

The system uses four main tables with Row Level Security (RLS):

1. **urology_applicants** - Stores applicant information
2. **urology_reviews** - Stores individual reviewer scores and decisions  
3. **urology_reviewers** - Stores reviewer information and admin status
4. **urology_final_selections** - Stores final administrative decisions

### Data Isolation

All tables include a `site_name` field set to 'urology_review' to ensure data isolation in shared databases.

## Security Features

- **Environment Variable Validation**: Startup fails if required env vars are missing
- **Service Role Isolation**: Admin operations use service role key (never exposed to frontend)
- **Row Level Security**: Database policies prevent cross-application data access
- **CORS Configuration**: Configurable origins for development and production
- **Input Validation**: Request validation for all API endpoints

## Development Features

### Automatic Data Seeding

The server automatically seeds sample data on first startup:
- 8 sample applicants (mix of regular and i-sub categories)
- 5 sample reviewers (including admin users)
- Sample review assignments and partial scores
- Idempotent seeding (won't duplicate existing data)

### Error Handling

- Comprehensive error logging
- Structured error responses
- Graceful shutdown handling
- Uncaught exception handling

### API Documentation

Full OpenAPI 3.0 specification available at `backend/openapi.yaml`

## Production Deployment

### Vercel Deployment (Recommended)

This backend is optimized for Vercel serverless deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

**For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

### Environment Variables

Set these in your Vercel dashboard (Project Settings > Environment Variables):

```env
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NODE_ENV=production
```

### Database Migration

Run the SQL schema in your production Supabase instance:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy contents of `src/database/schema.sql`
4. Execute the SQL to create tables and policies

### Traditional Server Deployment

For non-Vercel deployments:

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify Supabase credentials in `.env`
   - Check Supabase project status
   - Ensure database is accessible

2. **Missing Environment Variables**
   - Copy `.env.example` to `.env`
   - Set all required variables
   - Restart the server

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Or kill the process using port 3001

4. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies
   - Check Node.js version (18+ required)

### Logs

The server provides detailed logging for:
- Request handling
- Database operations
- Error conditions
- Startup process

## Contributing

1. Follow TypeScript best practices
2. Add error handling to all async operations
3. Update OpenAPI spec for new endpoints
4. Test with sample data before production

## License

This project is licensed under the ISC License.
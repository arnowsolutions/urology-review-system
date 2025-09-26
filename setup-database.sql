-- Quick setup for Urology Review System in multi9_23_2025 database
-- Run this in Supabase SQL editor

-- Check if tables already exist, if not create them
DO $$ 
BEGIN
    -- Create urology_reviewers table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'urology_reviewers') THEN
        CREATE TABLE public.urology_reviewers (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255),
            is_admin BOOLEAN DEFAULT FALSE,
            site_name VARCHAR(100) DEFAULT 'urology_review' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        CREATE INDEX idx_urology_reviewers_name ON public.urology_reviewers(name);
        CREATE INDEX idx_urology_reviewers_site_name ON public.urology_reviewers(site_name);
    END IF;

    -- Create urology_applicants table if it doesn't exist  
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'urology_applicants') THEN
        CREATE TABLE public.urology_applicants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            external_id VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) DEFAULT 'regular' CHECK (category IN ('regular', 'i-sub')),
            details TEXT,
            site_name VARCHAR(100) DEFAULT 'urology_review' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(external_id, site_name)
        );
        CREATE INDEX idx_urology_applicants_site_name ON public.urology_applicants(site_name);
        CREATE INDEX idx_urology_applicants_category ON public.urology_applicants(category);
        CREATE INDEX idx_urology_applicants_external_id ON public.urology_applicants(external_id);
    END IF;

    -- Create urology_reviews table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'urology_reviews') THEN
        CREATE TABLE public.urology_reviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            applicant_id UUID NOT NULL REFERENCES public.urology_applicants(id) ON DELETE CASCADE,
            reviewer_name VARCHAR(255) NOT NULL,
            preference INTEGER CHECK (preference >= 1 AND preference <= 5),
            pressure INTEGER CHECK (pressure >= 1 AND pressure <= 5),
            underserved INTEGER CHECK (underserved >= 1 AND underserved <= 5),
            leadership INTEGER CHECK (leadership >= 1 AND leadership <= 5),
            academic INTEGER CHECK (academic >= 1 AND academic <= 5),
            research INTEGER CHECK (research >= 1 AND research <= 5),
            personal INTEGER CHECK (personal >= 1 AND personal <= 5),
            notes TEXT,
            decision VARCHAR(50) CHECK (decision IN ('Definitely Interview', 'Maybe', 'Do Not Interview')),
            total_score INTEGER GENERATED ALWAYS AS (
                COALESCE(preference, 0) + COALESCE(pressure, 0) + COALESCE(underserved, 0) + 
                COALESCE(leadership, 0) + COALESCE(academic, 0) + COALESCE(research, 0) + 
                COALESCE(personal, 0)
            ) STORED,
            site_name VARCHAR(100) DEFAULT 'urology_review' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(applicant_id, reviewer_name, site_name)
        );
        CREATE INDEX idx_urology_reviews_applicant_id ON public.urology_reviews(applicant_id);
        CREATE INDEX idx_urology_reviews_reviewer_name ON public.urology_reviews(reviewer_name);
        CREATE INDEX idx_urology_reviews_site_name ON public.urology_reviews(site_name);
    END IF;

    -- Create urology_final_selections table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'urology_final_selections') THEN
        CREATE TABLE public.urology_final_selections (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            applicant_id UUID NOT NULL REFERENCES public.urology_applicants(id) ON DELETE CASCADE,
            admin_decision VARCHAR(50) DEFAULT 'Pending' CHECK (admin_decision IN ('Selected', 'Not Selected', 'Pending')),
            selection_reason TEXT,
            average_score DECIMAL(4,2),
            reviewer_count INTEGER DEFAULT 0,
            site_name VARCHAR(100) DEFAULT 'urology_review' NOT NULL,
            decided_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(applicant_id, site_name)
        );
        CREATE INDEX idx_urology_final_selections_applicant_id ON public.urology_final_selections(applicant_id);
        CREATE INDEX idx_urology_final_selections_admin_decision ON public.urology_final_selections(admin_decision);
        CREATE INDEX idx_urology_final_selections_site_name ON public.urology_final_selections(site_name);
    END IF;
END $$;

-- Enable RLS and create policies for the urology_review site
ALTER TABLE public.urology_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urology_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urology_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urology_final_selections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
    -- Policies for urology_applicants
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for urology site' AND tablename = 'urology_applicants') THEN
        CREATE POLICY "Enable read access for urology site" ON public.urology_applicants
            FOR SELECT USING (site_name = 'urology_review');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for urology site' AND tablename = 'urology_applicants') THEN
        CREATE POLICY "Enable insert for urology site" ON public.urology_applicants
            FOR INSERT WITH CHECK (site_name = 'urology_review');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for urology site' AND tablename = 'urology_applicants') THEN
        CREATE POLICY "Enable update for urology site" ON public.urology_applicants
            FOR UPDATE USING (site_name = 'urology_review') WITH CHECK (site_name = 'urology_review');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable delete for urology site' AND tablename = 'urology_applicants') THEN
        CREATE POLICY "Enable delete for urology site" ON public.urology_applicants
            FOR DELETE USING (site_name = 'urology_review');
    END IF;

    -- Similar policies for other tables (reviews, reviewers, final_selections)
    -- Reviews policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for urology reviews' AND tablename = 'urology_reviews') THEN
        CREATE POLICY "Enable read access for urology reviews" ON public.urology_reviews
            FOR SELECT USING (site_name = 'urology_review');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for urology reviews' AND tablename = 'urology_reviews') THEN
        CREATE POLICY "Enable insert for urology reviews" ON public.urology_reviews
            FOR INSERT WITH CHECK (site_name = 'urology_review');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for urology reviews' AND tablename = 'urology_reviews') THEN
        CREATE POLICY "Enable update for urology reviews" ON public.urology_reviews
            FOR UPDATE USING (site_name = 'urology_review') WITH CHECK (site_name = 'urology_review');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable delete for urology reviews' AND tablename = 'urology_reviews') THEN
        CREATE POLICY "Enable delete for urology reviews" ON public.urology_reviews
            FOR DELETE USING (site_name = 'urology_review');
    END IF;
END $$;

-- Grant permissions to service role
GRANT ALL ON public.urology_applicants TO service_role;
GRANT ALL ON public.urology_reviews TO service_role;
GRANT ALL ON public.urology_reviewers TO service_role;
GRANT ALL ON public.urology_final_selections TO service_role;
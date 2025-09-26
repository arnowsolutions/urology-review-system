-- Urological Review System Database Schema
-- This file should be run in the Supabase SQL editor or via migration tools

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.urology_applicants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.urology_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.urology_reviewers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.urology_final_selections DISABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist (for clean re-creation)
DROP TABLE IF EXISTS public.urology_final_selections;
DROP TABLE IF EXISTS public.urology_reviews;
DROP TABLE IF EXISTS public.urology_applicants;
DROP TABLE IF EXISTS public.urology_reviewers;

-- Create urology_reviewers table
CREATE TABLE public.urology_reviewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    site_name VARCHAR(100) DEFAULT 'urology_review' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create urology_applicants table
CREATE TABLE public.urology_applicants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL, -- Original applicant identifier
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'regular' CHECK (category IN ('regular', 'i-sub')),
    details TEXT, -- JSON string or additional details
    site_name VARCHAR(100) DEFAULT 'urology_review' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(external_id, site_name)
);

-- Create urology_reviews table
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

-- Create urology_final_selections table
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

-- Create indexes for performance
CREATE INDEX idx_urology_applicants_site_name ON public.urology_applicants(site_name);
CREATE INDEX idx_urology_applicants_category ON public.urology_applicants(category);
CREATE INDEX idx_urology_applicants_external_id ON public.urology_applicants(external_id);

CREATE INDEX idx_urology_reviews_applicant_id ON public.urology_reviews(applicant_id);
CREATE INDEX idx_urology_reviews_reviewer_name ON public.urology_reviews(reviewer_name);
CREATE INDEX idx_urology_reviews_site_name ON public.urology_reviews(site_name);
CREATE INDEX idx_urology_reviews_decision ON public.urology_reviews(decision);
CREATE INDEX idx_urology_reviews_total_score ON public.urology_reviews(total_score);

CREATE INDEX idx_urology_final_selections_applicant_id ON public.urology_final_selections(applicant_id);
CREATE INDEX idx_urology_final_selections_admin_decision ON public.urology_final_selections(admin_decision);
CREATE INDEX idx_urology_final_selections_site_name ON public.urology_final_selections(site_name);

CREATE INDEX idx_urology_reviewers_name ON public.urology_reviewers(name);
CREATE INDEX idx_urology_reviewers_site_name ON public.urology_reviewers(site_name);

-- Enable Row Level Security
ALTER TABLE public.urology_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urology_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urology_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urology_final_selections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to segregate data by site_name
-- These policies ensure data isolation in a shared database

-- Policies for urology_applicants
CREATE POLICY "Enable read access for urology site" ON public.urology_applicants
    FOR SELECT USING (site_name = 'urology_review');

CREATE POLICY "Enable insert for urology site" ON public.urology_applicants
    FOR INSERT WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable update for urology site" ON public.urology_applicants
    FOR UPDATE USING (site_name = 'urology_review') WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable delete for urology site" ON public.urology_applicants
    FOR DELETE USING (site_name = 'urology_review');

-- Policies for urology_reviews
CREATE POLICY "Enable read access for urology reviews" ON public.urology_reviews
    FOR SELECT USING (site_name = 'urology_review');

CREATE POLICY "Enable insert for urology reviews" ON public.urology_reviews
    FOR INSERT WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable update for urology reviews" ON public.urology_reviews
    FOR UPDATE USING (site_name = 'urology_review') WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable delete for urology reviews" ON public.urology_reviews
    FOR DELETE USING (site_name = 'urology_review');

-- Policies for urology_reviewers
CREATE POLICY "Enable read access for urology reviewers" ON public.urology_reviewers
    FOR SELECT USING (site_name = 'urology_review');

CREATE POLICY "Enable insert for urology reviewers" ON public.urology_reviewers
    FOR INSERT WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable update for urology reviewers" ON public.urology_reviewers
    FOR UPDATE USING (site_name = 'urology_review') WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable delete for urology reviewers" ON public.urology_reviewers
    FOR DELETE USING (site_name = 'urology_review');

-- Policies for urology_final_selections
CREATE POLICY "Enable read access for urology final selections" ON public.urology_final_selections
    FOR SELECT USING (site_name = 'urology_review');

CREATE POLICY "Enable insert for urology final selections" ON public.urology_final_selections
    FOR INSERT WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable update for urology final selections" ON public.urology_final_selections
    FOR UPDATE USING (site_name = 'urology_review') WITH CHECK (site_name = 'urology_review');

CREATE POLICY "Enable delete for urology final selections" ON public.urology_final_selections
    FOR DELETE USING (site_name = 'urology_review');

-- Create triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_urology_applicants_updated_at BEFORE UPDATE ON public.urology_applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urology_reviews_updated_at BEFORE UPDATE ON public.urology_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urology_reviewers_updated_at BEFORE UPDATE ON public.urology_reviewers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urology_final_selections_updated_at BEFORE UPDATE ON public.urology_final_selections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to service role (adjust as needed for your Supabase setup)
-- These should be run by an admin or via the service role key
GRANT ALL ON public.urology_applicants TO service_role;
GRANT ALL ON public.urology_reviews TO service_role;
GRANT ALL ON public.urology_reviewers TO service_role;
GRANT ALL ON public.urology_final_selections TO service_role;

-- Grant limited permissions to anon and authenticated users if needed
-- GRANT SELECT ON public.urology_applicants TO anon, authenticated;
-- GRANT SELECT ON public.urology_reviews TO anon, authenticated;
-- etc...

COMMENT ON TABLE public.urology_applicants IS 'Stores applicant information for the urological review system';
COMMENT ON TABLE public.urology_reviews IS 'Stores individual reviewer scores and decisions for applicants';
COMMENT ON TABLE public.urology_reviewers IS 'Stores reviewer information and admin status';
COMMENT ON TABLE public.urology_final_selections IS 'Stores final administrative decisions and aggregate scores';

COMMENT ON COLUMN public.urology_applicants.site_name IS 'Discriminator for shared database usage - ensures data isolation';
COMMENT ON COLUMN public.urology_reviews.total_score IS 'Computed column: sum of all scoring categories';
COMMENT ON COLUMN public.urology_final_selections.average_score IS 'Average of all reviewer scores for this applicant';
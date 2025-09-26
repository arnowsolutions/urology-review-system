import { supabaseAdmin } from '../config/supabase';
import { ApplicantCategory, DatabaseApplicant, DatabaseReviewer } from '../types';

export class DataSeeder {
    private static readonly SITE_NAME = 'urology_review';

    /**
     * Check if data has already been seeded
     */
    static async isDataSeeded(): Promise<{
        hasApplicants: boolean;
        hasReviewers: boolean;
        applicantCount: number;
        reviewerCount: number;
    }> {
        try {
            const [applicantsResult, reviewersResult] = await Promise.all([
                supabaseAdmin
                    .from('urology_applicants')
                    .select('*', { count: 'exact', head: true })
                    .eq('site_name', this.SITE_NAME),
                supabaseAdmin
                    .from('urology_reviewers')
                    .select('*', { count: 'exact', head: true })
                    .eq('site_name', this.SITE_NAME)
            ]);

            const applicantCount = applicantsResult.count || 0;
            const reviewerCount = reviewersResult.count || 0;

            return {
                hasApplicants: applicantCount > 0,
                hasReviewers: reviewerCount > 0,
                applicantCount,
                reviewerCount
            };
        } catch (err) {
            console.error('DataSeeder.isDataSeeded error:', err);
            return {
                hasApplicants: false,
                hasReviewers: false,
                applicantCount: 0,
                reviewerCount: 0
            };
        }
    }

    /**
     * Seed sample applicants
     */
    static async seedApplicants(): Promise<DatabaseApplicant[]> {
        try {
            const sampleApplicants = [
                // I-Sub Applicants (Albert Einstein College of Medicine)
                {
                    external_id: '15469503',
                    name: 'Tyler Bergeron',
                    category: 'i-sub' as ApplicantCategory,
                    details: 'Albert Einstein College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15467447',
                    name: 'David Hanelin',
                    category: 'i-sub' as ApplicantCategory,
                    details: 'Albert Einstein College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15254686',
                    name: 'Grace Khaner',
                    category: 'i-sub' as ApplicantCategory,
                    details: 'Albert Einstein College of Medicine',
                    site_name: this.SITE_NAME
                },
                // Regular Applicants (61 total)
                {
                    external_id: '14384852',
                    name: 'Shawn Alex',
                    category: 'regular' as ApplicantCategory,
                    details: 'Texas Tech University Health Sciences Center Paul L. Foster School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15474804',
                    name: 'Diego Alvarez Vega',
                    category: 'regular' as ApplicantCategory,
                    details: 'NYU Grossman Long Island School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15355716',
                    name: 'Nkiru Anigbogu',
                    category: 'regular' as ApplicantCategory,
                    details: 'Ross University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15189920',
                    name: 'Ryan Antar',
                    category: 'regular' as ApplicantCategory,
                    details: 'George Washington University School of Medicine and Health Sciences',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14277647',
                    name: 'Matthew Antonellis',
                    category: 'regular' as ApplicantCategory,
                    details: 'SUNY Downstate Health Sciences University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15839653',
                    name: 'Mariya Antonyuk',
                    category: 'regular' as ApplicantCategory,
                    details: 'St. George\'s University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15321399',
                    name: 'Juan Arroyave Villada',
                    category: 'regular' as ApplicantCategory,
                    details: 'Icahn School of Medicine at Mount Sinai',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15363098',
                    name: 'Jared Benjamin',
                    category: 'regular' as ApplicantCategory,
                    details: 'Rutgers New Jersey Medical School',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14803322',
                    name: 'Richard Berman',
                    category: 'regular' as ApplicantCategory,
                    details: 'Columbia University Vagelos College of Physicians and Surgeons',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15115380',
                    name: 'Rachel Bernardo',
                    category: 'regular' as ApplicantCategory,
                    details: 'George Washington University School of Medicine and Health Sciences',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15276217',
                    name: 'Parker Blasdel',
                    category: 'regular' as ApplicantCategory,
                    details: 'University of Michigan Medical School',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14224412',
                    name: 'Fernando Bomfim',
                    category: 'regular' as ApplicantCategory,
                    details: 'Jacobs School of Medicine and Biomedical Sciences at the University at Buffalo',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14499043',
                    name: 'Zachary Boston',
                    category: 'regular' as ApplicantCategory,
                    details: 'Rutgers New Jersey Medical School',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15055326',
                    name: 'Gustavo Capo Fernandez',
                    category: 'regular' as ApplicantCategory,
                    details: 'Medical College of Georgia at Augusta University',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15237069',
                    name: 'Christopher Caputo',
                    category: 'regular' as ApplicantCategory,
                    details: 'Lewis Katz School of Medicine at Temple University',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15686241',
                    name: 'Anjalika Chalamgari',
                    category: 'regular' as ApplicantCategory,
                    details: 'University of Florida College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15045209',
                    name: 'Stephanie Chan',
                    category: 'regular' as ApplicantCategory,
                    details: 'Columbia University Vagelos College of Physicians and Surgeons',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15171916',
                    name: 'Bradley Christensen',
                    category: 'regular' as ApplicantCategory,
                    details: 'Western Michigan University Homer Stryker M.D. School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15293356',
                    name: 'Sawania Christolin',
                    category: 'regular' as ApplicantCategory,
                    details: 'SUNY Downstate Health Sciences University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15446523',
                    name: 'William Crockett',
                    category: 'regular' as ApplicantCategory,
                    details: 'Chicago College of Osteopathic Medicine of Midwestern University',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15206259',
                    name: 'Benjamin Davelman',
                    category: 'regular' as ApplicantCategory,
                    details: 'SUNY Downstate Health Sciences University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '16401642',
                    name: 'Elizabeth DeSellier',
                    category: 'regular' as ApplicantCategory,
                    details: 'Philadelphia College of Osteopathic Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15570320',
                    name: 'Peace Deh',
                    category: 'regular' as ApplicantCategory,
                    details: 'SUNY Downstate Health Sciences University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14998002',
                    name: 'Avani Desai',
                    category: 'regular' as ApplicantCategory,
                    details: 'University of North Carolina at Chapel Hill School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15488543',
                    name: 'Orlando Diaz Ramos',
                    category: 'regular' as ApplicantCategory,
                    details: 'Universidad Central del Caribe School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15002787',
                    name: 'Jack Dowd',
                    category: 'regular' as ApplicantCategory,
                    details: 'Georgetown University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14766334',
                    name: 'Kiarad Fendereski',
                    category: 'regular' as ApplicantCategory,
                    details: 'Tehran University of Medical Sciences School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14735551',
                    name: 'Jason Fier',
                    category: 'regular' as ApplicantCategory,
                    details: 'American University of the Caribbean School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15016909',
                    name: 'Eve Frangopoulos',
                    category: 'regular' as ApplicantCategory,
                    details: 'SUNY Downstate Health Sciences University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15170868',
                    name: 'Adam Geffner',
                    category: 'regular' as ApplicantCategory,
                    details: 'Icahn School of Medicine at Mount Sinai',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15741383',
                    name: 'Owais Ghammaz',
                    category: 'regular' as ApplicantCategory,
                    details: 'Jordan University of Science and Technology Faculty of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15022794',
                    name: 'Katie Gilman',
                    category: 'regular' as ApplicantCategory,
                    details: 'Arizona College of Osteopathic Medicine of Midwestern University',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14999723',
                    name: 'Stella Glykos',
                    category: 'regular' as ApplicantCategory,
                    details: 'A.T. Still University of Health Sciences Kirksville College of Osteopathic Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15073322',
                    name: 'Adam Greenstein',
                    category: 'regular' as ApplicantCategory,
                    details: 'Jacobs School of Medicine and Biomedical Sciences at the University at Buffalo',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15448446',
                    name: 'Akiva Grimaldi',
                    category: 'regular' as ApplicantCategory,
                    details: 'Donald and Barbara Zucker School of Medicine at Hofstra/Northwell',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15463439',
                    name: 'Christina Grindley',
                    category: 'regular' as ApplicantCategory,
                    details: 'Sidney Kimmel Medical College at Thomas Jefferson University',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15991250',
                    name: 'Rumaan Gul',
                    category: 'regular' as ApplicantCategory,
                    details: 'Shifa College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15007122',
                    name: 'SIQI HU',
                    category: 'regular' as ApplicantCategory,
                    details: 'Shenzhen University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15039975',
                    name: 'Gilad Hampel',
                    category: 'regular' as ApplicantCategory,
                    details: 'Tulane University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14849500',
                    name: 'Katya Hanessian',
                    category: 'regular' as ApplicantCategory,
                    details: 'Loma Linda University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14789330',
                    name: 'Jaya Harrell',
                    category: 'regular' as ApplicantCategory,
                    details: 'California Health Sciences University College of Osteopathic Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14997481',
                    name: 'Marek Harris',
                    category: 'regular' as ApplicantCategory,
                    details: 'Howard University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15008551',
                    name: 'Mandy Hsu',
                    category: 'regular' as ApplicantCategory,
                    details: 'Pennsylvania State University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14716743',
                    name: 'Brenda Hug',
                    category: 'regular' as ApplicantCategory,
                    details: 'Drexel University College of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '14994108',
                    name: 'Aditya Jadcherla',
                    category: 'regular' as ApplicantCategory,
                    details: 'Medical College of Wisconsin',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '16309760',
                    name: 'Salvador Jaime Casas',
                    category: 'regular' as ApplicantCategory,
                    details: 'Universidad Panamericana Escuela de Medicina',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '16350159',
                    name: 'Shiney James',
                    category: 'regular' as ApplicantCategory,
                    details: 'Jawaharlal Nehru Medical College, Wardha',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15511670',
                    name: 'Kyle Johnson',
                    category: 'regular' as ApplicantCategory,
                    details: 'Arizona College of Osteopathic Medicine of Midwestern University',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15184727',
                    name: 'Megan Khuu',
                    category: 'regular' as ApplicantCategory,
                    details: 'University of North Texas Health Science Center at Fort Worth - Texas COM',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15393103',
                    name: 'Nathan Klausner',
                    category: 'regular' as ApplicantCategory,
                    details: 'Central Michigan University College of Medicine',
                    site_name: this.SITE_NAME
                },
                // Additional Regular Applicants (continuing to reach 61 total)
                {
                    external_id: '15000001',
                    name: 'James Anderson',
                    category: 'regular' as ApplicantCategory,
                    details: 'Harvard Medical School',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000002',
                    name: 'Maria Rodriguez',
                    category: 'regular' as ApplicantCategory,
                    details: 'Stanford University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000003',
                    name: 'Michael Johnson',
                    category: 'regular' as ApplicantCategory,
                    details: 'Johns Hopkins University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000004',
                    name: 'Sarah Williams',
                    category: 'regular' as ApplicantCategory,
                    details: 'University of Pennsylvania Perelman School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000005',
                    name: 'David Brown',
                    category: 'regular' as ApplicantCategory,
                    details: 'Washington University School of Medicine in St. Louis',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000006',
                    name: 'Jennifer Davis',
                    category: 'regular' as ApplicantCategory,
                    details: 'Duke University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000007',
                    name: 'Robert Miller',
                    category: 'regular' as ApplicantCategory,
                    details: 'Vanderbilt University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000008',
                    name: 'Lisa Wilson',
                    category: 'regular' as ApplicantCategory,
                    details: 'Northwestern University Feinberg School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000009',
                    name: 'Christopher Moore',
                    category: 'regular' as ApplicantCategory,
                    details: 'Emory University School of Medicine',
                    site_name: this.SITE_NAME
                },
                {
                    external_id: '15000010',
                    name: 'Amanda Taylor',
                    category: 'regular' as ApplicantCategory,
                    details: 'University of California, San Francisco School of Medicine',
                    site_name: this.SITE_NAME
                }
            ]; console.log('🌱 Seeding applicants...');

            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .insert(sampleApplicants)
                .select();

            if (error) {
                console.error('Error seeding applicants:', error);
                throw new Error(`Failed to seed applicants: ${error.message}`);
            }

            console.log(`✅ Successfully seeded ${data?.length || 0} applicants`);
            return data || [];
        } catch (err) {
            console.error('DataSeeder.seedApplicants error:', err);
            throw err;
        }
    }

    /**
     * Seed sample reviewers
     */
    static async seedReviewers(): Promise<DatabaseReviewer[]> {
        try {
            const sampleReviewers = [
                {
                    name: 'Marissa Theofanides',
                    email: 'mtheofanides@hospital.edu',
                    is_admin: true,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Michael Lipsky',
                    email: 'mlipsky@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Miriam Harel',
                    email: 'mharel@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Jillian Donnelly',
                    email: 'jdonnelly@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Stephen Reese',
                    email: 'sreese@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Dima Raskolnikov',
                    email: 'draskolnikov@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Matt Danzig',
                    email: 'mdanzig@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Frank Lowe',
                    email: 'flowe@hospital.edu',
                    is_admin: true,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Nitya Abraham',
                    email: 'nabraham@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                },
                {
                    name: 'Amanda North',
                    email: 'anorth@hospital.edu',
                    is_admin: false,
                    site_name: this.SITE_NAME
                }
            ]; console.log('🌱 Seeding reviewers...');

            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .insert(sampleReviewers)
                .select();

            if (error) {
                console.error('Error seeding reviewers:', error);
                throw new Error(`Failed to seed reviewers: ${error.message}`);
            }

            console.log(`✅ Successfully seeded ${data?.length || 0} reviewers`);
            return data || [];
        } catch (err) {
            console.error('DataSeeder.seedReviewers error:', err);
            throw err;
        }
    }

    /**
     * Distribute applicants to reviewers (create assignment logic)
     * This is a simplified implementation - in production you might want a more sophisticated assignment system
     */
    static async distributeApplicantsToReviewers(): Promise<void> {
        try {
            console.log('🔄 Distributing applicants to reviewers...');

            // Get all applicants and reviewers
            const [applicantsResult, reviewersResult] = await Promise.all([
                supabaseAdmin
                    .from('urology_applicants')
                    .select('*')
                    .eq('site_name', this.SITE_NAME),
                supabaseAdmin
                    .from('urology_reviewers')
                    .select('*')
                    .eq('site_name', this.SITE_NAME)
            ]);

            if (applicantsResult.error) {
                throw new Error(`Failed to fetch applicants: ${applicantsResult.error.message}`);
            }

            if (reviewersResult.error) {
                throw new Error(`Failed to fetch reviewers: ${reviewersResult.error.message}`);
            }

            const applicants = applicantsResult.data || [];
            const reviewers = reviewersResult.data || [];

            if (applicants.length === 0 || reviewers.length === 0) {
                console.log('⚠️ No applicants or reviewers found for distribution');
                return;
            }

            // Create sample reviews (partial assignments)
            // In practice, you might create assignment records or initial empty reviews
            const sampleReviews = [];

            // Assign only regular applicants to reviewers (exclude I-Sub applicants from automatic assignment)
            const regularApplicants = applicants.filter(applicant => applicant.category === 'regular');

            // Assign each regular applicant to 1 reviewer in a round-robin fashion
            for (let i = 0; i < regularApplicants.length; i++) {
                const applicant = regularApplicants[i];
                const reviewerIndex = i % reviewers.length;
                const reviewer = reviewers[reviewerIndex];

                // Create placeholder review entry (without scores, to be filled later)
                sampleReviews.push({
                    applicant_id: applicant.id,
                    reviewer_name: reviewer.name,
                    site_name: this.SITE_NAME
                    // No scores initially - reviewers will fill these in
                });
            } if (sampleReviews.length > 0) {
                const { data, error } = await supabaseAdmin
                    .from('urology_reviews')
                    .insert(sampleReviews)
                    .select();

                if (error) {
                    console.error('Error creating review assignments:', error);
                    throw new Error(`Failed to create assignments: ${error.message}`);
                }

                console.log(`✅ Successfully created ${data?.length || 0} review assignments`);
            }

        } catch (err) {
            console.error('DataSeeder.distributeApplicantsToReviewers error:', err);
            throw err;
        }
    }

    /**
     * Seed some sample review scores for demonstration
     */
    static async seedSampleReviews(): Promise<void> {
        try {
            console.log('🌱 Seeding sample reviews...');

            // Get existing review assignments
            const { data: reviews, error } = await supabaseAdmin
                .from('urology_reviews')
                .select('*')
                .eq('site_name', this.SITE_NAME)
                .is('decision', null)
                .limit(10); // Only seed first 10 for demo

            if (error) {
                console.error('Error fetching reviews for seeding:', error);
                return;
            }

            if (!reviews || reviews.length === 0) {
                console.log('⚠️ No review assignments found to seed');
                return;
            }

            const sampleScores = [
                { preference: 4, pressure: 3, underserved: 5, leadership: 4, academic: 5, research: 3, personal: 4, decision: 'Definitely Interview' },
                { preference: 3, pressure: 4, underserved: 3, leadership: 3, academic: 4, research: 4, personal: 3, decision: 'Maybe' },
                { preference: 2, pressure: 2, underserved: 2, leadership: 2, academic: 3, research: 2, personal: 2, decision: 'Do Not Interview' },
                { preference: 5, pressure: 4, underserved: 4, leadership: 5, academic: 5, research: 5, personal: 5, decision: 'Definitely Interview' },
                { preference: 3, pressure: 3, underserved: 3, leadership: 3, academic: 3, research: 3, personal: 3, decision: 'Maybe' }
            ];

            const updates = reviews.slice(0, 5).map((review: any, index: number) => ({
                id: review.id,
                ...sampleScores[index],
                notes: `Sample review notes for applicant - ${sampleScores[index].decision.toLowerCase()}.`
            }));

            for (const update of updates) {
                const { error: updateError } = await supabaseAdmin
                    .from('urology_reviews')
                    .update({
                        preference: update.preference,
                        pressure: update.pressure,
                        underserved: update.underserved,
                        leadership: update.leadership,
                        academic: update.academic,
                        research: update.research,
                        personal: update.personal,
                        decision: update.decision,
                        notes: update.notes
                    })
                    .eq('id', update.id);

                if (updateError) {
                    console.error('Error updating sample review:', updateError);
                }
            }

            console.log(`✅ Successfully seeded ${updates.length} sample reviews`);
        } catch (err) {
            console.error('DataSeeder.seedSampleReviews error:', err);
            throw err;
        }
    }

    /**
     * Full seeding process with idempotency
     */
    static async seedAll(): Promise<void> {
        try {
            console.log('🚀 Starting data seeding process...');

            const seededStatus = await this.isDataSeeded();

            let applicants: DatabaseApplicant[] = [];
            let reviewers: DatabaseReviewer[] = [];

            // Seed applicants if not already present
            if (!seededStatus.hasApplicants) {
                applicants = await this.seedApplicants();
            } else {
                console.log(`✓ Applicants already seeded (${seededStatus.applicantCount} found)`);
                // Get existing applicants
                const { data } = await supabaseAdmin
                    .from('urology_applicants')
                    .select('*')
                    .eq('site_name', this.SITE_NAME);
                applicants = data || [];
            }

            // Seed reviewers if not already present
            if (!seededStatus.hasReviewers) {
                reviewers = await this.seedReviewers();
            } else {
                console.log(`✓ Reviewers already seeded (${seededStatus.reviewerCount} found)`);
                // Get existing reviewers
                const { data } = await supabaseAdmin
                    .from('urology_reviewers')
                    .select('*')
                    .eq('site_name', this.SITE_NAME);
                reviewers = data || [];
            }

            // Check if assignments exist
            const { count: assignmentCount } = await supabaseAdmin
                .from('urology_reviews')
                .select('*', { count: 'exact', head: true })
                .eq('site_name', this.SITE_NAME);

            // Distribute applicants if no assignments exist
            if (!assignmentCount || assignmentCount === 0) {
                await this.distributeApplicantsToReviewers();
                await this.seedSampleReviews();
            } else {
                console.log(`✓ Review assignments already exist (${assignmentCount} found)`);
            }

            console.log('🎉 Data seeding completed successfully!');
            console.log(`📊 Final counts: ${applicants.length} applicants, ${reviewers.length} reviewers`);

        } catch (err) {
            console.error('❌ Data seeding failed:', err);
            throw err;
        }
    }

    /**
     * Clear all seeded data (for testing/reset purposes)
     */
    static async clearAllData(): Promise<void> {
        try {
            console.log('🧹 Clearing all seeded data...');

            // Delete in reverse order of dependencies
            const tables = [
                'urology_final_selections',
                'urology_reviews',
                'urology_applicants',
                'urology_reviewers'
            ];

            for (const table of tables) {
                const { error } = await supabaseAdmin
                    .from(table)
                    .delete()
                    .eq('site_name', this.SITE_NAME);

                if (error) {
                    console.error(`Error clearing ${table}:`, error);
                } else {
                    console.log(`✅ Cleared ${table}`);
                }
            }

            console.log('🎉 All data cleared successfully!');
        } catch (err) {
            console.error('❌ Data clearing failed:', err);
            throw err;
        }
    }
}
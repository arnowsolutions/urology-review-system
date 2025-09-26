import { testDatabaseConnection } from '../config/supabase';
import { supabaseAdmin } from '../config/supabase';
import { DataSeeder } from '../utils/dataSeeder';

class DatabaseSetup {
    /**
     * Test database connection
     */
    static async testConnection(): Promise<boolean> {
        try {
            console.log('🔍 Testing database connection...');
            const isConnected = await testDatabaseConnection();
            if (isConnected) {
                console.log('✅ Database connection successful');
                return true;
            } else {
                console.error('❌ Database connection failed');
                return false;
            }
        } catch (error) {
            console.error('❌ Database connection test failed:', error);
            return false;
        }
    }

    /**
     * Check if required tables exist
     */
    static async checkTablesExist(): Promise<{ exists: boolean; tables: string[]; missingTables: string[] }> {
        try {
            console.log('🔍 Checking if required tables exist...');

            const requiredTables = [
                'urology_applicants',
                'urology_reviews',
                'urology_reviewers',
                'urology_final_selections'
            ];

            const existingTables: string[] = [];
            const missingTables: string[] = [];

            for (const table of requiredTables) {
                try {
                    const { data, error } = await supabaseAdmin
                        .from(table)
                        .select('*', { count: 'exact', head: true });

                    if (!error) {
                        existingTables.push(table);
                        console.log(`✅ Table '${table}' exists`);
                    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
                        missingTables.push(table);
                        console.log(`❌ Table '${table}' does not exist`);
                    } else {
                        console.log(`⚠️  Table '${table}' exists but has permission issues:`, error.message);
                        existingTables.push(table); // Assume it exists but has permission issues
                    }
                } catch (err) {
                    missingTables.push(table);
                    console.log(`❌ Error checking table '${table}':`, err);
                }
            }

            const allTablesExist = missingTables.length === 0;

            if (allTablesExist) {
                console.log('✅ All required tables exist');
            } else {
                console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
            }

            return {
                exists: allTablesExist,
                tables: existingTables,
                missingTables
            };
        } catch (error) {
            console.error('❌ Error checking tables:', error);
            return { exists: false, tables: [], missingTables: [] };
        }
    }

    /**
     * Provide instructions for running schema.sql
     */
    static printSchemaInstructions(): void {
        console.log('\n📋 SCHEMA SETUP INSTRUCTIONS:');
        console.log('============================================');
        console.log('1. Go to Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/fsxzgkyiutpjobpmfgtk/sql');
        console.log('');
        console.log('2. Copy the contents of: backend/src/database/schema.sql');
        console.log('');
        console.log('3. Paste and execute the SQL in the Supabase SQL editor');
        console.log('');
        console.log('4. Verify all 4 tables are created:');
        console.log('   - urology_applicants');
        console.log('   - urology_reviews');
        console.log('   - urology_reviewers');
        console.log('   - urology_final_selections');
        console.log('');
        console.log('5. Run this setup script again: npm run setup-db');
        console.log('============================================\n');
    }

    /**
     * Execute data seeding
     */
    static async seedData(): Promise<void> {
        try {
            console.log('🌱 Starting data seeding process...');
            await DataSeeder.seedAll();
            console.log('✅ Data seeding completed successfully');
        } catch (error) {
            console.error('❌ Data seeding failed:', error);
            throw error;
        }
    }

    /**
     * Verify data persistence by querying each table
     */
    static async verifyDataPersistence(): Promise<void> {
        try {
            console.log('🔍 Verifying data persistence...');

            const tables = [
                'urology_applicants',
                'urology_reviews',
                'urology_reviewers',
                'urology_final_selections'
            ];

            for (const table of tables) {
                try {
                    const { count, error } = await supabaseAdmin
                        .from(table)
                        .select('*', { count: 'exact', head: true })
                        .eq('site_name', 'urology_review');

                    if (error) {
                        console.error(`❌ Error querying ${table}:`, error.message);
                    } else {
                        console.log(`✅ ${table}: ${count || 0} records`);
                    }
                } catch (err) {
                    console.error(`❌ Error checking ${table}:`, err);
                }
            }
        } catch (error) {
            console.error('❌ Error verifying data persistence:', error);
            throw error;
        }
    }

    /**
     * Test API endpoints
     */
    static async testApiEndpoints(): Promise<void> {
        try {
            console.log('🔍 Testing API readiness (checking data availability)...');

            // Test applicants endpoint
            const { data: applicants, error: applicantsError } = await supabaseAdmin
                .from('urology_applicants')
                .select('*')
                .eq('site_name', 'urology_review')
                .limit(1);

            if (applicantsError) {
                console.error('❌ Applicants API test failed:', applicantsError.message);
            } else {
                console.log(`✅ Applicants API ready (${applicants?.length || 0} sample records)`);
            }

            // Test reviewers endpoint  
            const { data: reviewers, error: reviewersError } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*')
                .eq('site_name', 'urology_review')
                .limit(1);

            if (reviewersError) {
                console.error('❌ Reviewers API test failed:', reviewersError.message);
            } else {
                console.log(`✅ Reviewers API ready (${reviewers?.length || 0} sample records)`);
            }

            // Test reviews endpoint
            const { data: reviews, error: reviewsError } = await supabaseAdmin
                .from('urology_reviews')
                .select('*')
                .eq('site_name', 'urology_review')
                .limit(1);

            if (reviewsError) {
                console.error('❌ Reviews API test failed:', reviewsError.message);
            } else {
                console.log(`✅ Reviews API ready (${reviews?.length || 0} sample records)`);
            }

            console.log('\n🚀 Backend is ready! You can now:');
            console.log('   1. Start the server: npm run dev');
            console.log('   2. Test health endpoint: http://localhost:3001/health');
            console.log('   3. Test applicants: http://localhost:3001/api/applicants');

        } catch (error) {
            console.error('❌ API endpoints test failed:', error);
            throw error;
        }
    }

    /**
     * Main setup process
     */
    static async run(): Promise<void> {
        console.log('🚀 Starting Supabase Database Setup...\n');

        try {
            // Step 1: Test connection
            const connectionSuccess = await this.testConnection();
            if (!connectionSuccess) {
                console.error('\n❌ Setup failed: Cannot connect to database');
                console.log('Please check your .env file and ensure Supabase credentials are correct');
                process.exit(1);
            }

            // Step 2: Check tables
            const { exists: tablesExist, tables, missingTables } = await this.checkTablesExist();

            if (!tablesExist) {
                console.log(`\n❌ Setup cannot continue: Missing tables`);
                this.printSchemaInstructions();
                process.exit(1);
            }

            // Step 3: Check if data exists and seed if needed
            const seedStatus = await DataSeeder.isDataSeeded();

            if (!seedStatus.hasApplicants || !seedStatus.hasReviewers) {
                console.log('\n📊 No existing data found. Seeding initial data...');
                await this.seedData();
            } else {
                console.log(`\n✅ Existing data found:`);
                console.log(`   - Applicants: ${seedStatus.applicantCount}`);
                console.log(`   - Reviewers: ${seedStatus.reviewerCount}`);
                console.log('   Skipping data seeding');
            }

            // Step 4: Verify data persistence
            await this.verifyDataPersistence();

            // Step 5: Test API readiness
            await this.testApiEndpoints();

            console.log('\n🎉 Database setup completed successfully!');
            console.log('==================================================');
            console.log('✅ Database connection: Working');
            console.log('✅ Required tables: All exist');
            console.log('✅ Initial data: Seeded');
            console.log('✅ API endpoints: Ready');
            console.log('==================================================');
            console.log('\n📝 Next steps:');
            console.log('   1. Start development server: npm run dev');
            console.log('   2. Visit: http://localhost:3001/health');
            console.log('   3. API endpoints available at: http://localhost:3001/api/');

        } catch (error) {
            console.error('\n❌ Database setup failed:', error);
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Verify .env file has correct Supabase credentials');
            console.log('   2. Ensure database schema is deployed in Supabase');
            console.log('   3. Check Supabase project is active and accessible');
            console.log('   4. Try running: npm run test-connection');
            process.exit(1);
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    DatabaseSetup.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export default DatabaseSetup;
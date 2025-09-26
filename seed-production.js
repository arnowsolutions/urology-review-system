// Seed data via production API
const BASE_URL = 'https://interview-iz3e98k72-letsgetmoney2009-gmailcoms-projects.vercel.app/api';

// Sample reviewers data
const reviewers = [
    { name: 'Marissa Theofanides', email: 'mtheofanides@hospital.edu', is_admin: true },
    { name: 'Michael Lipsky', email: 'mlipsky@hospital.edu', is_admin: false },
    { name: 'Miriam Harel', email: 'mharel@hospital.edu', is_admin: false },
    { name: 'Jillian Donnelly', email: 'jdonnelly@hospital.edu', is_admin: false },
    { name: 'Stephen Reese', email: 'sreese@hospital.edu', is_admin: false },
    { name: 'Dima Raskolnikov', email: 'draskolnikov@hospital.edu', is_admin: false },
    { name: 'Matt Danzig', email: 'mdanzig@hospital.edu', is_admin: false },
    { name: 'Frank Lowe', email: 'flowe@hospital.edu', is_admin: true },
    { name: 'Nitya Abraham', email: 'nabraham@hospital.edu', is_admin: false },
    { name: 'Amanda North', email: 'anorth@hospital.edu', is_admin: false }
];

// I-Sub applicants
const iSubApplicants = [
    { external_id: '15469503', name: 'Tyler Bergeron', category: 'i-sub', details: 'Albert Einstein College of Medicine' },
    { external_id: '15467447', name: 'David Hanelin', category: 'i-sub', details: 'Albert Einstein College of Medicine' },
    { external_id: '15254686', name: 'Grace Khaner', category: 'i-sub', details: 'Albert Einstein College of Medicine' }
];

// Sample regular applicants (first 10 for demo)
const regularApplicants = [
    { external_id: '14384852', name: 'Shawn Alex', category: 'regular', details: 'Texas Tech University Health Sciences Center Paul L. Foster School of Medicine' },
    { external_id: '15474804', name: 'Diego Alvarez Vega', category: 'regular', details: 'NYU Grossman Long Island School of Medicine' },
    { external_id: '15355716', name: 'Nkiru Anigbogu', category: 'regular', details: 'Ross University School of Medicine' },
    { external_id: '15189920', name: 'Ryan Antar', category: 'regular', details: 'George Washington University School of Medicine and Health Sciences' },
    { external_id: '14277647', name: 'Matthew Antonellis', category: 'regular', details: 'SUNY Downstate Health Sciences University College of Medicine' },
    { external_id: '15839653', name: 'Mariya Antonyuk', category: 'regular', details: 'St. George\'s University School of Medicine' },
    { external_id: '15321399', name: 'Juan Arroyave Villada', category: 'regular', details: 'Icahn School of Medicine at Mount Sinai' },
    { external_id: '15363098', name: 'Jared Benjamin', category: 'regular', details: 'Rutgers New Jersey Medical School' },
    { external_id: '14803322', name: 'Richard Berman', category: 'regular', details: 'Columbia University Vagelos College of Physicians and Surgeons' },
    { external_id: '15115380', name: 'Rachel Bernardo', category: 'regular', details: 'George Washington University School of Medicine and Health Sciences' }
];

async function seedData() {
    console.log('🚀 Seeding production database...');

    try {
        // Test API health first
        console.log('🔍 Testing API health...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        if (!healthResponse.ok) {
            throw new Error('API health check failed');
        }
        console.log('✅ API is healthy');

        // Seed reviewers
        console.log('🌱 Seeding reviewers...');
        for (const reviewer of reviewers) {
            try {
                const response = await fetch(`${BASE_URL}/reviewers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reviewer)
                });

                if (response.ok) {
                    console.log(`✅ Added reviewer: ${reviewer.name}`);
                } else {
                    const error = await response.text();
                    console.log(`⚠️  Reviewer ${reviewer.name} may already exist or error occurred: ${error}`);
                }
            } catch (err) {
                console.log(`❌ Error adding reviewer ${reviewer.name}:`, err.message);
            }
        }

        // Seed I-Sub applicants
        console.log('🌱 Seeding I-Sub applicants...');
        for (const applicant of iSubApplicants) {
            try {
                const response = await fetch(`${BASE_URL}/applicants`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(applicant)
                });

                if (response.ok) {
                    console.log(`✅ Added I-Sub applicant: ${applicant.name}`);
                } else {
                    const error = await response.text();
                    console.log(`⚠️  I-Sub applicant ${applicant.name} may already exist or error occurred: ${error}`);
                }
            } catch (err) {
                console.log(`❌ Error adding I-Sub applicant ${applicant.name}:`, err.message);
            }
        }

        // Seed regular applicants
        console.log('🌱 Seeding regular applicants...');
        for (const applicant of regularApplicants) {
            try {
                const response = await fetch(`${BASE_URL}/applicants`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(applicant)
                });

                if (response.ok) {
                    console.log(`✅ Added regular applicant: ${applicant.name}`);
                } else {
                    const error = await response.text();
                    console.log(`⚠️  Regular applicant ${applicant.name} may already exist or error occurred: ${error}`);
                }
            } catch (err) {
                console.log(`❌ Error adding regular applicant ${applicant.name}:`, err.message);
            }
        }

        console.log('\n🎉 Data seeding completed!');
        console.log('📊 Summary:');
        console.log(`   - ${reviewers.length} reviewers (2 admins, 8 reviewers)`);
        console.log(`   - ${iSubApplicants.length} I-Sub applicants`);
        console.log(`   - ${regularApplicants.length} regular applicants (sample)`);
        console.log('\n🚀 Application is ready at:');
        console.log('   https://interview-iz3e98k72-letsgetmoney2009-gmailcoms-projects.vercel.app');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

seedData();
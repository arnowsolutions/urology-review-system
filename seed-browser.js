// Simple data seeding script for the deployed application
// Run this in browser console or as a Node script

const API_BASE = 'https://interview-4ej1bwpbe-letsgetmoney2009-gmailcoms-projects.vercel.app/api';

// Add some initial reviewers
async function addReviewers() {
    const reviewers = [
        { name: 'Dr. Marissa Theofanides', email: 'mtheofanides@hospital.edu', is_admin: true },
        { name: 'Dr. Michael Lipsky', email: 'mlipsky@hospital.edu', is_admin: false },
        { name: 'Dr. Frank Lowe', email: 'flowe@hospital.edu', is_admin: true }
    ];

    for (const reviewer of reviewers) {
        try {
            const response = await fetch(`${API_BASE}/reviewers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewer)
            });
            console.log(`Added reviewer: ${reviewer.name}`, response.status);
        } catch (error) {
            console.log(`Error adding ${reviewer.name}:`, error);
        }
    }
}

// Add some I-Sub applicants
async function addISubApplicants() {
    const applicants = [
        { external_id: '15469503', name: 'Tyler Bergeron', category: 'i-sub', details: 'Albert Einstein College of Medicine' },
        { external_id: '15467447', name: 'David Hanelin', category: 'i-sub', details: 'Albert Einstein College of Medicine' },
        { external_id: '15254686', name: 'Grace Khaner', category: 'i-sub', details: 'Albert Einstein College of Medicine' }
    ];

    for (const applicant of applicants) {
        try {
            const response = await fetch(`${API_BASE}/applicants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicant)
            });
            console.log(`Added I-Sub applicant: ${applicant.name}`, response.status);
        } catch (error) {
            console.log(`Error adding ${applicant.name}:`, error);
        }
    }
}

// Add some regular applicants
async function addRegularApplicants() {
    const applicants = [
        { external_id: '14384852', name: 'Shawn Alex', category: 'regular', details: 'Texas Tech University' },
        { external_id: '15474804', name: 'Diego Alvarez Vega', category: 'regular', details: 'NYU Grossman School' },
        { external_id: '15355716', name: 'Nkiru Anigbogu', category: 'regular', details: 'Ross University' }
    ];

    for (const applicant of applicants) {
        try {
            const response = await fetch(`${API_BASE}/applicants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicant)
            });
            console.log(`Added regular applicant: ${applicant.name}`, response.status);
        } catch (error) {
            console.log(`Error adding ${applicant.name}:`, error);
        }
    }
}

// Run all seeding functions
async function seedData() {
    console.log('🚀 Starting data seeding...');
    await addReviewers();
    await addISubApplicants();
    await addRegularApplicants();
    console.log('✅ Data seeding completed!');
}

// Uncomment the line below to run seeding
// seedData();

console.log('Data seeding script ready. Run seedData() to populate the database.');
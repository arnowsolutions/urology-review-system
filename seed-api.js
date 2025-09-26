// Seed initial data via API endpoints
const API_BASE = 'https://interview-4ej1bwpbe-letsgetmoney2009-gmailcoms-projects.vercel.app/api';

async function seedInitialData() {
    console.log('🚀 Seeding initial data via API...');

    // Add reviewers first
    const reviewers = [
        { name: 'Dr. Marissa Theofanides', email: 'mtheofanides@hospital.edu', is_admin: true },
        { name: 'Dr. Michael Lipsky', email: 'mlipsky@hospital.edu', is_admin: false },
        { name: 'Dr. Frank Lowe', email: 'flowe@hospital.edu', is_admin: true },
        { name: 'Dr. Miriam Harel', email: 'mharel@hospital.edu', is_admin: false }
    ];

    for (const reviewer of reviewers) {
        try {
            const response = await fetch(`${API_BASE}/reviewers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewer)
            });
            if (response.ok) {
                console.log(`✅ Added reviewer: ${reviewer.name}`);
            } else {
                const error = await response.text();
                console.log(`⚠️ Reviewer ${reviewer.name}: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.log(`❌ Error adding reviewer ${reviewer.name}:`, error.message);
        }
    }

    // Add I-Sub applicants
    const iSubApplicants = [
        { external_id: '15469503', name: 'Tyler Bergeron', category: 'i-sub', details: 'Albert Einstein College of Medicine' },
        { external_id: '15467447', name: 'David Hanelin', category: 'i-sub', details: 'Albert Einstein College of Medicine' },
        { external_id: '15254686', name: 'Grace Khaner', category: 'i-sub', details: 'Albert Einstein College of Medicine' }
    ];

    for (const applicant of iSubApplicants) {
        try {
            const response = await fetch(`${API_BASE}/applicants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicant)
            });
            if (response.ok) {
                console.log(`✅ Added I-Sub applicant: ${applicant.name}`);
            } else {
                const error = await response.text();
                console.log(`⚠️ I-Sub applicant ${applicant.name}: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.log(`❌ Error adding I-Sub applicant ${applicant.name}:`, error.message);
        }
    }

    // Add regular applicants
    const regularApplicants = [
        { external_id: '14384852', name: 'Shawn Alex', category: 'regular', details: 'Texas Tech University Health Sciences Center' },
        { external_id: '15474804', name: 'Diego Alvarez Vega', category: 'regular', details: 'NYU Grossman Long Island School of Medicine' },
        { external_id: '15355716', name: 'Nkiru Anigbogu', category: 'regular', details: 'Ross University School of Medicine' },
        { external_id: '15189920', name: 'Ryan Antar', category: 'regular', details: 'George Washington University School of Medicine' },
        { external_id: '14277647', name: 'Matthew Antonellis', category: 'regular', details: 'SUNY Downstate Health Sciences University College of Medicine' }
    ];

    for (const applicant of regularApplicants) {
        try {
            const response = await fetch(`${API_BASE}/applicants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicant)
            });
            if (response.ok) {
                console.log(`✅ Added regular applicant: ${applicant.name}`);
            } else {
                const error = await response.text();
                console.log(`⚠️ Regular applicant ${applicant.name}: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.log(`❌ Error adding regular applicant ${applicant.name}:`, error.message);
        }
    }

    console.log('✅ Initial data seeding completed!');
    console.log('📊 Summary:');
    console.log(`   - ${reviewers.length} reviewers (${reviewers.filter(r => r.is_admin).length} admins)`);
    console.log(`   - ${iSubApplicants.length} I-Sub applicants`);
    console.log(`   - ${regularApplicants.length} regular applicants`);
    console.log('\n🎉 Application should now have data to display!');
}

// Auto-run when script is loaded
seedInitialData().catch(error => {
    console.error('❌ Seeding failed:', error);
});
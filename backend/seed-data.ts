import { DataSeeder } from './src/utils/dataSeeder';

async function main() {
    try {
        console.log('🚀 Starting database seeding...');
        await DataSeeder.seedAll();
        console.log('✅ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
}

main();
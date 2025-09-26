import { supabaseAdmin } from './src/config/supabase';

async function testConnection() {
    try {
        console.log('Testing basic Supabase connection...');

        // Try a simple health check
        const { data, error } = await supabaseAdmin
            .from('non_existent_table')
            .select('*', { count: 'exact', head: true });

        // If we get a "relation does not exist" error, that means connection is working
        if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log('✅ Connection successful! Database is reachable.');
            console.log('Error message:', error.message);
            return true;
        } else if (error) {
            console.error('❌ Connection failed:', error.message);
            return false;
        } else {
            console.log('✅ Connection successful!');
            return true;
        }
    } catch (err) {
        console.error('❌ Connection test failed:', err);
        return false;
    }
}

testConnection().then(result => {
    process.exit(result ? 0 : 1);
});
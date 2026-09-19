const { Client } = require('pg');
const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!dbUrl) {
    console.error('DATABASE_URL atau DIRECT_URL tidak ditemukan');
    process.exit(1);
}
const client = new Client(dbUrl);
client.connect().then(() => {
    return client.query('SELECT * FROM kemenag_ptsp.profiles_pegawai WHERE user_id = $1', ['847ec58d-d66a-4e41-9343-da9f85a276b8']);
}).then(res => {
    console.log('DB RESULT:', JSON.stringify(res.rows, null, 2));
}).catch(console.error).finally(() => client.end());

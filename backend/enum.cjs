const { Client } = require('pg');
const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!dbUrl) {
    console.error('DATABASE_URL atau DIRECT_URL tidak ditemukan');
    process.exit(1);
}
const client = new Client(dbUrl);
client.connect().then(() => {
    return client.query(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'ptsp_request_status'`);
}).then(res => {
    console.log('ENUM VALUES:', res.rows.map(r => r.enumlabel));
}).catch(console.error).finally(() => client.end());

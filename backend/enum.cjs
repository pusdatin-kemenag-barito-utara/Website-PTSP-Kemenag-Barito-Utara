const { Client } = require('pg');
const client = new Client('postgres://postgres:S4g0Q3H^YgJ2u4E2@103.189.235.150:5432/postgres');
client.connect().then(() => {
    return client.query(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'ptsp_request_status'`);
}).then(res => {
    console.log('ENUM VALUES:', res.rows.map(r => r.enumlabel));
}).catch(console.error).finally(() => client.end());

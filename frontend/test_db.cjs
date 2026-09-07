const { Client } = require('pg');
const client = new Client('postgres://postgres:S4g0Q3H^YgJ2u4E2@103.189.235.150:5432/postgres');
client.connect().then(() => {
    return client.query('SELECT * FROM kemenag_ptsp.profiles_pegawai WHERE user_id = $1', ['847ec58d-d66a-4e41-9343-da9f85a276b8']);
}).then(res => {
    console.log('DB RESULT:', JSON.stringify(res.rows, null, 2));
}).catch(console.error).finally(() => client.end());

const { Client } = require('pg');
const client = new Client('postgres://postgres:S4g0Q3H^YgJ2u4E2@103.189.235.150:5432/postgres');
client.connect().then(() => {
    return client.query('SELECT * FROM kemenag_pusdatin.profiles WHERE id = $1', ['fc9367a7-ad73-41d8-b435-e709b9feef80']);
}).then(res => {
    console.log('DB RESULT:', JSON.stringify(res.rows, null, 2));
}).catch(console.error).finally(() => client.end());

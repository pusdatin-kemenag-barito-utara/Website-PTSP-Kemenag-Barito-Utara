const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const views = ['ptsp_daftar_pegawai', 'ptsp_daftar_pemohon', 'ptsp_daftar_admin'];
    
    for (const view of views) {
      const res = await client.query(`
        SELECT definition 
        FROM pg_views 
        WHERE viewname = $1 AND schemaname = 'public';
      `, [view]);
      
      if (res.rows.length > 0) {
        console.log(`\n--- View: ${view} ---`);
        console.log(res.rows[0].definition);
      } else {
        console.log(`\nView ${view} not found.`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();

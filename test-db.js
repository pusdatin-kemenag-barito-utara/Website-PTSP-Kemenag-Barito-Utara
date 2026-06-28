const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:f49YacyrwGrHDi5REIirX7w9TMByR4Dx@185.207.107.58:5432/postgres"
  });
  await client.connect();
  
  try {
    const res = await client.query(`
      SELECT nspname, rolname
      FROM pg_namespace n
      JOIN pg_authid a ON n.nspowner = a.oid
      WHERE nspname = 'kemenag_ptsp';
    `);
    console.log("Schema owner:", res.rows);
    
    const perm = await client.query(`
      SELECT has_schema_privilege('postgres', 'kemenag_ptsp', 'CREATE');
    `);
    console.log("Has CREATE privilege:", perm.rows);
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();

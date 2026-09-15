require('dotenv').config();
const { createClient } = require('@libsql/client');

async function test() {
  const client = createClient({ 
    url: process.env.DATABASE_URL, 
    authToken: process.env.TURSO_AUTH_TOKEN 
  });
  
  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({ 
  url: process.env.DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

client.execute("SELECT name FROM sqlite_master WHERE type='table'")
  .then(r => console.log('Rows:', JSON.stringify(r.rows, null, 2)))
  .catch(e => console.error(e));
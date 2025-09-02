require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sqlPath = path.join(__dirname, "..", "sql", "migrate.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Migrations applied.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();

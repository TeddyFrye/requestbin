const { getBodyById } = require("./mongo");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { getSecretValue, getParameterValue } = require("../aws-secrets");

let pool;

(async () => {
  if (process.env.ENV === "production") {
    const [dbCredentials, database] = await Promise.all([
      getSecretValue(process.env.PG_CREDENTIALS_KEY),
      getParameterValue(process.env.PG_DATABASE_NAME),
    ]);
    const { host, password, port, username: user } = JSON.parse(dbCredentials);

    pool = new Pool({
      database,
      host,
      password,
      port,
      user,
    });
  } else {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || undefined,
    });
  }
})();

async function runMigrations() {
  const sqlPath = path.join(__dirname, "..", "sql", "migrate.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function createBasket(name) {
  const { rows } = await pool.query(
    "INSERT INTO baskets (name) VALUES ($1) RETURNING *",
    [name]
  );
  return rows[0];
}

async function getBasket(name) {
  const { rows } = await pool.query("SELECT * FROM baskets WHERE name = $1", [
    name,
  ]);
  return rows[0];
}

async function listBaskets() {
  const { rows } = await pool.query("SELECT * FROM baskets", []);
  return rows;
}

async function insertRequest({
  basketId,
  path,
  query,
  method,
  headers,
  bodyMongoId, // mongo id provided by storeRequest() in mongo.js
}) {
  const { rows } = await pool.query(
    "INSERT INTO requests (basket_id, path, query, method, headers, body_mongo_id) VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, $6) RETURNING *",
    [basketId, path, query, method, headers, bodyMongoId]
  );
  return rows[0];
}

async function getRequest(id) {
  const { rows } = await pool.query("SELECT * FROM requests WHERE id = $1", [
    id,
  ]);
  return rows[0];
}

async function listRequests(basketId, { limit = 50, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT * FROM requests 
     WHERE basket_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [basketId, limit, offset]
  );
  return rows;
}

async function deleteRequests(id) {
  const { rowCount } = await pool.query(
    "DELETE FROM requests WHERE basket_id = $1",
    [id]
  );
  return rowCount === 1;
}

async function deleteBasket(id) {
  const { rowCount } = await pool.query("DELETE FROM baskets WHERE id = $1", [
    id,
  ]);
  return rowCount === 1;
}

async function getRequestsWithBodies(basketId) {
  const { rows: requests } = await pool.query(
    "SELECT * FROM requests WHERE basket_id = $1 ORDER BY created_at DESC",
    [basketId]
  );

  const enriched = await Promise.all(
    requests.map(async (req) => {
      let body = null;
      try {
        if (req.body_mongo_id) {
          const doc = await getBodyById(req.body_mongo_id);
          body = doc?.json_string ?? null;
        }
      } catch (err) {
        console.error(
          `Failed to fetch Mongo body for ID ${req.body_mongo_id}`,
          err
        );
      }

      return {
        ...req,
        raw_body: body,
      };
    })
  );

  return enriched;
}

async function close() {
  await pool.end();
}

module.exports = {
  runMigrations,
  createBasket,
  getBasket,
  listBaskets,
  insertRequest,
  getRequest,
  listRequests,
  deleteRequests,
  deleteBasket,
  getRequestsWithBodies,
  close,
};

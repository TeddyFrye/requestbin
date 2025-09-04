require("dotenv").config();
const { Pool } = require("pg");
const { MongoClient } = require("mongodb");

const PG_URL =
  process.env.DATABASE_URL || `postgres://localhost:5432/requestbin`;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "requestbin";
const MONGO_COLLECTION = process.env.MONGO_COLLECTION || "request_bodies";

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function nowIso() {
  return new Date().toISOString();
}

async function main() {
  const pg = new Pool({ connectionString: PG_URL });
  const mongoClient = new MongoClient(MONGO_URL);

  try {
    await mongoClient.connect();
    const mdb = mongoClient.db(MONGO_DB_NAME);
    const bodies = mdb.collection(MONGO_COLLECTION);
    await bodies.createIndex({ created_at: 1 });

    if (process.env.SEED_RESET === "1") {
      console.log("Resetting dev data…");
      await pg.query("TRUNCATE TABLE requests RESTART IDENTITY CASCADE;");
      await pg.query("TRUNCATE TABLE baskets RESTART IDENTITY CASCADE;");
      await bodies.deleteMany({});
    }

    const basketNames = ["webhooks-demo", "payments", "staging-bin"];
    const baskets = [];
    for (const name of basketNames) {
      const { rows } = await pg.query(
        `INSERT INTO baskets (name)
     VALUES ($1)
     ON CONFLICT (name) DO UPDATE
       SET name = EXCLUDED.name   -- no-op, but lets us RETURNING
     RETURNING id, name, created_at`,
        [name]
      );
      baskets.push(rows[0]);
    }

    const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const PATHS = [
      "/foo",
      "/bar",
      "/api/v1/orders",
      "/hello/world",
      "/checkout/success",
    ];

    const EXAMPLE_BODIES = [
      "",
      JSON.stringify({ event: "ping", ts: nowIso() }),
      JSON.stringify({
        type: "order.created",
        data: { id: 12345, amount_cents: 4999 },
      }),
      "not-json body=raw&x=1",
      JSON.stringify({
        type: "customer.updated",
        data: {
          id: "cus_" + Math.random().toString(36).slice(2, 8),
          active: true,
        },
      }),
    ];

    const headersBase = {
      "x-seed": "true",
      accept: "*/*",
    };

    let inserted = 0;

    for (let i = 0; i < 25; i++) {
      const basket = randPick(baskets);
      const method = randPick(METHODS);
      const path = randPick(PATHS);
      const query = { q: ["alpha", "beta", "gamma"][i % 3], page: 1 + (i % 5) };

      const candidateBody = randPick(EXAMPLE_BODIES);
      const hasBody = candidateBody !== "";
      const headers = {
        ...headersBase,
        "user-agent": `seed-bot/${i}`,
        "x-request-id": `rb-${i}-${Math.random().toString(36).slice(2, 8)}`,
        ...(hasBody
          ? {
              "content-type": candidateBody.startsWith("{")
                ? "application/json"
                : "text/plain",
            }
          : {}),
      };

      let bodyMongoId = null;
      if (hasBody) {
        const doc = {
          json_string: candidateBody,
          size_bytes: Buffer.byteLength(candidateBody, "utf8"),
          created_at: new Date(),
        };
        const res = await bodies.insertOne(doc);
        bodyMongoId = res.insertedId.toString();
      }

      await pg.query(
        `
          INSERT INTO requests
            (basket_id, path, query, method, headers, body_mongo_id)
          VALUES
            ($1,        $2,   $3::jsonb, $4,    $5::jsonb, $6)
        `,
        [
          basket.id,
          path,
          JSON.stringify(query),
          method,
          JSON.stringify(headers),
          bodyMongoId,
        ]
      );

      inserted++;
    }

    console.log(
      `✅ Seed complete: ${baskets.length} baskets, ${inserted} requests.`
    );
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoClient.close();
    } catch {}
    try {
      await new Promise((r) => setTimeout(r, 0));
    } catch {}
    try {
      const { totalCount, idleCount, waitingCount } =
        require("pg").Pool.prototype;
    } catch {}
  }
}

main()
  .then(() => process.exit())
  .catch(() => process.exit(1));

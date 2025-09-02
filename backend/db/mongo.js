const { MongoClient, ObjectId } = require("mongodb");
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "requestbin";
const COLLECTION = process.env.MONGO_COLLECTION || "request_bodies";

let client;
let db;
let col;

async function connect() {
  if (col) return col;
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(MONGO_DB_NAME);
  col = db.collection(COLLECTION);
  await col.createIndex({ created_at: 1 });
  return col;
}

async function storeRequest(rawBody) {
  const col = await connect();

  const jsonString =
    typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody ?? "");

  const doc = {
    json_string: jsonString,
    size_bytes: Buffer.byteLength(jsonString, "utf8"),
    created_at: new Date(),
  };
  const res = await col.insertOne(doc);
  return res.insertedId.toString();
}

async function getRequest(id) {
  const col = await connect();

  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return null;
  }

  const doc = await col.findOne({ _id });
  if (!doc) return null;

  let parsed = null;
  try {
    parsed = JSON.parse(doc.json_string);
  } catch {}
  return { _id: doc._id.toString(), json_string: doc.json_string };
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    col = null;
  }
}

module.exports = {
  storeRequest,
  getRequest,
  close,
};

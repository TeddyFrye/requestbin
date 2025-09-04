const { MongoClient, ObjectId } = require("mongodb");
// localhost version for testing, env variables for production
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "requestbin";
const COLLECTION = process.env.MONGO_COLLECTION || "request_bodies";

let client;
let db;
let col;
// connects to the MongoDB database
async function connect() {
  if (col) return col;
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(MONGO_DB_NAME);
  col = db.collection(COLLECTION);
  await col.createIndex({ created_at: 1 });
  return col;
}
// call storeRequest to save the raw body and get back the ID
async function storeRequest(rawBody, basketName) {
  const col = await connect();

  const jsonString =
    typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody ?? "");

  const doc = {
    json_string: jsonString,
    size_bytes: Buffer.byteLength(jsonString, "utf8"),
    created_at: new Date(),
    basketName: basketName,
  };
  const res = await col.insertOne(doc);
  return res.insertedId.toString();
}

async function getRequest(id) {
  const col = await connect();
  const doc = await col.findOne({ _id: ObjectId(id) });
  return doc ? JSON.parse(doc.json_string) : null;
}

async function deleteRequest(id) {
  const col = await connect();
  const res = await col.deleteOne({ _id: ObjectId(id) });
  return res.deletedCount === 1;
}

async function deleteRequestsByBasketId(basketId) {
  const col = await connect();
  const res = await col.deleteMany({ basketId: basketId });
  return res.deletedCount > 0;
}

// closes the database connection
async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    col = null;
  }
}

async function getBodyById(id) {
  const col = await connect();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  console.log(doc);
  // return doc ? JSON.parse(doc.json_string) : null;
  return doc;
}

module.exports = {
  storeRequest,
  getRequest,
  close,
  deleteRequest,
  deleteRequestsByBasketId,
  getBodyById,
};

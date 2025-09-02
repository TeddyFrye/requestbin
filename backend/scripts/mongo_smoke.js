require("dotenv").config();
const mongo = require("../db/mongo");

(async () => {
  try {
    const id = await mongo.storeRequest({ hello: "world" });
    console.log("Inserted body_mongo_id:", id);
    const doc = await mongo.getRequest(id);
    console.log("Fetched:", doc);
  } catch (e) {
    console.error("Mongo smoke failed:", e);
    process.exitCode = 1;
  } finally {
    await mongo.close();
  }
})();

require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const PgPersistence = require("./db/pg");
const MongoDB = require("./db/mongo");

app.use(cors());
app.use(express.json());
//Endpoints
app.all("/:name", async (request, response) => {
  const name = request.params.name;
  const basket = await PgPersistence.getBasket(name);

  if (!basket) {
    response.status(404).end();
  }

  const { body, path, query, method, headers } = request;
  const id = await MongoDB.storeRequest(body, name);

  await PgPersistence.insertRequest({
    basketId: basket.id,
    path,
    query,
    method,
    headers: JSON.stringify(headers),
    bodyMongoId: id,
  });
});
//View all baskets
app.get("/api/baskets", async (request, response) => {
  const baskets = await PgPersistence.listBaskets();

  response.json(baskets.map((basket) => basket.name));
});
//Add a new basket
app.post("/api/baskets", async (request, response) => {
  // const name = generateName();
  // const newBasket = await PgPersistence.createBasket(name);

  // response.json(newBasket);
  const name = generateName();

  let newBasket;
  do {
    try {
      newBasket = await PgPersistence.createBasket(name);
    } catch (error) {
      console.log(error);
    }
  } while (!newBasket);

  response.json(newBasket);
});
//View a specific basket
app.get("/api/baskets/:name", async (req, res) => {
  const name = req.params.name;
  const basket = await PgPersistence.getBasket(name);

  if (!basket) {
    res.status(404).end();
  }

  // const requests = await PgPersistence.listRequests(basket.id);
  // console.log(requests, "hello");
  // response.json(requests);
  // const basketId = parseInt(req.params.id, 10);
  const basketId = basket.id;
  try {
    const fullRequests = await PgPersistence.getRequestsWithBodies(basketId);
    res.json(fullRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});
//Delete all requests in the current basket
app.delete("/api/baskets/:name/requests", async (request, response) => {
  const name = request.params.name;
  const basket = await PgPersistence.getBasket(name);

  if (!basket) {
    response.status(404).end();
  }

  await MongoDB.deleteRequestsByBasketId(name);
  await PgPersistence.deleteRequests(name);

  response.status(204).end();
});
//Delete the current basket
app.delete("/api/baskets/:name", async (request, response) => {
  const name = request.params.name;
  const basket = await PgPersistence.getBasket(name);

  if (!basket) {
    response.status(404).end();
  }

  await MongoDB.deleteRequestsByBasketId(name);
  await PgPersistence.deleteBasket(name);

  response.status(204).end();
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function generateName() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let name = "";

  for (let index = 0; index < 7; index += 1) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }

  return name;
}

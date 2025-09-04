const express = require('express');
const app = express();
const cors = require("cors");
const PgPersistence = require("./db/pg");
const MongoDB = require("./db/mongo");

app.use(cors());
app.use(express.json());
//View all baskets
app.get('/api/baskets', async (request, response) => {
  const baskets = await PgPersistence.listBaskets();
  
  response.json(baskets);
})
//Add a new basket
app.post('/api/baskets', async (request, response) => {
  const name = generateName();
  const newBasket = await PgPersistence.createBasket(name);

  response.json(newBasket);
})
//View a specific basket
app.get('/api/baskets/:name', async (request, response) => {
  const name = request.params.name;
  const requests = await PgPersistence.listRequests(name);

  if (requests) {
    response.json(requests);
  } else {
    response.status(404).end();
  }
});
//Delete the current basket
app.delete('/api/baskets/:name', async (request, response) => {
  const name = request.params.name;

  await MongoDB.deleteRequestsByBasketId(name);
  await PgPersistence.deleteRequests(name);
  await PgPersistence.deleteBasket(name);

  response.status(204).end();
});
//Delete all requests in the current basket
app.delete('/api/baskets/:name/requests', async (request, response) => {
  const name = request.params.name;

  await MongoDB.deleteRequestsByBasketId(name);
  await PgPersistence.deleteRequests(name);

  response.status(204).end();
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

function generateName() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let name = '';

  for (let index = 0; index < 7; index += 1) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }

  return name;
}
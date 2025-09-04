const express = require('express');
const app = express();
const cors = require("cors");
const PgPersistence = require("./db/pg");
const MongoDB = require("./db/mongo");

app.use(cors());
app.use(express.json());
//View all baskets
app.get('/api/baskets', async (request, response) => {
  let baskets = await PgPersistence.listBaskets();
  response.json(baskets);
})
//Add a new basket
app.post('/api/baskets', async (request, response) => {
  let name = generateName();
  let newBasket = await PgPersistence.createBasket(name);
  response.json(newBasket);
})
//View a specific basket
app.get('/api/baskets/:name', async (request, response) => {
  const name = request.params.name;
  let basket = await PgPersistence.getBasket(name);

  if (basket) {
    response.json(basket);
  } else {
    response.status(404).end();
  }

  console.log(basket);
})
//Delete the current basket
app.delete('/api/baskets/:name', (request, response) => {
  const name = request.params.name;
  baskets = baskets.filter(basket => basket.name !== name);
  response.status(204).end();
});
//Delete all requests in the current basket
app.delete('/api/baskets/:name/requests', (request, response) => {
  const name = request.params.name;
  const basket = baskets.find(basket => basket.name === name);
  basket.requests = [];
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
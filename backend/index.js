const express = require('express')
const app = express()
const cors = require("cors");

app.use(cors())
app.use(express.json())

let baskets = [
  {
    name: "abc1234",
    requests: [],
  },
  {
    name: "xyz7890",
    requests: [{'method': 'POST', 'timestamp': '2024-10-10T10:10:10.000Z', 'headers': [{'Content-Type': 'application/json'}], 'body': '{"url": "http://example.com"}'}],
  },
]
//Do I need this one?
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
//View all baskets
app.get('/api/baskets', (request, response) => {
  response.json(baskets.map(basket => basket.name));
})
//Add a new basket
app.post('/api/baskets', (request, response) => {
  const basket = {
    name: generateName(),
    requests: [],
  }

  baskets = baskets.concat(basket)
  response.json(basket)
})
//View a specific basket (don't need the name)
app.get('/api/baskets/:name', (request, response) => {
  const name = request.params.name
  const basket = baskets.find(basket => basket.name === name)

  if (basket) {
    response.json(basket.requests)
  } else {
    response.status(404).end()
  }
})
//Delete the current basket
app.delete('/api/baskets/:name', (request, response) => {
  const name = request.params.name
  baskets = baskets.filter(basket => basket.name !== name)
  response.status(204).end()
})
//Add a new request to the current basket
app.post('/api/baskets/:name', (request, response) => {
  const name = request.params.name
  
  const newRequest = {
    method: "",
    timestamp: "",
    headers: [],
    body: "",
  }

  const basket = baskets.find(basket => basket.name === name)
  basket.requests = basket.requests.concat(newRequest)

  response.json(basket)
})

//Delete all requests in the current basket
app.delete('/api/baskets/:name/requests', (request, response) => {
  const name = request.params.name
  const basket = baskets.find(basket => basket.name === name)
  basket.requests = []
  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

function generateName() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let name = '';

  for (let index = 0; index < 7; index += 1) {
    name += chars[Math.floor(Math.random() * chars.length)]
  }

  return name;
}
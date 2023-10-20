const express = require('express')
const bodyParser = require('body-parser')  //the built-in body-parser middleware,
const app = express()
const port = 3000

require('dotenv').config() // for .env

const db = require('./db/queries')

const user = process.env.user;
const password = process.env.password;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.get('/', (request, response) => {
  response.json({ info: user + password })
})
app.get('/api', (request, response) => {
  response.json({ info: 'you will work with API' })
})
    // 1 USERS
app.get('/api/users', db.getUsers)
app.get('/api/users/:user_id', db.getUserById)
app.post('/api/users', db.createUser) 
app.put('/api/users/:user_id', db.updateUser)
app.delete('/api/users/:user_id', db.deleteUser)

   // 2 PRODUCTS
app.get('/api/products', db.getProducts)
app.get('/api/products/:product_id', db.getProductsById)
app.post('/api/products', db.createProduct) 
app.put('/api/products/:product_id', db.updateProduct)
app.delete('/api/products/:product_id', db.deleteProducts)

  // 3 CARTS
app.get('/api/carts/:user_id', db.getCartsById)
app.post('/api/carts/:user_id', db.createCarts) 
app.put('/api/carts/:cart_id', db.updateCarts)
app.delete('/api/carts/:cart_id', db.deleteCarts)

  // 4 Cart Items
app.get('/api/cart_items/:cart_id', db.getCartItemsByUserId)
app.post('/api/cart_items/:cart_id', db.createCartItemByCartId) 
app.put('/api/cart_items/:cart_item_id', db.updateCartItemByCartItemId)
app.delete('/api/cart_items/:cart_item_id', db.deleteCartItemByCartItemId)

  // Start server
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

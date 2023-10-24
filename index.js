const express = require('express')
const bodyParser = require('body-parser')  //the built-in body-parser middleware,
const app = express()
const port = 3000

const session = require("express-session");
const passport = require("passport");

// Secret data
require('dotenv').config(); // for .env
const userNameENV = process.env.user;
const passwordPasword = process.env.password;
const secret = process.env.secret;
// const bcrypt = require("bcrypt");

// Import data base
const db_users = require('./db/users');
const db_products = require('./db/products');
const db_carts = require('./db/carts');
const db_cart_items = require('./db/cart_items');
const db_orders = require('./db/orders');
const db_order_items = require('./db/order_items');

// Import Passport config
require('./config/passport');

// Session Config
app.use(
  session({
    secret: secret,
    cookie: { maxAge: 1000 * 60 *60 * 24, secure: true, sameSite: "none" },
    saveUninitialized: false,
    resave: false,
  })
);

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

// Body-parser middleware
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.send('only registered users can view products, please register');
    // res.redirect("/login"); 
  }
}

// Routes
app.get('/', (request, response) => {
  response.json({ info: userNameENV + passwordPasword })
})
app.get('/api', (request, response) => {
  response.json({ info: 'you will work with API' })
})

    // 1 USERS
app.post('/api/register', db_users.createUser);
app.post('/api/login',
  passport.authenticate("local", { failureRedirect : "/api/login"}),  //  щоб обробити автентифікацію та, у разі успіху, серіалізувати користувача для нас, але якщо не буде успіху перенаправить до "/login". -->({ failureRedirect : "/login"})
  db_users.logIn
);
app.get('/api/logout', db_users.logOut);

app.get('/api/users', db_users.getUsers)
app.get('/api/users/:user_id', db_users.getUserById)
app.put('/api/users/:user_id', db_users.updateUser)
// app.put('/api/users/:user_id', passport.authenticate('local', { failureRedirect: '/login' }), db.updateUser);
app.delete('/api/users/:user_id', db_users.deleteUser)

  // 2 PRODUCTS
app.get('/api/products', db_products.getProducts)
app.get('/api/products/:product_id', db_products.getProductsById)
app.post('/api/products', db_products.createProduct) 
app.put('/api/products/:product_id', db_products.updateProduct)
app.delete('/api/products/:product_id', db_products.deleteProducts)

app.get('/api/products/search', db_products.searchProductsName)


  // 3 CARTS
app.get('/api/carts/:user_id', db_carts.getCartsById)
app.post('/api/carts/:user_id', db_carts.createCarts) 
app.put('/api/carts/:cart_id', db_carts.updateCarts)
app.delete('/api/carts/:cart_id', db_carts.deleteCarts)

  // 4 Cart Items
app.get('/api/cart_items/:cart_id', db_cart_items.getCartItemsByUserId)
app.post('/api/cart_items/:cart_id', db_cart_items.createCartItemByCartId) 
app.put('/api/cart_items/:cart_item_id', db_cart_items.updateCartItemByCartItemId)
app.delete('/api/cart_items/:cart_item_id', db_cart_items.deleteCartItemByCartItemId)

  // 5 Orders
app.get('/api/orders/:user_id', db_orders.getOrders )
app.post('/api/orders/:user_id', db_orders.createOrder ) 
app.put('/api/orders/:order_id', db_orders.updateOrderStatus )
app.delete('/api/orders/:order_id', db_orders.deleteOrder);

  // 6 Order Items
app.get('/api/order_items/:order_id', db_order_items.getOrderItems )
app.post('/api/order_items/:order_id', db_order_items.createOrderItem ) 
app.put('/api/order_items/:order_item_id', db_order_items.updateOrderItem )
app.delete('/api/order_items/:order_item_id', db_order_items.deleteOrderItem);

  // Start server
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

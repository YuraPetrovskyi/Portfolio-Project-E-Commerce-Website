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
const db = require('./db/queries');


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

function ensureAuthentication(req, res, next) {
  // Complete the if statmenet below:
  if (req.session.authenticated) {
    return next();
  } else {
    res.status(403).json({ msg: "You're not authorized to view this page" });
  }
}

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


// Routes
app.get('/', (request, response) => {
  response.json({ info: userNameENV + passwordPasword })
})
app.get('/api', (request, response) => {
  response.json({ info: 'you will work with API' })
})


// Register User:
app.post('/api/register', db.createUser);
// Log In User:
app.post('/api/login',
  passport.authenticate("local", { failureRedirect : "/login"}),  //  щоб обробити автентифікацію та, у разі успіху, серіалізувати користувача для нас, але якщо не буде успіху перенаправить до "/login". -->({ failureRedirect : "/login"})
  (req, res) => {
    // res.redirect("/users");
    console.log('User is logged in')
    console.log(req.user)
    res.send('User is logged in')
  }
);
// Log out user:
app.get('/api/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }   
    console.log('User is logged out');
    res.send('User is logged out');
  });
});

    // 1 USERS
app.get('/api/users', db.getUsers)
app.get('/api/users/:user_id', db.getUserById)
app.put('/api/users/:user_id', db.updateUser)
// app.put('/api/users/:user_id', passport.authenticate('local', { failureRedirect: '/login' }), db.updateUser);

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

  // 5 Orders
app.get('/api/orders/:user_id', db.getOrders )
app.post('/api/orders/:user_id', db.createOrder ) 
app.put('/api/orders/:order_id', db.updateOrderStatus )
app.delete('/api/orders/:order_id', db.deleteOrder);

  // 6 Order Items
app.get('/api/order_items/:order_id', db.getOrderItems )
app.post('/api/order_items/:order_id', db.createOrderItem ) 
app.put('/api/order_items/:order_item_id', db.updateOrderItem )
app.delete('/api/order_items/:order_item_id', db.deleteOrderItem);

  // Start server
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

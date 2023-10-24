const Pool = require('pg').Pool

const userNameENV = process.env.user;
const password = process.env.password;

const pool = new Pool({
  user: userNameENV,
  host: 'localhost',
  database: 'e_commerce',
  password: password,
  port: 5432,
})

const bcrypt = require("bcrypt");

//  https://blog.logrocket.com/crud-rest-api-node-js-express-postgresql/

function findByUsername(username, callback) {
  pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    if (results.rows.length === 0) {
      return callback(null, false);
    }    
    const user = results.rows[0];
    return callback(null, user);
  });
}

function findById(id, callback) {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    if (results.rows.length === 0) {
      return callback(null, false);
    }
    const user = results.rows[0];
    return callback(null, user);
  });
}

    //========================================== USERS
// Get a list of all users.
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY user_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
// Get information about a specific user by his user_id.
const getUserById = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('SELECT * FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}



// POST register a new user (create)
const createUser = async (request, response) => {
  const { username, email, password } = request.body
  console.log('Received data: ', { username, email, password });

  // Check if the email already exists in the database
  const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    // Email already exists, return an error response
    return response.status(400).send(`A user with email address: ${email}  - already exists! Please choose a different email address or sign in.`);
  }
  let salt, hashedPassword;
  try {
    if (password) {    
      try {
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
        console.log('Hashed password:', hashedPassword);
      } catch (error) {
        console.error('Password processing error:', error);
        response.status(500).send('Internal Server Error');
      }
    }

    const userInsertResult = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
    const userId = userInsertResult.rows[0].user_id;
    if (!Array.isArray(userInsertResult.rows) || userInsertResult.rows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }

    const cartInsertResult = await pool.query('INSERT INTO carts (cart_id, user_id) VALUES ($1, $2) RETURNING *', [userId, userId]);
    const cartsCreated = cartInsertResult.rows[0].created_at;
    if (!Array.isArray(cartInsertResult.rows) || cartInsertResult.rows.length < 1) {
      return response.status(500).send('Internal Server Error');
    }
    
    response.status(201).send(`User registered with ID: ${userId}, Name: ${username}, Email: ${email}, Password: ${hashedPassword}, Carts added at: ${cartsCreated}`);
  } catch (error) {
    console.error('Error:', error);
    response.status(500).send('Internal Server Error');
  }
}

//   // Generate salt
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword], (error, results) => {
//     if (error) {
//       response.status(500).send('Internal Server Error')
//     } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
//       response.status(500).send('Internal Server Error')
//     }
//     const userId = results.rows[0].user_id;
//     // Creating a shopping cart for a user
//     pool.query('INSERT INTO carts (cart_id, user_id) VALUES ($1, $2) RETURNING *', [userId, userId], (cartError, cartResults) => {
//       if (cartError) {
//         response.status(500).send('Internal Server Error until created CARTS');
//       } else if (!Array.isArray(cartResults.rows) || cartResults.rows.length < 1) {
//       response.status(500).send('Internal Server Error until created CARTS')
//       }
//       const cartsCreated = cartResults.rows[0].created_at;
//       response.status(201).send(`User registered with ID: ${userId}, Name: ${username}, Email: ${email}, Password: ${hashedPassword}, Carts added at: ${cartsCreated}`)
//     });
//   })
// }

//  PUT Update user information by their user_id.
const updateUser = async (request, response) => {
  const user_id = parseInt(request.params.user_id)
  const { username, email, password } = request.body
  console.log('Received data: ', { user_id, username, email, password });
  
  if (!user_id) {
    return response.status(400).send('Invalid user_id');
  }
  // Перевірка, чи користувач спробує оновити пароль
  let salt;
  let hashedPassword = null;
  if (password) {    
    try {
      salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      console.log('Hashed password:', hashedPassword);
    } catch (error) {
      console.error('Помилка обробки паролю:', error);
      response.status(500).send('Internal Server Error');
    }
  } 
  pool.query(
    'UPDATE users SET username = $1, email = $2, password = COALESCE($3, password) WHERE user_id = $4 RETURNING *',
    // 'UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4  RETURNING *',
    // [username, email, password, user_id ],
    [username, email, hashedPassword, user_id],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`)
        return
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`)
        return
      } 
      const userId = results.rows[0].user_id;

      pool.query(
        'UPDATE carts SET user_id = $1 WHERE user_id = $2 RETURNING *',
        [userId, user_id],
        (cartError, cartResults) => {
          if (cartError) {
            throw cartError;
          }
          if (typeof cartResults.rows == 'undefined') {
            response.status(404).send(`Cart not found`);
            return;
          } else if (Array.isArray(cartResults.rows) && cartResults.rows.length < 1) {
            response.status(404).send(`Cart not found`);
            return;
          }
          response.status(200).send(`User modified with ID: ${userId}`);
        }
      )
    }
  )
}

// DELETE a user by their user_id.
const deleteUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('DELETE FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (results.rowCount === 0) {
      response.status(404).send(`User not found`);
    } else {
      response.status(200).send(`User deleted with ID: ${user_id}`);
    }
  });
}

    // ========================================== PRODUCTS
// Get a list of all products.
const getProducts = (request, response) => {
  pool.query('SELECT * FROM products ORDER BY product_id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
// Get information about a specific product by his product_id.
const getProductsById = (request, response) => {
  const product_id = parseInt(request.params.product_id)

  pool.query('SELECT * FROM products WHERE product_id = $1', [product_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
// POST a new product (create)
const createProduct = (request, response) => {
  const { name, description, price, inventory } = request.body
  console.log('Received data: ', { name, description, price, inventory });
  pool.query('INSERT INTO products (name, description, price, inventory) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, price, inventory], (error, results) => {
    if (error) {
      throw error
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      throw error
    }
    response.status(201).send(`Products added with ID: ${results.rows[0].product_id}, Name: ${results.rows[0].name}, description: ${results.rows[0].description}, Price: ${results.rows[0].price}, Inventory: ${results.rows[0].inventory}`)
  })
}
//  PUT Update product information by their product_id.
const updateProduct = (request, response) => {
  const product_id = parseInt(request.params.product_id)
  const  { name, description, price, inventory } = request.body
  console.log('Received data: ', { name, description, price, inventory })
  pool.query(
    'UPDATE products SET name = $1, description = $2, price = $3, inventory = $4 WHERE product_id = $5  RETURNING *',
    [ name, description, price, inventory, product_id ],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`)
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`)
      } else {
        response.status(200).send(`User modified with ID: ${results.rows[0].product_id}, Name: ${results.rows[0].name}, description: ${results.rows[0].description}, Price: ${results.rows[0].price}, Inventory: ${results.rows[0].inventory}`)         	
      }
    }
  )
}
// DELETE a product by their product_id.
const deleteProducts = (request, response) => {
  const product_id = parseInt(request.params.product_id)
  pool.query('DELETE FROM products WHERE product_id = $1 RETURNING name, description, price, inventory', [product_id], (error, results) => {
    if (error) {
      throw error
    }
    
    if (results.rows.length === 0) {
      response.status(404).send(`Product not found`)
    } else {
      const deletedProduct = results.rows[0]
      response.status(200).send(`Product deleted: Name: ${deletedProduct.name}, Description: ${deletedProduct.description}, Price: ${deletedProduct.price}, Inventory: ${deletedProduct.inventory}`)
    }
  });
}

    //========================================== CARTS
// Get the user's cart by their user_id.
const getCartsById = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('SELECT * FROM carts WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    } else if (results.rows.length === 0) {
      response.status(404).send(`Cart not found`)
    } else (
      response.status(200).json(results.rows)
    )    
  })
}
// Create a new cart for an existing user with their user_id.
const createCarts = (request, response) => {
  const user_id = parseInt(request.params.user_id);

  pool.query('INSERT INTO carts (cart_id, user_id) VALUES ($1, $2) RETURNING *', [user_id, user_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error')
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      response.status(500).send('Internal Server Error')
    }

    const cartId = results.rows[0].cart_id;
    response.status(201).send(`Cart created with ID: ${cartId} for user with ID: ${user_id}`)
  })
}
// Update a cart by its cart_id.
const updateCarts = (request, response) => {
  const cart_id = parseInt(request.params.cart_id)
  const { user_id, created_at } = request.body

  // Перевірка, чи передані всі необхідні дані для оновлення кошика.
  if (!user_id || !created_at) {
    return response.status(400).send('User ID and created_at are required for updating the cart.')
  }

  pool.query(
    'UPDATE carts SET user_id = $1, created_at = $2 WHERE cart_id = $3 RETURNING *',
    [user_id, created_at, cart_id],
    (error, results) => {
      if (error) {
        response.status(500).send('Internal Server Error');
      } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
        response.status(404).send('Cart not found');
      } else {
        response.status(200).send(`Cart updated with ID: ${cart_id}`)
      }
    }
  );
};
// DELETE a cart by their cart_id.
const deleteCarts = (request, response) => {
  const cart_id = parseInt(request.params.cart_id)
  pool.query('DELETE FROM carts WHERE cart_id = $1 RETURNING *', [cart_id], (error, results) => {
    if (error) {
      throw error
    }    
    if (results.rows.length === 0) {
      response.status(404).send(`Carts not found`)
    } else {
      const deletedCarts = results.rows[0]
      response.status(200).send(`Product deleted: Cart_id: ${deletedCarts.cart_id}, User_id: ${deletedCarts.user_id}, Created_at: ${deletedCarts.created_at},`)
    }
  })
}

    //========================================== CART ITEMS
// Get information about a specific product by his product_id.
const getCartItemsByUserId = (request, response) => {
  createCartItemsByCartId

  pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cart_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error')
      return
    } else if (results.rows.length === 0) {
      response.status(404).send(`Shopping cart is empty`)
      return
    } else {
      response.status(200).json(results.rows)
    }    
  })
}
// POST a new cart_items (add)
const createCartItemByCartId = (request, response) => {
  const cart_id = parseInt(request.params.cart_id)
  const { product_id, quantity } = request.body
  // First, we will get information about the amount of goods in stock
  pool.query('SELECT inventory FROM products WHERE product_id = $1', [product_id], (error, productResults) => {
    if (error) {
      response.status(500).send('Internal Server Error')
    } else if (productResults.rows.length === 0) {
      response.status(404).send('Product not found')
    } else {
      const availableInventory = productResults.rows[0].inventory
      // Let's check whether the selected quantity of the product does not exceed the quantity in stock
      if (quantity <= availableInventory) {
        // Here you can add the product to the cart, as the quantity is valid
        pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', [cart_id, product_id, quantity], (insertError, results) => {
          if (insertError) {
            response.status(500).send('Internal Server Error')
          } else if (results.rows.length === 0) {
            response.status(500).send('Internal Server Error')
          } else {
            response.status(201).send(`Product added to cart with ID: ${results.rows[0].cart_id}, Product ID: ${results.rows[0].product_id}, Quantity: ${results.rows[0].quantity}`)
          }
        });
      } else {
        response.status(400).send('Requested quantity exceeds available inventory')
      }
    }
  });
}
// PUT update cart_items using cart_item_id
const updateCartItemByCartItemId = (request, response) => {
  const cart_item_id = parseInt(request.params.cart_item_id);
  const { quantity } = request.body;
  console.log('Received data: ', { cart_item_id, quantity });

  pool.query('UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 RETURNING *', [quantity, cart_item_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      response.status(404).send('Cart item not found')
    } else {
      response.status(200).send(`Cart item updated with ID: ${results.rows[0].cart_item_id}, Quantity: ${results.rows[0].quantity} `)
    }
  });
}
// DELETE  cart_item using cart_item_id
const deleteCartItemByCartItemId = (request, response) => {
  const cart_item_id = parseInt(request.params.cart_item_id)
  console.log('Received data: ', { cart_item_id })

  pool.query('DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *', [cart_item_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error')
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      response.status(404).send('Cart item not found')
    } else {
      response.status(200).send(`Cart item deleted with ID: ${results.rows[0].cart_item_id}`)
    }
  });
}

    //========================================== Orders
// Get a list of user orders by their user_id.
const getOrders = (request, response) => {
  const user_id = parseInt(request.params.user_id);
  console.log('Received data: ', { user_id });

  pool.query('SELECT * FROM orders WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (results.rows.length === 0) {
      response.status(400).send('There are no orders'); 
    } else {
      response.status(200).json(results.rows);
    }
  });
}

// Create a new order for user by user_id.
const createOrder = (request, response) => {
  const { user_id } = request.params;

  // we will get information from the user's basket.
  pool.query('SELECT cart_items.product_id, cart_items.quantity, products.price FROM cart_items INNER JOIN products ON cart_items.product_id = products.product_id WHERE cart_items.cart_id = $1', [user_id], (cartItemsError, cartItemsResults) => {
    if (cartItemsError) {
      response.status(500).send('Internal Server Error 1');
    } else if (cartItemsResults.rows.length === 0) {
      response.status(400).send('The basket is empty. First, add products to the shopping cart.');
    } else {
      // Let's create a new order and get the ID of this order.
      const totalAmount = cartItemsResults.rows.reduce((total, cartItem) => {
        return total + cartItem.quantity * cartItem.price;
      }, 0);

      pool.query('INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING order_id', [user_id, totalAmount], (orderError, orderResults) => {
        if (orderError) {
          response.status(500).send('Internal Server Error 2');
        } else {
          const orderId = orderResults.rows[0].order_id;

          // Let's create records for each product in the table "order_items."
          const orderItemsPromises = cartItemsResults.rows.map((cartItem) => {
            return pool.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)', [orderId, cartItem.product_id, cartItem.quantity]);
          });

          // Let's clear the user's shopping cart after creating an order.
          pool.query('DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = $1)', [user_id], (deleteError, deleteResults) => {
            if (deleteError) {
              response.status(500).send('Internal Server Error 3');
            } else {
              Promise.all(orderItemsPromises).then(() => {
                response.status(201).send(`Замовлення створено з ID: ${orderId}`);
              }).catch((orderItemsError) => {
                response.status(500).send('Помилка під час створення записів order_items');
              });
            }
          });
        }
      });
    }
  });
};
// Update order status by order_id.
const updateOrderStatus = (request, response) => {
  const order_id = parseInt(request.params.order_id);
  const orderStatus = request.body.status;

  pool.query('UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING order_id, status', [orderStatus, order_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else {
      if (results.rows.length > 0) {
        response.status(200).send(`The status of the order with id: ${results.rows[0].order_id} has been changed to ${results.rows[0].status}`);
      } else {
        response.status(404).send(`Order with id ${order_id} not found`);
      }
    }
  });
}
// DELETE order using order_id
const deleteOrder = (request, response) => {
  const order_id = parseInt(request.params.order_id);

  // Спочатку видалити записи з order_items
  pool.query('DELETE FROM order_items WHERE order_id = $1', [order_id], (orderItemsError) => {
    if (orderItemsError) {
      response.status(500).send('Internal Server Error (Order Items Deletion)');
    } else {
      // Після видалення записів з order_items видалити замовлення з orders
      pool.query('DELETE FROM orders WHERE order_id = $1 RETURNING order_id', [order_id], (orderError, results) => {
        if (orderError) {
          response.status(500).send('Internal Server Error (Order Deletion)');
        } else {
          if (results.rows.length > 0) {
            response.status(200).send(`Order with id: ${results.rows[0].order_id} has been deleted`);
          } else {
            response.status(404).send(`Order with id ${order_id} not found`);
          }
        }
      });
    }
  });
}

    //========================================== Order Items
// GET a list of user orders by their user_id.
const getOrderItems = (request, response) => {
  const order_id = parseInt(request.params.order_id);
  pool.query('SELECT * FROM order_items WHERE order_id = $1', [order_id], (error, results) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (results.rows.length === 0) {
      response.status(400).send('There are no orders itams'); 
    } else {
      response.status(200).json(results.rows);
    }
  });
}

// POST Add product to order by order_id.
const createOrderItem = (request, response) => {
  const order_id = parseInt(request.params.order_id);
  const { product_id, quantity } = request.body;
  // We get the product price from the products table
  pool.query('SELECT price FROM products WHERE product_id = $1', [product_id], (error, productResults) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (productResults.rows.length === 0) {
      response.status(404).send('Product not found');
    } else {
      const productPrice = productResults.rows[0].price;
      const totalAmountToAdd = productPrice * quantity;

      // We add the product to the order_items table
      pool.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', [order_id, product_id, quantity], (insertError, results) => {
        if (insertError) {
          response.status(500).send('Internal Server Error');
        } else if (results.rows.length === 0) {
          response.status(500).send('Internal Server Error');
        } else {
          // We update total_amount in the orders table
          pool.query('UPDATE orders SET total_amount = total_amount + $1 WHERE order_id = $2 RETURNING *', [totalAmountToAdd, order_id], (updateError, updateResults) => {
            if (updateError) {
              response.status(500).send('Internal Server Error');
            } else if (updateResults.rows.length === 0) {
              response.status(404).send('Order not found');
            } else {
              response.status(201).send(`Product added to order with ID: ${results.rows[0].order_id}, Product ID: ${results.rows[0].product_id}, Quantity: ${results.rows[0].quantity}`);
            }
          });
        }
      });
    }
  });
};

// PUT Update the quantity of the product in the order by order_item_id.
const updateOrderItem = (request, response) => {
  const order_item_id = parseInt(request.params.order_item_id);
  const { quantity } = request.body;

  // We get information about the order and the product from order_items
  pool.query('SELECT order_items.order_id, order_items.product_id, order_items.quantity, products.price FROM order_items INNER JOIN products ON order_items.product_id = products.product_id WHERE order_item_id = $1', [order_item_id], (error, itemResults) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (itemResults.rows.length === 0) {
      response.status(404).send('Order item not found');
    } else {
      const order_id = itemResults.rows[0].order_id;
      const product_id = itemResults.rows[0].product_id;
      const oldQuantity = itemResults.rows[0].quantity;
      const productPrice = itemResults.rows[0].price;

      // We calculate the difference in cost
      const totalAmountDifference = productPrice * (quantity - oldQuantity);

      // We update the order_items record
      pool.query('UPDATE order_items SET quantity = $1 WHERE order_item_id = $2 RETURNING *', [quantity, order_item_id], (updateError, updateResults) => {
        if (updateError) {
          response.status(500).send('Internal Server Error');
        } else if (updateResults.rows.length === 0) {
          response.status(404).send('Order item not found');
        } else {
          // We update total_amount in the orders table
          pool.query('UPDATE orders SET total_amount = total_amount + $1 WHERE order_id = $2 RETURNING *', [totalAmountDifference, order_id], (totalAmountError, totalAmountResults) => {
            if (totalAmountError) {
              response.status(500).send('Internal Server Error');
            } else if (totalAmountResults.rows.length === 0) {
              response.status(404).send('Order not found');
            } else {
              response.status(200).send(`Order item updated: Order ID: ${order_id}, Product ID: ${product_id}, Quantity: ${quantity}`);
            }
          });
        }
      });
    }
  });
};

// DELETE Remove the product from the order by order_item_id.
const deleteOrderItem = (request, response) => {
  const order_item_id = parseInt(request.params.order_item_id);

  // We get information about the order and the product from order_items
  pool.query('SELECT order_items.order_id, order_items.product_id, order_items.quantity, products.price FROM order_items INNER JOIN products ON order_items.product_id = products.product_id WHERE order_item_id = $1', [order_item_id], (error, itemResults) => {
    if (error) {
      response.status(500).send('Internal Server Error');
    } else if (itemResults.rows.length === 0) {
      response.status(404).send('Order item not found');
    } else {
      const order_id = itemResults.rows[0].order_id;
      const product_id = itemResults.rows[0].product_id;
      const quantity = itemResults.rows[0].quantity;
      const productPrice = itemResults.rows[0].price;

      // We delete the record from order_items
      pool.query('DELETE FROM order_items WHERE order_item_id = $1', [order_item_id], (deleteError, deleteResults) => {
        if (deleteError) {
          response.status(500).send('Internal Server Error');
        } else {
          // We update total_amount in the orders table
          const totalAmountDifference = -productPrice * quantity;          
          pool.query('UPDATE orders SET total_amount = total_amount + $1 WHERE order_id = $2 RETURNING *', [totalAmountDifference, order_id], (totalAmountError, totalAmountResults) => {
            if (totalAmountError) {
              response.status(500).send('Internal Server Error');
            } else if (totalAmountResults.rows.length === 0) {
              response.status(404).send('Order not found');
            } else {              
              response.status(200).send(`Order item deleted: Order ID: ${order_id}, Product ID: ${product_id}`);
            }
          });
        }
      });
    }
  });
};


module.exports = {
  findByUsername,
  findById,

  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProducts,

  getCartsById,
  createCarts,
  updateCarts,
  deleteCarts,

  getCartItemsByUserId,
  createCartItemByCartId,
  updateCartItemByCartItemId,
  deleteCartItemByCartItemId,

  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,

  getOrderItems,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
}

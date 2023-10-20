const Pool = require('pg').Pool


const user = process.env.user;
const password = process.env.password;

const pool = new Pool({
  user: user,
  host: 'localhost',
  database: 'e_commerce',
  password: password,
  port: 5432,
})


//  https://blog.logrocket.com/crud-rest-api-node-js-express-postgresql/

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
// POST a new user (create)
const createUser = (request, response) => {
  const { username, email, password } = request.body
  console.log('Received data: ', { username, email, password });
  pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, password], (error, results) => {
    if (error) {
      throw error
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      throw error
    }
    response.status(201).send(`User added with ID: ${results.rows[0].user_id}, Name: ${username}, Email: ${email}, Password: ${password}`)
  })
}
//  PUT Update user information by their user_id.
const updateUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)
  const { username, email, password } = request.body
  console.log('Received data: ', { user_id, username, email, password });
  pool.query(
    'UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4  RETURNING *',
    [username, email, password, user_id ],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`);
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`);
      } else {
        response.status(200).send(`User modified with ID: ${results.rows[0].user_id}`)         	
      }
    }
  )
}
// DELETE a user by their user_id.
const deleteUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('DELETE FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${user_id}`)
  })
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
  console.log('Received data: ', { name, description, price, inventory });
  pool.query(
    'UPDATE products SET name = $1, description = $2, price = $3, inventory = $4 WHERE product_id = $5  RETURNING *',
    [ name, description, price, inventory, product_id ],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`);
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`);
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
      throw error;
    }
    
    if (results.rows.length === 0) {
      response.status(404).send(`Product not found`);
    } else {
      const deletedProduct = results.rows[0];
      response.status(200).send(`Product deleted: Name: ${deletedProduct.name}, Description: ${deletedProduct.description}, Price: ${deletedProduct.price}, Inventory: ${deletedProduct.inventory}`);
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
    }
    response.status(200).json(results.rows)
  })
}
// // Create a new cart for a user with their user_id.
// const createCarts = (request, response) => {
//   const user_id = parseInt(request.params.user_id)

//   const { name, description, price, inventory } = request.body
//   console.log('Received data: ', { name, description, price, inventory });
//   pool.query('INSERT INTO products (name, description, price, inventory) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, price, inventory], (error, results) => {
//     if (error) {
//       throw error
//     } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
//       throw error
//     }
//     response.status(201).send(`Products added with ID: ${results.rows[0].product_id}, Name: ${results.rows[0].name}, description: ${results.rows[0].description}, Price: ${results.rows[0].price}, Inventory: ${results.rows[0].inventory}`)
//   })
// }


module.exports = {
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
}

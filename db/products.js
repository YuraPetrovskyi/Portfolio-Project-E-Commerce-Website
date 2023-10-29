const { pool } = require('../config/pool');


// Get a list of all products.
const getProducts = (request, response) => {
  pool.query('SELECT * FROM products ORDER BY product_id ASC', (error, results) => {
    if (error) {
      response.status(500).json({ error: 'An error occurred while processing the request' });
    }
    response.status(200).json(results.rows)
  })
}
// Get information about a specific product by his product_id.
const getProductsById = (request, response) => {
  const product_id = parseInt(request.params.product_id)

  pool.query('SELECT * FROM products WHERE product_id = $1', [product_id], (error, results) => {
    if (error) {
      response.status(500).json({ error: 'An error occurred while processing the request' });
    }
    if (results.rows.length < 1) {
      return response.status(400).json({ error: 'The product with this ID does not exist in the database' })      
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
      return response.status(500).json({ error: 'An error occurred while processing the request' });
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      return response.status(400).json({ value: 'Invalid input. Please provide valid product data.' });
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
        return response.status(500).json({ error: 'An error occurred while processing the request' });
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`)
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`No product with such ID found`)
      } else {
        response.status(200).send(`Product modified with ID: ${results.rows[0].product_id}, Name: ${results.rows[0].name}, description: ${results.rows[0].description}, Price: ${results.rows[0].price}, Inventory: ${results.rows[0].inventory}`)         	
      }
    }
  )
}
// DELETE a product by their product_id.
const deleteProducts = (request, response) => {
  const product_id = parseInt(request.params.product_id)
  pool.query('DELETE FROM products WHERE product_id = $1 RETURNING name, description, price, inventory', [product_id], (error, results) => {
    if (error) {
      return response.status(500).json({ error: 'An error occurred while processing the request' });
    }
    
    if (results.rows.length === 0) {
      response.status(404).send(`No product with such ID found`)
    } else {
      const deletedProduct = results.rows[0]
      response.status(200).send(`Product deleted: Name: ${deletedProduct.name}, Description: ${deletedProduct.description}, Price: ${deletedProduct.price}, Inventory: ${deletedProduct.inventory}`)
    }
  });
}

// SEARCH a user by their name.
const searchProductsName = (request, response) => {
  const productName = request.query.name; // Отримуємо параметр "name" з запиту
  if (!productName || productName.trim() === '') {
    return response.status(400).json({ error: 'Invalid input. Please provide a valid product name.' });
  }
  pool.query('SELECT * FROM products WHERE name ILIKE  $1', [`%${productName}%`], (error, results) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ error: 'Product search error' });
    }
    response.json(results.rows);
  })
}



module.exports = {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProducts,
  searchProductsName,
}

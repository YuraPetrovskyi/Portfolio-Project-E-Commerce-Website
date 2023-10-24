const { pool } = require('../config/pool');


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

module.exports = {
  getCartItemsByUserId,
  createCartItemByCartId,
  updateCartItemByCartItemId,
  deleteCartItemByCartItemId,
}
const { pool } = require('../config/pool');

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


module.exports = {
  getCartsById,
  createCarts,
  updateCarts,
  deleteCarts,
}
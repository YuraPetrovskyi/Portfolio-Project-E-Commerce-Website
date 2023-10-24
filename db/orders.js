const { pool } = require('../config/pool');


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

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
}
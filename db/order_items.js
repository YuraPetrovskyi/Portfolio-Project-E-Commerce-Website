const { pool } = require('../config/pool');


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
  getOrderItems,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
}
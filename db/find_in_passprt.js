const { pool } = require('../config/pool');


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

module.exports = {
  findByUsername,
  findById,
};
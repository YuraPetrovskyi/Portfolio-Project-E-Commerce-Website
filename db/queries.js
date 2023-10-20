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

    // 1 USERS
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

// DELETE a user
const deleteUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('DELETE FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${user_id}`)
  })
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}



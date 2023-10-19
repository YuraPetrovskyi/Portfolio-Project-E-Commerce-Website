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

/*
GET: / | displayHome()
GET: /users | getUsers()
GET: /users/:id | getUserById()
POST: /users | createUser()
PUT: /users/:id | updateUser()
DELETE: /users/:id | deleteUser()
*/

// GET all users
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

// // GET a single user by ID
// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id)

//   pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

// // POST a new user
// const createUser = (request, response) => {
//   const { name, email } = request.body

//   pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
//     if (error) {
//       throw error
//     } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
//     	throw error
//     }
//     response.status(201).send(`User added with ID: ${results.rows[0].id}`)
//   })
// }

// //  PUT updated data in an existing user
// const updateUser = (request, response) => {
//   const id = parseInt(request.params.id)
//   const { name, email } = request.body

//   pool.query(
//     'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
//     [name, email, id],
//     (error, results) => {
//       if (error) {
//         throw error
//       } 
//       if (typeof results.rows == 'undefined') {
//       	response.status(404).send(`Resource not found`);
//       } else if (Array.isArray(results.rows) && results.rows.length < 1) {
//       	response.status(404).send(`User not found`);
//       } else {
//         response.status(200).send(`User modified with ID: ${results.rows[0].id}`)         	
//       }
//     }
//   )
// }

// // DELETE a user
// const deleteUser = (request, response) => {
//   const id = parseInt(request.params.id)

//   pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).send(`User deleted with ID: ${id}`)
//   })
// }

// module.exports = {
//   getUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   deleteUser,
// }
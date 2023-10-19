const express = require('express')
const bodyParser = require('body-parser')  //the built-in body-parser middleware,
const app = express()
const port = 3000

require('dotenv').config()

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;  
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const user = process.env.user;
const password = process.env.password;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.get('/', (request, response) => {
  response.json({ info: user + password })
})
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

// const express = require('express')
// const bodyParser = require('body-parser')  //the built-in body-parser middleware,
// const app = express()
// const port = 3000

// const db = require('./queries')

// app.use(bodyParser.json())
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// )

// app.get('/', (request, response) => {
//   response.json({ info: 'Node.js, Express, and Postgres API' })
// })

// app.get('/users', db.getUsers)
// app.get('/users/:id', db.getUserById)
// app.post('/users', db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

// app.listen(port, () => {
//   console.log(`App running on port ${port}.`)
// })
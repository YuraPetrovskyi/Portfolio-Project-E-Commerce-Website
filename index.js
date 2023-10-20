const express = require('express')
const bodyParser = require('body-parser')  //the built-in body-parser middleware,
const app = express()
const port = 3000

require('dotenv').config() // for .env

const db = require('./db/queries')

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
app.get('/api', (request, response) => {
  response.json({ info: 'you will work with API' })
})
    // 1 USERS
app.get('/api/users', db.getUsers)
app.get('/api/users/:user_id', db.getUserById)
app.post('/api/users', db.createUser) 
app.put('/api/users/:user_id', db.updateUser)
app.delete('/api/users/:user_id', db.deleteUser)



  // Start server
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

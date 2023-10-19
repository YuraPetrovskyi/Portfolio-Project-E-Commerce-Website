const express = require('express')
const bodyParser = require('body-parser')  //the built-in body-parser middleware,
const app = express()
const port = 3000

require('dotenv').config()
// console.log(process.env)

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;  
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.get('/', (request, response) => {
  response.json({ info: GITHUB_CLIENT_ID })
})
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
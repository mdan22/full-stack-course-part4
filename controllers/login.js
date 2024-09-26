// login.js defines the login router

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // respond with status code 401 unauthorized
  // if user or password is invalid
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  // create a token with jwt.sign()
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // token expires in 1h
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  // a successful request is responded to with status code 200 OK
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter

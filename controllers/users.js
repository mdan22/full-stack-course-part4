// users.js defines the route handlers for users

const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  // Add password validation
  // check password length
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: '`password` is required and `password` must be at least 3 characters long'
    })
  }

  // Add username validation
  // check username length
  if (!username || username.length < 3) {
    return response.status(400).json({
      error: '`username` is required and `username` must be at least 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter

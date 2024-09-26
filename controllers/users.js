// users.js defines the route handlers for users

const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.get('/', async (request, response) => {
  // use populate() to 'join' user and blogs
  // here: show blog information like title, author, etc. within a user of user list
  const users = await User
    .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1  }) // id is always returned

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

// adjusting the delete operation was not required but did it anyways
usersRouter.delete('/:id', async (request, response) => {
  const userId = request.params.id

  // 'malformatted id' error is handled by the middleware

  const user = await User.findById(userId)
  if (!user) {
    return response.status(204).end()
  }

  // Delete all blogs associated with the user
  await Blog.deleteMany({ user: userId })

  // Delete the user
  await User.findByIdAndDelete(userId)

  response.status(204).end()
})

module.exports = usersRouter

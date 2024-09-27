const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const saltRounds = 10

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  }
]

// can be used for creating a database object ID that
// does not belong to any blog object in DB
const nonExistingId = async ( user ) => {
  const blog = new Blog({
    title: 'willremovethissoon',
    url: 'http://www.u.arizona.edu/willremovethissoon',
    user: user._id // added the user since it is now required
  })

  return blog._id.toJSON()
}

// can be used for checking the blogs stored in DB
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const getAuthToken = async () => {
  // create a test user
  const hash = await bcrypt.hash('sekret', 10)

  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: hash
  })
  await user.save()

  // create and sign a token
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  return { token, user }
}

const hashPassword = async ( password ) => {
  return await bcrypt.hash(password, saltRounds)
}

const test_helper = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getAuthToken,
  hashPassword,
}

module.exports = test_helper

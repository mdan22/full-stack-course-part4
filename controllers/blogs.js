const User = require('../models/user')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  // use populate() to 'join' user and blogs
  // here: show user information like username and name within a blog of blog list
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// new blogs can only be added if a valid token is send
// in the header of the HTTP POST request.
// the user associated with the token is designated as the creator of the blog.
// Tested with REST CLient:
// - user is then visible within the blog object
// - blogs are visible within the user object
blogsRouter.post('/', async (request, response) => {
  const body = request.body

  // check token validity
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author || '',
    url: body.url,
    likes: body.likes || 0,
    // set blog's user id
    user: user._id
  })

  const savedBlog = await blog.save()

  // add blog id to user's blog list
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

// adjusting the delete operation wasn't required but did it anyways
blogsRouter.delete('/:id', async (request, response) => {
  const blogId = request.params.id

  // check token validity
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const blog = await Blog.findById(blogId)
  // depending on the use case 404 could be used if blog is not found
  // can be moved to the error handler middleware
  if (!blog) {
    return response.status(204).end()
  }

  const blogUser = await User.findById(blog.user)

  // we check if the logged in user is the user that posted the blog
  // if not server responds with 401
  if ( blog.user.toString() !== decodedToken.id.toString() ) {
    return response.status(401).end() // unauthorized
  }

  await Blog.findByIdAndDelete(blogId)

  if (blogUser) {
    blogUser.blogs = blogUser.blogs.filter(b => b.toString() !== blogId)
    await blogUser.save()
  }

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' }
  )

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter
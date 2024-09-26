const User = require('../models/user')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  // use populate() to 'join' user and blogs
  // here: show user information like username and name within a blog of blog list
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  let user
  if (body.userId) {
    user = await User.findById(body.userId)
  } else {
    // if no userId is provided, get first user from db
    user = await User.findOne({})
  }

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

  const blog = await Blog.findById(blogId)
  // depending on the use case 404 could be used if blog is not found
  // can be moved to the error handler middleware
  if (!blog) {
    return response.status(204).end()
  }

  const user = await User.findById(blog.user)

  await Blog.findByIdAndDelete(blogId)

  if (user) {
    user.blogs = user.blogs.filter(b => b.toString() !== blogId)
    await user.save()
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
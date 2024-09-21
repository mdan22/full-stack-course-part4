// blogs.js defines the routes for the blog list

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
  // in express 5 the error is catched and passed to error-handling middleware internally.
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  // handle missing title or url for 4.12*
  if (!blog.title || !blog.url ) {
    response.status(400).end()
  }

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

module.exports = blogsRouter

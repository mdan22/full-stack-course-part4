// blogs.js defines the routes for the blog list

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const mongoose = require('mongoose')

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

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  // Check if the id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // Respond with status code 400: Not Found if id is invalid
    return response.status(400).json({ error: 'malformatted id' })
  }

  // Attempt to delete the blog
  await Blog.findByIdAndDelete(request.params.id)

  // Respond with 204 No Content whether the blog existed or not
  response.status(204).end() // No Content (id is valid + exists or not)
})

module.exports = blogsRouter

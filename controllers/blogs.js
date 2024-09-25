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

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  // Attempt to delete the blog
  await Blog.findByIdAndDelete(request.params.id)

  // Respond with 204 No Content whether the blog existed or not
  response.status(204).end() // No Content (id is valid + exists or not)
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    // these options r necessary to ensure the op returns the updated document
    { new: true, runValidators: true, context: 'query' }
  )

  updatedBlog
    ? response.status(200).json(updatedBlog) // OK: operation succeeds
    : response.status(404).end() // Not Found

  response.json(updatedBlog)
})

module.exports = blogsRouter

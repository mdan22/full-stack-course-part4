const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')

const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')

// imports the express application from app.js
const app = require('../app')
// wraps the app with supertest function into a superagent object
const api = supertest(app)
// now tests can use the api var for making HTTP requests to the backend

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared')

  for(let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
    console.log('saved')
  }

  console.log('done')
})

// 4.8: Blog List Tests, step 1
// Verify that the blog list application returns the
// correct amount of blog posts in the JSON format
test('all blogs are returned correctly and in the json format', async () => {
  const response =
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // execution gets here only after the HTTP request is complete
  // the result of HTTP request is saved in variable response
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

// 4.9: Blog List Tests, step 2
// Verify that the unique identifier property of the
// blog posts is named id, by default the database
// names the property _id
test('all blogs have a property named id, but not _id', async () => {
  const response =
  await api
    .get('/api/blogs')

  const blogs = response.body
  blogs.forEach(blog => {
    assert(blog.id)
    assert(!blog._id) // could be skipped but done for clarity
  })
})

after(async () => {
  await mongoose.connection.close()
})

const { test, after, beforeEach, describe } = require('node:test')
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

const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  // insertMany instead of for of loop to make code simpler
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially some blogs saved', async () => {
  // 4.8: Blog List Tests, step 1
  // Verify that the blog list application returns the
  // correct amount of blog posts in the JSON format
  test('all blogs are returned correctly and in the json format', async () => {
    // make the HTTP GET request
    const response =
    await api
      .get('/api/blogs')
      .expect(200) // ok
      .expect('Content-Type', /application\/json/)

    // execution gets here only after the HTTP request is complete
    // the result of HTTP request is saved in variable response

    // verify that the total number of blogs in system and db is the same and correct
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // 4.9: Blog List Tests, step 2
  // Verify that the unique identifier property of the
  // blog posts is named id, by default the database
  // names the property _id
  test('all blogs have a property named id, but not _id', async () => {
    // make the HTTP GET request
    const response =
    await api
      .get('/api/blogs')

    // verify that all blogs have the property id
    const blogs = response.body
    blogs.forEach(blog => {
      assert(blog.id)
      assert(!blog._id) // could be skipped but done for clarity
    })
  })

  describe('viewing a specific blog', () => {
    // more tests can be added later
  })

  describe('addition of a new blog', () => {
    // 4.10: Blog List Test, step 3
    // Verify that making a HTTP POST request for the
    // /api/blogs URL successfully creates a new blog post
    test('a valid blog can be added', async () => {
      const newBlog = {
        'title': 'How to install Windows',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
        'likes': 7
      }

      // make the HTTP POST request
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201) // content created
        .expect('Content-Type', /application\/json/)

      // verify that the total number of blogs in the system
      // is increased by one
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      // verify that the added blog is in DB
      const titles = blogsAtEnd.map(blog => blog.title)
      assert(titles.includes('How to install Windows'))
    })

    // 4.11*: Blog List Tests, step 4
    // Verify that if the likes property is missing from
    // the request, it will default to the value zero
    test('like property missing results in value 0', async () => {
      const newBlog =     {
        'title': 'Hello, Blog!',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html'
      }

      // make the HTTP POST request
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201) // content created
        .expect('Content-Type', /application\/json/)

      // verify that the total number of blogs in the system
      // is increased by one
      const blogsAtEnd = await helper.blogsInDb()
      assert.deepStrictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      // verify that the added blog is in DB
      const titles = blogsAtEnd.map(blog => blog.title)
      assert(titles.includes('Hello, Blog!'))

      // verify that the likes property is set to 0
      assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
    })

    // 4.12*: Blog List tests, step 5
    // Verify that if the title or url properties are missing
    // from the request data, the backend responds with the
    // status code 400 Bad Request
    test('title or url properties missing result in status code 400 Bad Request', async () => {
      const newBlogNoTitle =     {
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html'
      }

      const newBlogNoUrl =     {
        'title': 'Hello, Blog!',
        'author': 'Akira Taguchi',
      }

      const newBlogOnlyAuthor =     {
        'author': 'Akira Taguchi',
      }

      // make HTTP POST request without title
      await api
        .post('/api/blogs')
        .send(newBlogNoTitle)
        .expect(400) // bad request

      // make HTTP POST request without url
      await api
        .post('/api/blogs')
        .send(newBlogNoUrl)
        .expect(400) // bad request

      // make HTTP POST request with missing title and url
      await api
        .post('/api/blogs')
        .send(newBlogOnlyAuthor)
        .expect(400) // bad request
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid and exists', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToUpdate.id}`)
        .expect(204) // no content

      const blogsAtEnd = await helper.blogsInDb()
      // using notesAtStart here (instead of helper.initialNotes) so the test dynamically adapts to the current state of the database
      assert.strictEqual(blogsAtStart.length - 1, blogsAtEnd.length)

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToUpdate.title))
    })

    test('results in status code 400 if id is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400) // bad request

      const blogsAtEnd = await helper.blogsInDb()
      // using notesAtStart here (instead of helper.initialNotes) so the test dynamically adapts to the current state of the database
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
    })

    test('results in status code 204 if id is valid but blog doesn\'t exist', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const validNonExistentId = '66efbe933f0982d6deec6924'

      await api
        .delete(`/api/blogs/${validNonExistentId}`)
        .expect(204) // no content

      const blogsAtEnd = await helper.blogsInDb()
      // using notesAtStart here (instead of helper.initialNotes) so the test dynamically adapts to the current state of the database
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
    })
  })
  describe('update of a blog', () => {
    test('succeeds with status code 200 if id is valid and exists', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlogData = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1 // increment likes
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200) // ok
        .expect('Content-Type', /application\/json/)

      const updatedBlog = response.body
      assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
    })

    test('results in status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .put(`/api/blogs/${invalidId}`)
        .send({})
        .expect(400) // bad request
    })

    test('results in status code 404 if id is valid but blog doesn\'t exist', async () => {
      const validNonExistentId = '66efbe933f0982d6deec6924'

      await api
        .put(`/api/blogs/${validNonExistentId}`)
        .send({})
        .expect(404) // not found
    })
  })
})

describe('when there is initially one user in db', async () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'hellas', name: 'Arto Hellas', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(userAtStart.length + 1, usersAtEnd.length)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hellas',
      name: 'Superuser',
      password: 'sekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
  })

  test('creation fails with proper statuscode and message if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Superuser',
      password: 'sekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('`username` is required'))

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
  })

  test('creation fails with proper statuscode and message if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'superuser',
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('`password` is required'))

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
  })

  test('creation fails with proper statuscode and message if name is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'superuser',
      password: 'sekret',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('`name` is required'))

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
  })

})

after(async () => {
  await mongoose.connection.close()
})

const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let token
let user

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // create a test user with authentication token
  const auth = await helper.getAuthToken()
  token = auth.token
  user = auth.user

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog({
      ...blog,
      user: user._id
    }))
  await Blog.insertMany(blogObjects)
})

describe('when there is initially some blogs saved', () => {
  // 4.8: Blog List Tests, step 1
  // Verify that the blog list application returns the
  // correct amount of blog posts in the JSON format
  test('all blogs are returned correctly and in the json format', async () => {
    // make the HTTP GET request
    const response = await api
      .get('/api/blogs')
      .expect(200) // ok
      .expect('Content-Type', /application\/json/)

    // verify that the total number of blogs in system and db is the same and correct
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // 4.9: Blog List Tests, step 2
  // Verify that the unique identifier property of the
  // blog posts is named id, by default the database
  // names the property _id
  test('all blogs have a property named id, but not _id', async () => {
    // make the HTTP GET request
    const response = await api.get('/api/blogs')
    // verify that all blogs have the property id
    const blogs = response.body
    blogs.forEach(blog => {
      assert(blog.id)
      assert(!blog._id)
    })
  })

  describe('addition of a new blog', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        'title': 'How to install Windows',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
        'likes': 7
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(titles.includes('How to install Windows'))
    })

    test('like property missing results in value 0', async () => {
      const newBlog = {
        'title': 'Hello, Blog!',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    })

    // 4.12*: Blog List tests, step 5
    // Verify that if the title or url properties are missing
    // from the request data, the backend responds with the
    // status code 400 Bad Request
    test('title or url properties missing result in status code 400 Bad Request', async () => {
      const newBlogNoTitle = {
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html'
      }

      const newBlogNoUrl = {
        'title': 'Hello, Blog!',
        'author': 'Akira Taguchi',
      }

      const newBlogOnlyAuthor = {
        'author': 'Akira Taguchi',
      }

      // make HTTP POST request without title
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogNoTitle)
        .expect(400) // bad request

      // make HTTP POST request without url
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogNoUrl)
        .expect(400) // bad request

      // make HTTP POST request with missing title and url
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogOnlyAuthor)
        .expect(400) // bad request
    })

    // 4.23*: Blog List Expansion, step 11
    // add this test for status code 401
    test('results in status code 401 if a token is not provided', async () => {
      const newBlog = {
        'title': 'How to install Windows',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
        'likes': 7
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401) // unauthorized
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes('How to install Windows'))
    })
  })

  // 4.23*: Blog List Expansion, step 11
  // fix the failing tests for deleting blogs
  describe('deletion of a blog', () => {
    let blogToDelete

    beforeEach(async () => {
      const blog = new Blog({
        title: 'Test Blog',
        author: 'Test Author',
        url: 'http://test.com',
        user: user._id
      })
      await blog.save()
      blogToDelete = blog
    })

    test('succeeds with status code 204 if id is valid and exists', async () => {
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    })

    test('returns status code 204 if id is valid but non-existent', async () => {
      const validNonExistentId = await helper.nonExistingId(user)

      await api
        .delete(`/api/blogs/${validNonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
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
        likes: blogToUpdate.likes + 1
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const updatedBlog = response.body
      assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)
    })

    test('results in status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .put(`/api/blogs/${invalidId}`)
        .send({})
        .expect(400)
    })

    test('results in status code 404 if id is valid but non-existent', async () => {
      const validNonExistentId = await helper.nonExistingId(user)

      await api
        .put(`/api/blogs/${validNonExistentId}`)
        .send({})
        .expect(404)
    })
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await helper.hashPassword('sekret')
    await new User({ username: 'hellas', name: 'Arto Hellas', passwordHash }).save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

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
    assert.strictEqual(usersAtStart.length + 1, usersAtEnd.length)

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

  test('creation fails with proper statuscode and message if password is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'superuser',
      name: 'Superuser',
      password: 'se',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('`password` must be at least 3 characters long'))

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
  })

  test('creation fails with proper statuscode and message if username is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'su',
      name: 'Superuser',
      password: 'sekret',
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('`username` must be at least 3 characters long'))

    assert.strictEqual(usersAtStart.length, usersAtEnd.length)
  })
})

describe('deletion of a user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await helper.hashPassword('sekret')
    user = new User({ username: 'testuser', name: 'Test User', passwordHash })
    await user.save()

    const blog = new Blog({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://test.com',
      user: user._id
    })
    await blog.save()
  })

  test('succeeds with status code 204 if id is valid and exists', async () => {
    await api
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, 0)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, 0)
  })

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = '12345'

    await api
      .delete(`/api/users/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, 1)
  })

  test('returns status code 204 if id is valid but non-existent', async () => {
    const nonExistentId = await helper.nonExistingId(user)

    await api
      .delete(`/api/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})

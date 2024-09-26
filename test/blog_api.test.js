const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create a test user
  const hash = await bcrypt.hash('sekret', 10)

  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: hash
  })
  await user.save()

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog({
      ...blog,
      user: user._id
    }))
  await Blog.insertMany(blogObjects)
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
    test('a valid blog can be added', async () => {
      const newBlog = {
        'title': 'How to install Windows',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
        'likes': 7
      }

      await api
        .post('/api/blogs')
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
      // using blogsAtStart here (instead of helper.initialBlogs) so the test dynamically adapts to the current state of the database
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
      // using blogsAtStart here (instead of helper.initialBlogs) so the test dynamically adapts to the current state of the database
      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
    })

    test('results in status code 204 if id is valid but blog doesn\'t exist', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const validNonExistentId = '66efbe933f0982d6deec6924'

      await api
        .delete(`/api/blogs/${validNonExistentId}`)
        .expect(204) // no content

      const blogsAtEnd = await helper.blogsInDb()
      // using blogsAtStart here (instead of helper.initialBlogs) so the test dynamically adapts to the current state of the database
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

  // for 4.15: Blog List Expansion, step 3
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

  // for 4.15: Blog List Expansion, step 3
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

  // for 4.16*: Blog List Expansion, step 4
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

  // for 4.16*: Blog List Expansion, step 4
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

  // for 4.16*: Blog List Expansion, step 4
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

  // for 4.16*: Blog List Expansion, step 4
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

  // for 4.16*: Blog List Expansion, step 4
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

describe('deletion of a blog', () => {
  let user
  let blog
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const hash = await bcrypt.hash('secreto', 10)

    user = new User({
      username: helper.initialBlogs[0].author.replace(/\s+/g, ''),
      name: helper.initialBlogs[0].author,
      passwordHash: hash
    })
    await user.save()

    blog = new Blog(helper.initialBlogs[0])
    await blog.save()

    blog.user = user._id
    await blog.save()

    user.blogs = user.blogs.concat(blog._id)
    await user.save()
  })

  test('succeeds with status code 204 if id is valid', async () => {
    await api
      .delete(`/api/blogs/${blog.id}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, 0)

    const userAtEnd = await User.findById(user._id)
    assert.strictEqual(userAtEnd.blogs.length, 0)
  })

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = 'invalidid'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, 1)
  })

  test('returns status code 204 if id is valid but non-existent', async () => {
    const nonExistentId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistentId}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, 1)
  })
})

describe('deletion of a user', () => {
  let user
  let userId

  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    user = new User({ username: 'testuser', name: 'Test User', passwordHash })
    await user.save()
    userId = user._id

    const blog = new Blog({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://testurl.com',
      user: user._id
    })
    await blog.save()
  })

  test('succeeds with status code 204 if id is valid and exists', async () => {
    await api
      .delete(`/api/users/${userId}`)
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
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, 1)
  })

  test('returns status code 204 if id is valid but non-existent', async () => {
    const nonExistentId = await helper.nonExistingId()

    await api
      .delete(`/api/users/${nonExistentId}`)
      .expect(204)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})

// totalLikes.test.js contains tests for function 'dummy'
// tests are written using Node.js's built-in assert module

const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// using a describe block to group tests into a logical collection
describe('total likes', () => {
  const emptyList = []

  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const biggerList = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
      'title': 'Hello, Blog!',
      'author': 'Akira Taguchi',
      'url': 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html',
      'likes': 3
    },
    {
      'title': 'How to install Windows',
      'author': 'Akira Taguchi',
      'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
      'likes': 7
    },
  ]

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes(emptyList)
    assert.strictEqual( result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual( result, 5)
  })

  test('of bigger list is calculated right', () => {
    const result = listHelper.totalLikes(biggerList)
    assert.strictEqual( result, 15)
  })
})

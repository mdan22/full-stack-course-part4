// favoriteLikes.test.js contains tests for function 'favoriteLikes'
// tests are written using Node.js's built-in assert module

const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// using a describe block to group tests into a logical collection
describe('favorite likes', () => {
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
      'likes': 6
    },
    {
      'title': 'How to install Windows',
      'author': 'Akira Taguchi',
      'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
      'likes': 7
    },
  ]

  test('of empty list is also an empty blog list', () => {
    const result = listHelper.favoriteLikes(emptyList)
    assert.deepStrictEqual( result, {})
  })

  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.favoriteLikes(listWithOneBlog)
    assert.deepStrictEqual( result,
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
      }
    )
  })

  test('of bigger list is finding the right blog', () => {
    const result = listHelper.favoriteLikes(biggerList)
    assert.deepStrictEqual( result,
      {
        'title': 'How to install Windows',
        'author': 'Akira Taguchi',
        'url': 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
        'likes': 7
      }
    )
  })
})

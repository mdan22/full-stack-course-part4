// mostLikes.test.js contains tests for function 'mostLikes'
// tests are written using Node.js's built-in assert module

const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// using a describe block to group tests into a logical collection
describe('most likes', () => {
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

  const biggerListSameAuthor = [
    {
      _id: '5a422aa71b54a676234d17f4',
      title: 'Hello, Blog!',
      author: 'Akira Taguchi',
      url: 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html',
      likes: 6,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676294d17f8',
      title: 'How to install Windows',
      author: 'Akira Taguchi',
      url: 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
      likes: 7,
      __v: 0
    }
  ]
  const biggerListDiffAuthors = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676234d17f4',
      title: 'Hello, Blog!',
      author: 'Akira Taguchi',
      url: 'https://akirataguchi115.github.io/misc/2023/12/31/hello-blog.html',
      likes: 6,
      __v: 0
    },
    {
      _id: '5a422aa71b54a676294d17f8',
      title: 'How to install Windows',
      author: 'Akira Taguchi',
      url: 'https://akirataguchi115.github.io/misc/2024/01/14/how-to-install-windows.html',
      likes: 7,
      __v: 0
    }
  ]

  test('of empty list is also an empty list', () => {
    const result = listHelper.mostLikes(emptyList)
    assert.deepStrictEqual( result, {})
  })

  test('when list has only one blog, equals that blog\'s author and that blog\'s likes', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepStrictEqual( result,
      {
        author: 'Edsger W. Dijkstra',
        likes: 5
      }
    )
  })

  test('when list has multiple blogs of one author, equals that author and the sum of their blog likes', () => {
    const result = listHelper.mostLikes(biggerListSameAuthor)
    assert.deepStrictEqual( result,
      {
        author: 'Akira Taguchi',
        likes: 13
      }
    )
  })

  test('of bigger list finds the right author calculates the correct sum of their blog likes', () => {
    const result = listHelper.mostLikes(biggerListDiffAuthors)
    assert.deepStrictEqual( result,
      {
        author: 'Akira Taguchi',
        likes: 13
      }
    )
  })
})

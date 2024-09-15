// mostBlogs.test.js contains tests for function 'mostBlogs'
// tests are written using Node.js's built-in assert module

const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// using a describe block to group tests into a logical collection
describe('most blogs', () => {
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

  test('of empty list is also an empty blog list', () => {
    const result = listHelper.mostBlogs(emptyList)
    assert.deepStrictEqual( result, {})
  })

  test('when list has only one blog, equals that author and blog count 1', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual( result,
      {
        author: 'Edsger W. Dijkstra',
        blogs: 1
      }
    )
  })

  test('when list has multiple blogs of one author, equals that author and the list length as blog count', () => {
    const result = listHelper.mostBlogs(biggerListSameAuthor)
    assert.deepStrictEqual( result,
      {
        author: 'Akira Taguchi',
        blogs: 2
      }
    )
  })

  test('of bigger list is finding the right author and their blog count', () => {
    const result = listHelper.mostBlogs(biggerListDiffAuthors)
    assert.deepStrictEqual( result,
      {
        author: 'Akira Taguchi',
        blogs: 2
      }
    )
  })
})

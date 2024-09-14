// dummy.test.js contains tests for function 'dummy'
// tests are written using Node.js's built-in assert module

const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual( result, 1)
})

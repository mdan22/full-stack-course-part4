// list_helper.js is a collection of helper functions for
// working with the describe sections of the blog list

// function that receives an array of blog posts as a parameter and always returns the value 1
const totalLikes = (blogs) => {
  const reducer = (sum, blogs) => {
    return sum + blogs.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const list_helper = {
  totalLikes
}

module.exports = list_helper

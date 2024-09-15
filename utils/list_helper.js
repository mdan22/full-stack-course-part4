// list_helper.js is a collection of helper functions for
// working with the describe sections of the blog list

// function that receives an array of blog posts
// and returns the total sum of likes of all blog posts
const totalLikes = (blogs) => {
  const reducer = (sum, blogs) => {
    return sum + blogs.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

// function that receives an array of blog posts
// and returns the blog post with the most likes
const favoriteLikes = (blogs) => {
  // reducer checks for each blog if it has more likes
  // if it does it updates the current favorite blog
  const reducer = (favorite, blog) => {
    return (blog.likes > favorite.likes) ? blog : favorite
  }

  return blogs.length === 0
    ? {}
    : blogs.reduce(reducer, blogs[0])
}

const list_helper = {
  totalLikes,
  favoriteLikes
}

module.exports = list_helper

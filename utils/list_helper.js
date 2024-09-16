// list_helper.js is a collection of helper functions for
// working with the describe sections of the blog list

// load the lodash library
var _ = require('lodash')

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

// function that receives an array of blog posts
// and returns the author (and his blog count) with the most blogs
const mostBlogs = (blogs) => {
  // group blogs by author using lodash's .groupBy function
  const groupedBlogs = _.groupBy(blogs, 'author')

  // find the author with most blogs using lodash's .maxBy function by comparing each author group length
  // We need Object.keys because _.maxBy expects an array of objects, not an object
  // groupedBlogs is an object where the keys are author names and the values are arrays of blogs.
  const mostBlogsAuthor = _.maxBy(Object.keys(groupedBlogs), (author) => groupedBlogs[author].length)

  // return object of that author with attributes 'author' and 'blogs'
  return blogs.length === 0
    ? {} :
    {
      author: mostBlogsAuthor,
      blogs: groupedBlogs[mostBlogsAuthor].length
    }
}

// function that receives an array of blog posts
// and returns the author with the most likes
// and the sum of his blogs' likes
const mostLikes = (blogs) => {
  // group blogs by author using lodash's .groupBy function
  const groupedBlogs = _.groupBy(blogs, 'author')

  // create an array that contains overall like count 'likes' of all blogs for each author
  const likesPerAuthor = _.map(groupedBlogs, (blogGroup, author) => ({
    author: author,
    likes: _.sumBy(blogGroup, 'likes')
  }))

  // find the author with most blogs using lodash's .maxBy function by comparing each author group likes
  const mostLikesAuthor = _.maxBy(likesPerAuthor, 'likes')

  return blogs.length === 0 ? {} : mostLikesAuthor
}

const list_helper = {
  totalLikes,
  favoriteLikes,
  mostBlogs,
  mostLikes
}

module.exports = list_helper

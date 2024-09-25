// blog.js defines the Mongoose schema for blogs
// and sets the toJSON method for the schema

const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true }, // added required for 4.12*
  author: String,
  url: { type: String, required: true }, // added required for 4.12*
  likes: { type: Number, default: 0 }, // added default value for 4.11*
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog

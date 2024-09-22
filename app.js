// app.js creates the actual application
// and takes the router into use
// it also is responsible of establishing the connection to MongoDB

const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')

const blogsRouter = require('./controllers/blogs')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

// we probably don't need to set strictQuery to false (but would put it here)

logger.info('connecting to MongoDB')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
// might need this in the future:
// app.use(express.static('dist'))
app.use(express.json())

// has to be placed before the route handlers
// app.use(middleware.requestLogger) // but toggled this so the console doesn't get bloated

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

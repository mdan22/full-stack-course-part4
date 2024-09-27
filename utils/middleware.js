// middleware.js contains the middleware functions

const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests that result in errors
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  if(error.name === 'CastError') {
    return response.status(400).send({ error:'malformatted id' }) // bad request
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message }) // bad request
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' }) // bad request
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' }) // unauthorized
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })// unauthorized
  }

  next(error)
}

// extracts token from request header
// and updates request.token to the extracted token
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  }
  else {
    request.token = null
  }
  next()
}

const middleware  = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
}

module.exports = middleware

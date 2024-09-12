// important: envs need to be available globally before
// the code from other modules is imported.
require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

// use static to make Express show static content, the
// page index.html and the JavaScript, etc. which it fetches
app.use(express.static('dist'))

// use cors to allow for requests from all origins
app.use(cors())

// use the middleware 'json-parser' from the express package
app.use(express.json())

// using the middleware 'morgan'...

// define custom token to log the request body for POST requests
morgan.token('body', (req) => JSON.stringify(req.body))

// define custom format for POST requests
const postFormat = ':method :url :status :res[content-length] - :response-time ms :body'

// use custom format for POST requests and 'tiny' for all other requests
app.use((req, res, next) => {
  const format = (req.method === 'POST' ? postFormat : 'tiny')
  morgan(format)(req, res, next)
})

// get request: persons array is send as a JSON-string
// Express automatically sets the Content-Type header
// with the appropriate value of application/json
// we can now use Person.find to fetch a specific person from MongoDB
// no other changes needed here
app.get( '/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// get request: /api/info displays number of entries/persons and date of the request
app.get( '/api/info', (request, response, next) => {
  Person.countDocuments({})
    .then(numberOfEntries => {
      const currentDate = new Date()
      response.send(
        `<p>Phonebook has info for ${numberOfEntries} people<p/>
         <p/>${currentDate}</p>`
      )
    })
    .catch(error => next(error))
})

// get request: get data of specific person by id
// I already made some changes here but wrong ids lead to app crash
// error handling is needed and will be added later
app.get('/api/persons/:id', (request, response, next) => {
  // finding the person via findById makes the code simpler
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      }
      else {
        response.status(404).end() // the requested data was not found
      }
    })
    .catch(error => next(error))
})

// delete request: delete a specific person from persons by id if it exists
app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      // in both cases (id exists or not) we respond with the same code
      response.status(204).end() // 204 means "no content"
    })
    .catch(error => next(error)) // next passes exceptions to the error handler
})

// post request: posts a new person entry with name, number data and a random id
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // a person can't be added if name and number data content is empty
  // '!body.name' and 'body.name === undefined' do the same thing
  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // check if a person with the same name already exists
  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(
    savedPerson => {
      // because we use .save method we don't need .concat anymore
      response.json(savedPerson)
    }
  )
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  // we need the {new: true} parameter so the modified version
  // of the person 'updatedPerson' is given to the event handler
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    // added runValidators: true, context: 'query'
    // so the validation works for PUT route
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if(error.name === 'CastError') {
    return response.status(400).send({ error:'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware,
// also all the routes should be registered before this!

// handler of requests that result in errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// 3.21: I verified that everything works at https://mdan22-fsc.onrender.com/ as well

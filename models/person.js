// db configuration are moved to its own module
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI;

console.log('connecting to', url)

// establish the connection to the database
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')        
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

// define the schema for a person and the matching model
const personSchema = new mongoose.Schema({
  // we define constraints for attribute 'name' of type 'String'
  name: {
    type: String,
    minLength: 3,
    required: true
  },

  // here we could define constraints for attribute 'number' of type 'String'
  // do 3.20* here

  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d+$/.test(v);
      },
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// The public interface of the module is defined by setting
// a value to the module.exports variable
// changed 'person' to 'Person' to match the error msg in solution
module.exports = mongoose.model('Person', personSchema)

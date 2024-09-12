const mongoose = require('mongoose')

// base case: node mongo.js:
// no password given
if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

// we can pass database user password with the command
// node mongo.js yourPassword
const password = process.argv[2]

const url = `mongodb+srv://mdan22:${password}@cluster0.x1k0o1c.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

// establish the connection to the database
mongoose.connect(url)

// define the schema for a person and the matching model
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('person', personSchema)

// case no person parameters given: node mongo.js yourPassword:
// this lists all Person objects
if (process.argv.length === 3) {

    // Use an array to collect entries
    const entries = [];

    // retrieve objects from the DB with the find method
    // the parameter of find() expresses search conditions
    // so an empty object {} results in getting all persons stored in the persons collection
    Person.find({}).then(result => {
      result.forEach(person => {
        entries.push(`${person.name} ${person.number}`)
      })
      // join the array using '\n' and add "phonebook: \n" to start of output string
      console.log("phonebook: \n" + entries.join('\n'))
      mongoose.connection.close()
    })
}

// case person parameters name and number given:
// node mongo.js yourPassword name number:
// adds a Person object to database
else {
    const name = process.argv[3]
    const number = process.argv[4]
    
    // create a new person object with the help of the Person model
    const person = new Person({
      name: name,
      number: number,
    })
    
    // call save method which saves the object to the database
    // and close the connection to end the execution of this code
    person.save().then(result => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
}

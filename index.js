
const express = require('express')
const app = express()
require('dotenv').config()
const morgan = require('morgan')
const Person = require('./models/person')

const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(express.json()) 
//app.use(logger) 

morgan.token('postBody', function getBody (req) {
  if(req.method == 'POST'){
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postBody'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.post('/api/persons', (request, response, next) => {
  const name = request.body.name
  const number =  request.body.number
  
  if (!name) {
    return response.status(400)
     .send({ error: 'name missingQQ' })
  }
  if (!number) {
    return response.status(400)
    .send({ 
      error: 'number missingAA' 
    })
  }
  let existingPerson 
  Person.find({name: name})
    .then(person => existingPerson = person)
    .catch(error => existingPerson = null)
  if(!existingPerson) {  //normal case
    const person = new Person({
      name: name,
      number: number,
      date: new Date()
    })

    person.save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => {
      response.json(savedAndFormattedNote)
    }) 
    .catch(error => next(error))
  }else{ // updating existing
    existingPerson.number = number
    Person.findByIdAndUpdate(existingPerson.id, existingPerson, { new: true })
    .then(updatedNote => {
      response.json(updatedNote.toJSON())
    })
    .catch(error => next(error))
  }
})

app.get('/api/info', (request, response, next) => {
  console.log("apiInfo")
  Person.find({})
  .then(persons => {
    console.log("people", persons)    
    response.contentType('text/plain')
    response.end("Phonebook has info for " + persons.length + " people\n\n" +
        new Date()
    )
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error)) 
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedNote => {
      response.json(updatedNote.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' && error.path === '_id') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

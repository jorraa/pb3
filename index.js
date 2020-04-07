const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json()) 
morgan.token('postBody', function getBody (req) {
  if(req.method == 'POST'){
    return JSON.stringify(req.body)
  }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postBody'))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})
app.get('/api/info', (req, res) => {
  res.contentType('text/plain')
  res.end("Phonebook has info for " + persons.length + " people\n\n" +
        new Date()
  )
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
      response.json(person)
  } else {
      response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})
 
const generateId = () => parseInt(100000*Math.random())

app.post('/api/persons', (request, response) => {
  console.log("body", request.body)
  
  const name = request.body.name
  const number =  request.body.number
  
  if (!name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  console.log("persons.findIndex((p) => p.name===name", persons.findIndex((p) => p.name===name))
  if(persons.findIndex((p) => p.name===name) > -1){
    return response.status(400).json({ 
      error: 'name must be unique'
    })  
  }

  const person = {
    name: name,
    number: number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
  })
const port = 3001
app.listen(port)
console.log(`Server running on port ${port}`)
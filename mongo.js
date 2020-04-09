const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
console.log("args", process.argv)
const url = 
    `mongodb+srv://jorma:${password}@cluster0-kmsw3.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length >4) {
    const name = process.argv[3] 
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number,
        date: new Date()
    })

    person.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
    })
}else{
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
    mongoose.connection.close()
    })
}
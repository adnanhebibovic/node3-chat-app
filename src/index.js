const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const Messages = require('./utils/messages') 
const Users = require('./utils/users')

const users = new Users()

const app = express()
const server = http.Server(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {

    socket.on('welcome', () => {
        var message = new Messages(socket)

        const username = socket.handshake.auth.user
        socket.handshake.auth.user = 'System'
        socket.emit('message', message.generate(`Welcome ${username}!`))
        socket.broadcast.emit('message', message.generate(`${username} has joined!`))
        socket.handshake.auth.user = username

        io.emit('welcome', users.add(username))
    })
    
    socket.on('message', (text, callback) => {
        const filter = new Filter()

        if (filter.isProfane(text)) {
            return callback('Rejected')    
        }

        var message = new Messages(socket)

        io.emit('message', message.generate(text))
        callback('Delivered')
    })

    socket.on('location', (location, callback) => {
        var message = new Messages(socket)

        io.emit('location', message.generate(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Shared')
    })

    socket.on('disconnect', () => {
        var message = new Messages(socket)

        const username = socket.handshake.auth.user
        io.emit('goodbye', users.remove(username))
        
        socket.handshake.auth.user = 'System'
        io.emit('message', message.generate(username + ' just left!'))
    })
})

server.listen(port, () => {
    console.log('Server is up and running on port ' + port)
})

const PORT = 3000
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { serveClient: false })
const cors = require('cors')
const postgre = require('./postgre')
app.use(cors())

postgre.registerNewTable()







//SOCKET IO EXAMPLE
let timer

io.on('connection', (socket) => {
  socket.join(socket.id)
  const time = () => {
    const d = new Date();
    socket.emit(socket.id, d.toLocaleTimeString())
  }
  console.log('a user connected')
  timer = setInterval(() => time(), 1000)
  socket.on('disconnect', () => {
    console.log('user disconnected')
    clearInterval(timer)
  })
})



//SERVER LISTEN
server.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})

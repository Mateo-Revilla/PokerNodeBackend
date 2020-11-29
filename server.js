const PORT = 3000
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { serveClient: false })
const cors = require('cors')
const postgre = require('./postgre')
app.use(cors())







//-------------------------------------EXAMPLES-------------------------------------------

//RUN TEST
//postgre.test()


//SOCKET IO EXAMPLE
let timer

io.on('connection', (socket) => {
  socket.join("main")
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
    clearInterval(timer)
  })

})


let users = []

const newUser = () => {
  console.log('A')
  let newUser = "user " + Math.floor((Math.random() * 10) + 1);
  users.push(newUser)
  io.to("main").emit("lobby", users)
}

timer = setInterval(() => newUser(), 3000)



//SERVER LISTEN
server.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})

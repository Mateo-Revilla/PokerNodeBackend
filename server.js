const PORT = 3000
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { serveClient: false })
const cors = require('cors')
const postgre = require('./postgre')
app.use(cors())





//-------------------------------------REST API-------------------------------------------

app.get('/create', (req, res) => {
  console.log("POST HTTP")
  console.log(req.header("username"))
  const username = req.header("username")
  postgre.registerNewTable(res, username)

});

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

  socket.on('newParticipant', (data) => {
    console.log(data.username)
    console.log(data.table_id)
    socket.join(data.table_id)
  })

})


let users = []

const newUser = () => {
  console.log('send to lobby')
  let newUser = "user "
  users.push(newUser)
  io.to("main").emit("lobby", users)

}

timer = setInterval(() => newUser(), 3000)



//SERVER LISTEN
server.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})

const PORT = process.env.PORT || 3000
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { serveClient: false })
const cors = require('cors')
const postgre = require('./postgre')
app.use(cors())





//-------------------------------------REST API-------------------------------------------

app.get('/create', (req, res) => {
  const username = req.header("username")
  postgre.registerNewTable(res, username)

});


app.get('/join', (req, res) => {
  const table_id = req.header("table_id")
  const username = req.header("username")

  postgre.addNewParticipant(io,res, username, table_id)

});

//-------------------------------------EXAMPLES-------------------------------------------

//RUN TEST
postgre.test()




//SOCKET IO EXAMPLE
let timer

io.on('connection', (socket) => {

  socket.join("main")
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
    clearInterval(timer)
  })

//CONNECT TO ROOM
  socket.on('connectToRoom', (data) => {
    socket.join("table:" + data.table_id)
  })

//START GAME
  socket.on('sendStart', (data) => {
    postgre.startTable(io, data.table_id, data.player_id, data.number_player)
  })

//USER
socket.on('sendAction', (data) => {
  console.log("send action")
  postgre.newAction(io, data.game_id, data.player_id, data.action_type, data.amount)
})

})






//SERVER LISTEN
server.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})

const PORT = 3000
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { serveClient: false })
const cors = require('cors')
const {Pool} = require('pg')
app.use(cors())


//DATABSE
const pool = new Pool({
  user: 'master',
  host: 'database.c8ib7ubvtm2x.us-east-2.rds.amazonaws.com',
  database: 'pokerDatabase',
  password: 'master12345',
  port: 5432,
})

pool.query('SELECT * FROM tables_registered', (err, res) => {
  console.log(err, res)
  pool.end()
})




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

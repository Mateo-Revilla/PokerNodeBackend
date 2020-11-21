const {Pool} = require('pg')


//-----------------------------CONFIGURE---------------------------------------

const pool = new Pool({
    user: 'master',
    host: 'database.c8ib7ubvtm2x.us-east-2.rds.amazonaws.com',
    database: 'pokerDatabase',
    password: 'master12345',
    port: 5432,
  })

  //-----------------------------EXAMPLE---------------------------------------
  function example() {
    pool.query('SELECT * FROM tables_registered', (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0].code)
        }
        
        pool.end()
      })
  }


  //-----------------------------CREATE TABLE---------------------------------------

  //REGISTER NEW TABLE
  function registerNewTable() {
    const time = Date.now()
    const registerQuery = {
        text: 'insert into register(start_time) values($1) returning table_id',
        values: [time]
    }
    pool.query(registerQuery, (errRegister, resRegister) => { //insert to register table
         if (errRegister) {
            console.log(errRegister)
            return null
        } else {
            const table_id = resRegister.rows[0].table_id //table_id created
            console.log(table_id)
            return table_id       
            }
    })

  }

  

  


  

//-----------------------------EXPORTS---------------------------------------

  module.exports = {
    registerNewTable
  }
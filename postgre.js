const { Pool } = require('pg')


//-----------------------------CONFIGURE---------------------------------------

const pool = new Pool({
  user: 'master',
  host: 'database.c8ib7ubvtm2x.us-east-2.rds.amazonaws.com',
  database: 'pokerDatabase',
  password: 'master12345',
  port: 5432,
})

//-----------------------------EXAMPLE & TEST---------------------------------------

function example() {//RETURNS ALL THE TABLE IN REGISTERS
  pool.query('SELECT * FROM register', (err, res) => {
    if (err) {
      console.log(err)
    } else {
      console.log(res.rows)
    }
    pool.end()
  })
}

function test() {//ADD HERE WHATAVER YOU WANT TO TEST
  example()
}


//-----------------------------REGISTER TABLE--------------------------------------

  //REGISTER NEW TABLE (MATEO)
  function registerNewTable(small_blind, big_blind, number_participants,
    max_number_participants, initial_money, participants_usernames, paritcipants_current_money) {
    //VARIABLES TO UPDATE
    const time = Date.now()
    /*MISSING IMPLEMENTATION OF small_blind, big_blind, number_participants,
    max_number_participants, initial_money, participants_usernames, paritcipants_current_money
    */
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
            //CONTINUE IMPLEMENTING REGISTRATION
            }
    })

  }


  //Add New participants (FELIKS)

  function addNewParticipant(username, table_id) {
    //  const registerQuery = {
    //      text: 'insert into register(start_time) values($1) returning table_id',
    //      values: []
   //   }
      let max = "0"
      //'SELECT DISTINCT max_number_participants FROM register'
      pool.query('SELECT DISTINCT max_number_participants FROM register', (errMax, resMax) => {
          if (errMax)
          {
              console.log(errMax)
              return null
          } else
              {
              console.log(resMax.rows[0])
              max = resMax.rows[0].max_number_participants
          }

      })


      if (max < Number("8"))
      {
          const newParicipant = {
              text: 'UPDATE register SET participants_usernames = append_array(participants_usernames, values($1)) WHERE table_id = values($2)',
              values: [username, table_id]
          }


          pool.query(newParicipant, (errParicipant, resParicipant) => { //insert to register user
              if (errParicipant)
              {
                  console.log(errParicipant)
                  return null
              }

              else

              {
                  const table_row = resParicipant.rows[0]
                  console.log(table_row)

              }
          })


          const setMoney = {
              text: 'UPDATE register SET paritcipants_current_money = append_array(paritcipants_current_money, values($1)) WHERE table_id = values($2)',
              values: ["1000", table_id]
          }

          pool.query(setMoney, (errSetMoney, resSetMoney) => { //insert to register user
              if (errSetMoney)
              {
                  console.log(errSetMoney)
                  return null
              }

              else

              {
                  const table_row = resSetMoney.rows[0]
                  console.log(table_row)

              }
          })






      }
    /*
      pool.query('SELECT max_number_participants FROM register WHERE table_id = values($1)', (err, res) => {
          if (err)
          {
              console.log(err)
          } else
          {
              console.log(res.rows)
          }
          pool.end()
      }) */



  }

  //GET INFO FOR table with id (FELIKS)

  function getInfoForTableID(table_id) {
    /*return the information of this table*/
      const seeTableIdQuery = {
          text: 'SELECT * FROM register WHERE table_id = values($1)',
          values: [table_id]
      }


      pool.query(seeTableIdQuery, (errSeeTable, resSeeTable) => { //insert to register user
          if (errSeeTable)
          {
              console.log(errSeeTable)
              return null
          }

          else

          {
              const table_row = resSeeTable.rows[0]
              console.log(resSeeTable.fields.map(field => field.name))
              console.log(table_row)

          }
      })


  }



  //-----------------------------GAME TABLE--------------------------------------

  //Create a rows (MATEO)
  //It should deal cards and assign cards to participants
  //Assign the table cards
  //Update current_game_id in register table big_blind psoition and number of games

  function newGame(table_id) {

  }


  //Update current_round_type (FELIKS)

  function  updateCurrentRoundType(number, table_id){
    /*Update table_cards_active to number*/
      const setRoundIdQuery = {
          text: 'UPDATE register SET current_game_id = values($1) WHERE table_id = values($2)',
          values: [number, table_id]
      }


      pool.query(setRoundIdQuery, (errSetRoundIdQuery, resSetRoundIdQuery) => { //insert to register user
          if (errSetRoundIdQuery)
          {
              console.log(errSetRoundIdQuery)
              return null
          }

          else

          {
              const table_row = resSetRoundIdQuery.rows[0]
              console.log(table_row)

          }
      })


      const setRoundIdQuery_gameTable = {
          text: 'UPDATE game SET current_round_type = values($1) WHERE table_id = values($2)',
          values: [number, table_id]
      }


      pool.query(setRoundIdQuery_gameTable, (err_SetRoundIdQuery_gameTable, res_SetRoundIdQuery_gameTable) => { //insert to register user
          if (err_SetRoundIdQuery_gameTable)
          {
              console.log(err_SetRoundIdQuery_gameTable)
              return null
          }

          else

          {
              const table_row = res_SetRoundIdQuery_gameTable.rows[0]
              console.log(table_row)

          }
      })

  }




  //-----------------------------ACTION TABLE--------------------------------------


//UPdate game player turn, active participants, matching bet, participantsbets, current_action_id (FELIKS)
function newAction(game_id, player, action_type, amount) {
    const set_newAction = {
        text: 'INSERT INTO action(action_id, game_id, player, action_type, amount) values($1, $2, $3, $4, $5)',
        values: ["12345", game_id, player, action_type, amount]
    }

    pool.query(set_newAction, (err_set_newAction, res_set_newAction) => { //insert to register user
        if (err_set_newAction)
        {
            console.log(err_set_newAction)
            return null
        }

        else

        {
            const table_row = res_set_newAction.rows[0]
            console.log(table_row)

        }
    })

    

}










//-----------------------------EXPORTS---------------------------------------

  module.exports = {
    test,
    registerNewTable
  }
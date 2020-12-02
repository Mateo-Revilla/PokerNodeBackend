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
  //addNewParticipant(3, "serpiente", 4)
}


//-----------------------------REGISTER TABLE--------------------------------------

  //REGISTER NEW TABLE (MATEO)
  function registerNewTable(res, username) {
    //VARIABLES TO UPDATE

    const registerQuery = {
        text: 'insert into register(participants_usernames, paritcipants_current_money) values($1, $2) returning table_id',
        values: ['{' + username + '}', '{1000}']
    }
    pool.query(registerQuery, (errRegister, resRegister) => { //insert to register table
         if (errRegister) {
            console.log(errRegister)
            return null
        } else {
            const table_id = resRegister.rows[0].table_id //table_id created
            console.log(table_id)
            res.send({"table_id": table_id, "participants_usernames": [username], "player_id": 0});
            //CONTINUE IMPLEMENTING REGISTRATION
            }
    })

  }


  //Add New participants (FELIKS)

  function addNewParticipant(io, res, username, table_id) {

    const addParticipantsQuery = {
        text: 'UPDATE register SET participants_usernames[number_participants + 1] = $1 , paritcipants_current_money[number_participants + 1] = initial_money, number_participants = number_participants + 1  WHERE (table_id = $2 AND number_participants < 6 AND started = false ) returning * ',
        values: [username, table_id]
    }

    pool.query(addParticipantsQuery, (errAdd, resAdd) => { //insert to register table
         if (errAdd) {
            console.log(errAdd)
            return null
        } else {
          console.log(resAdd.rows[0])
            const currentParticipants= resAdd.rows[0].participants_usernames
            const player_id = resAdd.rows[0].number_participants  - 1
            res.send({"table_id": table_id, "participants_usernames": currentParticipants, "player_id": player_id});
            io.to("table:" + table_id).emit("lobby", currentParticipants)
            }
    })



  }

  //STARTED TABLE

  function startTable(io, table_id, player_id) {
    const setStarted = {
        text: 'UPDATE register SET started = true WHERE table_id = $1 ',
        values: [table_id]
    }

    if (player_id == 0) {
      pool.query(setStarted, (errSetStarted, resSetStarted) => { //insert to register user
          if (errSetStarted)
          {
              console.log(errSetStarted)
          }

          else

          {
              io.to("table:" +table_id).emit("start", {"start": true})

          }
      })
    }
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
    registerNewTable,
    addNewParticipant,
    startTable
  }

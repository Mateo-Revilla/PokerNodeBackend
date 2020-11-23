const {Pool} = require('pg')


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
          console.log(res)
        }
        pool.end()
      })
  }

  function test() {//ADD HERE WHATAVER YOU WANT TO TEST
    example()
    registerNewTable()

  }


  //-----------------------------REGISTER TABLE--------------------------------------

  //REGISTER NEW TABLE
  function registerNewTable() {
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


  //Add New participants

  function addNewParticipant() {

  }

  //GET INFO FOR table with id

  function getInfoForTableID(table_id) {
    /*return the information of this table*/
  }



  //-----------------------------GAME TABLE--------------------------------------

  //Create a rows
  //It should deal cards and assign cards to participants
  //Assign the table cards
  //Update current_game_id in register table big_blind psoition and number of games

  function newGame(table_id) {

  }


  //Update current_round_type

  function  updateCurrentRoundType(number){
    /*Update table_cards_active to number*/
  }




  //-----------------------------ACTION TABLE--------------------------------------


//UPdate game player turn, active participants, matching bet, participantsbets, current_action_id
function newAction(game_id, player, action_type, bet, call) {

}










//-----------------------------EXPORTS---------------------------------------

  module.exports = {
    test,
    registerNewTable
  }

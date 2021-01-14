const { Pool } = require('pg');
const axios = require("axios");
require('dotenv').config();


//-----------------------------CONFIGURE---------------------------------------

const pool = new Pool({
  user: process.env.USER_DATABASE,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT_DATABASE
})





const flaskApp = "https://poker-polar.herokuapp.com/winner/"

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
  //4H,13H,12C,9C,5H/5/2H,3H;5C,6C;7C,10C;9D,8D;7D,1D
  //finishGame(4, {"table_cards": ["4H","13H","12C","9C","5H"], "participants_cards": ["2H,3H", "5C,6C","7C,10C", "9D,8D", "7D,1D" ]})
}


//-----------------------------REGISTER TABLE--------------------------------------

const card_deck = ["1H", "2H", "3H", "4H","5H", "6H", "7H", "8H", "9H", "10H", "11H", "12H", "13H",
  "1C", "2C", "3C", "4C","5C", "6C", "7C", "8C", "9C", "10C", "11C", "12C", "13C",
  "1D", "2D", "3D", "4D","5D", "6D", "7D", "8D", "9D", "10D", "11D", "12D", "13D",
  "1T", "2T", "3T", "4T","5T", "6T", "7T", "8T", "9T", "10T", "11T", "12T", "13T"
]


//-----------------------------REGISTER TABLE--------------------------------------

  //REGISTER NEW TABLE (MATEO)
  function registerNewTable(res, username) {
    //VARIABLES TO UPDATE

    const registerQuery = {
        text: 'insert into register(participants_usernames, participants_current_money) values($1, $2) returning table_id',
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
      text: 'UPDATE register SET participants_usernames[number_participants + 1] = $1 , participants_current_money[number_participants + 1] = initial_money, number_participants = number_participants + 1  WHERE (table_id = $2 AND number_participants < 6 AND started = false ) returning * ',
      values: [username, table_id]
  }

  pool.query(addParticipantsQuery, (errAdd, resAdd) => { //insert to register table
       if (errAdd) {
          console.log(errAdd)
          res.send("ERROR")
      } else {
        console.log(resAdd)
        if (resAdd.rowCount == 0 ) {
          console.log("UNDEFINED")
          res.send("ERROR")
        } else {
          console.log(resAdd.rows[0])
            const currentParticipants= resAdd.rows[0].participants_usernames
            const player_id = resAdd.rows[0].number_participants  - 1
            res.send({"table_id": table_id, "participants_usernames": currentParticipants, "player_id": player_id});
            io.to("table:" + table_id).emit("lobby", currentParticipants)
        }

        }
  })
}


  //STARTED TABLE

  function startTable(io, table_id, player_id, number_users) {
    const setStarted = {
        text: 'UPDATE register SET started = true WHERE table_id = $1 returning * ',
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
              newGame(io,table_id, number_users, [])

          }
      })
    }
  }



  //-----------------------------GAME TABLE--------------------------------------


  function newGame(io, table_id, number_users, players_money) {
    var active_participants = []
    var active_play_participants = []
    var participants_current_money = []
    var participants_bets = []

    var new_card_deck = card_deck


    //SHUFFLE
    new_card_deck = new_card_deck.sort(() => Math.random() - 0.5)

    var new_table_cards = []
    var new_participants_cards = []

    for(var i = 0; i < number_users; i++) {
      active_participants.push(true)
      active_play_participants.push(true)
      participants_current_money.push(10000)
      participants_bets.push(0)
      const cardA = new_card_deck.pop()
      const cardB = new_card_deck.pop()
      new_participants_cards.push(cardA + "," + cardB)
    }

    for (var i = 0; i < 5; i++) {
      new_table_cards.push(new_card_deck.pop())
    }

    if (players_money.length > 0) {
      participants_current_money = players_money
    }

    const newGame = {
        text: 'insert into game(table_id, participants_current_money, active_participants,participants_cards,table_cards, active_play_participants, participants_bets ) values($1, $2, $3, $4, $5, $6, $7) returning *',
        values: [table_id, participants_current_money, active_participants, new_participants_cards, new_table_cards, active_play_participants, participants_bets]
    }

    pool.query(newGame, (errGame, resGame) => { //insert to register user
        if (errGame)
        {
            console.log(errGame)
        }

        else

        {

            console.log("ACTION")
            io.to("table:" +table_id).emit("action", resGame.rows[0])

        }
    })


  }

  //Create a rows
  //It should deal cards and assign cards to participants
  //Assign the table cards
  //Update current_game_id in register table big_blind psoition and number of games


  function newGameUpdate(io, new_participants_money, table_id) {
    var active_participants = []
    new_participants_money.forEach(function(money){
      active_participants.push(money != 0)
    });

    var new_card_deck = card_deck


    //SHUFFLE
    new_card_deck = new_card_deck.sort(() => Math.random() - 0.5)

    var new_table_cards = []
    var new_participants_cards = []

    for(var i = 0; i < new_participants_money.length; i++) {
      const cardA = new_card_deck.pop()
      const cardB = new_card_deck.pop()
      new_participants_cards.push(cardA + "," + cardB)
    }

    for (var i = 0; i < 5; i++) {
      new_table_cards.push(new_card_deck.pop())
    }

    const newGame = {
        text: 'insert into game(table_id, participants_current_money, active_participants,participants_cards,table_cards,active_play_participants  ) values($1, $2, $3, $4, $5, $3) returning *',
        values: [table_id, new_participants_money, active_participants, new_participants_cards, new_table_cards]
    }
    pool.query(newGame, (errGame, resGame) => { //insert to register user
        if (errGame)
        {
            console.log(errGame)
        }

        else

        {
            console.log("EMIT")
            console.log(resGame.rows[0])
            io.to("table:" +table_id).emit("action", resGame.rows[0])

            ///UPDATE REGISTER TABLE

            const updateTableRegister = {
                text: 'UPDATE register SET number_of_games = number_of_games + 1 , participants_current_money = $3, current_game_id = $2,   WHERE (table_id = $2 AND number_participants < 6 AND started = false ) returning * ',
                values: [resGame.rows[0].table_id, resGame.rows[0].game_id, resGame.rows[0].participants_current_money]
            }

            //CONTINUE

        }
    })


  }

  function finishGame(io, res_game) {
    //CALL FLASK APP
    const table_cards = res_game.table_cards.toString()
    var users_cards = ""
    res_game.participants_cards.forEach( function(cards) {
      users_cards += cards+";"
    }


  );
  users_cards = users_cards.substring(0, users_cards.length - 1)
    axios.get(flaskApp + table_cards + "/" + users_cards.length + "/" + users_cards)
          .then(response => {
            console.log(response.data)
            const winner = response.data.Rankings[0]

            //BETS
            var total_bets = 0
            res_game.participants_bets.forEach(function(bet){
              total_bets += bet
            });
            var participants_money = res_game.participants_current_money
            participants_money[winner] += total_bets
            const new_participants_money = participants_money

            //newGameUpdate(io, new_participants_money)
            res_game.winner = winner
            const winnerString = winner.toString()
            res_game.winnerPattern = response.data[winnerString].Pattern
            io.to("table:" +res_game.table_id).emit("action", res_game)

            function newGameTimeout() {
              newGame(io, res_game.table_id, res_game.participants_cards.length, res_game.participants_current_money)
            }
            setTimeout(newGameTimeout, 5000)




          })
          .catch(error => {
            console.log(error);
          });
  }


  function updateGame(io, new_action) {
    console.log("update")
    const get_game = {
        text: 'SELECT * FROM game WHERE game_id = $1',
        values: [new_action.game_id]
    }

    pool.query(get_game, (err_get_game, res_get_game) => { //insert to register user
        if (err_get_game)
        {
            console.log(err_get_game)
            return null
        }

        else

        {
            const game_row = res_get_game.rows[0]

            var index = 1
            var length = game_row.active_play_participants.length
            var new_player_id = -1
            while (index <  length ) {//CHECK WHO IS NEXT PLAYER
              const mod_index = (new_action.player_id + index) % length
              if (game_row.active_play_participants[mod_index] == true) {
                new_player_id = mod_index
                break;
              }
              index++;
            }

            var new_round_type = game_row.current_round_type
            var new_game = false
            var active_play_participants = game_row.active_play_participants
            active_play_participants[new_action.player_id] = false

            if (new_player_id == -1 && new_action.action_type != 3) {//CHECK IF NEED TO UPDATE ROUND
              if (game_row.current_round_type == 3) {//CHECK IF NEW GAME
                new_game = true
              } else {
                new_round_type = (game_row.current_round_type + 1) % 4
                new_player_id = 0
                for(var index = 0; index < active_play_participants.length;index++) {
                  active_play_participants[index] = true
                }
              }
            }



            //UPDATE QUERY
            const update_game = {
                text: 'UPDATE game SET last_action_id = $1  WHERE game_id = $2 returning *',
                values: [new_action.action_id, new_action.game_id , new_action.player_id + 1, new_action.amount, new_round_type, new_player_id ]
            }
            //ACTION

            switch (new_action.action_type) {
              case 0://ACTION FOLD
                update_game.text = 'UPDATE game SET last_action_id = $1, current_round_type = $4, player_turn_id = $5, active_participants[$3] = false, active_play_participants = $6 WHERE game_id = $2 returning *'
                update_game.values = [new_action.action_id, new_action.game_id , new_action.player_id + 1, new_round_type, new_player_id, active_play_participants ]
                //update_game.values.push(active_participants)
                //update_game.values.push(active_play_participants)
                break;
              case 1://ACTION CHECK
                update_game.text = 'UPDATE game SET last_action_id = $1, current_round_type = $3, player_turn_id = $4, active_play_participants = $5  WHERE game_id = $2 returning *'
                update_game.values = [new_action.action_id, new_action.game_id , new_round_type, new_player_id, active_play_participants ]
                break;
              case 2://CALL
                const difference = game_row.top_matching_bet - game_row.participants_bets[new_action.player_id]
                if (difference <= game_row.participants_current_money[new_action.player_id]) {
                  var participants_bets = game_row.participants_bets
                  var participants_current_money = game_row.participants_current_money
                  participants_bets[new_action.player_id] += difference
                  participants_current_money[new_action.player_id] -= difference

                  update_game.text = 'UPDATE game SET last_action_id = $1, current_round_type = $3, player_turn_id = $4, participants_bets = $6, participants_current_money = $7, active_play_participants = $5  WHERE game_id = $2 returning *'
                  update_game.values = [new_action.action_id, new_action.game_id , new_round_type, new_player_id, active_play_participants, participants_bets, participants_current_money ]

                } else {
                  all_in = game_row.participants_current_money[new_action.player_id]
                  var participants_bets = game_row.participants_bets
                  var participants_current_money = game_row.participants_current_money
                  participants_bets[new_action.player_id] += all_in
                  participants_current_money[new_action.player_id] = 0
                  update_game.text = 'UPDATE game SET last_action_id = $1, current_round_type = $3, player_turn_id = $4, participants_bets = $6, participants_current_money = $7, active_play_participants = $5  WHERE game_id = $2 returning *'
                  update_game.values = [new_action.action_id, new_action.game_id , new_round_type, new_player_id, active_play_participants, participants_bets, participants_current_money]

                }

                break;
              case 3://BET

                //UPDATE NEXT ACTIVE_PLAY_PARTICIPANTS AND NEXT_PLAYER
                active_play_participants = game_row.active_play_participants
                participants_current_money = game_row.participants_current_money
                //UPDATE ACTIVE PLAY
                var index = 0
                while (index < participants_current_money.length) {
                  if (participants_current_money[index] != 0 && index != new_action.player_id) {
                    active_play_participants[index] = true
                  }
                  index++;
                }
                active_play_participants[new_action.player_id] = false

                //UPATE NEXT PLAYER
                var index = 1
                var length = active_play_participants.length
                var new_player_id = -1
                while (index <  length ) {//CHECK WHO IS NEXT PLAYER
                  const mod_index = (new_action.player_id + index) % length
                  if (active_play_participants[mod_index] == true) {
                    new_player_id = mod_index
                    break;
                  }
                  index++;
                }

                //NEW MATCHING BET
                const new_matching_bet = game_row.participants_bets[new_action.player_id] + new_action.amount
                update_game.text = 'UPDATE game SET last_action_id = $1, current_round_type = $5, player_turn_id = $6, active_play_participants = $7, top_matching_bet = $8, participants_current_money[$3] = participants_current_money[$3] - $4, participants_bets[$3] = participants_bets[$3] + $4   WHERE game_id = $2 returning *'
                update_game.values[5] = new_player_id
                update_game.values.push(active_play_participants)
                update_game.values.push(new_matching_bet)



            }



            pool.query(update_game, (err_update_game, res_update_game) => { //insert to register user
                if (err_update_game)
                {
                    console.log(err_update_game)
                    return null
                }

                else

                {
                    const res_game = res_update_game.rows[0]
                    if (new_game) {//RETURN WHO WON AND CREATE NEW GAME
                      finishGame(io, res_game)
                    } else {
                      console.log(res_game)
                      console.log("UPDATE")
                      io.to("table:" + res_game.table_id).emit("action", res_game)
                    }



                }
            })





        }
    })








  }




  //-----------------------------ACTION TABLE--------------------------------------


//Update game player turn, active participants, matching bet, participantsbets, current_action_id
function newAction(io, game_id, player, action_type, amount) {
    const set_newAction = {
        text: 'INSERT INTO action(game_id, player_id, action_type, amount) values($1, $2, $3, $4) returning *',
        values: [game_id, player, action_type, amount]
    }

    pool.query(set_newAction, (err_set_newAction, res_set_newAction) => { //insert to register user
        if (err_set_newAction)
        {
            console.log(err_set_newAction)
            return null
        }

        else

        {
            const new_action = res_set_newAction.rows[0]
            console.log(new_action)

            //UPDATE GAME ROW
            updateGame(io, new_action)


        }
    })



}










//-----------------------------EXPORTS---------------------------------------

  module.exports = {
    test,
    registerNewTable,
    addNewParticipant,
    startTable,
    newAction
  }

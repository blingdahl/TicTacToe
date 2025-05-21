#!/bin/bash

# Simulate two users
USER1=$(uuidgen)
USER2=$(uuidgen)

# Find or create a game for USER1
GAME1=$(curl -s -X POST http://localhost:3000/api/game/find -H 'Content-Type: application/json' -d '{"userId": "'$USER1'"}')
GAMEID=$(echo $GAME1 | jq -r '.game.gameId')
echo "User1 ($USER1) joined/created game: $GAMEID"

# User1 makes a move (0,0)
curl -s -X POST http://localhost:3000/api/game/move -H 'Content-Type: application/json' -d '{"userId": "'$USER1'", "gameId": "'$GAMEID'", "row": 0, "column": 0}'

# User2 joins the same game
GAME2=$(curl -s -X POST http://localhost:3000/api/game/find -H 'Content-Type: application/json' -d '{"userId": "'$USER2'"}')
echo "User2 ($USER2) joined game: $GAMEID"


# User2 makes a move (1,1)
curl -s -X POST http://localhost:3000/api/game/move -H 'Content-Type: application/json' -d '{"userId": "'$USER2'", "gameId": "'$GAMEID'", "row": 1, "column": 1}'

# User1 makes a move (0,1)
curl -s -X POST http://localhost:3000/api/game/move -H 'Content-Type: application/json' -d '{"userId": "'$USER1'", "gameId": "'$GAMEID'", "row": 0, "column": 1}'

# User2 makes a move (2,2)
curl -s -X POST http://localhost:3000/api/game/move -H 'Content-Type: application/json' -d '{"userId": "'$USER2'", "gameId": "'$GAMEID'", "row": 2, "column": 2}'

# User1 makes a move (0,2) -- this should be a win for User1
RESULT=$(curl -s -X POST http://localhost:3000/api/game/move -H 'Content-Type: application/json' -d '{"userId": "'$USER1'", "gameId": "'$GAMEID'", "row": 0, "column": 2}')
echo "Final move result: $RESULT"

# Get the final game state
curl -s -X POST http://localhost:3000/api/game/get -H 'Content-Type: application/json' -d '{"userId": "'$USER1'", "gameId": "'$GAMEID'"}' | jq 
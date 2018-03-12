$(document).ready(function(){
    //==============================================================GLOBAL VARIABLES AND CONSTANTS=====================================================================
    var board;
    var player1;
    var player2;
    var playerAI;
    var onePlayer;
    var turnCount;
    var delayRestart;
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    //array of all posible winning combinations (used a zero index identification for the squares (refer to the id's in html) to provide ease when dealing with the array of actual squares/cells on the game board)
    
    //==============================================================GAME SETUP SCREENS================================================================================
    
    $("#1player").click(numOfPlayers)
  
    $("#2players").click(numOfPlayers)
  
    function numOfPlayers(event) {
      if (event.target.id == "1player") {
        onePlayer = true;
      } else {
        onePlayer = false;
        $("#symbolRequest").html("Choose first player..");
      }
      $(".numberOfPlayers").css("display", "none");
      $(".chooseSymbol").css("display", "block");
    }
    //click function to decide number of players
  
    $("#O").click(symbolAllocation);
    $("#X").click(symbolAllocation);
  
    function symbolAllocation(event) {
      var otherPlayer;
      if (event.target.id == "O") {
        player1 = "O";
        otherPlayer = "X";
      } else {
        player1 = "X";
        otherPlayer = "O";
      }
      if (onePlayer) {
        //if a one player game (game against AI) was selected
        playerAI = otherPlayer;
      } else {
        player2 = otherPlayer;
      }
      $(".chooseSymbol").css("display", "none");
      $("table").css("display", "block");
    }
    //click function to decide which symbol player 1 will be, and indirectly which symbol player2/playerAI will be
    
    //==============================================================INITIATE BOARD AND START SCREEN===================================================================
  
    startGame();
    //call startGame function on document load
  
    $("#restartButton").click(function(){
      startGame();
      clearTimeout(delayRestart);
    })
    //click function for restart button, restarts game.. and cancels the timeout function, that is called on a game finish, to restart the game automatically after 5 seconds if the button is not pressed
  
    function startGame() {
      $(".chooseSymbol").css({"display": "none"});
      $(".gameFinish").css({"display": "none"});
      $("table").css("display", "");
      $("#symbolRequest").html("Choose your character..");
      //hide game finish pop up box and hide the board, also hide the symbol select screen as the restart button may have been pressed, before this screens display was changed back to none. and revert the symbol select screen text back to its original state so that it will appear normal if a one player game is selected; if a 2 player game is selected it will be altered again by the click function
      $(".numberOfPlayers").css("display", "");
      //show first screen (1player/2player selection)
      turnCount = 1;
      //set turnCount to one as the first turn will be numbered 1
      board = Array.from(Array(9).keys());
      //creates an array of 9 undefined elements(Array(9)), we then iterate through the key of each element (index), and each key is placed into an array (Array.from); this will correspond to our conveniently named square id's but they will be numbers rather than strings (important for later)
      $(".square").html("");
      $(".square").css("background-color", "");
      $(".square").click(turnClick);
      //clear each cell, remove the highlighted backgrounds (used to indicate winning combo of previous game), relate click event of each square to turnClick function
    }
    
    //==============================================================SQUARE CLICK================================================================================
    
    function turnClick(event) {
      if (typeof board[event.target.id] === 'number'){
        //if the square has not been clicked yet
        if (turnCount % 2 != 0 && !onePlayer){
          //if the turn count is an odd number AND we are playing a two player game, then it is player1's turn
          turn(event.target.id, player1);
          if (checkIfDraw()) {
            declareWinner("It's a Tie!");
          }
          //check if its a draw after this click
        } else if (turnCount % 2 == 0 && !onePlayer) {
          turn(event.target.id, player2);
          if (checkIfDraw()) {
            declareWinner("It's a Tie!");
          }
        } else {
          turn(event.target.id, player1);
          let gameWon = checkIfWin(board, player1);
          //check for a win streak (even though this is included in turn, the game AI turn below would still execute after a win was already found from the player turn)
          if (!checkIfDraw() && !gameWon) {
            //if this is not a win yet and if it is not a draw (so all squares have not been clicked)
            turn(miniMax(board, playerAI).index, playerAI);
            //carry out a turn for playerAI (computer)
          }
        }
        turnCount++;
        //put the turnCount up for the next turn
      }
    }
    //function decides how to execute the turn function depending on how many players there is and whos go it is (if playing with two players)
  
    function turn(squareID, player) {
      board[squareID] = player;
      //find current index (of square) on our board array and replace it with the player indicator (rather than just the array of the key for each square) this means it will now indicate which player has occupied it and also it will be a string rather than a number now (will make for some easy checks later)
      $("#"+squareID).html(player);
      //place player symbol in the square
      let gameWon = checkIfWin(board, player);
      //check for a win streak
      if (gameWon){
        gameOver(gameWon);
      }
      //if win streak found, call game finish protocol
    }
    //the function(s) to be called on a square when it is clicked
    
    //==============================================================WIN PROTOCOL================================================================================
    
    function checkIfWin(currentBoard, player){
      let plays = currentBoard.reduce((acc, element, index) =>
                                      (element == player) ? acc.concat(index) : acc
                                      ,[]);
      //reduce board to only those squares played by the player who made the latest move. NB could not use acc.push(index) instead had to use acc.concat(index) because of arrow function. NEED TO KNOW WHY!
      let gameWon = null;
      //sets an initial value for win, inother words this whole function will not render truthy if the below is not satisfied
      for (let [index, winningCombo] of winningCombos.entries()){
        //let each entry in winningCombos have the format [index, winningCombo] so that we may use/check these propertys
        if (winningCombo.every(elem => plays.indexOf(elem) != -1)) {
          //if any of the winningCombo elements (each winning combination array within the array) is found (!= -1) in our plays array (reduced array of squares on the board that have been played, from above) NB every returns truthy if ALL of the elements it is called on satisfies the function, otherwise it will return false
          gameWon = {index: index, player: player};
          //let the output of this function be an object that contains the index of the winning combo and the player who made the combination
          break;
          //break for of loop
        }
      }
      return gameWon;
    }
  
    function gameOver(win) {
      for (let index of winningCombos[win.index]){
        //for the index of each square played in our winning combination
        $("#"+index).css({"background": "rgba(0, 0, 0, 0.15)"})
        //change the background color
      }
      $(".square").off("click", turnClick);
      //remove the click function from each square (game is now over; no more plays allowed)
      if (onePlayer) {
        declareWinner(win.player == player1 ? "You Win!" : "You Lose.");
      } else {
        declareWinner(win.player == player1 ? player1 + "'s Win!" : player2 + "'s Win!");
      }
    }
  
    function declareWinner(who) {
      //winnder declaration function; who will be passed in whenever it is called
      $(".gameFinish").css({"display": "block"});
      $(".gameFinishMessage").html(who);
      //show game finish screen and add the appropriate message, depending on what has been passed into this function
      delayRestart = setTimeout(function(){startGame()},5000);
      //calls startGame function after a 5 second delay
    }
    
    //==============================================================DRAW PROTOCOL================================================================================
    
    function checkIfDraw () {
      if (emptySquares(board).length == 0 && !checkIfWin(board, player1) && !checkIfWin(board, player2) && !checkIfWin(board, playerAI)){
        //if there are no more empty squares left AND there is not a win (last possible square selected may have also formed a winning combination) NB without the extra AND conditions a game win on last available square would still always result in the tie message even though it is a win
        $(".square").css("background","rgba(0, 0, 0, 0.15)")
        $(".square").off("click", turnClick);
        declareWinner("It's a Tie!");
        //highlight all boxes, remove the click function from the squares, and call the declare winner function but pass in the tie message
        return true;
        //draw is true
      }
      return false;
      //draw is false (will not be returned if true has already been returned since return ends a function)
    }
  
    function emptySquares(boardOfInterest) {
      return boardOfInterest.filter(function(element){
        if (typeof element == 'number'){
          //if the element is a number it must not have been played yet otherwise it would be a string containing the players symbol
          return true;
        }
        return false;
      })
      //filter will return the values that return truthy in the function. these values will form the new filtered array/board
    }
  
    function miniMax(newBoard, player) {
      var availSpots = emptySquares(newBoard);
      //find available spots in current board (this board may be that of the original with a spot already taken as a potential move, from the original pass of this function; if we are in a subesequent pass of the same inital call of this function that is)
  
      if(checkIfWin(newBoard, playerAI)) {
        return {score: 10};
      } else if (checkIfWin(newBoard, player1)) {
        return {score: -10};
      } else if (availSpots.length == 0) {
        return {score: 0};
      }
      //check for a terminal state and assign the appropriate score for a win (for playerAI), loss (for playerAI), or draw
      var moves = [];
      //create an array to store each move object in
      for (var i=0; i<availSpots.length; i++){
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;
        //create move object set its index property to that of the current available spot and set that spot in the newBoard to the player who is taking the current move (potential move as this algorithm is calculating moves in advance);(so we start by checking the first available spot and see how that pans out; inotherwords what score it terminates with)
        if (player == playerAI) {
          var result = miniMax(newBoard, player1);
          move.score = result.score;
        } else if (player == player1) {
          var result = miniMax(newBoard, playerAI);
          move.score = result.score;
        }
        //if current move is by AI call the function again for player1, and vice versa. And set the score property of the move object to the result of the termination from that move (and its' subsequent moves as decided by the recursion of miniMax)
        newBoard[availSpots[i]] = move.index;
        moves.push(move);
        //set the newBoard back to its original self and add the newly made move object (the one associated with the current iteration of the for loop) to the moves array.
      }
  
      var bestMoveIndex;
      //variable to store the index of the best move in the moves array
      if (player == playerAI) {
        var bestScore = -10000;
        for (var i=0; i<moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMoveIndex = i;
          }
        }
      } else {
        var bestScore = 10000;
        for (var i=0; i<moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMoveIndex = i;
          }
        }
      }
      //set an initally very low score for a terminating move taken by the playerAI (as we want to compare and go higher, eventually settling for the highest potential score for the AI)
      //and sent an initially very high score for a terminating move taken by player1 (as we want to compare and go lower, eventually settling for the lowest potential score for the player)
  
  
      return moves[bestMoveIndex];
  
    }
  
})
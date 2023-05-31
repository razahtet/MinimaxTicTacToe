var twoPlayerButton = document.getElementById("twoPlayerButton");
var computerButton = document.getElementById("computerButton");
var backButton = document.getElementById("backButton");
var levelsC = document.querySelectorAll(".levelsC");
var chooseBelow = document.getElementById("chooseBelow");
var boxes = document.querySelectorAll(".boxes");
var board = document.getElementById("board");
var message = document.getElementById("message");
var computerFirstButton = document.getElementById("computerFirstButton");
var restartButton = document.getElementById("restartButton");
var whoX = document.getElementById("whoX");
var whoO = document.getElementById("whoO");

var gameO = false;
var levelState = "";
var playersTurn = 0;
var computerTurnA = false;
var boardArray = ["", "", "", "", "", "", "", "", ""];
var computerO = true;
var recentObject = "";

computerButton.addEventListener("click", showLevels);
computerFirstButton.addEventListener("click", computeFirst);
twoPlayerButton.addEventListener("click", twoPlayerTime);
restartButton.addEventListener("click", cleanBoard);
backButton.addEventListener("click", goBackMain);

for (var i = 0; i < levelsC.length; i++) {
  levelsC[i].addEventListener("click", playMode);
}
for (var i = 0; i < boxes.length; i++) {
  boxes[i].addEventListener("click", placeLetter);
  boxes[i].numB = i;
}

function playMode() {
  gameO = false;
  var idK = this.getAttribute("id").split("Button");
  startGame(idK[0]);
  showHideLevels("none", false);
}

function startGame(level) {
  levelState = level;
  computerO = true;
  computerFirstButton.innerHTML = "Let Computer Go First";
  changeXO(true);
}

function placeLetter() {
  if (this.innerHTML == "" && message.innerHTML == "") {
    if (levelState == "twoPlayer") {
      if (playersTurn == 0) {
        this.style.color = "mediumseagreen";
        this.innerHTML = "X";
        playersTurn = 1;
      } else {
        this.style.color = "mediumblue";
        this.innerHTML = "O";
        playersTurn = 0;
      }
      boardArray[this.numB] = this.innerHTML;
      checkState();
    } else {
      if (!computerTurnA) {
        if (computerO) {
          this.style.color = "mediumseagreen";
          this.innerHTML = "X";
        } else {
          this.style.color = "mediumblue";
          this.innerHTML = "O";
        }
        boardArray[this.numB] = this.innerHTML;
        doComputerMove();
      }
    }
  }
}

function doComputerMove() {
  var gameFinished = checkState();
  if (!gameFinished) {
    computerTurnA = true;
    var allN = nextMoves(boardArray.slice(), computerO, []);
    var scoreObj = [];
    
    for (var i = 0; i < allN.length; i++) {
      var toS = score(allN[i], true);
      scoreObj.push({
        elScore: toS,
        nextP: allN[i]
      });
    }
    
    var mostUp = getMax(scoreObj, levelState);
    var pRand = Math.floor(Math.random() * mostUp.length);
    boardArray = mostUp[pRand];

    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] == "O") {
        boxes[i].style.color = "mediumblue";
      } else if (boardArray[i] == "X") {
        boxes[i].style.color = "mediumseagreen";
      }
      boxes[i].innerHTML = boardArray[i];
    }

    computerTurnA = false;
    checkState();
  }
}

function getMax(object, mode) {
  var leastS = {};
  leastS.moves = [];
  if (mode == "impossible") {
    leastS.score = -Infinity;
  } else if (mode == "easy") {
    leastS.score = Infinity;
  }
  var alreadyChecked = [];
  for (var i = 0; i < object.length; i++) {
    var greaterT = false;
    
    if (mode == "easy") {
      if (object[i].elScore < leastS.score) {
        greaterT = true;
        leastS.moves = [];
        leastS.score = object[i].elScore;
      }
    } else if (mode == "impossible") {
      if (object[i].elScore > leastS.score) {
        greaterT = true;
        leastS.moves = [];
        leastS.score = object[i].elScore;
      }
    }
    if (object[i].elScore == leastS.score || mode == "medium") {
      greaterT = true;
    }
    if (greaterT) {
      leastS.moves.push(object[i].nextP);
    }
  }

  return leastS.moves;
}

function nextMoves(array, kCond, allK) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == "") {
      var arrayN = array.slice();
      if (kCond) {
        arrayN[i] = "O";
      } else {
        arrayN[i] = "X";
      }

      allK.push(arrayN);
    }
    if (i == array.length - 1) {
      return allK;
    }
  }
}

function gameOver(move) {
  var winCond = {
    type: "none",
    condition: false
  };
  
  if (boardIsFull(move)) {
    winCond.type = "boardFull";
    winCond.condition = true;
  }
  
  if (threeInRowA("X", move)) {
    winCond.type = "X Wins";
    winCond.condition = true;
  } 
  
  if (threeInRowA("O", move)) {
    winCond.type = "O Wins";
    winCond.condition = true;
  }
  
  return winCond;
}

function score(move, computerTurn) {
  var bestScore;
  var scoreK;
  var checkG = gameOver(move);
  
  if (checkG.condition) {
    var scoreR = 0;
    if (checkG.type == "X Wins") {
      if (computerO) {
        scoreR = -10;
      } else {
        scoreR = 10;
      }
    } else if (checkG.type == "O Wins") {
      if (computerO) {
        scoreR = 10;
      } else {
        scoreR = -10;
      }
    }
    
    return scoreR;
  } else {
    var nextMovesK = [];
    
    var elC;
    if (computerTurn) {
      if (computerO) {
        elC = true;
      } else {
        elC = false;
      }
    } else {
      if (computerO) {
        elC = false;
      } else {
        elC = true;
      }
    }
    nextMovesK = nextMoves(move, !elC, []);
    
    if (computerTurn) {
      bestScore = Infinity;
      for (var i = 0; i < nextMovesK.length; i++) {
        scoreK = score(nextMovesK[i], false);
        bestScore = Math.min(scoreK, bestScore);
      }
      
      // for each possible next move:
      //     score = score(nextMove, false)
      //     bestScore = min(score, bestScore)
      
      return bestScore;
    } else {
      bestScore = -Infinity;
      for (var i = 0; i < nextMovesK.length; i++) {
        scoreK = score(nextMovesK[i], true);
        bestScore = Math.max(scoreK, bestScore);
      }
      
      // for each possible next move:
      //     score = score(nextMove, true)
      //     bestScore = max(score, bestScore)
      
      return bestScore;
    }
  }
}

function checkState() {
  if (threeInRowA("X", boardArray)) {
    message.innerHTML = "X Won!";
    gameO = true;
  } else if (threeInRowA("O", boardArray)) {
    message.innerHTML = "O Won!";
    gameO = true;
  } else if (boardIsFull(boardArray)) {
    message.innerHTML = "It is a Tie Game!";
    gameO = true;
  }

  return gameO;
}

function computeFirst() {
  if (computerO) {
    computerO = false;
    this.innerHTML = "Let Yourself Go First";
    changeXO(false);
  } else {
    computerO = true;
    this.innerHTML = "Let Computer Go First";
    changeXO(true);
  }
  cleanBoard();
}

function threeInRowA(letter, array) {
  var elK = false;

  for (var i = 0; i < array.length; i += 3) {
    if (
      array[i] == letter &&
      array[i + 1] == letter &&
      array[i + 2] == letter
    ) {
      elK = true;
      break;
    }
  }

  for (var i = 0; i < 3; i++) {
    if (
      array[i] == letter &&
      array[i + 3] == letter &&
      array[i + 6] == letter
    ) {
      elK = true;
      break;
    }
  }

  if (array[0] == letter && array[4] == letter && array[8] == letter) {
    elK = true;
  }

  if (array[2] == letter && array[4] == letter && array[6] == letter) {
    elK = true;
  }
  
  return elK;
}

function boardIsFull(array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == "") {
      return false;
    }
  }

  return true;
}

function twoPlayerTime() {
  hideButtons();
  chooseBelow.style.display = "none";
  levelState = "twoPlayer";
  cleanBoard();
  board.style.display = "block";
  restartButton.style.display = "block";
  whoX.innerHTML = "Player 1 is X";
  whoO.innerHTML = "Player 2 is O";
  whoX.style.marginRight = "177px";
}

function showLevels() {
  hideButtons();
  showHideLevels("inline-block", true);
}

function goBackMain() {
  twoPlayerButton.style.display = "inline-block";
  computerButton.style.display = "inline-block";
  this.style.display = "none";

  showHideLevels("none", true);
}

function hideButtons() {
  twoPlayerButton.style.display = "none";
  computerButton.style.display = "none";
  backButton.style.display = "block";
}

function showHideLevels(text, cond) {
  for (var i = 0; i < levelsC.length; i++) {
    levelsC[i].style.display = text;
  }

  if (cond) {
    chooseBelow.style.display = "block";
    board.style.display = "none";
    computerFirstButton.style.display = "none";
    restartButton.style.display = "none";
    whoO.innerHTML = "";
    whoX.innerHTML = "";
  } else {
    chooseBelow.style.display = "none";
    board.style.display = "block";
    computerFirstButton.style.display = "inline-block";
    restartButton.style.display = "inline-block";
  }
  resetPlayers();
  cleanBoard();
}

function cleanBoard() {
  gameO = false;
  resetPlayers();
  message.innerHTML = "";
  for (var i = 0; i < boardArray.length; i++) {
    boardArray[i] = "";
    boxes[i].innerHTML = "";
  }
  
  if (!computerO && levelState != "twoPlayer") {
    doComputerMove();
  }
}

function changeXO(condition) {
  whoX.style.marginRight = "223px";
  if (condition) {
    whoX.innerHTML = "You are X";
    whoO.innerHTML = "Computer is O";
  } else {
    whoX.innerHTML = "You are O";
    whoO.innerHTML = "Computer is X";
  }
}

function resetPlayers() {
  if (levelState == "twoPlayer") {
    playersTurn = 0;
  }
}

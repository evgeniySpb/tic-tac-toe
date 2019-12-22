var table = document.getElementById('field');
var storeEmptyTable = table.innerHTML;

var button = document.getElementById('newGame');
button.addEventListener('click', newGame);

var scoreTable = document.getElementById('score');
var scoreCells = scoreTable.rows[1].cells;

var x = 'x';
var o = 'o';
var size = 3;
var cellsCount = size * size;
var winPositions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // vertical
    [0, 4, 8], [2, 4, 6]              // diogonal
];

newGame();

function newGame() {
    table.innerHTML = storeEmptyTable;
    table.onclick = '';

    var xPlayer = new Player('xPlayer', x, scoreCells[0], true);
    var oPlayer = new Player('oPlayer', o, scoreCells[2]);

    movie(xPlayer, oPlayer);
}

function Player(selectId, character, scoreCell, firstMove) {
    this.move = getSelectedPlayer(selectId);
    this.character = character;
    this.wins = scoreCell;
    this.firstMove = firstMove;
}

function movie(currentPlayer, rival) {
    var state = getState();
    var winLine = checkWin(state);

    if(winLine) {
        highlightWin(winLine);
        rival.wins.innerHTML++;
    } else if(!isFreeCells(state)) {
        var draws = scoreCells[1];
        draws.innerHTML++;
    } else {
        currentPlayer.move(rival);
    }
}

function getSelectedPlayer(id) {
    var player = document.getElementById(id);
    player.onchange = newGame;
    var playerName = player.options[player.selectedIndex].value;
    return window[playerName];
}

function getState() {
    var state = [];
    for(var i = 0; i < size; i++) {
        for(var j = 0; j < size; j++) {
            var inner = table.rows[i].cells[j].innerHTML;
            state[j + size * i] = inner;
        }
    }
    return state;
}

function isFreeCells(state) {
    for(var i = 0; i < cellsCount; i++) {
        if(!state[i]) return true;
    }
}

function human(rival) {
    table.onclick = humanMovie;
    var that = this;

    function humanMovie(event) {
        if(!event.target.innerHTML) {
            event.target.innerHTML = that.character;
            table.onclick = '';
            movie(rival, that);
        }
    }
}

function computer(rival) {
    if(this.firstMove) {
        var numCell = Math.floor(Math.random() * cellsCount);
        this.firstMove = false;
    } else {
        var state = getState();
        var bestMove = negaMax(state, this.character, -100, 100, 10);
        var numCell = bestMove.numCell;
    }

    var coords = getCoordsFromNum(numCell);
    table.rows[coords.y].cells[coords.x].innerHTML = this.character;
    movie(rival, this);
}

function negaMax(state, player, alpha, beta, weight) {
    var best = {
        score: (player === o) ? -weight : weight,
        numCell: null
    };

    if(checkWin(state)) return best;

    if(!isFreeCells(state)) {
        best.score = 0;
        return best;
    }

    for(var i = 0; i < cellsCount; i++) {
        if(!state[i]) {
            state[i] = player;
            var rival = (player === o) ? x : o;
            var reply = negaMax(state, rival, alpha, beta, weight - 1);
            state[i] = 0;
            var candidate = reply.score;

            if(   player === o && candidate > best.score
               || player === x && candidate < best.score) {
                if(player === o) {
                    alpha = candidate;
                } else {
                    beta = candidate;
                }
                best.score = candidate;
                best.numCell = i;
            }

            if(alpha >= beta || best.score === weight - 1) break;
        }
    }
    return best;
}

function checkWin(state) {
    var len = winPositions.length;
    for(var i = 0; i < len; i++) {
        var nums = winPositions[i];
        var one = nums[0];
        var two = nums[1];
        var three = nums[2];

        if(   state[one]
           && state[one] === state[two]
           && state[one] === state[three]) {
            return nums;
        }
    }
}

function highlightWin(winLine) {
    for(var i = 0; i < size; i++) {
        var coords = getCoordsFromNum(winLine[i]);
        var cell = table.rows[coords.y].cells[coords.x];
        cell.style.background = '#9FFC5F';
    }
}

function getCoordsFromNum(num) {
    return {
        x: num % size,
        y: num / size ^ 0
    };
}
/* global require, module */

"use strict";

var _ = require("lodash");
var seedrandom = require("seedrandom");

// lodash in git HEAD has negate; copied here
if (!_.hasOwnProperty("negate")) {
    _.negate =  function negate(predicate) {
        if (!_.isFunction(predicate)) {
            throw new TypeError("negate called on a non-function");
        }
        return function() {
            return !predicate.apply(this, arguments);
        };
    };
}

// 7 possible shapes, plus black for the background
var boardWidth = 10;  // number of cells in each row of the game board
var boardHeight = 20; // number of rows in the game board
var colors = ["grey17", "red3", "darkgoldenrod", "aquamarine", "deeppink4", "forestgreen", "royalblue4", "blueviolet"];

var ret = {};

// debugging
// increment all block ids by 1
ret.incrementBoard = function(board) {
    return _.map(board, function(row) {
        return _.map(row, function(c) {
            return (c+1) % 7;
        });
    });
};

// debugging
// decrement all block ids by 1
ret.decrementBoard = function(board) {
    return _.map(board, function(row) {
        return _.map(row, function(c) {
            return (c+7-1) % 7;
        });
    });
};

ret.nextBlock = function(prng) {
    return Math.floor(prng() * 7) + 1;
};

ret.color = function(shape) {
    return colors[shape];
};

ret.blankRow = function() {
    return _.map(_.range(boardWidth), _.constant(0));
};

// Given a list of lists, extend it to $boardHeight rows by prepending empty (0) rows.
// If the list has $boardHeight or more rows, return it unaltered.
ret.padBoard = function(board) {
    return _.map(_.range(boardHeight-board.length), ret.blankRow).concat(board);
};

var initialPosition = function() {
    return Object.create([0, Math.floor(boardWidth/2)]);
};

ret.initialGameState = function(time) {
    var prng = seedrandom();
    return {
        currentPiece: {
            shape: ret.nextBlock(prng),  // 1-7
            position: initialPosition(), // (0-boardWidth, 0-boardHeight)
            orientation: 0  // 0-3
        },
        nextBlock: ret.nextBlock(prng),
        board: ret.padBoard([]),
        lastDrop: time, // last time the current piece moved down
        timeStep: 500, // milliseconds between piece moving down
        lines: 0,  // score, lines completed
        prng: prng
    };
};


// returns True iff every cell of the row is filled
ret.isFullRow = function(row) {
    return _.every(row, function(c) {
        return c !== 0;
    });
};

// returns the number of filled rows in the board
ret.countRows = function(board) {
    return _.filter(board, ret.isFullRow).length;
};

// Returns a board with all full rows removed,
// and all remaining rows at the bottom.
ret.deleteRows = function(board) {
    return ret.padBoard(_.filter(board, _.negate(ret.isFullRow)));
};

// given a board and a position as [row, column], return the specified cell of the board
ret.lookupBoard = function(board, position) {
    return board[position[0]][position[1]];
};

// multiply a 2x2 matrix r by a (column) vector v
ret.mmul = function(r, v) {
    return [
        r[0][0]*v[0] + r[0][1]*v[1],
        r[1][0]*v[0] + r[1][1]*v[1]
    ];
};

ret.vadd = function(u, v) {
    return [u[0] + v[0], u[1] + v[1]];
};

ret.blockCells = function(p) {

    var rot = [
        [[1,0], [0,1]],
        [[0,-1], [1,0]],
        [[-1,0], [0,-1]],
        [[0,1], [-1, 0]]
    ];

    // a list of offsets for each shape
    var offsets = [
        // empty cell
        [],
        // square
        [[0,0], [0,1], [1,0], [1,1]],
        // L
        [[1,-1], [0,-1], [0,0], [0,1]],
        // Γ
        [[0,-1], [0,0], [0,1], [1,1]],
        // T
        [[0,0], [1,-1], [1,0], [1,1]],
        // S
        [[0,0], [0,1], [1,-1], [1,0]],
        // Z
        [[0,-1], [0,0], [1,0], [1,1]],
        // line
        [[0,-2], [0,-1], [0,0], [0,1]]
    ];

    return _.map(offsets[p.shape], function(v) {
        // rot * v + position
        return ret.vadd(ret.mmul(rot[p.orientation], v), p.position);
    });
};

// returns a board with the current piece colored in.
ret.drawable = function(gs) {
    var b = Object.create(gs.board);
    _.each(ret.blockCells(gs.currentPiece), function(pos) {
        b[pos[0]][pos[1]] = gs.currentPiece.shape;
    });
    return b;
};

// given a board and a piece, returns True iff that piece colides
// with others already placed.
ret.collision = function(board, piece) {
    return _.any(ret.blockCells(piece), function(pos) {
        return pos[1] < 0 || pos[1] >= boardWidth ||
            pos[0] < 0 || pos[0] >= boardHeight ||
            ret.lookupBoard(board, pos) !== 0;
    });
};

ret.makeMove = function(move) {
    return function(oldGame) {
        var newPiece = move(oldGame.currentPiece);
        if (ret.collision(oldGame.board, newPiece)) {
            return oldGame;
        } else {
            var newGame = Object.create(oldGame);
            newGame.currentPiece = newPiece;
            return newGame;
        }
    };
};

ret.translate = function(v) {
    return function(p) {
        var q = Object.create(p);
        q.position = ret.vadd(v, q.position);
        return q;
    };
};

ret.rotate = function(cw) {
    return function(p) {
        var q = Object.create(p);
        q.orientation = (p.orientation + cw) % 4;
        return q;
    };
};

ret.moveRight = ret.makeMove(ret.translate([0,1]));
ret.moveLeft = ret.makeMove(ret.translate([0,-1]));
ret.moveDown = ret.makeMove(ret.translate([1,0]));
ret.rotateCW = ret.makeMove(ret.rotate(1));
ret.rotateCCW = ret.makeMove(ret.rotate(-1));

ret.updateGame = function(gs, t) {
    var newGS, newPiece, board;
    // console.log(t - gs.lastDrop);
    if (t < gs.lastDrop + gs.timeStep) {
        // console.log("returning GameState unmodified");
        return gs;
    } else {
        // console.log(t - gs.lastDrop);
        // move block down if possible
        newGS = ret.moveDown(gs);
        newGS.lastDrop = t;
        // if it can't move down more, score lines
        newPiece = ret.translate([1,0])(gs.currentPiece);
        if (ret.collision(gs.board, newPiece)) {
            console.log("collision");
            console.log(newGS);
            board = ret.drawable(newGS);
            newGS.lines += ret.countRows(board);
            newGS.board = ret.deleteRows(board);
            newGS.currentPiece = {
                shape: gs.nextBlock,
                orientation: 0,
                position: initialPosition()
            };
            newGS.nextBlock = ret.nextBlock(newGS.prng);
        } else {
            console.log("no collision");
        }
        // console.log(newGS);
        // console.log(newGS.currentPiece.position);
        return newGS;
    }
};

module.exports = ret;
_

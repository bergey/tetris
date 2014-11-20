/* global require, module */

/**
 * @module logic
 */

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

var logic = {};

// 7 possible shapes, plus black for the background
logic.boardWidth = 10;  // number of cells in each row of the game board
logic.boardHeight = 20; // number of rows in the game board
var colors = ["grey17", "red3", "darkgoldenrod", "aquamarine", "deeppink4", "forestgreen", "royalblue4", "blueviolet"];

// debugging
// increment all block ids by 1
logic.incrementBoard = function(board) {
    return _.map(board, function(row) {
        return _.map(row, function(c) {
            return (c+1) % 7;
        });
    });
};

// debugging
// decrement all block ids by 1
logic.decrementBoard = function(board) {
    return _.map(board, function(row) {
        return _.map(row, function(c) {
            return (c+7-1) % 7;
        });
    });
};

/**
 * A number between 1 and 7, inclusive, representing a tetris block.
 * @typedef {number} Block
 */

/**
 * A number between 0 and 7, inclusive, representing a tetris block or
 * an empty position.
 * @typedef {number} MaybeBlock
 */

/**
 * Returns a random tetris block.
 * @param prng - the random number generator
 * @returns {Block} - a new block
 */
logic.nextBlock = function(prng) {
    return Math.floor(prng() * 7) + 1;
};

/**
 * Returns the color corresponding to a given Block.
 * @param {Block} shape
 * @returns {string} color
 */
logic.color = function(shape) {
    return colors[shape];
};

/**
 * Returns a new board row, with all cells empty.
 * @returns {Array.<MaybeBlock>} row
 */
logic.blankRow = function() {
    return _.times(logic.boardWidth, _.constant(0));
};

/**
 * A Row is represented as a list of cells, beginning with the leftmost.
 * The width of each row is fixed.
 * @typedef {Array.<MaybeBlock>} Row
 */

/**
 * A board is represented as a list of Rows, beginning with the topmost.
 * The number of Rows in a Board is fixed.
 * @typedef {Array.<Row>} Board
 */

// Given a list of lists, extend it to $boardHeight rows by prepending empty (0) rows.
// If the list has $boardHeight or more rows, return it unaltered.
/**
 * Returns a Board with empty rows above (before) the provided rows.
 * @param {Array.<Row>} partial - all the non-empty rows of the board, top first
 * @returns {Board} the complete Board
 */
logic.padBoard = function(partial) {
    return _.map(_.range(logic.boardHeight-partial.length), logic.blankRow).concat(partial);
};

var initialPosition = function() {
    return Object.create([0, Math.floor(logic.boardWidth/2)]);
};

logic.initialGameState = function(time) {
    var prng = seedrandom();
    return {
        currentPiece: {
            shape: logic.nextBlock(prng),  // 1-7
            position: initialPosition(), // (0-boardWidth, 0-boardHeight)
            orientation: 0  // 0-3
        },
        nextBlock: logic.nextBlock(prng),
        board: logic.padBoard([]),
        lastDrop: time, // last time the current piece moved down
        timeStep: 500, // milliseconds between piece moving down
        lines: 0,  // score, lines completed
        prng: prng
    };
};


/**
 * Returns True if & only if every cell of the row is filled
 * @param {Row}
 * @returns {Bool}
 */
logic.isFullRow = function(row) {
    return _.every(row, function(c) {
        return c !== 0;
    });
};

/**
 * Returns the number of filled rows in the board
 * @param {Board}
 * @returns {number} - the count of full rows
 */
logic.countRows = function(board) {
    return _.filter(board, logic.isFullRow).length;
};

// Returns a board with all full rows removed,
// and all remaining rows at the bottom.
logic.deleteRows = function(board) {
    return logic.padBoard(_.filter(board, _.negate(logic.isFullRow)));
};

// given a board and a position as [row, column], return the specified cell of the board
logic.lookupBoard = function(board, position) {
    return board[position[0]][position[1]];
};

// multiply a 2x2 matrix r by a (column) vector v
logic.mmul = function(r, v) {
    return [
        r[0][0]*v[0] + r[0][1]*v[1],
        r[1][0]*v[0] + r[1][1]*v[1]
    ];
};

logic.vadd = function(u, v) {
    return [u[0] + v[0], u[1] + v[1]];
};

logic.blockCells = function(p) {

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
        return logic.vadd(logic.mmul(rot[p.orientation], v), p.position);
    });
};

// returns a board with the current piece colored in.
logic.drawable = function(gs) {
    var b = Object.create(gs.board);
    _.each(logic.blockCells(gs.currentPiece), function(pos) {
        b[pos[0]][pos[1]] = gs.currentPiece.shape;
    });
    return b;
};

// given a board and a piece, returns True iff that piece colides
// with others already placed.
logic.collision = function(board, piece) {
    return _.any(logic.blockCells(piece), function(pos) {
        return pos[1] < 0 || pos[1] >= logic.boardWidth ||
            pos[0] < 0 || pos[0] >= logic.boardHeight ||
            logic.lookupBoard(board, pos) !== 0;
    });
};

logic.makeMove = function(move) {
    return function(oldGame) {
        var newPiece = move(oldGame.currentPiece);
        if (logic.collision(oldGame.board, newPiece)) {
            return oldGame;
        } else {
            var newGame = Object.create(oldGame);
            newGame.currentPiece = newPiece;
            return newGame;
        }
    };
};

logic.translate = function(v) {
    return function(p) {
        var q = Object.create(p);
        q.position = logic.vadd(v, q.position);
        return q;
    };
};

logic.rotate = function(cw) {
    return function(p) {
        var q = Object.create(p);
        q.orientation = (p.orientation + cw) % 4;
        return q;
    };
};

logic.moveRight = logic.makeMove(logic.translate([0,1]));
logic.moveLeft = logic.makeMove(logic.translate([0,-1]));
logic.moveDown = logic.makeMove(logic.translate([1,0]));
logic.rotateCW = logic.makeMove(logic.rotate(1));
logic.rotateCCW = logic.makeMove(logic.rotate(-1));

logic.updateGame = function(gs, t) {
    var newGS, newPiece, board;
    // console.log(t - gs.lastDrop);
    if (t < gs.lastDrop + gs.timeStep) {
        // console.log("returning GameState unmodified");
        return gs;
    } else {
        // console.log(t - gs.lastDrop);
        // move block down if possible
        newGS = logic.moveDown(gs);
        newGS.lastDrop = t;
        // if it can't move down more, score lines
        newPiece = logic.translate([1,0])(gs.currentPiece);
        if (logic.collision(gs.board, newPiece)) {
            console.log("collision");
            console.log(newGS);
            board = logic.drawable(newGS);
            newGS.lines += logic.countRows(board);
            newGS.board = logic.deleteRows(board);
            newGS.currentPiece = {
                shape: gs.nextBlock,
                orientation: 0,
                position: initialPosition()
            };
            newGS.nextBlock = logic.nextBlock(newGS.prng);
        } else {
            console.log("no collision");
        }
        // console.log(newGS);
        // console.log(newGS.currentPiece.position);
        return newGS;
    }
};

module.exports = logic;

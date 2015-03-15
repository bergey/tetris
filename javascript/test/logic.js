/* global require, describe, it */
/* jshint expr:true */

"use strict";

var logic = require("../js/logic");
var expect = require("chai").expect;
var _ = require("lodash");
var seedrandom = require("seedrandom");

describe("logic", function(){
    // describe("boardWidth", function(){
    //     it("should be 10", function(){
    //         expect(logic.boardWidth).to.equal(10);
    //     });
    // });

    var emptyRow = logic.blankRow();
    var emptyBoard = _.times(logic.boardHeight, logic.blankRow);
    var fullRow = function(val) {
        return _.times(logic.boardWidth, _.constant(val));
    };
    var fullBoard = _.times(logic.boardHeight, fullRow(3));

    describe("nextBlock", function() {
        var prng = seedrandom();  // TODO, should ensure reproducibility
        it("should return between 1 & 7", function() {
            expect(logic.nextBlock(prng)).is.within(1,7);
        });
        it("should return an integer", function() {
            var block = logic.nextBlock(prng);
            expect(block).equals(Math.floor(block));
        });
    });

    describe("blankRow", function() {
        it("should return 10 cells", function() {
            expect(logic.blankRow()).to.have.length(10);
        });
        it("should only have zeros", function() {
            expect(logic.blankRow()).to.have.members([0]);
        });
    });

    describe("padBoard", function() {
        it("should return 20 rows", function() {
            expect(logic.padBoard([]).length).to.equal(20);
            expect(logic.padBoard([1]).length).to.equal(20);
            expect(logic.padBoard([1,2]).length).to.equal(20);
        });
    });

    describe("isFullRow", function() {
        it("should be True for full rows", function() {
            expect(logic.isFullRow(fullRow(1))).is.true;
        });
        it("should be False for empty rows", function() {
            expect(logic.isFullRow(emptyRow)).is.false;
        });
        it("should be False for partially filled rows", function() {
            expect(logic.isFullRow(_.range(0,10))).is.false;
        });
    });

    describe("countRows", function() {
        it("should be 0 for empty boards", function() {
            expect(logic.countRows(emptyBoard)).equals(0);
        });
        it("should be 1 with 1 row", function() {
            expect(logic.countRows([fullRow(2)])).equals(1);
        });
        it("should be 20 with a full board", function() {
            expect(logic.countRows(fullBoard)).equals(logic.boardHeight);
        });
    });

    describe("hitBottom", function() {
        it("should be false for initial game state", function() {
            expect(logic.hitBottom(logic.initialGameState(Date.now()))).is.false;
        });
        it("should be true for a piece at the bottom", function() {
            var gs = logic.initialGameState(Date.now);
            gs.currentPiece.position[1] = logic.boardHeight;
            expect(logic.hitBottom(gs)).is.true;
        });
        it("should be true for a full board", function() {
            var gs = logic.initialGameState(Date.now);
            gs.board = fullBoard;
            expect(logic.hitBottom(gs)).is.true;
        });
        it("should be false for a board with one full row", function() {
            var gs = logic.initialGameState(Date.now);
            gs.board = logic.padBoard([fullRow]);
            expect(logic.hitBottom(gs)).is.false;
        });
    });


});

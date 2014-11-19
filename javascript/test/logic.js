/* global require, describe, it */

"use strict";

var logic = require("../js/logic");
var expect = require("chai").expect;
var _ = require("lodash");

describe("logic", function(){
    // describe("boardWidth", function(){
    //     it("should be 10", function(){
    //         expect(logic.boardWidth).to.equal(10);
    //     });
    // });

    describe("padBoard", function() {
        it("should return 20 rows", function() {
            expect(logic.padBoard([]).length).to.equal(20);
            expect(logic.padBoard([1]).length).to.equal(20);
            expect(logic.padBoard([1,2]).length).to.equal(20);
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
});

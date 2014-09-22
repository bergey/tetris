/* global define */

define(["underscore"], function (_) {
    "use strict";
    var colors = ["black", "red", "green", "cyan", "magenta", "yellow"];
    var cn = colors.length;

    return {
        incrementBoard: function(board) {
            return _.map(board, function(row) {
                return _.map(row, function(c) {
                    return (c+1) % cn;
                });
            });
        },
        decrementBoard: function(board) {
        return _.map(board, function(row) {
            return _.map(row, function(c) {
                return (c+cn-1) % cn;
            });
        });
        }
    };
});

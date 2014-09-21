/* global define */

define(["react", "underscore"], function (React, _) {
    "use strict";

    var r = React.DOM;
    var colors = ["black", "red", "green", "cyan", "magenta"];
    var board = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,2,2,3,4,4,4,0,1],
        [2,1,0,4,3,1,1,0,1,2]
    ];

    var cell = React.createClass({
        displayName: "tetrisCell",
        render: function() {
            return r.div({
                style: {
                    "background": this.props.color,
                    "width": "20px",
                    "height": "20px",
                    "float": "left"
                }});
        }
    });

    var tetrisRow = React.createClass({
        displayName: "tetrisRow",
        render: function() {
            return r.div({
            style: {
                "clear": "both"
            }},
                        _.map(this.props.blocks, function(c,i) {
                            return cell({color: colors[c], key: i});
                        }));
        }
    });


    return React.createClass({
        displayName: "tetrisUI",
        render: function() {
            return r.div({},
                         _.map(board, function(row, i) {
                             return tetrisRow({blocks: row, key: i});
                         }));
        },
        getInitialState: function() {
            return {board: board};
        },
        // onKeyDown: function() {
        //     this.setState({board: _.rest(board).append(_.first(board))});
        // }
    });
});

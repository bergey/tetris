/* global define, console, key */

define(["react", "underscore", "logic"], function (React, _, logic) {
    "use strict";

    console.log(key);

    var r = React.DOM;
    var colors = ["black", "red", "green", "cyan", "magenta", "yellow"];
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
            return r.div({
                onClick: this.incrementBoard,
                onDoubleClick: this.decrementBoard
            },
                _.map(this.state.board, function(row, i) {
                    return tetrisRow({blocks: row, key: i});
                }));
        },
        getInitialState: function() {
            return {board: board};
        },
        componentDidMount: function() {
            key("left", this.decrementBoard);
            key("right", this.incrementBoard);
        },
        incrementBoard: function() {
            console.log("incrementing");
            this.setState({
                board: logic.incrementBoard(this.state.board)});
                                   },
        decrementBoard: function() {
            console.log("decrementing");
            this.setState({
                board: logic.decrementBoard(this.state.board)});
        }
    });
});

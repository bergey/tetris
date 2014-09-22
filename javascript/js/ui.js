/* global define, console, key */

define(["react", "underscore", "logic"], function (React, _, logic) {
    "use strict";

    console.log(key);

    var r = React.DOM;

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
                            return cell({color: logic.color(c), key: i});
                        }));
        }
    });


    return React.createClass({
        displayName: "tetrisUI",
        render: function() {
            return r.div({
                onClick: this.incrementBoard,                
            },
                _.map(logic.drawable(this.state), function(row, i) {
                    return tetrisRow({blocks: row, key: i});
                }));
        },
        getInitialState: function() {
            var d = new Date().getTime();
            return logic.initialGameState(d);
        },
        
        componentDidMount: function() {
            key("left", this.moveLeft);
            key("right", this.moveRight);
            this.interval = setInterval(this.updateGame, 100);
        },

        componentWillUnmount: function() {
            clearInterval(this.interval);
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
        },

        moveRight: function() {
            this.setState(logic.moveRight(this.state));
        },

        moveLeft: function() {
            this.setState(logic.moveLeft(this.state));
        },

        updateGame: function() {
            this.setState(logic.updateGame(this.state));
        }
        
    });
});

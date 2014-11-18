/* global document, window, require */

"use strict";

// define(["react", "ui"], function (React, ui) {
var React = require("react");
var ui = React.createFactory(require("./ui"));

// var r = React.DOM;
window.onload = function() {
    React.render(
        // r.p({}, ["This text made by React."]),
        ui(),
        document.getElementById("tetris"));
};

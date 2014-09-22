/* global document, define */

define(["react", "ui"], function (React, ui) {
    "use strict";

    // var r = React.DOM;

    React.renderComponent(
        // r.p({}, ["This text made by React."]),
        ui(),
        document.getElementById("tetris"));
});

/* global document, define */

define(["react",], function (React) {
    "use strict";

    var r = React.DOM;

    React.renderComponent(
        r.p({}, ["This text made by React."]),
        document.getElementById("example"));
});

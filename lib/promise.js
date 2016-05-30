(function () {
    "use strict";
    var Promise = require('bluebird');

    var method = {
        false: function() { return false; },
        undefined: function() {}
    };

    exports.while = Promise.method(function Promise_while(condition, action) {
        if(typeof condition !== 'function') {
            condition = method.false;
        }
        if(typeof action !== 'function') {
            action = method.undefined;
        }
        condition = Promise.method(condition);
        action = Promise.method(action);
        var resultList = [];
        return iteration();
        function iterate() {
            return action().then(function(actionResult) {
                resultList.push(actionResult);
                return iteration();
            });
        }
        function iteration() {
            return condition().then(function(conditionResult) {
                if(conditionResult) {
                    return iterate();
                }
                return resultList;
            });
        }
    });
})();
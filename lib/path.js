(function () {
    "use strict";
    var nativePath = require('path');

    var REGEX_WIN32_DEVICE = /[a-zA-Z]:/;
    var REGEX_WIN32_UNC_PREFIX = /\\\\\?\\/;
    var REGEX_WIN32_REMOTE_PREFIX = /\\\\[a-zA-Z0-9-]+\\/;
    var REGEX_WIN32_NAME = /[^\\/:*?"<>|\r\n]+/;
    var REGEX_WIN32_SEPARATOR = /[\\/]+/;
    var REGEX_WIN32_ABSOLUTE_PATH = /^((?:[a-zA-Z]):)((?:[\\/][^\\/:*?"<>|\r\n]*)*)[\\/]?$/;
    var REGEX_WIN32_PATH = /^((?:[a-zA-Z]):)?((?:[\\/][^\\/:*?"<>|\r\n]*)*)[\\/]?$/;
    var REGEX_WIN32_UNC_PATH = /^\\\\\?\\((?:[a-zA-Z]):)?((?:[\\/][^\\/:*?"<>|\r\n]*)*)[\\/]?$/;
    var REGEX_WIN32_REMOTE_PATH = /^\\\\(?:[a-zA-Z0-9_.$-]+)\\[^\r\n]*$/;

    var platform = {
        default: {
            isValid: function (path) {
                return path.indexOf('\0') < 0;
            },
            hasSeparator: function (path) {
                return path.indexOf('/') >= 0;
            },
            isAbsolute: function (path) {
                return path.charAt(0) === '/';
            },
            getSeparator: function () {
                return '/';
            },
            getDelimiter: function () {
                return ':';
            }
        },
        win32: {
            isValid: function (path) {
                return REGEX_WIN32_PATH.test(path) || REGEX_WIN32_UNC_PATH.test(path) || REGEX_WIN32_REMOTE_PATH.test(path);
            },
            hasSeparator: function (path) {
                return REGEX_WIN32_SEPARATOR.test(path);
            },
            isAbsolute: function (path) {
                return REGEX_WIN32_ABSOLUTE_PATH.test(path) || REGEX_WIN32_UNC_PATH.test(path) || REGEX_WIN32_REMOTE_PATH.test(path);
            },
            getSeparator: function () {
                return '\\';
            },
            getDelimiter: function () {
                return ';';
            }
        }
    };

    var getPlatformValue = function (name) {
        return platform[process.platform] && platform[process.platform][name] ? platform[process.platform][name] : platform.default[name];
    };

    exports.isValid = function (path) {
        if (typeof path !== 'string' || path.length <= 0) {
            return false;
        }
        return getPlatformValue('isValid')(path);
    };

    exports.hasSeparator = function (path) {
        if (typeof path !== 'string' || path.length <= 0) {
            return false;
        }
        return getPlatformValue('hasSeparator')(path);
    };
    exports.isAbsolute = function(path) {
        if (typeof path !== 'string' || path.length <= 0) {
            return new TypeError('invalid path');
        }
        return getPlatformValue('isAbsolute')(path);
    };
    exports.separator = getPlatformValue('getSeparator')();
    exports.delimiter = getPlatformValue('getDelimiter')();
})();
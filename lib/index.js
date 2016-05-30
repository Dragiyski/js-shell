(function () {
    "use strict";
    var Promise = require('bluebird');
    var promiseExtra = require('./promise');
    var nativePath = require('path');
    var libPath = require('./path');

    var INTERNAL = {};
    var Shell = module.exports = function Shell() {
        if (arguments[0] !== INTERNAL) {
            throw new TypeError('Illegal constructor');
        }
        this._cwd = arguments[1];
        this._commandList = {};
        this._commandQueue = [];
        this._shellRunId = null;
    };
    Shell.prototype = Object.create(Object.prototype, {
        constructor: {
            value: Shell
        },
        execute: {
            enumerable: true,
            value: Promise.method(function () {
                if (arguments.length === 0) {
                    throw new TypeError('invalid.arguments.count');
                }
                if (typeof arguments[0] !== 'string') {
                    throw new TypeError('invalid.path')
                }
                var command = new Command(INTERNAL, Array.prototype.slice.call(arguments, 0));
                this._commandQueue.push(command);
                this._scheduleRun();
            })
        },
        hasCommand: {
            enumerable: true,
            value: function (command) {
                if (this._commandList.indexOf(command) >= 0) {
                    return true;
                }
                if (this._context) {
                    return this._context.hasCommand(command);
                }
                return Shell.hasCommand();
            }
        },
        _scheduleRun: {
            value: function () {
                if (this._shellRunId == null) {
                    this._scheduleRun = setImmediate(this._run.bind(this));
                }
            }
        },
        _run: {
            value: function () {
                var self = this;
                promiseExtra.while(function () {
                    return self._commandQueue.length > 0;
                }, function () {
                    var command = this._commandQueue.shift();
                    return command._run();
                });
            }
        }
    });
    Object.defineProperties(Shell, {
        open: {
            enumerable: true, value: function () {
                var path;
                if (arguments.length > 0) {
                    path = arguments[0];
                    if (!libPath.isValid(path)) {
                        throw new TypeError('invalid.path');
                    }
                    if (!libPath.isAbsolute(path)) {
                        path = libPath.resolve(process.cwd(), path);
                    }
                } else {
                    path = process.cwd();
                }
                return new Shell(INTERNAL, path);
            }
        },
        hasCommand: {
            enumerable: true, value: function (command) {
                return this._commandList.indexOf(command) >= 0;
            }
        },
        _commandList: {
            value: []
        }
    });

    var Command = function Command() {
        if (arguments[0] !== INTERNAL) {
            throw new TypeError('Illegal constructor');
        }
        this._shell = arguments[1];
        this._command = arguments[2];
        this._arguments = arguments[3];
    };
    Command.prototype = Object.create(Object.prototype, {
        _run: {
            value: Promise.method(function () {
                return this._resolveCommand();
            })
        },
        _resolveCommand: {
            value: function () {
                var isPathCommand = false;
                if(libPath.hasSeparator(this._command)) {
                    isPathCommand = true;
                } else if(!this._shell.hasCommand(this._command)) {
                    isPathCommand = true;
                }
                if(isPathCommand) {

                }
                // TODO: Windows shell does not recognizes UNC paths for commands, so only local paths can be used there
                // TODO: The regex to validate local path is:
                // TODO: Volume: [a-zA-Z]:
                // TODO: Folder names and file names: [^\\/:*?"<>|\r\n]*
                // TODO: Separator: [\\/]
                // TODO: If first name is empty, it is replaced by current volume.
                // TODO: If first name is not a drive or empty, it is a relative path.
                // TODO: If path does not contain separators, windows shells looks in CWD first, while linux shells does not.
                // TODO: It is a security issue to look general command in CWD, so we wouldn't implement this.
                // TODO: Instead if command contains no separator we look directly in path.
                // Security note: For example, lets open windows shell
                // C:\Users\user> ping 8.8.8.8
                // This must start C:\Windows\System32\PING.EXE
                // Let's there a virus/hacker program on PC with non-administrative access.
                // Virus cannot overwrite any files in C:\Windows\**
                // So instead virus create a file C:\User\user\ping.exe
                // Now the ping command will start the virus, not legitimate PING program.
                // In linux this is prevented, you must explicitly say start the PING program in this directory and do not search the PATH
                // /home/user$ ./ping
            }
        }
    });

    function safeStringConvert(data, invalidMessage) {
        var type = typeof data;
        if (type === 'boolean') {
            return data ? '1' : '0';
        } else if (type === 'number') {
            return data.toString(10);
        } else if (type === 'string') {
            return data;
        } else {
            throwTypeError();
        }
        function throwTypeError() {
            if (invalidMessage != null) {
                throw new TypeError(invalidMessage);
            } else {
                throw new TypeError();
            }
        }
    }
})();
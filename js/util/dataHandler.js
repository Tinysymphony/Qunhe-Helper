// Handle data got from httphandler and send data to target window.

var httpHandler = require('./httpHandler');
const SEND = require('../const.js').SEND;
const STATUS = require('../const.js').STATUS;

var _username = '',
    _basicBugLink = "http://jira.qunhequnhe.com/browse/";

function _login(username, password, window) {
    httpHandler.login(username, password, function () {
        window.send(SEND.LOGIN_SUCCESS);

        // Send unread messages and trigger polling
        httpHandler.getMessage(function (data) {
            window.send(SEND.RENDER_MESSAGE, data, true, true);
        }, function () {
            window.send(SEND.RENDER_MESSAGE_ERROR);
        });

        // Send unsolved bugs and trigger polling
        httpHandler.getBug(username, STATUS.OPEN_BUG, function () {
            window.send(SEND.RENDER_BUG, data, true, true);
        }, function () {
            window.send(SEND.RENDER_BUG_ERROR);
        });

    }, function () {
        window.send(SEND.LOGIN_FAILED);
    });
}

function _getInfo(window) {
    httpHandler.getInfo(function (data) {
        window.send(SEND.LOAD_INFO, data);
    }, function () {
        window.send(SEND.LOAD_FAILED);
    });
}

function _getTask(window) {
    httpHandler.getTask(function (data) {
        data = _simplifyTask(data);
        window.send(SEND.LOAD_TASK, data);
    }, function () {
        window.send(SEND.LOAD_FAILED);
    });
}

function _getMessage(window, mainWindow) {
    httpHandler.getMessage(function (data) {
        window.send(SEND.LOAD_MESSAGE, data);
        mainWindow.send(SEND.RENDER_MESSAGE, data, true);
    }, function () {
        window.send(SEND.LOAD_FAILED);
        mainWindow.send(SEND.RENDER_MESSAGE_ERROR);
    });
}

function _pollingMessage(window) {
    httpHandler.getMessage(function (data) {
        window.send(SEND.RENDER_MESSAGE, data, true, false);
    }, function () {
        window.send(SEND.RENDER_MESSAGE_ERROR);
    });
}

function _getBug(window) {
    // concatenate query condition (bug status)
    var query = '(';
    for (var i = 0; i < arguments.length - 1; i++) {
        if (i != arguments.length - 2) {
            query += 'status = ' + arguments[i + 1] + ' OR ';
        } else {
            query += 'status = ' + arguments[i + 1] + ')';
        }
    }
    httpHandler.getBug(_username, query, function (data) {
        data = _simplifyBug(data);
        window.send(SEND.LOAD_BUG, data);
    }, function () {
        window.send(SEND.LOAD_FAILED);
    });
}

function _pollingBug(window){
    var query = '(';
    for (var i = 0; i < arguments.length - 1; i++) {
        if (i != arguments.length - 2) {
            query += 'status = ' + arguments[i + 1] + ' OR ';
        } else {
            query += 'status = ' + arguments[i + 1] + ')';
        }
    }
    httpHandler.getBug(_username, query, function (data) {
        data = _simplifyBug(data);
        window.send(SEND.RENDER_BUG, data);
    }, function () {
        window.send(SEND.RENDER_BUG_ERROR);
    });
}

// get bugs of everyone and rank them.
function _rankBug(target) {
    httpHandler.getAllBugs(function (data) {
        var rank = {};
        console.log(data.totoal);
        for (var i = 0; i < data.total; i++) {
            // console.log(data.issues[i]);
            if (!data.issues[i].assignee) {
                continue;
            }
            if (rank[data.issues[i].assignee]) {
                rank[data.issues[i].assignee] += 1;
            } else {
                rank[data.issues[i].assignee] = 1;
            }
        }
        window.send(SEND.LOAD_RANK, rank);
    }, function () {
        window.send(SEND.LOAD_FAILED);
    });
}

// Extract the attributes of tasks that we need, such as name, id , key, etc.
function _simplifyTask(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var tmp = {
            "self": data[i]['self'],
            "key": data[i]['key'],
            "name": data[i]['name'],
            "id": data[i]['id']
        };
        result.push(tmp);
    }
    return result;
}

// Extract the attributes of bugs that we need, such as key, title, description and JIRA link.
function _simplifyBug(data) {
    var result = {};
    result.bugs = [];
    result.total = data.total;
    for (var i = 0; i < data.total; i++) {
        var tmp = {
            "key": data.issues[i]["key"],
            "title": data.issues[i]["fields"]["summary"],
            "link": _basicBugLink + data.issues[i]["key"]
        };
        result.bugs.push(tmp);
    }
    return result;
}

var DataHander = {
    login: _login,
    getInfo: _getInfo,
    getMessage: _getMessage,
    pollingMessage: _pollingMessage,
    getBug: _getBug,
    pollingBug: _pollingBug,
    getTask: _getTask,
    rankBug: _rankBug
};

module.exports = DataHander;

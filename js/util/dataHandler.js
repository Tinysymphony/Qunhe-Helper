// Handle data got from httphandler and send data to target window.

var httpHandler = require('./httpHandler');
const SEND = require('../const.js').SEND;
const STATUS = require('../const.js').STATUS;

var _username = '',
    _basicBugLink = "http://jira.qunhequnhe.com/browse/",
    _mainWindow = null,
    _isNotify = true;

function _login(username, password, window) {
    httpHandler.login(username, password, function () {
        _username = username;
        //_mainWindow = window;
        window.send(SEND.LOGIN_SUCCESS);

        // Send unread messages and trigger polling
        httpHandler.getMessage(function (data) {
            window.send(SEND.RENDER_MESSAGE, data, _isNotify, true);
        }, function () {
            window.send(SEND.RENDER_MESSAGE_ERROR);
        });

        // Send unsolved bugs and trigger polling
        var queryStatus = '(status = ' + STATUS.OPEN_BUG + ' OR status = '+ STATUS.REOPENED_BUG + ')';
        httpHandler.getBug(username, queryStatus, function(data){
            window.send(SEND.RENDER_BUG, data.total, _isNotify, true);
        }, function(){
            window.send(SEND.RENDER_BUG_ERROR);
        });
        //httpHandler.getBug(username, STATUS.OPEN_BUG, function () {
        //    window.send(SEND.RENDER_BUG, data, true, true);
        //}, function () {
        //    window.send(SEND.RENDER_BUG_ERROR);
        //});

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
        //mainWindow.send(SEND.RENDER_MESSAGE, data, true);
    }, function () {
        window.send(SEND.LOAD_FAILED);
        //mainWindow.send(SEND.RENDER_MESSAGE_ERROR);
    });
}

function _pollingMessage(window) {
    httpHandler.getMessage(function (data) {
        window.send(SEND.RENDER_MESSAGE, data, _isNotify, false);
    }, function () {
        window.send(SEND.RENDER_MESSAGE_ERROR);
    });
}

function _sendMessage() {

}

function _getBug(window, mainWindow, type, statusList) {
    // concatenate query condition (bug status)

    var query = '(';
    for (var i = 0; i < statusList.length; i++) {
        if (i != statusList.length - 1) {
            query += 'status = ' + statusList[i] + ' OR ';
        } else {
            query += 'status = ' + statusList[i] + ')';
        }
    }
    httpHandler.getBug(_username, query, function (data) {
        data = _simplifyBug(data);
        window.send(SEND.LOAD_BUG, data);
        if(type === 'bug'){
            mainWindow.send(SEND.UPDATE_MENU_BUG, data.total, _isNotify);
        }
    }, function () {
        window.send(SEND.LOAD_FAILED);
    });
}

function _pollingBug(window, statusList){
    var query = '(';
    for (var i = 0; i < statusList.length; i++) {
        if (i != statusList.length - 1) {
            query += 'status = ' + statusList[i] + ' OR ';
        } else {
            query += 'status = ' + statusList[i] + ')';
        }
    }
    httpHandler.getBug(_username, query, function (data) {
        data = _simplifyBug(data);
        window.send(SEND.RENDER_BUG, data.total);
    }, function () {
        window.send(SEND.RENDER_BUG_ERROR);
    });
}

// get bugs of everyone and rank them.
function _rankBug(window) {
    httpHandler.getBugRank(function (data) {
        window.send(SEND.LOAD_RANK, data);
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
    for (var i = 0; i < data.issues.length; i++) {
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

// Handle data got from httphandler and send data to target window.

import httpHandler from './httpHandler'
import {SEND, STATUS} from '../const'

const _basicBugLink = "http://jira.qunhequnhe.com/browse/";

let _username = '',
    _isNotify = true;

function _login(username, password, window) {
    httpHandler.login(username, password, () => {
        _username = username;
        window.send(SEND.LOGIN_SUCCESS);

        // Send unread messages and trigger polling

        // Send unsolved bugs and trigger polling
        let queryStatus = '(status = ' + STATUS.OPEN_BUG + ' OR status = '+ STATUS.REOPENED_BUG + ')';
        httpHandler.getBug(username, queryStatus, data => {
            window.send(SEND.RENDER_BUG, data.total, _isNotify, true);
        }, () => {
            window.send(SEND.RENDER_BUG_ERROR);
        });

        httpHandler.getUsers(data => {
            window.send(SEND.GET_USERS, data);
            //httpHandler.getMessage(38, function (data) {
            //    window.send(SEND.RENDER_MESSAGE, data, _isNotify, true);
            //}, () => {
            //    window.send(SEND.RENDER_MESSAGE_ERROR);
            //});
        }, () => {
            window.send(SEND.GET_USERS_ERROR);
        });

    }, () => {
        window.send(SEND.LOGIN_FAILED);
    });
}

function _getInfo(window) {
    httpHandler.getInfo(data => {
        window.send(SEND.LOAD_INFO, data);
    }, () => {
        window.send(SEND.LOAD_FAILED);
    });
}

function _getTask(window) {
    httpHandler.getTask(data => {
        data = _simplifyTask(data);
        window.send(SEND.LOAD_TASK, data);
    }, () => {
        window.send(SEND.LOAD_FAILED);
    });
}

function _getMessage(window, mainWindow) {
    httpHandler.getMessage(data => {
        window.send(SEND.LOAD_MESSAGE, data);
        //mainWindow.send(SEND.RENDER_MESSAGE, data, true);
    }, () => {
        window.send(SEND.LOAD_FAILED);
        //mainWindow.send(SEND.RENDER_MESSAGE_ERROR);
    });
}

function _pollingMessage(window) {
    httpHandler.getMessage(data => {
        window.send(SEND.RENDER_MESSAGE, data, _isNotify, false);
    }, () => {
        window.send(SEND.RENDER_MESSAGE_ERROR);
    });
}

function _sendMessage() {

}

function _getBug(window, mainWindow, type, statusList) {
    // concatenate query condition (bug status)

    let query = '(';
    for (let i = 0; i < statusList.length; i++) {
        if (i != statusList.length - 1) {
            query += 'status = ' + statusList[i] + ' OR ';
        } else {
            query += 'status = ' + statusList[i] + ')';
        }
    }
    httpHandler.getBug(_username, query, data => {
        data = _simplifyBug(data);
        window.send(SEND.LOAD_BUG, data);
        if(type === 'bug'){
            mainWindow.send(SEND.UPDATE_MENU_BUG, data.total, _isNotify);
        }
    }, () => {
        window.send(SEND.LOAD_FAILED);
    });
}

function _pollingBug(window, statusList){
    let query = '(';
    for (let i = 0; i < statusList.length; i++) {
        if (i != statusList.length - 1) {
            query += 'status = ' + statusList[i] + ' OR ';
        } else {
            query += 'status = ' + statusList[i] + ')';
        }
    }
    httpHandler.getBug(_username, query, function (data) {
        data = _simplifyBug(data);
        window.send(SEND.RENDER_BUG, data.total);
    }, () => {
        window.send(SEND.RENDER_BUG_ERROR);
    });
}

// get bugs of everyone and rank them.
function _rankBug(window) {
    httpHandler.getBugRank(data => {
        window.send(SEND.LOAD_RANK, data);
    }, () => {
        window.send(SEND.LOAD_FAILED);
    });
}

// Extract the attributes of tasks that we need, such as name, id , key, etc.
function _simplifyTask(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let tmp = {
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
    let result = {};
    result.bugs = [];
    result.total = data.total;
    for (let i = 0; i < data.issues.length; i++) {
        let tmp = {
            "key": data.issues[i]["key"],
            "title": data.issues[i]["fields"]["summary"],
            "link": _basicBugLink + data.issues[i]["key"]
        };
        result.bugs.push(tmp);
    }
    return result;
}

module.exports = {
    login: _login,
    getInfo: _getInfo,
    getMessage: _getMessage,
    pollingMessage: _pollingMessage,
    getBug: _getBug,
    pollingBug: _pollingBug,
    getTask: _getTask,
    rankBug: _rankBug
};

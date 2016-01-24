// Handle data got from httphandler and send data to target window.

var httpHandler = require('./httpHandler');
const SEND = require('../const.js').SEND;

var _username = '';

function _login(username, password, window){
    httpHandler.login(username, password, function(status){
        _username = username;
        window._username = username;
        window._password = password;
        window.send(SEND.LOGIN_SUCCESS);
        httpHandler.getMessage(function(data){
            window.send(SEND.RENDER_MESSAGE, data, true);
        }, function(){
            window.send(SEND.RENDER_MESSAGE_ERROR);
        });
    }, function(){
        window.send(SEND.LOGIN_FAILED);
    });
}

function _getInfo(window){
    httpHandler.getInfo(function(data){
        window.send(SEND.LOAD_INFO, data);
    }, function(){
        window.send(SEND.LOAD_FAILED);
    });
}

function _getTask(window){
    httpHandler.getTask(function(data){
        data = _simplifyTask(data);
        window.send(SEND.LOAD_TASK, data);
    }, function(){
        window.send(SEND.LOAD_FAILED);
    });
}

function _getMessage(window){
    httpHandler.getMessage(function(data){
        window.send(SEND.LOAD_MESSAGE, data);
    }, function(){
        window.send(SEND.LOAD_FAILED);
    })
    // httpHandler.getMessage(function(status, data){
    //     if(status){
    //         data = JSON.parse(data);
    //         _message = data;
    //         target.send('load-message', data);
    //         mainWindow.send('render-message', data, false);
    //     } else {
    //         target.send('load-fail');
    //         _message = null;
    //     }
    // });
}

function _getBug(window){
    // concatenate query condition (bug status)
    var query = '(';
    for(var i = 0; i < arguments.length - 1; i++){
        if(i != arguments.length - 2){
            query += 'status = ' + arguments[i + 1] + ' OR ';
        } else {
            query += 'status = ' + arguments[i + 1] + ')';
        }
    }
    httpHandler.getBug(_username, query, function(data){
        data = _simplifyBug(data);
        window.send(SEND.LOAD_BUG, data);
    }, function(){
        window.send(SEND.LOAD_FAILED);
    });
}

// get bugs of everyone and rank them.
function _rankBug(target){
    httpHandler.getAllBugs(function(data){
        var rank = {};
        console.log(data.totoal);
        for(var i = 0; i < data.total; i++){
            console.log(i);
            if(rank[data.issues[i].assignee]){
                rank[data.issues[i].assignee] += 1;
            } else {
                rank[data.issues[i].assignee] = 1;
            }
        }
        console.log(rank);
        window.send(SEND.LOAD_RANK, rank);
    }, function(){
        window.send(SEND.LOAD_FAILED);
    });
}

// Extract the attributes of tasks that we need, such as name, id , key, etc.
function _simplifyTask(data){
    var result = [];
    for(var i = 0; i < data.length; i++){
        var tmp = {
            "self": data[i]['self'],
            "key": data[i]['key'],
            "name": data[i]['name'],
            "id": data[i]['id']
        };
        result.push(tmp);
    }
    return JSON.stringify(result);
}

// Extract the attributes of bugs that we need, such as key, title, description and JIRA link.
function _simplifyBug(data){
    var result = {};
    result.bugs = [];
    result.total = data.total;
    for(var i = 0; i < data.total; i++){
        var tmp = {
            "key": data.issues[i]["key"],
            "title": data.issues[i]["fields"]["summary"],
            "link": "http://jira.qunhequnhe.com/browse/" + data.issues[i]["key"]
        };
        result.bugs.push(tmp);
    }
    return JSON.stringify(result);
}

var DataHander = {
    login: _login,
    getInfo: _getInfo,
    getMessage: _getMessage,
    getBug: _getBug,
    getTask: _getTask,
    rankBug: _rankBug
};

module.exports = DataHander;

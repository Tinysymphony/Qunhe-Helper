// Using http request to get data in json format.

var req = require('request');
var globalJar = req.jar();

// url and method can be maintained in the const.js
// const URL = require('../const').URL;

function _login(username, password, onSuccess, onFail){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/auth/1/session',
        method: 'POST',
        json: {
            "username": username || "irobot",
            "password": password || "cleanEARTH"
        },
        jar: globalJar
    };
    _base(options, onSuccess, onFail, true);
}

function _getInfo(onSuccess, onFail){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/myself',
        method: 'GET',
        jar: globalJar
    };
    _base(options, onSuccess, onFail);
}

function _getTask(onSuccess, onFail){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/project',
        method: 'GET',
        jar: globalJar
    };
    _base(options, onSuccess, onFail);
}

function _getBug(name, queryStatus, onSuccess, onFail){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/search?jql=issuetype = Bug AND ' + queryStatus + ' AND assignee in (' + name + ')',
        method: 'GET',
        jar: globalJar
    };
    _base(options, onSuccess, onFail);
}

function _getAllBugs(onSuccess, onFail){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/search?jql=issuetype = Bug',
        method: 'GET',
        jar: globalJar
    };
    _base(options, onSuccess, onFail);
}

function _getMessage(onSuccess, onFail){
    var options = {
        url: 'http://10.10.31.222/api/notice',
        method: 'GET',
        jar: globalJar
    };
    _base(options, onSuccess, onFail);
}

// basic logic
function _base(options, onSuccess, onFail, noParse){
    req(options, function(err, res, body){
        if(!err && res.statusCode === 200 && onSuccess && typeof onSuccess === 'function'){
            if(noParse){
                onSuccess(body);
            } else {
                onSuccess(JSON.parse(body));
            }
        } else {
            if(onFail && typeof onFail === 'function'){
                onFail(body);
            }
        }
    });
}

var Handler = {
    login: _login,
    getInfo: _getInfo,
    getTask: _getTask,
    getBug: _getBug,
    getAllBugs: _getAllBugs,
    getMessage: _getMessage
};

module.exports = Handler;

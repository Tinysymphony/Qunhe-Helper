// Using http request to get data in json format.

var req = require('request');
var globalJar = req.jar();

// url and method can be maintained in the const.js
// const URL = require('../const').URL;
//var jiraDomain = 'http://jira.qunhequnhe.com/';
var jiraDomain = 'http://10.1.6.113/',
    msgDomain = 'http://10.10.31.222/',
    bugRankDomain = 'http://10.10.31.222/';

function _login(username, password, onSuccess, onFail){
    var tag = 'login';
    var options = {
        url: jiraDomain + 'rest/auth/1/session',
        method: 'POST',
        json: {
            "username": username || "irobot",
            "password": password || "cleanEARTH"
        },
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail, true);
}

function _getInfo(onSuccess, onFail){
    var tag = 'getInfo';
    var options = {
        url: jiraDomain + 'rest/api/2/myself',
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

function _getTask(onSuccess, onFail){
    var tag = 'getTask';
    var options = {
        url: jiraDomain + 'rest/api/2/project',
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

function _getBug(name, queryStatus, onSuccess, onFail){
    var tag = 'getBug';
    if(!name){
        name = 'irobot';
    }
    console.log(queryStatus);
    var options = {
        url: jiraDomain + 'rest/api/2/search?jql=issuetype = Bug AND ' + queryStatus + ' AND assignee in (' + name + ')',
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

function _getAllBugs(onSuccess, onFail){
    var tag = 'getAllBugs';
    var options = {
        url: jiraDomain + 'rest/api/2/search?jql=issuetype = Bug',
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

function _getBugRank(onSuccess, onFail){
    var tag = 'getBugRank';
    var options = {
        url: bugRankDomain + 'api/notice',
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

function _getMessage(id, onSuccess, onFail){
    var tag = 'getMessage';
    var options = {
        url: msgDomain + 'api/readmessage?recipientId=' + id,
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

function _getUsers(onSuccess, onFail){
    var tag = 'getUsers';
    var options = {
        url: msgDomain + 'api/userinfo',
        method: 'GET',
        jar: globalJar
    };
    _base(tag, options, onSuccess, onFail);
}

// basic logic
function _base(tag, options, onSuccess, onFail, noParse){
    req(options, function(err, res, body){
        if(!err && res.statusCode === 200 && onSuccess && typeof onSuccess === 'function'){
            console.log(new Date() + ': ' + tag + ' √');
            if(noParse){
                onSuccess(body);
            } else {
                onSuccess(JSON.parse(body));
            }
        } else {
            console.log(new Date() + ': ' + tag + ' X ----- Error: ' + err);
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
    getMessage: _getMessage,
    getBugRank: _getBugRank,
    getUsers: _getUsers
};

module.exports = Handler;

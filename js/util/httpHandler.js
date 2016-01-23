var req = require('request');
var globalJar = req.jar();

function _login(username, password, callback){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/auth/1/session',
        method: 'POST',
        json: {
            "username": username || "irobot",
            "password": password || "cleanEARTH"
        },
        jar: globalJar
    };
    _base(options, callback);
}

function _getInfo(callback){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/myself',
        method: 'GET',
        jar: globalJar
    };
    _base(options, callback);
}

function _getTask(callback){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/project',
        method: 'GET',
        jar: globalJar
    };
    _base(options, callback);
}

function _getBug(name, queryStatus, callback){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/search?jql=issuetype = Bug AND ' + queryStatus + ' AND assignee in (' + name + ')',
        method: 'GET',
        jar: globalJar
    };
    _base(options, callback);
}

function _getAllBugs(callback){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/search?jql=issuetype = Bug',
        method: 'GET',
        jar: globalJar
    };
    _base(options, callback);
}

function _getMessage(callback){
    var options = {
        url: 'http://10.10.31.222/api/notice',
        method: 'GET',
        jar: globalJar
    };
    _base(options, callback);
}

function _base(options, callback){
    //guozi
    // return callback(true);
    req(options, function(err, res, body){
        if(!err && res.statusCode === 200){
            callback(true, body);
        } else {
            callback(false, body);
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

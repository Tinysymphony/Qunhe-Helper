var req = require('request');
var globalJar = req.jar();

function _jsonHandler(method, url, data, callback){

}

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

function _getBug(name, callback){
    var options = {
        url: 'http://jira.qunhequnhe.com/rest/api/2/search?jql=issuetype = Bug AND status = Open AND assignee in (' + name + ')',
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
    req(options, function(err, res, body){
        if(!err && res.statusCode === 200){
            var status = true;
            callback(status, body);
        } else {
            var status = false;
            callback(status, body);
        }
    });
}

var Handler = {
    login: _login,
    jsonHandler: _jsonHandler,
    getInfo: _getInfo,
    getTask: _getTask,
    getBug: _getBug,
    getMessage: _getMessage
};

module.exports = Handler;

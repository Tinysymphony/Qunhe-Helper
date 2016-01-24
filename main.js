'use strict';

const electron = require('electron');

// Module to get event from application's view.
const ipc = electron.ipcMain;

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Modules defined by Tiny (Guozi)
const httpHandler = require('./js/util/httpHandler');
const dataHandler = require('./js/util/dataHandler');
// Load Constants
const CONST = require('./js/const.js'),
    MODE = CONST.MODE,
    ACTION = CONST.ACTION,
    WINDOW = CONST.WINDOW,
    STATUS = CONST.STATUS,
    TYPE = CONST.TYPE,
    SEND = CONST.SEND;

// Using test mode
if(process.argv[2] === MODE.TEST_MODE){
    var  DATA = require('./js/data.js');
} else {
    var DATA = null;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// Global References of new windows created by the mainWindow.
var newWindows = {};

// Save information in the process for temporary use.
var _username = 'irobot',
    _info = null,
    _bug = null,
    _message = null,
    _task = null;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 320, height: 470,
        //   x: 0, y:0,
        transparent: true,
        autoHideMenuBar: true,
        frame: false,
    });
    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // newWindows = null;
        mainWindow = null;
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// when the close button of the login window is pressed, close the application.
ipc.on(ACTION.CLOSE_APP, function () {
    app.quit();
});

// when items on the main menu is clicked, open a new window and save the reference.
ipc.on(ACTION.NEW_WINDOW, function(emitter, name, url, options){
    // options.resizable = false;
    options.overlayScrollbars = true;
    if(name === WINDOW.TOP){
        //link browser
        options.nodeIntegration = false;
    }
    newWindows[name] = new BrowserWindow(options);
    newWindows[name].loadURL(url);
    // newWindows[name].webContents.openDevTools();
    newWindows[name].on('closed', function(){
        newWindows[name] = null;
    });
});

// Router for handling data requests from the front-end.
ipc.on(ACTION.DATA_REQUEST, function(emitter, name, type){
    switch (name) {
        case WINDOW.TASK:
            dataHandler.getTask(newWindows[name]);
            break;
        case WINDOW.BUG:
            if(type === TYPE.HISTROY_BUG){
                dataHandler.getBug(newWindows[name], STATUS.CLOSED_BUG, STATUS.RESOLVED_BUG);
            } else if(type === TYPE.RANK_BUG) {
                dataHandler.rankBug(newWindows[name]);
            } else {
                dataHandler.getBug(newWindows[name], STATUS.OPEN_BUG);
            }
            break;
        case WINDOW.MESSAGE:
            dataHandler.getMessage(newWindows[name]);
            break;
        case WINDOW.INFO:
            dataHandler.getInfo(newWindows[name]);
            break;
        case WINDOW.SETTINGS:
            // _getSettings(newWindows[name]);
            // break;
        default:
            break;
    }
});

// Login with LDAP account
ipc.on(ACTION.LOGIN, function(emitter, username, password){
    dataHandler.login(username, password, mainWindow);
});

// login in test mode
ipc.on(ACTION.LOGIN_TEST, function(emitter){
    console.log(DATA);
    mainWindow.send(SEND.LOGIN_SUCCESS);
});

//////////////
// function _getInfo(target){
//     httpHandler.getInfo(function(status, data){
//         if(status){
//             data = JSON.parse(data);
//             target.send('load-info', data);
//             _info = data;
//         }else {
//             target.send('load-fail');
//             _info = null;
//         }
//     });
// }
//
// function _getTask(target){
//     httpHandler.getTask(function(status, data){
//         if(status){
//             data = smallerTask(data);
//             target.send('load-task', data);
//             _task = data;
//         }else {
//             target.send(SEND.LOAD_FAILED);
//             _task = null;
//         }
//     });
// }
//
// function _getMessage(target){
//     httpHandler.getMessage(function(status, data){
//         if(status){
//             data = JSON.parse(data);
//             _message = data;
//             target.send('load-message', data);
//             mainWindow.send('render-message', data, false);
//         } else {
//             target.send('load-fail');
//             _message = null;
//         }
//     });
// }
//
// function _getBug(target){
//     var query = '(';
//     for(var i = 0; i < arguments.length - 1; i++){
//         if(i != arguments.length - 2){
//             query += 'status = ' + arguments[i + 1] + ' OR ';
//         } else {
//             query += 'status = ' + arguments[i + 1] + ')';
//         }
//     }
//     httpHandler.getBug(_username, query, function(status, data){
//         if(status){
//             data = smallerBug(data);
//             _bug = data;
//             target.send('load-bug', data);
//         } else {
//             _bug = null;
//             target.send('load-fail');
//         }
//     });
// }
//
// function _rankBug(target){
//     httpHandler.getAllBugs(function(status, data){
//         if(status){
//             var rank = {};
//             console.log(data.totoal);
//             for(var i = 0; i < data.total; i++){
//                 console.log(i);
//                 if(rank[data.issues[i].assignee]){
//                     rank[data.issues[i].assignee] += 1;
//                 } else {
//                     rank[data.issues[i].assignee] = 1;
//                 }
//             }
//             console.log(rank);
//             target.send('load-rank', rank);
//         } else {
//             target.send('load-fail');
//         }
//     });
// }
//
// function smallerTask(data){
//     var result = [];
//     data = JSON.parse(data);
//     for(var i = 0; i < data.length; i++){
//         var tmp = {
//             "self": data[i]['self'],
//             "key": data[i]['key'],
//             "name": data[i]['name'],
//             "id": data[i]['id']
//         };
//         result.push(tmp);
//     }
//     return JSON.stringify(result);
// }
//
// function smallerBug(data){
//     console.log(data);
//     data = JSON.parse(data);
//     var result = {};
//     result.bugs = [];
//     result.total = data.total;
//     for(var i = 0; i < data.total; i++){
//         var tmp = {
//             "key": data.issues[i]["key"],
//             "title": data.issues[i]["fields"]["summary"],
//             "link": "http://jira.qunhequnhe.com/browse/" + data.issues[i]["key"]
//         };
//         result.bugs.push(tmp);
//     }
//     return JSON.stringify(result);
// }

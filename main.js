'use strict';

const electron = require('electron');

const httpHandler = require('./js/util/httpHandler');

const ipc = electron.ipcMain;
// const dockMenu = require('./func/dock-menu');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

var newWindows = {};

var _username = 'irobot',
    _password = '',
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
        mainWindow = null;
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {

    // console.log(size.width + ' ' + size.height);
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

ipc.on('close-app', function () {
    app.quit();
});

ipc.on('start-new', function(emitter, name, url, options){
    // options.resizable = false;
    options.overlayScrollbars = true;
    if(name === 'top'){
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

ipc.on('ask-for-data', function(emitter, name){
    switch (name) {
        case 'task':
            _getTask(newWindows[name]);
            break;
        case 'bug':
            _getBug(newWindows[name]);
            break;
        case 'message':
            _getMessage(newWindows[name]);
            break;
        case 'info':
            _getInfo(newWindows[name]);
            break;
        case 'settings':
            // _getSettings(newWindows[name]);
            // break;
        default:
            break;
    }
});

ipc.on('login', function(emitter, username, password){
    // console.log(username);
    httpHandler.login(username, password, function(status){
        if(status){
            _username = username;
            _password = _password;
            mainWindow.send('login-success');
            httpHandler.getMessage(function(status, data){
                if(status){
                    data = JSON.parse(data);
                    _message = data;
                    mainWindow.send('render-message', data, true);
                } else {
                    mainWindow.send('render-message-error');
                    _message = null;
                }
            });
        } else {
            mainWindow.send('login-error');
        }
    });
});

ipc.on('test', function(emitter){
    mainWindow.send('login-success');
});

function _getInfo(target){
    httpHandler.getInfo(function(status, data){
        if(status){
            data = JSON.parse(data);
            console.log(data);
            target.send('load-info', data);
            _info = data;
        }else {
            target.send('load-fail');
            _info = null;
        }
    });
}

function _getTask(target){
    httpHandler.getTask(function(status, data){
        if(status){
            data = smallerTask(data);
            target.send('load-task', data);
            _task = data;
        }else {
            target.send('load-fail');
            _task = null;
        }
    });
}

function _getMessage(target){
    httpHandler.getMessage(function(status, data){
        if(status){
            data = JSON.parse(data);
            _message = data;
            console.log(data);
            target.send('load-message', data);
            mainWindow.send('render-message', data, false);
        } else {
            target.send('load-fail');
            _message = null;
        }
    });
}

function _getBug(target){
    console.log('bug');
    console.log(_username);
    httpHandler.getBug(_username, function(status, data){
        if(status){
            data = smallerBug(data);
            console.log(data);
            _bug = data;
            target.send('load-bug', data);
        } else {
            _bug = null;
            target.send('load-fail');
        }

    });
}

function smallerTask(data){
    var result = [];
    data = JSON.parse(data);
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

function smallerBug(data){
    var result = [];
    data = JSON.parse(data);
    for(var i = 0; i < data.length; i++){
        var tmp = {
            "key": data[i]["key"],
            "summary": data[i]["fields"]["summary"]
        }
        result.push(tmp);
    }
    return JSON.stringify(result);
}

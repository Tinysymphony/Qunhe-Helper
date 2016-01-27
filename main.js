'use strict';

const fs = require('fs');
const path = require('path');
const electron = require('electron');

// Module to get event from application's view.
const ipc = electron.ipcMain;

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Save user settings
var nconf = require('nconf'),
    dataPath = path.join(app.getPath('userData'), 'settings.json');
nconf.file({file: dataPath});

// Modules defined by Tiny (Guozi)
// const httpHandler = require('./js/util/httpHandler');
const dataHandler = require('./js/util/dataHandler');
// Load Constants (Ps. these constants' property can be modified...)
const CONST = require('./js/const.js'),
    MODE = CONST.MODE,
    ACTION = CONST.ACTION,
    WINDOW = CONST.WINDOW,
    STATUS = CONST.STATUS,
    TYPE = CONST.TYPE,
    SEND = CONST.SEND;

var TEST_MODE = false,
    DATA = null,
    isNotify = true;
// Using test mode

if (process.argv[2] === MODE.TEST_MODE) {
    DATA = require('./js/data.js');
    TEST_MODE = true;
} else {
    //DATA = require('./js/data.js');
    //TEST_MODE = true;
    DATA = null;
    TEST_MODE = false;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
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
    mainWindow.webContents.openDevTools();

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

// when the main window is rendered, send the data path.
ipc.on(ACTION.READY, function () {
    mainWindow.send(SEND.DATA_PATH, dataPath);
});

// when the close button of the login window is pressed, close the application.
ipc.on(ACTION.CLOSE_APP, function () {
    app.quit();
});

// when items on the main menu is clicked, open a new window and save the reference.
ipc.on(ACTION.NEW_WINDOW, function (emitter, name, url, options) {
    // options.resizable = false;
    options.overlayScrollbars = true;
    if (name === WINDOW.TOP) {
        //link browser
        options.nodeIntegration = false;
    }
    newWindows[name] = new BrowserWindow(options);
    newWindows[name].loadURL(url);
    // newWindows[name].webContents.openDevTools();
    newWindows[name].on('closed', function () {
        newWindows[name] = null;
    });
});

// Router for handling data requests from the front-end
ipc.on(ACTION.DATA_REQUEST, function (emitter, name, type) {
    // Data render test
    if (TEST_MODE) {
        switch (name) {
            case WINDOW.TASK:
                newWindows[name].send(SEND.LOAD_TASK, DATA.Task);
                break;
            case WINDOW.BUG:
                if (type === TYPE.HISTROY_BUG) {
                    newWindows[name].send(SEND.LOAD_BUG, DATA.HistoryBug);
                } else if (type === TYPE.RANK_BUG) {
                    newWindows[name].send(SEND.LOAD_RANK, DATA.RankBug);
                } else {
                    newWindows[name].send(SEND.LOAD_BUG, DATA.Bug, isNotify);
                }
                break;
            case WINDOW.MESSAGE:
                newWindows[name].send(SEND.LOAD_MESSAGE, DATA.Message);
                mainWindow.send(SEND.RENDER_MESSAGE, DATA.Message);
                break;
            case WINDOW.INFO:
                newWindows[name].send(SEND.LOAD_INFO, DATA.Info);
                break;
            case WINDOW.SETTINGS:
                newWindows[name].send(SEND.LOAD_SETTINGS, DATA.Settings);
                break;
            default:
                break;
        }
        return;
    }

    // Work mode
    switch (name) {
        case WINDOW.TASK:
            dataHandler.getTask(newWindows[name]);
            break;
        case WINDOW.BUG:
            if (type === TYPE.HISTROY_BUG) {
                dataHandler.getBug(newWindows[name], type, STATUS.CLOSED_BUG, STATUS.RESOLVED_BUG);
            } else if (type === TYPE.RANK_BUG) {
                dataHandler.rankBug(newWindows[name]);
            } else {
                dataHandler.getBug(newWindows[name], type, STATUS.OPEN_BUG, STATUS.REOPENED_BUG);
            }
            break;
        case WINDOW.MESSAGE:
            dataHandler.getMessage(newWindows[name], mainWindow);
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
ipc.on(ACTION.LOGIN, function (emitter, username, password) {
    // Send Login Success message with the path to save user configurations.
    if (TEST_MODE) {
        mainWindow.send(SEND.LOGIN_SUCCESS);
        mainWindow.send(SEND.RENDER_MESSAGE, DATA.RenderMessage, isNotify, true);
        mainWindow.send(SEND.RENDER_BUG, DATA.Bug.total, isNotify, true);
        return;
    }
    dataHandler.login(username, password, mainWindow);
});

ipc.on(ACTION.POLLING_MSG, function () {
    if(TEST_MODE) {
        mainWindow.send(SEND.RENDER_MESSAGE, DATA.RenderMessage, isNotify, false);
        return;
    }
    dataHandler.pollingMessage(mainWindow);
});

ipc.on(ACTION.POLLING_BUG, function(){
    if(TEST_MODE) {
        mainWindow.send(SEND.RENDER_BUG, DATA.Bug.total, isNotify, false);
        return;
    }
    dataHandler.getBug(mainWindow, TYPE.BUG, STATUS.OPEN, STATUS.REOPENED_BUG);
});

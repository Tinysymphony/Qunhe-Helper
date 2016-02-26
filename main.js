'use strict';

import fs from 'fs'
import {app, BrowserWindow, ipcMain, Tray, Menu, autoUpdater, screen} from 'electron'
import path from 'path'

// Save user settings
import nconf from 'nconf'
const dataPath = path.join(app.getPath('userData'), 'settings.json');
nconf.file({file: dataPath});


// Modules defined by Tiny (Guozi)
import dataHandler from './js/util/dataHandler'
// Load Constants (Ps. these constants' property can be modified...)
import {MODE, ACTION, WINDOW, STATUS, TYPE, SEND, SIZE, APP_ID} from './js/const'

let TEST_MODE = false,
    DATA = null,
    isNotify = true,
    screenSize = null;

global.tiny = 'wytiny';
global.sendToAllWindows = sendToAllWindows;

// Using test mode

const currentBugList = [STATUS.OPEN_BUG, STATUS.REOPENED_BUG],
    historyBugList = [STATUS.CLOSED_BUG, STATUS.RESOLVED_BUG],
    serverHost = 'serverHost.qunhequnhe.com'; //Pseudo Host

const arg = {
    platform: process.platform,
    appId: APP_ID,
    version: nconf.get('version') || '1.0.1'
}

if (process.argv[2] === MODE.TEST_MODE) {
    DATA = require('./js/data.js');
    TEST_MODE = true;
    console.log('testing');
} else {
    //DATA = require('./js/data.js');
    //TEST_MODE = true;
    DATA = null;
    TEST_MODE = false;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// Global References of new windows created by the mainWindow.
let newWindows = {};

// Save information in the process for temporary use.
let _username = 'irobot',
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
        resizable: true
    });
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // newWindows = null;
        appIcon = null;
        mainWindow = null;
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
let appIcon = null;
app.on('ready', () => {
    appIcon = new Tray('./img/big@2x.png')
    //top menu (OS X)

    const menu = Menu.buildFromTemplate(template)
    appIcon.setToolTip('Guozi')
    appIcon.setContextMenu(menu)
    // Menu.setApplicationMenu(menu)
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// when the main window is rendered, send the data path.
// can be replaced by binding dataPath to the global object and be exposed to FE by remote.getGlobal('dataPath')
ipcMain.on(ACTION.READY, (emitter, window, size) => {
    if(window !== 'main'){
        // handle child windows' ready event: save dataPath to save user data
        newWindows[window].send(SEND.DATA_PATH, dataPath);
        return;
    } else {
        //  handle main window ready event: save the screen size
        screenSize = size;
        mainWindow.send(SEND.DATA_PATH, dataPath);
    }
});

// when the close button of the login window is pressed, close the application.
ipcMain.on(ACTION.CLOSE_APP, () => {
    app.quit();
});

ipcMain.on(ACTION.RESTART, () => {
    console.log('Restarting...');
    for(let win in newWindows){
        if(newWindows[win] && newWindows.hasOwnProperty(win) && typeof newWindows[win] === 'object'){
            newWindows[win].send(SEND.CLOSE);
        }
    }
    mainWindow.send(SEND.RELOAD);
});

// when items on the main menu is clicked, open a new window and save the reference.
ipcMain.on(ACTION.NEW_WINDOW, (emitter, name, size) => {
    startWindow(name, size);
});

// Router for handling data requests from the front-end
ipcMain.on(ACTION.DATA_REQUEST, (emitter, name, type) => {
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
                dataHandler.getBug(newWindows[name], mainWindow, type, historyBugList);
            } else if (type === TYPE.RANK_BUG) {
                dataHandler.rankBug(newWindows[name]);
            } else {
                dataHandler.getBug(newWindows[name], mainWindow, type, currentBugList);
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
ipcMain.on(ACTION.LOGIN, (emitter, username, password) => {
    // Send Login Success message with the path to save user configurations.
    if (TEST_MODE) {
        mainWindow.webContents.send(SEND.LOGIN_SUCCESS);
        mainWindow.send(SEND.RENDER_MESSAGE, DATA.RenderMessage, isNotify, true);
        mainWindow.send(SEND.RENDER_BUG, DATA.Bug.total, isNotify, true);
        return;
    }
    dataHandler.login(username, password, mainWindow);
});

ipcMain.on(ACTION.POLLING_MSG, () => {
    console.log('polling msg');
    if(TEST_MODE) {
        mainWindow.send(SEND.RENDER_MESSAGE, DATA.RenderMessage, isNotify, false);
        return;
    }
    dataHandler.pollingMessage(mainWindow);
});

ipcMain.on(ACTION.POLLING_BUG, () => {
    console.log('polling bug');
    if(TEST_MODE) {
        mainWindow.send(SEND.RENDER_BUG, DATA.Bug.total, isNotify, false);
        return;
    }
    dataHandler.pollingBug(mainWindow, currentBugList);
});

ipcMain.on(ACTION.CLEAR_MSG, () => {
    mainWindow.send(SEND.CLEAR_MSG);
});

//Auto Updater Module
ipcMain.on(ACTION.UPDATE, () => {
    updateVersion(arg);
});

function updateVersion(options) {
    autoUpdater.setFeedUrl(getUpdateUrl(options))
    autoUpdater.checkForUpdates();
}

function getUpdateUrl(options) {
    return `http://${serverHost}/api/update?` +
        `app_id=${options.appId}` +
        `&current_version=${options.version}` +
        `&platform=${options.platform}`
}

autoUpdater.on('checking-for-update', info => {
    console.log('Checking For Update: ' + JSON.stringify(info));
});

autoUpdater.on('update-not-available', () => {
    console.log("Update Not Available");
});

autoUpdater.on('update-available', info => {
    console.log('Update Available: ' + JSON.stringify(info));
});

autoUpdater.on('update-downloaded', () => {} )

autoUpdater.on('error', (status, info) => {
    console.log(`AutoUpdate Error: ${status} --- ${info}`);
});

//functions

//top menu: must be called within app.on('ready', () => {})
const template = [
    {
        label: 'Task',
        click: () => { startWindow(WINDOW.TASK) }
    },
    {
        label: 'Bug',
        submenu: [
            {
                label: 'Current',
            },
            {
                label: 'History',
            },
            {
                label: 'Ranking',
            }
        ]
    },
    {
        label: 'Message',
        submenu: [
            {
                label: 'Message Box'
            },
            {
                label: 'Sender'
            }
        ]
    },
    {
        label: 'Qunhe News',
        click: () => { startWindow(WINDOW.TOP) }
    },
    {
        label: 'Preferences...',
        accelerator: 'Command+,',
        click: () => { startWindow(WINDOW.SETTINGS) }
    },
    {
        label: 'About XiaoMeng',
        cilck: () => { startWindow(WINDOW.ABOUT) }
    },
    {
        label: 'Quit',
        click: () => { app.quit() }
    },
]

function startWindow (name) {
    if(newWindows[name]){
        return;
    }
    let size = SIZE[name.toUpperCase()];
    let url = 'file://' + path.resolve(__dirname, `./child/${name}/${name}.html`);
    let options = {
        x: screenSize.width / 2 - size.width / 2,
        y: screenSize.height / 2 - size.height / 2,
        width: size.width,
        height: size.height
    }
    options.resizable = false;
    options.overlayScrollbars = true;
    if (name === WINDOW.TOP) {
        //link browser
        options.nodeIntegration = false;
    }
    newWindows[name] = new BrowserWindow(options);
    newWindows[name].loadURL(url);
    // newWindows[name].webContents.openDevTools();
    newWindows[name].on('closed', () => {
        newWindows[name] = null;
    });
}

// message: { type: String, data: Object }
function sendToAllWindows(message) {
    mainWindow.webContents.send(SEND.BOARDCAST, message)
    if(newWindows){
        for(let win in newWindows){
            if(newWindows[win] && newWindows.hasOwnProperty(win) && typeof newWindows[win] === 'object'){
                newWindows[win].webContents.send(SEND.BOARDCAST, message);
            }
        }
    }
}

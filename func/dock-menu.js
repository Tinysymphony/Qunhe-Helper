var remote = require('electron').remote;
console.log(remote);
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');

function bindDockMenu(){
    var trayIcon = null;

    if (process.platform === 'darwin') {
        trayIcon = new Tray(path.resolve(__dirname, '../img/close.png'));
    }
    else {
        trayIcon = new Tray(path.resolve(__dirname, '../img/close.png'));
    }
    var trayMenuTemplate = [
        {
            label: 'Sound machine',
            enabled: false
        },
        {
            label: 'Settings',
            click: function () {
                ipc.send('open-settings-window');
            }
        },
        {
            label: 'Quit',
            click: function () {
                ipc.send('close-main-window');
            }
        }
    ];
    var trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    trayIcon.setContextMenu(trayMenu);
}



module.exports = bindDockMenu;

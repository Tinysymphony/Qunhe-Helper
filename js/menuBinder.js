var $ = require('jquery');
var featureParser = require('./util/featureParser');
var notice = require('./util/notification');
var httpHandler = require('./util/httpHandler');

var WINDOW = require('./const').WINDOW;

const ipc = require('electron').ipcRenderer;

function binder(){
    var $menu = $('#dummy');

    $menu
    .on('click', '.J-task', function(){
        ipc.send('start-new', WINDOW.TASK);
        $menu.toggleClass('dummy--active');
    })
    .on('click', '.J-bug', function(){
        ipc.send('start-new', WINDOW.BUG);
        $menu.toggleClass('dummy--active');
    })
    .on('click', '.J-message', function(){
        ipc.send('start-new', WINDOW.MESSAGE);
        $menu.toggleClass('dummy--active');
    })
    .on('click', '.J-info', function(){
        ipc.send('start-new', WINDOW.INFO);
        $menu.toggleClass('dummy--active');
    })
    .on('click', '.J-top', function(){
        ipc.send('start-new', WINDOW.TOP);
        $menu.toggleClass('dummy--active');
    })
    .on('click', '.J-about', function(){
        ipc.send('start-new', WINDOW.ABOUT);
        $menu.toggleClass('dummy--active');
    })
    .on('click', '.J-settings', function(){
        ipc.send('start-new', WINDOW.SETTINGS);
        $menu.toggleClass('dummy--active');
    });

    $(document).on('click', '.img img', function(){
        $menu.toggleClass('dummy--active');
    });

    $(window).on('message', function(e){
        var info= e.originalEvent.data;
        if(info.action.indexOf('close') >= 0){
            window[info.name].close();
            window[info.name] = null;
        }
    });
}

module.exports = binder;

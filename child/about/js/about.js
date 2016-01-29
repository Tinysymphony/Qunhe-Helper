var $ = require('jquery');
const shell = require('electron').shell;
const ipc = require('electron').ipcRenderer;
const SEND = require('../../js/const').SEND;

$(function(){
    ipc.on(SEND.CLOSE, function(){
        window.close();
    });

    $('.link').click(function(){
        var url = $(this).data('href');
        shell.openExternal(url);
    });
});

var $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const ACTION = require('../../js/const').ACTION;
const SEND = require('../../js/const.js').SEND;

$(function(){
    $('.J-change-user').click(function(){
        ipc.send(ACTION.RESTART);
    });

    ipc.on(SEND.CLOSE, function(){
        window.close();
    });
});
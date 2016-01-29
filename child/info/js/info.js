var $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const ACTION = require('../../js/const').ACTION;
const SEND = require('../../js/const.js').SEND;
var info = null;

$(function(){
    ipc.send('ask-for-data', 'info');
    ipc.on('load-info', function(emitter, data){
        info = data;
        updateInfo();
    });
    ipc.on(SEND.CLOSE, function(){
        window.close();
    });
});

function updateInfo(){
    if(info){
        $('.name').html(info.name);
        $('.email').html(info.emailAddress);
        // var img = document.querySelector('.content img');
        // $('.img').attr('src', info.avatarUrls['48x48']);
    }
}

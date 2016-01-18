var $ = require('jquery');
const ipc = require('electron').ipcRenderer;

var info = null;

$(function(){
    ipc.send('ask-for-data', 'info');
    ipc.on('load-info', function(emitter, data){
        info = data;
        console.log(data);
        updateInfo();
    });
});

function updateInfo(){
    if(info){
        $('.name').text(info.name);
        $('.email').text(info.emailAddres);
        // var img = document.querySelector('.content img');
        // $('.img').attr('src', info.avatarUrls['48x48']);
    }
}

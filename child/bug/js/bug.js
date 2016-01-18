const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
var $ = require('jquery');

var list = [];

$(function(){
    ipc.send('ask-for-data', 'bug');
    ipc.on('load-bug', function(emitter, a, b){
        console.log(a);
        list = JSON.parse(a);
    });
});

function updateList(){
    var html = '';
    for(var i = 0; i < list.length; i++){
        html += '<li><div class="item"><a class="item-name">' + list[i].name + '</a></div></li>';
    }
    $('.main-list').append(html);
}

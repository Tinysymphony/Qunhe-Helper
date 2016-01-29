const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
var $ = require('jquery');
const SEND = require('../../js/const.js').SEND;
const ACTION = require('../../js/const.js').ACTION;

var list = [];

$(function(){
    ipc.send(ACTION.DATA_REQUEST, 'task');
    ipc.on(SEND.LOAD_TASK, function(emitter, data){
        console.log(data + ' ok');
        list = data;
        updateList();
    });

    $(document).on('click', '.item', function(){
        var url = 'http://jira.qunhequnhe.com/projects/' + $(this).data('key').toUpperCase() + '/summary';
        shell.openExternal(url);
    });

    ipc.on(SEND.CLOSE, function(){
        window.close();
    });
});

function updateList(){
    var html = '';
    for(var i = 0; i < list.length; i++){
        html += '<li><div class="item center" data-key="' + list[i].key + '"><a class="item-name">' + list[i].name + '</a></div></li>';
    }
    $('.main-list').append(html);
}

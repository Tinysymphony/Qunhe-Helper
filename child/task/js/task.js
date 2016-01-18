const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
var $ = require('jquery');

var list = [];

$(function(){
    ipc.send('ask-for-data', 'task');
    ipc.on('load-task', function(emitter, data){
        list = JSON.parse(data);
        updateList();
    });

    $(document).on('click', '.item', function(){
        var url = 'http://jira.qunhequnhe.com/projects/' + $(this).data('key').toUpperCase() + '/summary';
        shell.openExternal(url);
    })
});

function updateList(){
    var html = '';
    for(var i = 0; i < list.length; i++){
        html += '<li><div class="item center" data-key="' + list[i].key + '"><a class="item-name">' + list[i].name + '</a></div></li>';
    }
    $('.main-list').append(html);
}

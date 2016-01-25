const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
const WINDOW = 'bug';
const ACTION = require('../../js/const').ACTION;
const SEND = require('../../js/const').SEND;

// const
var $ = require('jquery');

var list = [];

$(function(){
    $('.li-bug').addClass('focus');

    ipc.send(ACTION.DATA_REQUEST, WINDOW);
    ipc.on(SEND.LOAD_BUG, function(emitter, data){
        console.log(data);
        if(data.bugs){
            list = data.bugs;
            updateList();
        } else {
            list = data.ranks;
            updateRank();
        }
    });

    ipc.on(SEND.LOAD_RANK, function(emitter, data){
        for(var i in data){
            if(data.hasOwnProperty(i)){
                console.log(i + ': ' + data[i]);
            }
        }
    });

    $('.main-list').on('click', '.item', function(){
        var url = $(this).data('url');
        //$(this).append('<p>sfasf</p>');
        shell.openExternal(url);
    });

    $('.header').on('click', '.tab-item', function(){
        var $this = $(this);
        $this.addClass('focus').siblings().removeClass('focus');
        ipc.send('ask-for-data', WINDOW, $this.data('type'));
    });
});

function updateList(){
    var html = '';
    for(var i = 0; i < list.length; i++){
        html += '<li class="item" data-url="' + list[i].link + '">' +
            '<div class="bug-item">' +
            '<a><i class="icon-exclamation-sign mr10 ml10"></i>' + list[i].key +  ' ----- ' + list[i].title + '</a>' +
            '</div>' +
            '<div class="bug-detail">' +
            '</div>' +
            '</li>';
    }
    $('.main-list').html(html);
}

function updateRank(){
    var html = '';
    for(var i = 0; i < list.length; i++){
        html += '<li class="item" data-url="' + list[i].link + '"><a><i class="icon-exclamation-sign mr10 ml10"></i>' + list[i].rank +  ' ----- ' + list[i].name + ' ----- ' + list[i].count + '</a></li>';
    }
    $('.main-list').html(html);
}

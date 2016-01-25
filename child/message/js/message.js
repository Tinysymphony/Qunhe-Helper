var $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const ACTION = require('../../js/const').ACTION;
var notice = require('../../js/util/notification');

var message = [],
    messageCount;

$(function(){
    ipc.send(ACTION.DATA_REQUEST, 'message');
    ipc.on('load-message', function(emitter, data){
        message = data.messages;
        messageCount = data.count;
        noticeMessage();
        renderMessage();
        // renderDot();
    });
});

function noticeMessage(){
    if(messageCount != 0){
        notice('留言提醒', '有' + messageCount + '条信息未读，请尽快查阅', '', '../../img/s.png');
    }
}

function renderMessage(){
    var html = '';
    for(var i = 0; i < message.length; i++){
        html += '<li><div class="item center" data-id="' + message[i].recipientId + '">' +
        '<p class="item-content">' + message[i].content + '</p>' +
        '<p class="item-info">' +
        '<a class="item-sender">' + message[i].senderUserName + '</a>' +
        '<a class="item-time">' + message[i].formatCreated + '</a>' +
        '</p></div></li>';
    }
    $('.main-list').append(html);
}

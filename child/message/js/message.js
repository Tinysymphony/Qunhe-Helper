var $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const ACTION = require('../../js/const').ACTION;
const SEND = require('../../js/const.js').SEND;

var notice = require('../../js/util/notification'),
    nconf = require('nconf'),
    userList = [];

var message = [],
    messageCount;

$(function () {
    var $getMsg = $('.li-get-msg'),
        $sendMsg = $('.li-send-msg'),
        $list = $('.main-list'),
        $input = $('.input-wp');

    $getMsg.addClass('focus');
    ipc.send(ACTION.READY, 'message');
    //ipc.send(ACTION.DATA_REQUEST, 'message');
    //ipc.on('load-message', function (emitter, data, dataPath) {
    //    message = data.messages;
    //    messageCount = data.count;
    //    noticeMessage();
    //    renderMessage();
    //});

    ipc.on(SEND.DATA_PATH, function (emitter, dataPath) {
        console.log('data path √');
        nconf.file({file: dataPath});
        queryMessage();
    });

    $getMsg.on('click', function () {
        $list.empty();
        //ipc.send(ACTION.DATA_REQUEST, 'message');
        queryMessage();
        $('.tab-item').toggleClass('focus');
        $input.toggleClass('none');
    });

    $sendMsg.on('click', function () {
        var userList = nconf.get('users') || [],
            html = '';
        $list.empty();
        $('.tab-item').toggleClass('focus');
        $input.toggleClass('none');
        for (var i = 0; i < userList.length; i++) {
            html += '<li class="fl user-item" data-real="' + userList[i].realName + '" data-id="' + userList[i].userId + '">' + userList[i].userName + '</li>'
        }
        $list.append(html);
    });

    $input.on('click', '.clear-btn', function () {
        $('#content').val('');
    }).on('click', '.send-btn', function () {
        var value = $('#content').val(),
            sendTo = $('.target-user').data('id'),
            self = nconf.get('id');
        var data = {
            senderid: self || 1,
            recipientid: sendTo || 38,
            content: value
        };

        $.ajax({
            url: 'http://10.10.31.222/api/sendmessage',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                console.log('send √');
                console.log(data);
                var $successModal = $('.send-sucess');
                $successModal.css({display: 'inline-block'});
                setTimeout(function () {
                    $successModal.css({display: 'none'});
                }, 1200);
            },
            error: function () {
                console.log('send X');
                var $errorModal = $('.send-error');
                $errorModal.css({display: 'inline-block'});
                setTimeout(function () {
                    $errorModal.css({display: 'none'})
                }, 1200);
            }
        });
    });

    $list.on('click', '.user-item', function () {
        $(this).addClass('target-user').siblings().removeClass('target-user');
    });


    ipc.on(SEND.CLOSE, function () {
        window.close();
    });
});

function noticeMessage() {
    if (messageCount != 0 ) {
        notice('私信提醒', '有' + messageCount + '条信息未读，请尽快查阅', '', '../../img/s.png');
    }
}

function renderMessage() {
    var $list = $('.main-list');
    if (message.length === 0) {
        $list.before('<p class="no-msg">没有新的消息，sigh...</p>');
        return;
    }
    var html = '';
    for (var i = message.length - 1; i >= 0; i--) {
        html += '<li><div class="item center" data-id="' + message[i].recipientid + '">' +
            '<p class="item-content">' + message[i].content + '</p>' +
            '<p class="item-info">' +
            '<a class="item-sender">from ' + getName(message[i].senderid) + '</a>' +
                '<a class="item-time">' + (new Date(message[i].createTime)).toString().split('GMT')[0] + '</a>' +
            '</p></div></li>';
    }
    $list.append(html);
}

function clearMessage(){
    ipc.send(ACTION.CLEAR_MSG);
}

// guozi
function getName(id){
    var list = nconf.get('users');
    for(var i = 0; i < list.length; i++){
        if(list[i].userId === id){
            return list[i].userName;
        }
    }
    return 'Anonymous';
}

function queryMessage(){
    var id = nconf.get('id') || 38;
    $.ajax({
        url: 'http://10.10.31.222/api/readmessage?recipientid=' + id,
        method: 'GET',
        success: function (data) {
            message = JSON.parse(data);
            messageCount = message.length;
            //noticeMessage();
            renderMessage();
            clearMessage();
            nconf.set('message', message.length);
            nconf.save();
        },
        error: function () {
        }
    });
}
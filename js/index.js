const electron = require('electron');
const ipc = electron.ipcRenderer;
const $ = require('jquery');
var path = require('path');
var menuBinder = require('./js/menuBinder');
var notice= require('./js/util/notification');
// var infoBinder = require('./js/infoBinder');

$(function(){
    var $loginBtn = $('.login'),
        moveFlag = false;
    $(document).on('keyup', function(e){
        //handle enter key down
        $('.login-success, .login-error').css({display: 'none'});
        if($loginBtn.hasClass('disabled')){
            return;
        }
        if(e.keyCode === 13){
            $loginBtn.addClass('disabled');
            var username = $('.username').val(),
                password = $('.password').val();
            // ipc.send('login', username, password);
            ipc.send('test');
        }
    }).on('click', '.login', function(){
        //handle click event on login button
        $('.login-success, .login-error').css({display: 'none'});
        if($loginBtn.hasClass('disabled')){
            return;
        }
        $loginBtn.addClass('disabled');
        var username = $('.username').val(),
            password = $('.password').val();
        ipc.send('login', username, password)
    }).on('click', '.close-btn', function(){
        ipc.send('close-app');
    }).on('focus', '.info input', function(){
        $(this).select();
    });
    // todo: click and drag bug
    // on('mousedown', '.img img', function(){
    //
    // }).on('mousemove', '.img img', function(){
    //
    // }).on('mouseup', '.img img', function(){
    //
    // });

    ipc.on('login-success', loginSuccess);
    ipc.on('login-error', loginError);
    ipc.on('load-info', uploadInfo);
    ipc.on('render-message', renderMessage);

    // bindImageAction();

    // setTimeout(tmp_render, 22000);
});

function loginSuccess(){
    // var about = 'file://' + path.join(__dirname, 'child/about/about.html');
    $('.login-success').css({display: 'block'});
    $('.tiny').css({
        'background': 'transparent',
        'border': 0,
        'box-shadow': 'none',
    });
    $('.close, .return, .info').remove();
    $('.drag').css({display: 'block'});
    setTimeout(move, 400);
}

function loginError(){
    $('.login').removeClass('disabled');
    $('.login-error').css({display: 'block'});
}

function move(){
    $('.tiny').animate({
        'margin-top': 160
    }, 300);

    $('.img img').css({
        'cursor': 'pointer'
    });

    //bind
    setTimeout(menuBinder, 500);
}

function uploadInfo(emitter, data){
    // infoBinder(data);
    window.g_info = data;
}

function renderMessage(emitter, data, isShow){
    window.g_messageCount = data.count;
    if(isShow){
        notice('留言提醒', '有' + window.g_messageCount + '条信息未读，请尽快查阅', '', '../../img/s.png');
    }
    $('.red-point').text(window.g_messageCount).css({display: 'block'});
    $('.J-message').text('留言板（' + window.g_messageCount + '）');
}

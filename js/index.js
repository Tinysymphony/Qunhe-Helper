const electron = require('electron');
const ipc = electron.ipcRenderer;
const $ = require('jquery');
var path = require('path');
var menuBinder = require('./js/menuBinder');
var notice= require('./js/util/notification');
// var infoBinder = require('./js/infoBinder');

$(function(){
    $(document).on('keyup', function(e){
        if(e.keyCode === 13){
            $('.login-success, .login-error').css({display: 'none'});
            var username = $('.username').val(),
                password = $('.password').val();
            ipc.send('login', username, password)
        }
    }).on('click', '.login', function(){
        $('.login-success, .login-error').css({display: 'none'});
        var username = $('.username').val(),
            password = $('.password').val();
        ipc.send('login', username, password)
    }).on('click', '.close-btn', function(){
        ipc.send('close-app');
    }).on('focus', '.info input', function(){
        $(this).select();
    });

    ipc.on('login-success', loginSuccess);
    ipc.on('login-error', loginError);
    ipc.on('load-info', uploadInfo);
    ipc.on('render-message', renderMessage);

    // setTimeout(tmp_render, 22000);
});

function loginSuccess(){
    var about = 'file://' + path.join(__dirname, 'child/about/about.html');

    $('.login-success').css({display: 'block'});
    $('.tiny').css({
        'background': 'transparent',
        'border': 0,
        'box-shadow': 'none',
    });
    $('.close, .return, .info').remove();
    setTimeout(move, 400);
}

function loginError(){
    $('.login-error').css({display: 'block'});
}

function move(){
    $('.tiny').animate({
        'margin-top': 180
    }, 300);

    $('.img img').css({
        'cursor': 'pointer'
    });
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

// function tmp_render(){
//     notice('BUG提醒', 'F码抢码未登录情况点击抢VIP，要点两次才能跳转到登录页！ from 玉米');
//
// }

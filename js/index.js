const electron = require('electron');
const ipc = electron.ipcRenderer;
const $ = require('jquery');
const SEND = require('./js/const.js').SEND;
const ACTION = require('./js/const.js').ACTION;

// get local settings
const nconf = require('nconf');
nconf.file({file: './settings.json'});

var path = require('path'),
    menuBinder = require('./js/menuBinder'),
    notice= require('./js/util/notification');
// var infoBinder = require('./js/infoBinder');

$(function(){
    var $loginBtn = $('.login'),
        moveFlag = false,
        $username = $('.username'),
        $password = $('.password');
    $(document).on('keyup', function(e){
        //handle enter key down
        $('.login-success, .login-error').css({display: 'none'});
        if($loginBtn.hasClass('disabled')){
            return;
        }
        if(e.keyCode === 13){
            $loginBtn.addClass('disabled');
            var username = $username.val(),
                password = $password.val();
            ipc.send(ACTION.LOGIN, username, password);
            // ipc.send('test');
        }
    }).on('click', '.login', function(){
        //handle click event on login button
        $('.login-success, .login-error').css({display: 'none'});
        if($loginBtn.hasClass('disabled')){
            return;
        }
        $loginBtn.addClass('disabled');
        var username = $username.val(),
            password = $password.val();
        ipc.send('login', username, password)
    }).on('click', '.close-btn', function(){
        ipc.send('close-app');
    }).on('focus', '.info input', function(){
        $(this).select();
    });

    $username.val(nconf.get('user').username);
    $password.val(nconf.get('user').password);

    ipc.on(SEND.LOGIN_SUCCESS, loginSuccess);
    ipc.on(SEND.LOGIN_FAILED, loginError);
    ipc.on(SEND.LOAD_INFO, uploadInfo);
    ipc.on(SEND.RENDER_MESSAGE, renderMessage);
});

function loginSuccess(){
    // var about = 'file://' + path.join(__dirname, 'child/about/about.html');
    var user = {
        username: $('.username').val(),
        password: $('.password').val()
    };
    nconf.set('user', user);
    nconf.save();

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
        'margin-top': 180
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
    $('.red-point').text(window.g_messageCount > 999 ? '...' : window.g_messageCount).css({display: 'block'});
    $('.J-message').text('留言板（' + window.g_messageCount + '）');
}

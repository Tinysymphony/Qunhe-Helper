const electron = require('electron');
const ipc = electron.ipcRenderer;
const $ = require('jquery');
const SEND = require('./js/const.js').SEND;
const ACTION = require('./js/const.js').ACTION;

var path = require('path'),
    nconf = require('nconf'),
    menuBinder = require('./js/menuBinder'),
    notice = require('./js/util/notification');

const POLLING_TIME = 30000;
// var infoBinder = require('./js/infoBinder');

$(function () {
    var $loginBtn = $('.login'),
        $username = $('.username'),
        $password = $('.password');
    $(document).on('keyup', function (e) {
        //handle enter key down
        $('.login-success, .login-error').css({display: 'none'});
        if ($loginBtn.hasClass('disabled')) {
            return;
        }
        if (e.keyCode === 13) {
            $loginBtn.addClass('disabled');
            var username = $username.val(),
                password = $password.val();
            ipc.send(ACTION.LOGIN, username, password);
            // ipc.send('test');
        }
    }).on('click', '.login', function () {
        //handle click event on login button
        $('.login-success, .login-error').css({display: 'none'});
        if ($loginBtn.hasClass('disabled')) {
            return;
        }
        $loginBtn.addClass('disabled');
        var username = $username.val(),
            password = $password.val();
        ipc.send('login', username, password)
    }).on('click', '.close-btn', function () {
        ipc.send('close-app');
    }).on('focus', '.info input', function () {
        $(this).select();
    });

    // Ready will get user login data.
    ipc.send(ACTION.READY);
    ipc.on(SEND.DATA_PATH, autoInput);
    // Login success will have a side effect: trigger polling on.
    ipc.on(SEND.LOGIN_SUCCESS, loginSuccess);
    ipc.on(SEND.LOGIN_FAILED, loginError);
    ipc.on(SEND.LOAD_INFO, uploadInfo);
    ipc.on(SEND.RENDER_MESSAGE, renderMessage);
    ipc.on(SEND.RENDER_MESSAGE_ERROR, renderMessageError);
    ipc.on(SEND.RENDER_BUG, renderBug);
    ipc.on(SEND.RENDER_BUG_ERROR, renderBugError);
    ipc.on(SEND.UPDATE_MENU_BUG, updateMenuBug);
});

// get local settings and saved user info.
function autoInput(emitter, dataPath) {
    nconf.file({file: dataPath});
    if (nconf.get('user')) {
        $('.username').val(nconf.get('user').username);
        $('.password').val(nconf.get('user').password);
    }
}

function loginSuccess() {
    // save user login data
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
        'box-shadow': 'none'
    });
    $('.close, .return, .info').remove();
    $('.drag').css({display: 'block'});
    setTimeout(move, 400);
}

function loginError() {
    $('.login').removeClass('disabled');
    $('.login-error').css({display: 'block'});
}

function move() {
    $('.tiny').animate({
        'margin-top': 180
    }, 300);
    $('.img img').css({
        'cursor': 'pointer'
    });
    //bind
    setTimeout(menuBinder, 500);
}

function uploadInfo(emitter, data) {
    window.g_info = data;
}

function renderMessage(emitter, data, isShow, isLogin) {
    window.g_messageCount = data.count;
    if (!nconf.get('message')) {
        nconf.set('message', 0);
    }
    if (isShow && (isLogin || data.count > nconf.get('message'))) {
        notice('留言提醒', '有' + window.g_messageCount + '条信息未读，请尽快查阅', '', '../../img/s.png');
    }
    nconf.set('message', data.count);
    nconf.save();
    $('.red-point').text(window.g_messageCount > 999 ? '...' : window.g_messageCount).css({display: 'block'});
    $('.J-message').text('留言板（' + window.g_messageCount + '）');
    setTimeout(function () {
        ipc.send(ACTION.POLLING_MSG);
    }, POLLING_TIME);
}

function renderMessageError() {
    setTimeout(function(){
        ipc.send(ACTION.POLLING_MSG);
    }, POLLING_TIME);
}

function renderBug(emitter, data, isShow, isLogin) {
    updateMenuBug(data, isShow);
    setTimeout(function(){
        ipc.send(ACTION.POLLING_BUG);
    }, POLLING_TIME);
}

function renderBugError() {
    setTimeout(function(){
        ipc.send(ACTION.POLLING_BUG);
    }, POLLING_TIME);
}

function updateMenuBug(num, isShow){
    $('.J-bug').text('我的BUG（' + num + '）');

    if(!nconf.get('bug')){
        nconf.set('bug', 0);
    }

    if(isShow && (num > nconf.get('bug'))){
        notice('Bug提醒', '有' + num + '个Bug等待处理，请及时修理 or 甩锅', '', '../../img/s.png');
    }
    nconf.set('bug', num);
    nconf.save();
}
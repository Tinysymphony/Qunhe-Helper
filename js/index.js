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
    windowSize = {
        width: screen.width,
        height: screen.height
    }

    ipc.send(ACTION.READY, 'main', windowSize);
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
    ipc.on(SEND.GET_USERS, getUsers);
    ipc.on(SEND.RELOAD, reloadApp);
    ipc.on(SEND.CLEAR_MSG, clearMsg);
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

    $.ajax({
        url: 'http://10.10.31.222/api/userid?jira=' + user.username,
        method: 'GET',
        success: function(data){
            nconf.set('id', data);
            nconf.save();
        },
        error: function(){}
    });

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

// abort it
function renderMessage(emitter, data, isShow, isLogin) {
    var count = data.count;
    if (!nconf.get('message')) {
        nconf.set('message', 0);
    }

    var num = count - nconf.get('message');

    if(num <= 0){
        return;
    }

    if (isShow && isLogin) {
        notice('私信提醒', '有' + num + '条信息未读，请尽快查阅', '', '../../img/s.png');
    }
    nconf.set('message', count);

    nconf.save();
    $('.red-point').text(num > 999 ? '...' : num).css({display: 'block'});
    $('.J-message').text('私信（' + num + '）');
}

function renderMenuMsg(data, isShow) {
    if (!nconf.get('message')) {
        nconf.set('message', 0);
    }
    var num = data - nconf.get('message');

    if(num <= 0){
        return;
    }

    if (isShow) {
        notice('私信提醒', '有' + num + '条信息未读，请尽快查阅', '', '../../img/s.png');
    }
    nconf.set('message', data);
    //nconf.save();
    $('.red-point').text(num > 999 ? '...' : num).css({display: 'block'});
    $('.J-message').text('私信（' + num + '）');
}

function renderMessageError() {
    setTimeout(function () {
        ipc.send(ACTION.POLLING_MSG);
    }, POLLING_TIME);
}

function renderBug(emitter, data, isShow, isLogin) {
    updateMenuBug(data, isShow, isLogin);
    setTimeout(function () {
        ipc.send(ACTION.POLLING_BUG);
    }, POLLING_TIME);
}

function renderBugError() {
    setTimeout(function () {
        ipc.send(ACTION.POLLING_BUG);
    }, POLLING_TIME);
}

//guozi
function getUsers(emitter, data) {
    nconf.set('users', data);
    nconf.save();
    console.log(new Date() + ': Get users √');
    var id = nconf.get('id'),
        tag = 'msg polling';

    function poll(){
        $.ajax({
            url: 'http://10.10.31.222/api/readmessage?recipientid=' + id,
            method: 'GET',
            success: function (data) {
                console.log(new Date() + ': ' + tag + ' √');
                var num = JSON.parse(data).length;
                renderMenuMsg(num, true);
                //poll();
            },
            error: function () {
                console.log(new Date() + ': ' + tag + ' X');
                //poll();
            },
            complete: function() {
                setTimeout(function(){
                    poll();
                }, 20000);
            }
        });
    }
    poll();
}

function updateMenuBug(num, isShow, isLogin) {
    if (typeof num != 'number') {
        return;
    }

    if (num === 0) {
        $('.J-bug').text('我的BUG');
    } else {
        $('.J-bug').text('我的BUG（' + num + '）');
    }

    if (!nconf.get('bug')) {
        nconf.set('bug', 0);
    }

    if (isShow && (isLogin || num > nconf.get('bug'))) {
        if(num <= 0){
            return;
        }
        console.log('here');
        notice('Bug提醒', '有' + num + '个Bug等待处理，请及时修理 or 甩锅', '', '../../img/s.png');
    }
    nconf.set('bug', num);
    nconf.save();
}

function reloadApp() {
    window.location.reload();
}

function clearMsg(){
    $('.red-point').text('').css({display: 'none'});
    $('.J-message').text('私信');
}

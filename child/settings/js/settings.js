var $ = require('jquery'),
    nconf = require('nconf');

const ipc = require('electron').ipcRenderer;
const ACTION = require('../../js/const').ACTION;
const SEND = require('../../js/const.js').SEND;

var settings = {};

$(function () {
    $('.J-change-user').click(function () {
        if($(this).hasClass('disabled')){
            return;
        }
        ipc.send(ACTION.RESTART);
    });

    ipc.send(ACTION.READY, 'settings');
    ipc.on(SEND.DATA_PATH, function (emitter, dataPath) {
        console.log('get data path √');
        nconf.file({file: dataPath});
        if(nconf.get('settings')){
            settings = nconf.get('settings');
        } else {
            settings = {
                enableBug: true,
                enableMsg: true,
                enableNotify: true,
                pushTime: 1
            };
            nconf.set('settings', settings);
            nconf.save();
        }

        setTimeout(function(){
            if(settings.enableBug){
                $('#cb1').click();
            }

            if(settings.enableNotify){
                $('#cb2').click();
            }

            if(settings.enableMsg){
                $('#cb3').click();
            }
            $('#op' + settings.pushTime).click();
        }, 1000);

    });

    ipc.on(SEND.CLOSE, function () {
        window.close();
    });

    $('.save-btn').on('click', function(){
        if($(this).hasClass('disabled')){
            return;
        }
        settings = {
            enableBug: $('#cb1').is(':checked'),
            enableNotify: $('#cb2').is(':checked'),
            enableMsg: $('#cb3').is(':checked'),
            pushTime: $('input[name="time"]:checked').val()
        };
        nconf.set('settings', settings);
        nconf.save();
    });

});
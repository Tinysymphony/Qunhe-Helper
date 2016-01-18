var $ = require('jquery');
var featureParser = require('./util/featureParser');
var notice = require('./util/notification');
var httpHandler = require('./util/httpHandler');

const ipc = require('electron').ipcRenderer;

function binder(){
    var $menu = $('.menu');

    $menu
    .on('click', '.J-task', function(){
        startWindow('task', 400, 500);
    })
    .on('click', '.J-bug', function(){
        startWindow('bug', 400, 500);
    })
    .on('click', '.J-message', function(){
        startWindow('message', 400, 500);
    })
    .on('click', '.J-info', function(){
        startWindow('info', 300, 400, JSON.stringify(window.g_info));
        // notice('click', 'adsfadsfa', 'asdf');
    })
    .on('click', '.J-top', function(){
        startWindow('top', 400, 600);
    })
    .on('click', '.J-about', function(){
        startWindow('about', 300, 380);
    });

    $(document).on('click', '.img img', function(){
        var $menu = $('#dummy');
        $menu.toggleClass('dummy--active');
    });

    $(window).on('message', function(e){
        var info= e.originalEvent.data;
        if(info.action.indexOf('close') >= 0){
            window[info.name].close();
            window[info.name] = null;
        }
    });
}

function startWindow(name, width, height, data){
    var url = 'file://' + path.resolve(__dirname, '../child/' + name + '/' + name + '.html');
    var options = {
        width: width,
        height: height
    };
    options.x = screen.width / 2 - options.width / 2;
    options.y = screen.height / 2 - options.height / 2;
    // window['c_' + name] = window.open(url, 'c_' + name, featureParser(options));
    ipc.send('start-new', name, url, options);
    if(data){
        console.log(data);
        console.log(typeof data);
        window['c_' + name].postMessage(data, '*');
        window['c_' + name].data = JSON.parse(data);
    }
    // window.test = 'a';
}

module.exports = binder;

// const
const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
const WINDOW = 'bug';
const ACTION = require('../../js/const').ACTION;
const SEND = require('../../js/const').SEND;

var $ = require('jquery');

var stage = 'bug';

$(function(){
    $('.li-bug').addClass('focus');

    ipc.send(ACTION.DATA_REQUEST, WINDOW);
    ipc.on(SEND.LOAD_BUG, updateBugList);
    //ipc.on(SEND.LOAD_RANK, loadRank);

    $('.main-list').on('click', '.item', function(){
        var url = $(this).data('url');
        shell.openExternal(url);
    });

    $('.header').on('click', '.tab-item', function(){
        var $this = $(this);
        stage = $(this).data('type');
        $this.addClass('focus').siblings().removeClass('focus');
        ipc.send(ACTION.DATA_REQUEST, WINDOW, $this.data('type'));
        if($this.data('type') === 'rank-bug'){
            $.ajax({
                url: 'http://10.10.31.222/api/issue',
                method: 'GET',
                success: function(data){
                    var list = JSON.parse(data);
                    loadRank(list);
                }
            });
        }
    }).on('click', '.J-refresh', function(){
        ipc.send(ACTION.DATA_REQUEST, WINDOW, $('.focus').data('type'));
    });

    ipc.on(SEND.CLOSE, function(){
        window.close();
    });


});

function updateBugList(emitter, data){
    var total = data.total || 0,
        list = data.bugs || [];
    if(stage === 'his-bug'){
        $('.total-bug').html('一共接锅：<span>' + total + '</span> 口，再接再厉~');
        $('.bug-tip').html('只显示前50条bug喔');
    } else if (stage === 'bug'){
        $('.total-bug').html('当前背锅：<span>' + total + '</span> 口 _(:з」∠)_');
        $('.bug-tip').html('只显示前50条bug喔');
    } else {
        $('.total-bug').html('');
    }

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

function loadRank(data){
    $('.total-bug').html('锅——资历的象征');
    $('.bug-tip').html('');
    var html = '';
    for(var i = 0; i < data.length; i++){
        html += '<li class="item"><a><i class="icon-exclamation-sign mr10 ml10"></i>' + '第' + (i + 1) + '名 --->> ' + (data[i].assignee || 'Anonymous') +  ' ----- ' + data[i].bugCount  + '</a></li>';
    }
    $('.main-list').html(html);
}

function staticRank(){
    var string = '<div class="static-list-wp"><ul><li class="rank-item">1. fuchen --- 7</li>' +
        '<li class="rank-item">2. changchuan --- 5</li>' +
        '<li class="rank-item">3. buou --- 3</li>' +
        '<li class="rank-item">4. xiabing --- 3</li>' +
        '<li class="rank-item">5. alen --- 2</li></ul></div>';
    $('.bug-content').html(string);
}

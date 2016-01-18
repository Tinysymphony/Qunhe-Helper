var btn = document.getElementsByClassName('close-btn')[0];
btn.onclick = function(){
    var message = {
        name: 'c_about',
        action: 'close'
    };
    window.opener.postMessage(message, '*');
}

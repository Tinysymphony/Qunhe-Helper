var path = require('path');
var notifier = require('node-notifier');

var Notice = function (title, body, link, img) {
    if (process.platform === 'win32') {
        console.log('Platform: win32');
        notifier.notify({
            title: title,
            message: body,
            icon: img || 'file',
            sound: false
        });
        //notifier.on('click', function () {
        //    window.open(link);
        //});
    } else {
        console.log('Platform is not win32');
        var notification = new Notification(title, {
            icon: img || 'file',
            body: body || 'notification contents'
        });
        if (link) {
            notification.onclick = function () {
                window.open(link);
            };
        }
    }
    // var sound = new Audio(audio);
    // sound.volume = volume;
    // sound.play();

    //return notification;
};

module.exports = Notice;

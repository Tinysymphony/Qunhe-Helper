var path = require('path');

var Notice = function(title, body, link, img){
  var notification = new Notification(title, {
    icon: img || 'file',
    body: body || 'notification contents',
  });
  if(link){
      notification.onclick = function () {
        window.open(link);
      };
  }
  return notification;
}

module.exports = Notice;

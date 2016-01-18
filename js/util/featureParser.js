var Parser = function(options){
    var str = ''
    for(var val in options){
        if(options.hasOwnProperty(val) && typeof options[val] != 'function'){
            str += val + '=' + options[val] + ', ';
        }
    }
    return str.substring(0, str.length - 2);
}

module.exports = Parser

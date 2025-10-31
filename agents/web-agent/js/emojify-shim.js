// Minimal emojify shim: provides emojify.replace() used by the page
window.emojify = (function(){
    // naive replacement for common text emoticons to emoji; for full features, include a proper lib
    var map = {
        ':)': '😊',
        ':(': '☹️',
        ':D': '😄',
        ':P': '😛'
    };

    function replace(text){
        if(!text || typeof text !== 'string') return text;
        Object.keys(map).forEach(function(k){
            text = text.split(k).join(map[k]);
        });
        return text;
    }

    return { replace: replace };
})();


define('timer', function(require, exports){

    var dom = document.getElementById('timer');
    var timer, start, pass = 0, time = '00:00';

    exports.start = function(){
        start = Date.now() - pass;
        timer = setInterval((function(){
            time = Math.floor((Date.now() - start) / 1000);
            var seconds = time % 60;
            var minutes = (time - seconds) / 60;
            time = ('0' + minutes).substr(-2) + ':' + ('0' + seconds).substr(-2);
            dom.innerHTML = time;
            return arguments.callee;
        })(), 1000);
    };

    exports.get = function(){
        return time;
    };

    exports.pause = function(){
        pass += Date.now() - start;
        clearInterval(timer);
    };

    exports.reset = function(){
        pass = 0;
        time = '00:00';
        dom.innerHTML = time;
    };
});
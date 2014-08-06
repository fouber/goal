define('score', function(require, exports){

    var score = 0;
    var MAX_SCORE = 20;
    var playing = true;

    var dom = document.getElementById('slided');
    dom.innerHTML = score;

    exports.notenough = true;

    exports.reset = function(){
        playing = true;
        var last = score;
        this.notenough = true;
        dom.innerHTML = score = 0;
        return last;
    };

    exports.get = function(){
        return score;
    };

    exports.getMax = function(){
        return MAX_SCORE;
    };

    exports.add = function(num){
        if(playing && this.notenough){
            num = num || 1;
            score += num;
            dom.innerHTML = score;
            if(score >= MAX_SCORE){
                this.notenough = false;
            }
        }
        return score;
    };

    exports.die = function(){
        playing = false;
    };

});
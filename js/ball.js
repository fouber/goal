define('ball', function(require, exports){

    var speed = 2 - DEFAULT_FRAMERATE / 100 * 2.5;

    exports.create = function(image){
        var sheeet = new createjs.SpriteSheet({
            images: [ image ],
            frames: {
                width: 26, height: 25,
                regX : 13, regY:   22,
                count: 3
            },
            animations: {
                run: {
                    frames: [ 0, 1, 2 ],
                    speed : speed
                },
                back: {
                    frames: [ 2, 1, 0 ],
                    speed : speed
                }
            }
        });
        var ball = new createjs.Sprite(sheeet);
        ball.die = function(x, y){
            createjs.Tween.removeTweens(this);
            if(x && y){
                var self = this;
                if(x > self.x){
                    self.gotoAndPlay('run');
                } else {
                    self.gotoAndPlay('back');
                }
                createjs
                    .Tween
                    .get(this)
                    .to({x: x, y: y}, 500, createjs.Ease.circOut)
                    .call(function(){self.stop()});
            } else {
                this.stop();
            }
        };
        return ball;
    };
});
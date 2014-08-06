define('player', function(require, exports){

    var playerFrames = [ 'stand_rc', 'stand_rt', 'stand_ct', 'stand_lt', 'stand_lc', 'stand_lb', 'stand_cb', 'stand_rb' ];
    var PI2 = Math.PI * 2;
    var PI8 = Math.PI / 8;
    var PI4 = Math.PI / 4;
    var score = require('score');
    var speed = 0.8 - DEFAULT_FRAMERATE / 100;

    exports.create = function(image){
        var sheet = new createjs.SpriteSheet({
            images: [ image ],
            frames: {
                width: 100, height: 100,
                regX : 50,  regY  : 95,
                count: 12
            },
            animations: {
                stand_lt: 0,
                stand_lc: 4,
                stand_lb: 8,
                stand_rt: 2,
                stand_rc: 6,
                stand_rb: 10,
                stand_ct: 1,
                stand_cb: 9,
                slide: {
                    frames: [ 3, 5, 11, 7 ],
                    speed : speed,
                    next  : false
                }
            }
        });
        var player = new createjs.Sprite(sheet, 'stand_lc');
        player.sliding = false;
        player.hitTest = function(role){
            var x0 = role.x, y0 = role.y;
            var x1 = this.x, y1 = this.y;
            return x0 > x1 - 55 && x0 < x1 + 30 && y0 < y1 + 10 && y0 > y1 - 10;
        };
        player.slideTest = function(role){
            var x0 = role.x, y0 = role.y;
            var x1 = this.x, y1 = this.y;
            return x0 > x1 - 200 && x0 < x1 - 65  && y0 < y1 + 15  && y0 > y1 - 15;
        };
        player.slide = function(x, y){
            var self = this;
            if(self.sliding) return;
            self.sliding = true;
            self.gotoAndPlay('slide');
            createjs
                .Tween
                .removeTweens(self);
            createjs
                .Tween
                .get(self)
                .to({x: x, y: y}, 500, createjs.Ease.quadOut)
                .call(function(){
                    self.sliding = false;
                    score.add();
                });
        };
        player.stareAt = function(role){
            var angle = Math.atan2(this.y - role.y, role.x - this.x) + PI8;
            if(angle < 0){
                angle += PI2;
            }
            var n = Math.floor(angle / PI4);
            this.gotoAndStop(playerFrames[n]);
            return this;
        };
        player.passed = false;
        return player;
    };
});
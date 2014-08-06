define('squirrel', function(require, exports){

    var speed = 0.8 - DEFAULT_FRAMERATE / 100;

    //创建一个对象
    exports.create = function(image){
        var sheet = new createjs.SpriteSheet({
            images: [ image ],
            frames: {
                width: 100, height: 100,
                regX : 60,  regY  : 92,
                count: 48
            },
            animations: {
                run_rt: {
                    frames: [ 0, 8, 16, 24, 32, 40 ],
                    speed: speed
                },
                run_rc: {
                    frames: [ 9, 17, 25, 33, 41, 1 ],
                    speed: speed
                },
                run_rb: {
                    frames: [ 2, 10, 18, 26, 34, 42 ],
                    speed: speed
                },
                shoot_rt: {
                    frames: [ 3, 11, 19, 27, 37 ],
                    speed: speed,
                    next: false
                },
                shoot_rc: {
                    frames: [ 4, 12, 20, 28, 36 ],
                    speed: speed,
                    next: false
                },
                shoot_rb: {
                    frames: [ 5, 13, 21, 29, 43 ],
                    speed: speed,
                    next: false
                },
                kneel: {
                    frames: [ 38, 46, 38, 46, 38, 46, 38, 46, 31, 47 ],
                    speed: speed * 1.2,
                    next: 'cry'
                },
                cry: {
                    frames: [ 39, 45 ],
                    speed: speed * 2
                },
                win: {
                    frames: [ 6, 14, 22, 30, 7, 15, 23, 7, 15, 23 ],
                    speed: speed / 2
                },
                stand_rt: 37,
                stand_rc: 36,
                stand_rb: 43,
                stand_ct: 35,
                stand_cb: 44
            }
        });
        var squirrel = new createjs.Sprite(sheet, 'stand_rc');
        squirrel.jump = function(stageHeight){
            var self = this;
            createjs
                .Tween
                .removeTweens(self);
            createjs
                .Tween
                .get(this)
                .call(function(){if(self.currentAnimation !== 'run_rt') self.gotoAndPlay('run_rt')})
                .to({y:this.y - 80}, 400, createjs.Ease.quadOut)
                .call(function(){self.gotoAndPlay('run_rc')})
                .to({y:this.y - 80}, 400, createjs.Ease.linear)
                .call(function(){self.gotoAndPlay('run_rb')})
                .to({y:stageHeight + 30}, (stageHeight - self.y + 80) * 2.5, createjs.Ease.quadIn);
        };
        squirrel.die = function(){
            createjs.Tween.removeTweens(this);
            this.gotoAndPlay('kneel');
        };
        squirrel.shoot = function(x, y){
            var angle = Math.atan2(this.y - y, x - this.x);
            var gap = Math.PI / 32;
            var name = 'shoot_rc';
            if(angle > gap){
                name = 'shoot_rt';
            } else if(angle < -gap){
                name = 'shoot_rb';
            }
            this.gotoAndStop(name);
        };
        return squirrel;
    };

});
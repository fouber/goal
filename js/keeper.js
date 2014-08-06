define('keeper', function(require, exports){

    var speed = 0.8 - DEFAULT_FRAMERATE / 100;

    exports.create = function(image){
        var sheet = new createjs.SpriteSheet({
            images: [ image ],
            frames: {
                width: 100, height: 100,
                regX : 70,  regY  : 95,
                count: 9
            },
            animations: {
                stand_lt: 0,
                stand_lc: 3,
                stand_lb: 6,
                walk: {
                    frames: [ 1, 4, 7 ],
                    speed: speed
                },
                save: {
                    frames: [ 2, 5, 8 ],
                    speed: speed / 1.5,
                    next: false
                }
            }
        });
        return new createjs.Sprite(sheet, 'stand_lc');
    };

});
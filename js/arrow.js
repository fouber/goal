define('arrow', function(require, exports){

    var speed = 0.8 - DEFAULT_FRAMERATE / 100;

    exports.create = function(image){
        var sheet = new createjs.SpriteSheet({
            images: [ image ],
            frames: {
                width: 28, height: 32,
                regX : 0,  regY  : 13,
                count: 1
            },
            animations: {
                normal: 0
            }
        });
        var arrow = new createjs.Sprite(sheet, 'normal');
        arrow.width = image.width;
        return arrow;
    };
});
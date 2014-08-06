define('gate', function(require, exports){

    exports.create = function(image){
        var gate = new createjs.Shape();
        gate.graphics.beginBitmapFill(image, 'no-repeat').drawRect(1, 0, image.width, image.height);
        gate.width = image.width;
        return gate;
    };

    exports.createGateLeft = function(image){
        var shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(image, 'no-repeat').drawRect(1, 0, image.width, image.height);
        shape.regX = 7;
        shape.regY = 102;
        return shape;
    };

    exports.createGateRight = function(image){
        var shape = new createjs.Shape();
        shape.graphics.beginBitmapFill(image, 'no-repeat').drawRect(1, 0, image.width, image.height);
        shape.regX = 51;
        shape.regY = 255;
        return shape;
    };
});
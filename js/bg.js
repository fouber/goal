define('bg', function(require, exports){
    exports.create = function(image, width, height){
        var bg = new createjs.Shape();
        var imgW = image.width;
        var w = (Math.ceil(width / imgW) + 1) * imgW;
        bg.graphics.beginBitmapFill(image, 'repeat-x').drawRect(0, 0, w, height);
        bg.imageWidth = imgW;
        return bg;
    };
});
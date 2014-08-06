define('ui', function(require, exports){

    var $ = exports.$ = function(id){
        return document.getElementById(id);
    };

    var log = require('log');
    var timer = require('timer');
    var score = require('score');

    function nop(){}

    // var GAME_URL = 'http://t.cn/Rvf1xG1';
    var GAME_URL = 'http://go.uc.cn/page/goal/game?uc_param_str=dnfrpfbivecpbtnt';
    var DOWNLOAD_URL = 'http://www.uc.cn/ucbrowser/download/';
    var SHARE_IMAGE = 'http://image.uc.cn/s/uae/g/02/img/share.png';
    var DOWNLOAD_HTML = log.isUC ? '' : ('下载<a id="download" href="' + DOWNLOAD_URL + '" target="_blank">UC浏览器获得更流畅体验</a>>>');

    var isSupportTouch = exports.isSupportTouch = !!('ontouchend' in document);
    var EVENT_TYPE = exports.EVENT_TYPE =  isSupportTouch ? 'touchstart' : 'mousedown';
    
    function weixinShare(title, content){
        WeixinApi.ready(function(Api){
            var wxData = {
                "imgUrl": __uri('../img/apple-touch-icon-144.png'),
                "link": GAME_URL,
                "desc": content,
                "title": title
            };
            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            Api.shareToFriend(wxData);
            // 点击分享到朋友圈，会执行下面这个代码
            Api.shareToTimeline(wxData);
            // 点击分享到腾讯微博，会执行下面这个代码
            Api.shareToWeibo(wxData);
        });
    }
    weixinShare('UC世界杯在线足球游戏', '我正在参加UC世界杯足球挑战大赛，精彩游戏，精彩世界杯，大家都一起来玩吧！');

    exports.onLoaded = function(e){
        $('loaded').style.width = parseInt((e.loaded || 0) * 100) + '%';
    };

    exports.removeLoading = function(){
        var loading = $('loading');
        loading.parentNode.removeChild(loading);
        log.time('init');
    };

    function getGuideMessage(){
        return [
            '你将身负国家荣誉开始征战世界杯<br/>',
            '带球接近对方球员会触发铲球袭击，完成<em>' + score.getMax() + '</em>次铲球躲避后进入射门状态。大力射起吧，少年！'
        ].join('');
    }

    var mask = $('mask');
    
    exports.showGuide = function(callback){
        $('story').innerHTML = getGuideMessage();
        $('start').innerHTML = '开始';
        $('guide').style.display = 'block';
        setTimeout(function(){
            var body = document.body;
            body.className = 'show-mask show-guide';
            $('start').addEventListener(EVENT_TYPE, function(){
                body.className = 'show-mask';
                setTimeout(function(){
                    body.className = '';
                    $('mask').innerHTML = '';
                    if(callback){
                        callback();
                    }
                }, 200);
                log.click('start');
            }, false);
        }, 0);
    };

    exports.showPanel = function(options){
        options = options || {};
        var message = options.isFail ? exports.getFailMessage() : exports.getWinMessage();
        mask.innerHTML = [
            '<div class="panel' + (options.isFail ? ' fail' : '') + '">',
                '<div class="info">',
                    '<span>' + message + '</span>',
                '</div>',
                '<div class="slogan"></div>',
                '<div class="btn-bar">',
                    '<span id="share" class="btn btn-share">' + (options.shareLabel || '分享战绩') + '</span>',
                    '<span id="restart" class="btn">' + (options.restartLabel || '再玩一次') + '</span>',
                '</div>',
            '</div>'
        ].join('');
        var s = score.get();
        var rate = getRate(s);
        var success = options.isFail ? '' : '并最终攻入球门，';
        var content = '我在UC世界杯足球挑战大赛用' + timer.get() + '的时间' +
            '躲过了' + s + '次铲球袭击，' + success +
            '战胜了' + rate + '%的挑战者！大家快来足球大赛挑战我吧！';
        weixinShare('UC世界杯在线足球游戏', content);
        $('share').addEventListener(EVENT_TYPE, function(){
            exports.share(options.isFail);
        }, false);
        $('restart').addEventListener(EVENT_TYPE, function(){
            exports.hidePanel(options.onRestart || nop);
            log.click('restart');
        }, false);
        document.body.className = 'show-mask';
        setTimeout(function(){
            document.body.className = 'show-mask show-panel';
        }, 100);
        if(!log.isUC){
            $('download').addEventListener(EVENT_TYPE, function(){
                log.click('download');
            }, false);
        }
    };
    exports.hidePanel = function(callback){
        document.body.className = 'show-mask';
        setTimeout(function(){
            mask.innerHTML = '';
            document.body.className = '';
            callback();
        }, 300);
    };
    exports.getWinMessage = function(){
        return [
            '你凌空一脚，仅用<em>' + timer.get() + '</em>的时间就攻破了巴西的球门！',
            '这一刻你是国家的英雄！<br/>',
            DOWNLOAD_HTML
        ].join('');
    };
    function getRate(score){
        return score < 2 ? score : (score - 1) * 5;
    }
    exports.getFailMessage = function(){
        var s = score.get();
        var rate = getRate(s);
        return [
            '少年，你用了<em>' + timer.get() + '</em>的时间',
            '躲过了<em>' + s + '</em>次铲球袭击，',
            '战胜了<em>' + rate + '%</em>的挑战者！',
            '球门就在前面，继续努力挑战吧！<br/>',
            DOWNLOAD_HTML
        ].join('');
    };
    exports.share = function(isFail){
        var s = score.get();
        var rate = isFail ? getRate(s) : 99;
        var title = 'UC世界杯在线足球游戏';
        var success = isFail ? '' : '并最终攻入球门，';
        var content = '我在UC世界杯足球挑战大赛用' + timer.get() + '的时间' +
            '躲过了' + s + '次铲球袭击，' + success +
            '战胜了' + rate + '%的挑战者！大家快来足球大赛挑战我吧！';
        log.click('share');
        if(window.ucweb && typeof window.ucweb.startRequest === 'function'){
            var ret = ucweb.startRequest("shell.page_share", [title, content, GAME_URL, '']);
        } else {
            content = '#' + title + '# ' + content + ' ' + GAME_URL + ' @UC浏览器 ' + DOWNLOAD_URL;
            var url = [
                'http://rec.uc.cn/actplat/sharetheme/service/index?activityId=46&ruleId=48&uc_param_str=nidnssbifrpfuacpve',
                'backUrl=' + encodeURIComponent(GAME_URL),
                'content=' + encodeURIComponent(content),
                'imgUrl=' + encodeURIComponent(SHARE_IMAGE)
            ].join('&');
            setTimeout(function(){
                window.location.href = url;
            }, 500);
        }
    };
});
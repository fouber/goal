define('log', function(require, exports){

    function unique(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    var UUID;
    function getUUID(){
        if(!UUID){
            var key = '_f_uuid_', useCookie = false;
            if(window.localStorage && typeof window.localStorage.getItem === 'function'){
                UUID = localStorage.getItem(key);
            } else {
                var cookies = document.cookie.split(/\s*;\s*/);
                useCookie = true;
                for(var i = 0, len = cookies.length; i < len; i++){
                    var items = cookies[i].split('=');
                    if(items[0] === key){
                        UUID = items[1];
                    }
                }
            }
            if(!UUID){
                UUID = unique();
                if(useCookie){
                    document.cookie = key + '=' + UUID + ';expires=' + (new Date(Date.now() + 3.6e6*24*265));
                } else {
                    localStorage.setItem(key, UUID);
                }
            }
        }
        return UUID;
    }

    var ua = navigator.userAgent;
    var isUC = exports.isUC = /\bUC/.test(ua) || ('ucweb' in window);
    var isTV = exports.isTV = /TV/.test(ua) || /\b(androidtv|tv)\b/i.test(location.search);
    //var isIOS = exports.isIOS = /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(ua);

    var APP_ID = '486';
    var APP_KEY = 'football';
    var PAGE = 'index';
    var LOG_TYPE_PV = 'log';
    var LOG_TYPE_EVENT = 'event';
    var LOG_TYPE_CLICK = 'link';
    //var FULL_URL = '';
    var TRACE_URL = 'http://log.google.com/';

    function log(params){
        var url = [
            'uc_param_str=dnfrcpve',
            'appid=' + APP_ID,
            'appkey=' + APP_KEY,
            'pg=' + PAGE
        ];
        if(!isUC){
            url.push('dn=' + getUUID());
        }
        for(var key in params){
            if(params.hasOwnProperty(key)){
                url.push(key + '=' + encodeURIComponent(params[key]));
            }
        }
        (new Image()).src = TRACE_URL + '?' + url.join('&');
    }

    exports.pv = function(){
        log({
            lt: LOG_TYPE_PV,
            pv_rf: document.referrer
        });
    };

    exports.click = function(link){
        log({
            lt: LOG_TYPE_CLICK,
            link: link
        });
    };

    exports.time = function(action){
        log({
            lt: LOG_TYPE_EVENT,
            e_c: 'page_time',
            e_a: action,
            e_v: (new Date).getTime() - __START_TIME__
        });
    };

    var count = 0, start;
    exports.game = {};
    exports.game.start = function(){
        count++;
        start = (new Date).getTime();
        log({
            lt: LOG_TYPE_EVENT,
            e_c: 'game',
            e_a: 'start',
            e_v: count++
        });
    };
    exports.game.end = function(score, time, isWin){
        log({
            lt: LOG_TYPE_EVENT,
            e_c: 'game',
            e_a: 'end',
            e_v: isWin ? 0 : 1,
            my_t: time,
            my_s: score,
            my_c: count
        });
    };

});
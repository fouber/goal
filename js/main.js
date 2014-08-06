define(function(require){

    var log = require('log');
    log.pv();
    log.time('onload');
    window.onunload = function(){log.time('leave')};

    //获取像素值
    function px(val){ return val + 'px'; }

    //加载模块
    var score = require('score');
    var timer = require('timer');
    var ui = require('ui');
    
    function getOrientation(){
        return log.isTV ? '|' : (window.orientation == -90 || window.orientation == 90 ? '-' : '|');
    }
    
    window.addEventListener('orientationchange', (function(){
        if(getOrientation() === '|'){
            ui.$('mask2').style.display = 'none';
        } else {
            ui.$('mask2').style.display = 'block';
        }
        return arguments.callee;
    })(), false);

    //初始化画布，定高缩放
    var orientation = getOrientation();
    var body = document.body;
    var width  = orientation === '-' ? body.clientHeight : body.clientWidth;
    var height = orientation === '-' ? body.clientWidth : body.clientHeight;
    var stageHeight = 640;
    var stageWidth  = Math.floor(stageHeight * width / height);
    //高度中心，减去上下边界线距离
    var stageHeightCenter = (stageHeight - 110) / 2 + 80;
    var canvas = ui.$('goal');
    canvas.setAttribute('width', stageWidth);
    canvas.setAttribute('height', stageHeight);
    // canvas.style.width  = px(width);
    // canvas.style.height = px(height);
    canvas.addEventListener('touchmove', function(e){
        //增强用户体验
        e.stopPropagation();
        e.preventDefault();
    }, false);
    //ios全屏
    window.scrollTo(0, 1);

    //初始化状态变量
    var isGameOver = false, //是否结束
        isWin = false,      //是否胜利
        started = false,    //是否已开始
        status = 0;         //状态，0: 带球躲铲，1: 进入禁区，2: 准备射门，3: 射门完成

    //帧率设置
    var framerate = 60;
    if( window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ){
        //支持requestAnimationFrame的浏览器
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    } else {
        //不支持requestAnimationFrame的浏览器
        framerate = 30;
        createjs.Ticker.setFPS(framerate);
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    }
    //把帧率挂到全局，其他模块需要用到
    window.DEFAULT_FRAMERATE = framerate;

    //游戏角色对象
    var role = {};
    //移动距离，小于0就会安放一个铲球仔
    var distance = 0;
    //铲球仔间距
    var PLAYER_GAP = Math.min(stageWidth / 3, 170);
    //回收铲球仔队列，重复利用元素，减少性能开销
    var unusedPlayer = [];
    //铲球仔自增序号
    var playerIndex = 0;

    //必须写在这，依赖 `DEFAULT_FRAMERATE' 这个全局变量
    var Player = require('player');

    //创建舞台
    var stage = new createjs.Stage(canvas);
    //预加载
    var loader = new createjs.LoadQueue(false);
    loader.addEventListener('complete', init);
    loader.addEventListener('progress', ui.onLoaded);
    //预加载资源
    loader.loadManifest([
        {src:__uri('../img/squirrel.png'), id: 'squirrel'},
        {src:__uri('../img/bg.png'), id: 'bg'},
        {src:__uri('../img/ball.png'), id: 'ball'},
        {src:__uri('../img/gate.png'), id: 'gate'},
        {src:__uri('../img/gate_l.png'), id: 'gate_l'},
        {src:__uri('../img/gate_r.png'), id: 'gate_r'},
        {src:__uri('../img/keeper.png'), id: 'keeper'},
        {src:__uri('../img/arrow.png'), id: 'arrow'},
        {src:__uri('../img/player_1.png'), id: 'player_1'},
        {src:__uri('../img/player_2.png'), id: 'player_2'},
        {src:__uri('../img/guide.png')}
    ]);

    /**
     * 添加一个铲球仔，可以从unusedPlayers队列中获取元素
     */
    function addPlayer(){
        if(score.notenough){
            var player = unusedPlayer.shift();
            if(!player){
                player = createPlayer(false);
            }
            player.x = stageWidth + 50 * Math.random();
            player.y = (stageHeight - 270) * Math.random() + 160;
            role.players.push(player);
        }
    }

    /**
     * 创建铲球仔对象，默认添加到unusedPlayers队列中
     * @param {Boolean} unused 是否添加的unusedPlayers队列中，默认为true
     * @returns {*}
     */
    function createPlayer(unused){
        var index = (playerIndex++) % 2 +1;
        var player = Player.create(loader.getResult('player_' + index));
        player.x = -1000;
        stage.addChild(player);
        if(unused !== false){
            unusedPlayer.push(player);
        }
        return player;
    }

    /**
     * 游戏初始化
     */
    function init() {
        //干掉loading界面
        ui.removeLoading();
        //重置舞台
        reset();
        //监听tick事件
        createjs.Ticker.addEventListener('tick', tick);
        //展示新手引导界面
        ui.showGuide(function(){
            //关闭新手引导界面之后，监听canvas的交互事件
            canvas.addEventListener(ui.EVENT_TYPE, function(e){
                e.preventDefault();
                e.stopPropagation();
                touch();
            }, false);
        });
    }

    /**
     * canvas的点击事件处理函数
     */
    function touch(){
        if(status === 0){
            jump();
        } else if(status === 2){
            shoot();
        }
    }

    /**
     * 重置舞台
     */
    function reset(){
        //各种变量重置
        role = {};
        role.players = [];
        unusedPlayer = [];
        distance = 0;
        playerIndex = 0;
        isGameOver = false;
        isWin = false;
        started = false;
        status = 0;

        //各种对象重置
        score.reset();
        timer.reset();
        createjs.Tween.removeAllTweens();
        stage.removeAllChildren();

        //添加背景元素
        var bg = role.bg = require('bg').create(loader.getResult('bg'), stageWidth, stageHeight);
        stage.addChild(bg);

        //添加松鼠人物
        var squirrel = role.squirrel = require('squirrel').create(loader.getResult('squirrel'));
        squirrel.x = Math.max(stageWidth / 2 - 60, 60);
        squirrel.y = stageHeightCenter;
        stage.addChild(squirrel);

        //添加足球元素
        var ball = role.ball = require('ball').create(loader.getResult('ball'));
        ball.x = squirrel.x + 38;
        ball.y = squirrel.y;
        stage.addChild(ball);

        //直接创建n个铲球仔，以减少运行时创建的性能开销，用内存换性能
        for(var i = 0, len = stageWidth / PLAYER_GAP + 1; i < len; i++){
            createPlayer();
        }
    }

    /**
     * 向上带球处理
     */
    function jump(){
        //如果游戏结束了就不用动了
        if(!isGameOver && status === 0){
            //调松鼠的jump行为
            role.squirrel.jump(stageHeight);
            if(!started){
                //最开始要触发足球滚动
                role.ball.gotoAndPlay('run');
                started = true;
                timer.start();
                log.game.start();
            }
        }
    }

    /**
     * 射门处理
     */
    function shoot(){

        //设置状态
        status = 3;
        //移除所有运动
        createjs.Tween.removeAllTweens();

        //守门员位置
        var keeper = role.keeper;
        var keeperX = keeper.x;
        var keeperY = keeper.y;

        //足球位置
        var arrow = role.arrow;
        var ball = role.ball;
        var ballX = arrow.x;
        var ballY = arrow.y;
        var ballDuring = 300;   //移动时间

        var isSaved = ballY < keeperY + 33 && ballY > keeperY - 33;     //是否被扑救
        var isOut = ballY < role.gateLeft.y || ballY > role.gateRight.y;    //是否射出界
        var isFail = isSaved || isOut;  //被扑救和出界都是失败

        //守门员位移
        var keeperOffsetX = 100;
        if(isOut){
            //出界情况下守门员位移
            keeperOffsetX = 50;
        } else {
            //未出界守门员要做出扑救动作
            keeper.gotoAndPlay('save');
        }

        if(isSaved){
            //被扑救球的移动方向和时间
            ballX = keeper.x - 70;
            ballY = keeper.y;
            ballDuring = 100;
        } else {
            //没被扑到球的位置
            ballX = ballX + arrow.width + 50;
        }

        //守门员运动轨迹
        createjs
            .Tween
            .get(keeper)
            .to({x: keeperX - keeperOffsetX}, 500, createjs.Ease.quadOut);

        //足球开始播放滚动动画
        ball.gotoAndPlay('run');

        //足球运动轨迹
        createjs
            .Tween
            .get(ball)
            .to({x: ballX, y: ballY}, ballDuring, createjs.Ease.linear) //朝向之前计算的点运动
            .call(function(){ //求达到目标点后
                if( isFail ){
                    if(isSaved){    //如果被扑救
                        //足球播放回滚动画
                        ball.gotoAndPlay('back');
                        //足球运动轨迹
                        createjs
                            .Tween
                            .get(ball)
                            .to({x: ballX - 200, y: ballY - 100 + 200 * Math.random()}, 300, createjs.Ease.quadOut) //反方向运动
                            .call(function(){
                                //游戏失败
                                fail();
                            });
                    } else {
                        //出界情况，守门员站立就好了
                        keeper.gotoAndStop('stand_lb');
                        //游戏失败
                        fail();
                    }
                } else {
                    //游戏胜利
                    win();
                }
            });
        //移除箭头标记
        stage.removeChild(arrow);

        //执行松鼠对象的shoot方法
        role.squirrel.shoot(ballX, ballY);
    }

    /**
     * 游戏胜利
     */
    function win(){
        status = 3;
        role.squirrel.gotoAndPlay('win');
        role.ball.stop();
        timer.pause();
        setTimeout(function(){
            isWin = true;
            ui.showPanel({
                onRestart: reset
            });
        }, 1000);
        log.game.end(score.get(), timer.get(), true);
    }

    /**
     * 游戏失败
     * @param {Number|undefined} ballX 足球滚动方向x坐标
     * @param {Number|undefined} ballY 足球滚动方向y坐标
     */
    function fail(ballX, ballY){
        //修改状态
        status = 3;
        //停止计分
        score.die();
        //停止计时
        timer.pause();
        //松鼠死掉
        role.squirrel.die();
        //足球滚粗
        role.ball.die(ballX, ballY);
        //延时1秒，能欣赏到松鼠跪舔的动画
        setTimeout(function(){
            //标记isGameOver状态
            isGameOver = true;
            //展示失败界面
            ui.showPanel({
                isFail : true,
                onRestart: reset
            });
        }, 1000);
        log.game.end(score.get(), timer.get(), false);
    }

    /**
     * 进入禁区
     */
    function initGoal(){
        //停止计时
        timer.pause();
        //修改游戏状态
        status = 1;
        //移除所有动画
        createjs.Tween.removeAllTweens();
        //引入球门模块
        var Gate = require('gate');

        //创建禁区元素
        var gate = role.gate = Gate.create(loader.getResult('gate'));
        gate.x = stageWidth;
        stage.addChildAt(gate, 1);

        //创建球门左侧元素
        var gateLeft = role.gateLeft = Gate.createGateLeft(loader.getResult('gate_l'));
        gateLeft.x = stageWidth + gate.width - 75;
        gateLeft.y = stageHeightCenter - 84;
        stage.addChild(gateLeft);

        //创建球门右侧元素
        var gateRight = role.gateRight = Gate.createGateRight(loader.getResult('gate_r'));
        gateRight.x = gateLeft.x + 44;
        gateRight.y = gateLeft.y + 152;
        stage.addChild(gateRight);

        //创建守门员
        var keeper = role.keeper = require('keeper').create(loader.getResult('keeper'));
        keeper.x = stageWidth + gate.width - 120;
        keeper.y = stageHeightCenter;
        stage.addChild(keeper);

        //松鼠相关
        var squirrel = role.squirrel;
        //正向跑动
        squirrel.gotoAndPlay('run_rc');
        //计算停下来的位置
        var squirrelX = Math.max(stageWidth - gate.width + 150, 50);
        //自动跑到禁区前
        createjs
            .Tween
            .get(squirrel)
            .to({x: squirrelX, y: stageHeightCenter}, 1000, createjs.Ease.quadIn);
    }

    /**
     * 初始化射门
     */
    function initShoot(){
        //松鼠相关
        var squirrel = role.squirrel;
        //正向站立
        squirrel.gotoAndStop('stand_rc');
        //移除松鼠的所有动画
        createjs.Tween.removeTweens(squirrel);
        //停止足球动画
        role.ball.gotoAndStop(0);
        //守门员
        var keeper = role.keeper;
        //播放踏步动画
        keeper.gotoAndPlay('walk');

        //守门员上下移动
        var width = 84;
        var height = 22;
        var x0 = keeper.x;
        var y0 = keeper.y;
        var a =  width / height;
        var b = y0 - x0 * a;
        (function(){
            if(status !== 2) return;
            var x = x0 + (height - 8) * ( 1 - 2 * Math.random());
            var y = a * x + b;
            createjs
                .Tween
                .get(keeper)
                .to({x: x, y: y}, 500, createjs.Ease.linear)
                .call(arguments.callee);
        })();

        //添加箭头，并上下移动
        var arrow = role.arrow = require('arrow').create(loader.getResult('arrow'));
        var x00 = arrow.x = x0 + 30;
        arrow.y = y0;
        var bb = y0 - x00 * a;
        stage.addChild(arrow);
        (function(){
            if(status !== 2) return;
            var x = x00 + (height + 20) * ( 1 - 2 * Math.random());
            var y = a * x + bb;
            createjs
                .Tween
                .get(arrow)
                .to({x: x, y: y}, 500, createjs.Ease.linear)
                .call(arguments.callee);
        })();
        //重新开始计时
        timer.start();
    }

    /**
     * 带球阶段时间片
     * @param event
     */
    function tick1(event){
        if(started && !isGameOver) {
            //移动单位
            var delta = event.delta * 0.15;
            //各种元素，提高访问速度
            var squirrel = role.squirrel;
            var ball = role.ball;
            var bg = role.bg;

            //判断松鼠运动方向，修正足球的位置
            switch (squirrel.currentAnimation){
                case 'run_rt':
                    ball.x = squirrel.x + 15;
                    ball.y = squirrel.y - 6;
                    break;
                case 'run_rc':
                    ball.x = squirrel.x + 38;
                    ball.y = squirrel.y;
                    break;
                case 'run_rb':
                    ball.x = squirrel.x + 20;
                    ball.y = squirrel.y + 8;
                    break;
                default :
                    ball.x = squirrel.x + 38;
                    ball.y = squirrel.y;
                    break;
            }

            //判断是否带球出界
            if(squirrel.y < 80 || squirrel.y > stageHeight - 30){
                var ballX = squirrel.x + 25 + 50 * Math.random();
                var offsetY = squirrel.currentAnimation === 'run_rt' ? -10 : 15;
                var ballY = squirrel.y + offsetY - 5 * Math.random();
                fail(ballX, ballY);
                return;
            }

            //背景移动
            bg.x -= delta;
            if(bg.x < -bg.imageWidth){
                bg.x = 0;
            }

            //递减移动距离，达到间距就放置一个铲球仔
            distance -= delta;
            if(distance <= 0){
                distance = PLAYER_GAP;
                addPlayer();
            }

            //整理unusedPlayers和role.players数组
            var oldPlayers = role.players;
            var newPlayers = role.players = [];
            for(var i = 0, len = oldPlayers.length; i < len; i++){
                var player = oldPlayers[i];
                if(player.x < -25){
                    //超出屏幕左侧的铲球仔，被放入unusedPlayers队列，等待被重用
                    unusedPlayer.push(player);
                } else {
                    //没有超出屏幕的，放到role.players队列中
                    newPlayers.push(player);
                    if(player.hitTest(squirrel)){   //碰撞检测
                        var offset = ball.x < player.x + 10 ? -75 : 65;
                        fail(ball.x + offset - 50 * Math.random(), ball.y - 20 + 40 * Math.random());
                        return;
                    } else if(!player.sliding){
                        if(player.slideTest(squirrel)){  //铲球检测
                            player.slide(squirrel.x - 50, squirrel.y);
                        } else {
                            player.x -= delta;
                            if(player.x < stageWidth){    //盯梢检测
                                player.stareAt(squirrel);
                            }
                        }
                    }
                }
            }

            //场上没有队员之后，进入禁区
            if(newPlayers.length === 0){
                initGoal();
                return;
            }
        }

        //按照y轴排序元素，得到2.5D视觉效果
        stage.children.sort(function(a, b){
            return a.y - b.y;
        });

        stage.update(event);
    }

    /**
     * 进入禁区时间片
     * @param event
     */
    function tick2(event){
        //移动单位
        var delta = event.delta * 0.15;

        //松鼠与足球
        var squirrel = role.squirrel;
        var ball = role.ball;
        ball.x = squirrel.x + 38;
        ball.y = squirrel.y;

        //守门员移动
        var keeper = role.keeper;
        keeper.x -= delta;

        //背景移动
        var bg = role.bg;
        bg.x -= delta;
        if(bg.x < -bg.imageWidth){
            bg.x = 0;
        }

        //球门移动
        var gate = role.gate;
        if(gate.x < stageWidth - gate.width + delta){   //完整展现球门检测
            //修改游戏状态
            status = 2;
            //准备射门
            initShoot();
        } else {
            //球门移动
            var gateLeft = role.gateLeft;
            var gateRight = role.gateRight;
            gate.x -= delta;
            gateRight.x -= delta;
            gateLeft.x -= delta;
        }
        stage.update(event);
    }

    /**
     * 射门和失败、胜利等阶段时间片
     * @param event
     */
    function tick3(event){
        //排序各种元素，产生2.5D视角
        stage.children.sort(function(a, b){
            return a.y - b.y;
        });
        stage.update(event);
    }

    //时间片数组
    var ticks = [ tick1, tick2, tick3, tick3 ];
    function tick(event){
        //根据状态选择时间片函数
        ticks[status](event);
    }

});
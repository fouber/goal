## 松鼠足球游戏源码

> 在线地址：http://go.uc.cn/page/goal/game

![游戏截图](http://ww4.sinaimg.cn/large/6767ed9agw1eh21ndntjhj208s0i2dgh.jpg)

![游戏截图](http://ww4.sinaimg.cn/large/6767ed9agw1eh21wpj1asj208s0frwez.jpg)

## 运行及构建说明

* 使用 [fis](http://fis.baidu.com) 进行构建
    1. clone项目
    
        ```bash
        git clone https://github.com/fouber/goal.git
        ```
    
    1. 全局安装fis
    
        ```bash
        npm install -g fis
        ```
    
    1. 进入项目
    
        ```bash
        cd goal
        ```
    1. 构建项目，并监听文件&浏览器自动刷新
    
        ```bash
        fis release -wL
        ```
    
    1. 打开新的命令行，启动fis内置服务器浏览项目
    
        ```bash
        fis server start
        ```

> Based on [createjs](http://createjs.com/)

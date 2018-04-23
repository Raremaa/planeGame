    var stage;
    const ARROW_KEY_LEFT = 37;//键盘左键
    const ARROW_KEY_RIGHT = 39;//键盘右键
    const SPACE_KEY = 32;//键盘空格
    var leftKeyDown = false;//左按键状态
    var rightKeyDown = false;//右按键状态
    var starArr = new Array;//存星空背景的星星
    var player;//战机对象
    var speed = 5;//速度、
    var fires = new Array();//子弹Shape(每次事件触发一次push)
    var score = 0;
    var lives = 70;
    var enemy = new Array();//实际敌机
    var fireAble = true; //是否可开火
    var breakAble = true; //是否战机被毁
    var enemyClip = new Array;//敌机Sprite,一共四种

    function init() {
        //导入资源，并在资源加载完成后调用处理函数handleComplete
        //创建舞台stage
        stage = new createjs.Stage('game');
        sWidth = stage.canvas.width;
        sHeight = stage.canvas.height;
        queue = new createjs.LoadQueue(true);
        createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);//注册声音，可回放并进行预加载
        queue.installPlugin(createjs.Sound);
        queue.on("complete",handleComplete);//预加载完成进入游戏
        queue.loadManifest([
            {id:"sprite",src:"./images/planeAndBom.jpg"},
            {id:"shot",src:"./sound/shot.mp3"}
        ]);
        //{id:"explosion", src:"./sound/boom.mp3"}
    }

    function handleComplete() {
        buildGame();//创建游戏界面，星空，玩家飞机，敌机，计分板等
        setControl();//设置按键控制，让玩家可以左右移动并发射子弹
        startGame();//进入游戏循环，使用tick事件实现游戏的变化，发展
    }

    function buildGame() {
        buildMsg();//计分，和玩家剩余的飞机数
        buildPlayer();//创建玩家的飞机
        buildEnemy();//创建敌机
        buildSpace();//星空背景
    }






    /**
     * 创建星空背景
     * 用1px的圆来作为星星，设置alpha用透明度来表示星星的远近不同
     * 远处的星星运动速度慢，而近处的速度快(尚待实现)。
     */
    function buildSpace() {
        var i,star,w,h,alpha;
        for(i=0;i<200;i++){
            starSky = new createjs.Container();
            star = new createjs.Shape();
            w = Math.floor(Math.random()*stage.canvas.width);
            h = Math.floor(Math.random()*stage.canvas.height);
            alpha = Math.random();
            star.graphics.beginFill("#FFF").drawCircle(0,0,1);
            star.x = w;
            star.y = h;
            star.alpha = alpha;
            starSky.addChild(star);
            starArr.push(star);
            stage.addChild(starSky);
        }
    }

    /**
     * 创建玩家的飞机
     * 首先在这里建一个SpriteSheet，包含一个玩家飞机，四个敌机，还有一个爆炸的动画，前五个都是单帧的图片，
     * 只有爆炸是用连续图片来组成的一个动画，随后又注册了一个声音，为了测试声音文件的用法，如果没有在preload中提前载入声音文件，
     * 使用前，使用createjs.Sound.registerSound("./music/explosion.mp3",explosion);
     * 先注册一下，最后的stage.addChildAt(player,0)使用addChildAt添加元素，
     * 可以设置元素的顺序，0表示玩家的飞机永远在最上层
     */
    function buildPlayer() {
        var data ={
            //动画所需要的图像路径
            //可以是多个图片路径组成的列表
            images:[queue.getResult("sprite")],
            //定义每一帧的数据，宽高等等，形成动画的每一帧
            //有两种方法，如果所有的帧的尺寸相同，只需要统一定义
            //"frames":{width:, height:, count:, regX: , regY:}  其中regX和regY是用于图形做特殊转换所需标准点
            frames:[
                [0,0,37,42],
                [37,0,42,42],
                [79,0,37,42],
                [116,0,42,42],
                [158,0,37,42],
                [0,70,64,64],
                [64,70,64,64],
                [128,70,64,64],
                [192,70,64,64],
                [256,70,64,64],
                [320,70,64,64],
                [384,70,64,64],
                [448,70,64,64],
                [512,70,64,64],
                [576,70,64,64],
                [640,70,64,64],
                [704,70,64,64],
                [768,70,64,64]
            ],
            //创建动画，动画的名字，以及对应"frames"列表中的哪些帧
            // 也有两种方法
            //"run": [0, 25, "run", 1.5]
            // [开始帧，结束帧，动画完成后的动作，速度]
            animations:{
                ship:0,
                enemy1:1,
                enemy2:2,
                enemy3:3,
                enemy4:4,
                exp:{
                    frames:[5,6,7,8,9,10,11,12,13,14,15,16],
                    //可以增加next: "a1" 即exp播放完成后进入a1
                    speed:5//速度
                }
            }
        };
        //构建完成spriteSheet
        spriteSheet = new createjs.SpriteSheet(data);
        //为了测试声音文件的用法，如果没有在preload中提前载入声音文件
        //使用前，使用createjs.Sound.registerSound("./music/explosion.mp3",explosion);先注册一下
        createjs.Sound.registerSound("./sound/boom.mp3","boom");
        //创建一个sprite动画
        //有两种方法
        //player = new createjs.Sprite(spriteSheet);
        //player.gotoAndPlay("ship");
        player = new createjs.Sprite(spriteSheet,"ship");
        player.x = sWidth/2 ;
        //getBounds方法获取原始尺寸（不受变换影响）
        player.y = sHeight - player.getBounds().height;
        //addChildAt 可以指定元素添加至容器的指定位置，这里0控制始终在最上层
        stage.addChildAt(player,0);
    }

    /**
     * 通过键盘操作让飞机动起来并发射导弹
     */
    function setControl() {
        window.onkeydown = handleKeyDown;
        window.onkeyup = handleKeyUp;
    }
    function handleKeyDown(e){
        //是为了更好的兼容IE浏览器和非ie浏览器。
        e = !e ? window.event : e;
        switch(e.keyCode){
            case ARROW_KEY_LEFT:
                leftKeyDown = true;
                break;
            case ARROW_KEY_RIGHT:
                rightKeyDown = true;
                break;
        }
    }

    function handleKeyUp(e){
        e = !e ? window.event : e;
        switch(e.keyCode){
            case ARROW_KEY_LEFT:
                leftKeyDown = false;
                break;
            case ARROW_KEY_RIGHT:
                rightKeyDown = false;
                break;
            case SPACE_KEY:
                playFire();
        }
    }

    /**
     * 按下空格，发射一枚子弹
     * fireAble是一个bool值，默认是true，当玩家飞机被摧毁后，有段时间是处于无敌状态然后把fireAble设置为false，
     * 无敌状态不能发射子弹，createjs.Sound.play("shot");可以直接调用你在preload中载入的声音，不需要像explosion.mp3一样，
     * 使用前需要注册，这样每次按键都会播放一次发射的声音，并产生一个白色的子弹，
     * 当然子弹现在也是不能动的，后面的tick相应函数中会让它动起来。
     */
    function playFire(){
        if(fireAble){
            var fire = new createjs.Shape();
            //不加endFill在处理多个图形会遇到问题
            fire.graphics.beginFill("#FF0").drawRect(0,0,2,5).endFill();
            fire.x = player.x + 18;
            fire.y = 658;
            createjs.Sound.play("shot");
            fires.push(fire);
            stage.addChild(fire);
        }
    }

    /**
     * 信息栏,就是两个Text，用来显示玩家得分和剩余的战机
     */
    function buildMsg(){
        var lives = lives;
        var score = score;

        livesTxt = new createjs.Text("lives:" + lives, "20px Times", "#FFF");
        livesTxt.y = 5;
        livesTxt.x = 10;
        stage.addChild(livesTxt);

        scoreTxt = new createjs.Text("score:" + score, "20px Times", "#FFF");
        scoreTxt.y =5;
        scoreTxt.x = sWidth - 100;
        stage.addChild(scoreTxt);
    }

    /**
     * 添加敌机
     * 敌机的种类共有四种，但肯定不会只添加四架飞机。
     * 首先把四架飞机添加到一个数组enemyClip中，做一个敌机的集合，
     * 然后调用buildEnemis()通过循环来复制enemyClip中的每一类敌机来创建一个敌机群。
     */
    function buildEnemy() {
        var e1, e2, e3, e4;
        e1 = new createjs.Sprite(spriteSheet, "enemy1");
        e2 = new createjs.Sprite(spriteSheet, "enemy2");
        e3 = new createjs.Sprite(spriteSheet, "enemy3");
        e4 = new createjs.Sprite(spriteSheet, "enemy4");
        enemyClip.push(e1, e2, e3, e4);
        buildEnemis();
    }

    /**
     * 这里只是简单的通过调用clone()把每种敌机复制了6次，并使用TweenJS让它们3可以从上到下飞过屏幕，
     * 可以通过设置每组敌机的x/y来达到不同的队列组成方式，并通过不同的createjs.Ease来实现不同的运动轨迹。
     * 所有的敌机都被保存在一个enemy数组当中。
     */
    function buildEnemis(){
        var i, j=0,en,en1;
        for(i=0;i<4;i++){
            var en = new Array();
            //clone()方法实现对象复制
            en = enemyClip[i].clone();
            for(j=0;j<6;j++){
                var en1 = new Array();
                en1 = en.clone();
                enemy.push(en1);
                createjs.Tween.get(en1).wait(5000*i).to({x:300,y:800},5000,createjs.Ease.sineInOut(-2));
                stage.addChild(en1);
            }
        }
    }

    function startGame(event){
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick',function () {
            updateGame();//更新游戏元素的位置，更新分数等
            checkGame();//检查游戏中的元素是否发生碰撞，敌机被击落，还是飞出屏幕等等
            stage.update();
        });
    }

    //到这里所有的创建工作都结束了，后面要做的就让星空、子弹动起来
    //(通过在tick相应函数中改变y坐标，敌机使用TweenJS已经开始运动)
    //判断子弹是否与敌机相撞，敌机是否与玩家相撞，更新得分，继续添加敌机等
    
    function updateGame() {
        updateStar();
        updatePlayer();
        updateEnemy();
        updateFire();
        updateMsg();
    }

    /**
     * 让星空背景的星星移动，透明度越高非得越快
     */
    function updateStar() {
        var i,star,yPos;
        for(i=0;i<200;i++){
            star = starArr[i];
            yPos = star.y + 5*star.alpha;
            if(yPos >= stage.canvas.height){
                yPos = 0;
            }
            star.y = yPos;
        }
    }

    /**
     * 根据按键更新战机位置
     */
    function updatePlayer(){
        var nextX = player.x;
        if(leftKeyDown){
            nextX = player.x - speed;
            if(nextX<0){
                nextX = 0;
            }
        }else if(rightKeyDown){
            nextX = player.x + speed;
            if(nextX > (sWidth - 37)){
                nextX = sWidth - 37;
            }
        }

        player.x = nextX;
    }

    /**
     * 更新战机发射的子弹
     */
    function updateFire(){
        var i, nextY,fire;
        for (i=0;i<fires.length;i++){
            fire = fires[i];
            nextY = fire.y - 10;

            if(nextY == 0){//如果子弹飞出屏幕，在子弹数组中去掉，并在stage中删除元素
                //splice方法表示从第i个元素开始删除1个元素(js方法)
                fires.splice(i,1)
                stage.removeChild(fire);
                continue;
            }
            fire.y = nextY;
        }
    }

    /**
     * 敌机与子弹碰撞检测
     */
    function updateEnemy(){
        var i, j,fire,enemy1;
        var loop1 = fires.length;
        var loop2 = enemy.length;
        for(i=0;i<loop1;i++){
            for(j=0;j<loop2;j++){
                fire = fires[i];
                enemy1 = enemy[j];
                var fx = fire.x;
                var fy = fire.y;
                var ex = enemy1.x;
                var ey = enemy1.y;
                var ew = enemy1.getBounds().width;
                var eh = enemy1.getBounds().height;

               /* if(ey>=800 || ex>=600){
                    enemy.splice(j,1);
                    j-=1;
                    loop2-=1;
                    stage.removeChild(enemy1);
                    continue;
                }*/
                if(fy < ey+eh && fy > ey && fx>ex && fx<ex+ew && ey > 0){
                    score += 10;
                    fires.splice(i,1);
                    enemy.splice(j,1);
                    j-=1;i-=1;loop1-=1;loop2-=1;
                    stage.removeChild(fire);
                    stage.removeChild(enemy1);
                    createjs.Sound.play("boom");
                    var exp1 = new createjs.Sprite(spriteSheet,"exp");
                    exp1.x = ex;
                    exp1.y = ey;
                    //这一块有问题
                    exp1.addEventListener('animationend',function(e){
                        stage.removeChild(e.target);
                    });
                    stage.addChild(exp1);

                }
            }
        }
    }
    //更新分数和剩余生命值
    function updateMsg(){
        scoreTxt.text = "score:" + score;
        livesTxt.text = "lives:" + lives;
    }


    //好了，只需要简单的几个部分，游戏基本就完成了，最后再添加一个checkGame()来检查一下游戏运行的状态，
    //如果所有敌机都被消灭或者已经飞出屏幕，再添加新的敌机，
    //而且，我把敌机与玩家的碰撞放在了这里，玩家飞机被撞毁后，召唤新的战机，并在一段时间内无敌。

    function checkGame(){
        var i,en,pl;
        if(enemy.length==0){
            buildEnemis();
        }
        pl = player;
        plx = player.x;
        ply = player.y;
        plw = player.getBounds().width;
        plh = player.getBounds().height;

        for(i=0;i<enemy.length;i++){
            en = enemy[i];
            enx = en.x;
            eny = en.y;
            enw = en.getBounds().width;
            enh = en.getBounds().height;

            if(eny+enh<800 && eny+enh > ply && enx > plx && enx < plx+plw && breakAble){
                stage.removeChild(player);
                pl = null;
                player = null;
                fireAble = false;
                breakAble = false;
                setTime = setTimeout(newPlayer,10);
                break;
            }

        }

    }

    function newPlayer(){
        clearTimeout(setTime);
        player = new createjs.Sprite(spriteSheet,"ship");
        player.x = sWidth/2 ;
        player.y = sHeight - player.getBounds().height;
        player.alpha = 0;
        createjs.Tween.get(player).to({alpha:1},1000,createjs.Ease.getPowIn(1)).call(function(){
            lives--;
            fireAble = true;
            breakAble = true;
        });
        stage.addChildAt(player,0);
    }



    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

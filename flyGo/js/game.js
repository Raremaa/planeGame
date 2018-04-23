var stage;//createJs舞台
const ARROW_KEY_UP = 38;//键盘上键
const ARROW_KEY_DOWN = 40;//键盘下键
const ARROW_KEY_LEFT = 37;//键盘左键
const ARROW_KEY_RIGHT = 39;//键盘右键
const SPACE_KEY = 32;//键盘空格
var upKeyDown = false;//上按键状态
var downKeyDown = false;//下按键状态
var leftKeyDown = false;//左按键状态
var rightKeyDown = false;//右按键状态
var spaceKeyDown = false;//空格状态
var starArr = new Array;//存星空背景的星星Shape对象
var player;//战机对象
var speed = 5;//速度
var fires = new Array();//子弹Shape(每次事件触发一次push)
var score = 0; //得分
var lives = 5;//生命值
var bullet;
var enemy = new Array();//实际敌机
var fireAble = true; //是否可开火
var breakAble = true; //是否战机被毁
var enemyClip = new Array;//敌机Sprite,一共四种
var sWidth;//canvas宽度
var sHeight;//canvas高度
var starSky;//星空背景
var queue;//preload插件实现预加载类
var spriteSheet;//雪碧图
var part = 1;//游戏玩法
var isPerfect = true;//是否开启高画质
var fps = 60; //fps
//游戏资源实现：

/**
 * 预加载游戏所需资源
 *
 * sprite:战机以及爆炸效果的sprite图
 * shot:射击音效
 * explosion:爆炸音效
 * bgm:背景音乐
 */
function init() {
    stage = new createjs.Stage("game");
    sWidth = stage.canvas.width;
    sHeight = stage.canvas.height;
    queue = new createjs.LoadQueue();
    createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);//注册声音,可进行预加载与回放
    queue.installPlugin(createjs.Sound);
    queue.on("complete",handleComplete);
    queue.loadManifest([
        {id:"sprite",src:"./images/sprite.png"},
        {id:"shot",src:"./sound/shot.mp3"},
        {id:"explosion",src:"./sound/explosion.mp3"},
        {id:"bgm",src:"./sound/bgm.ogg"}
    ]);
}

/**
 * 预加载完成后进行游戏资源配置
 */
function handleComplete() {
    buildGame();//创建游戏界面，星空，玩家飞机，敌机，计分板等
    setControl();//设置按键控制，让玩家可以左右移动并发射子弹
    startGame();//进入游戏循环，使用tick事件实现游戏的变化，发展
}

/**
 *创建游戏界面，星空，玩家飞机，敌机，计分板
 */
function buildGame() {
    buildSpace();//星空背景
    buildMsg();//计分，和玩家剩余的飞机数
    buildSpriteSheet();//创建游戏元素所需素材图（雪碧图裁剪）
    buildPlayer();//创建玩家的飞机
    buildEnemy();//创建敌机
}

/**
 * 创建星空背景
 *
 * alpha 透明度
 */
function buildSpace() {
    var i,star,w,h,alpha;
    for(i=0;i<200;i++){
        starSky = new createjs.Container();
        star = new createjs.Shape();
        w = Math.floor(Math.random()*sWidth);
        h = Math.floor(Math.random()*sHeight);
        alpha = Math.random();
        star.graphics.beginFill("#FFF").drawCircle(0,0,1);
        star.x = w;
        star.y = h;
        star.alpha = alpha;
        starSky.addChild(star);
        starArr.push(star);
        stage.addChild(starSky);
        //createjs.Sound.play("bgm",{loop:-1});
    }
}

/**
 * 计分板信息
 *
 * livesText 生命值
 * scoreText 分数
 */
function buildMsg() {
    var livesText = new createjs.Text("lives:"+lives,"40px console","#FFF");
    livesText.x = 5;
    livesText.y = 10;
    stage.addChild(livesText);

    var scoreText = new createjs.Text("score:"+score,"40px console","#FFF");
    scoreText.x = 860;
    scoreText.y = 10;
    stage.addChild(scoreText);
}

/**
 * 根据雪碧图创建游戏图片资源
 */
function buildSpriteSheet() {
    var data ={
        images:[queue.getResult("sprite")],
        frames:[
            [482, 401, 71, 51, 0, 0, 0],
            [71, 401, 71, 51, 0, 0, 0],
            [142, 401, 71, 51, 0, 0, 0],
            [1262, 401, 71, 51, 0, 0, 0],
            [1659, 401, 71, 51, 0, 0, 0],
            [1781, 401, 71, 51, 0, 0, 0],
            [1588, 401, 71, 51, 0, 0, 0],
            [0, 452, 71, 51, 0, 0, 0],
            [1852, 401, 71, 51, 0, 0, 0],
            [142, 452, 71, 51, 0, 0, 0],
            [1923, 401, 71, 51, 0, 0, 0],
            [71, 452, 71, 51, 0, 0, 0],
            [213, 401, 71, 51, 0, 0, 0],
            [1877, 302, 71, 51, 0, 0, 0],
            [1948, 302, 71, 51, 0, 0, 0],
            [1735, 302, 71, 51, 0, 0, 0],
            [1806, 302, 71, 51, 0, 0, 0],
            [355, 401, 71, 51, 0, 0, 0],
            [284, 401, 71, 51, 0, 0, 0],
            [0, 401, 71, 51, 0, 0, 0],
            [566, 452, 75, 40, 0, -1, 0],
            [491, 452, 75, 40, 0, -1, 0],
            [941, 452, 75, 40, 0, -1, 0],
            [641, 452, 75, 40, 0, -1, 0],
            [716, 452, 75, 40, 0, -1, 0],
            [791, 452, 75, 40, 0, -1, 0],
            [866, 452, 75, 40, 0, -1, 0],
            [81, 503, 71, 26, 0, 0, 0],
            [1626, 452, 71, 26, 0, 0, 0],
            [1697, 452, 71, 26, 0, 0, 0],
            [1768, 452, 71, 26, 0, 0, 0],
            [1839, 452, 71, 26, 0, 0, 0],
            [1910, 452, 71, 26, 0, 0, 0],
            [0, 503, 71, 26, 0, 0, 0],
            [1730, 401, 51, 51, 0, 0, 0],
            [239, 452, 62, 45, 0, 0, 0],
            [405, 452, 60, 44, 0, 0, 0],
            [301, 452, 55, 44, 0, 0, 0],
            [1268, 452, 51, 33, 0, 0, 0],
            [1846, 0, 101, 99, 0, -3, -3],
            [1947, 0, 101, 99, 0, -3, -3],
            [0, 104, 101, 99, 0, -3, -3],
            [101, 104, 101, 99, 0, -3, -3],
            [202, 104, 101, 99, 0, -3, -3],
            [303, 104, 101, 99, 0, -3, -3],
            [404, 104, 101, 99, 0, -3, -3],
            [505, 104, 101, 99, 0, -3, -3],
            [606, 104, 101, 99, 0, -3, -3],
            [707, 104, 101, 99, 0, -3, -3],
            [808, 104, 101, 99, 0, -3, -3],
            [519, 0, 103, 101, 0, -2, -2],
            [622, 0, 103, 101, 0, -2, -2],
            [210, 0, 103, 101, 0, -2, -2],
            [313, 0, 103, 101, 0, -2, -2],
            [416, 0, 103, 101, 0, -2, -2],
            [1137, 0, 103, 101, 0, -2, -2],
            [1034, 0, 103, 101, 0, -2, -2],
            [1212, 104, 101, 99, 0, -3, -3],
            [1313, 104, 101, 99, 0, -3, -3],
            [1414, 104, 101, 99, 0, -3, -3],
            [1515, 104, 101, 99, 0, -3, -3],
            [1616, 104, 101, 99, 0, -3, -3],
            [1717, 104, 101, 99, 0, -3, -3],
            [1818, 104, 101, 99, 0, -3, -3],
            [1919, 104, 101, 99, 0, -3, -3],
            [0, 203, 101, 99, 0, -3, -3],
            [101, 203, 101, 99, 0, -3, -3],
            [909, 104, 101, 99, 0, -3, -3],
            [303, 203, 101, 99, 0, -3, -3],
            [404, 203, 101, 99, 0, -3, -3],
            [505, 203, 101, 99, 0, -3, -3],
            [606, 203, 101, 99, 0, -3, -3],
            [808, 203, 101, 99, 0, -3, -3],
            [1010, 104, 101, 99, 0, -3, -3],
            [1111, 104, 101, 99, 0, -3, -3],
            [1010, 203, 101, 99, 0, -3, -3],
            [1111, 203, 101, 99, 0, -3, -3],
            [1212, 203, 101, 99, 0, -3, -3],
            [1313, 203, 101, 99, 0, -3, -3],
            [725, 0, 103, 101, 0, -2, -2],
            [1240, 0, 103, 101, 0, -2, -2],
            [931, 0, 103, 101, 0, -2, -2],
            [1343, 0, 103, 101, 0, -2, -2],
            [1446, 0, 103, 101, 0, -2, -2],
            [1549, 0, 103, 101, 0, -2, -2],
            [828, 0, 103, 101, 0, -2, -2],
            [1818, 203, 101, 99, 0, -3, -3],
            [1919, 203, 101, 99, 0, -3, -3],
            [1414, 203, 101, 99, 0, -3, -3],
            [1745, 0, 101, 99, 0, -3, -3],
            [1515, 203, 101, 99, 0, -3, -3],
            [707, 203, 101, 99, 0, -3, -3],
            [1717, 203, 101, 99, 0, -3, -3],
            [1616, 203, 101, 99, 0, -3, -3],
            [0, 302, 101, 99, 0, -3, -3],
            [909, 203, 101, 99, 0, -3, -3],
            [202, 203, 101, 99, 0, -3, -3],
            [675, 401, 51, 51, 0, 0, 0],
            [2047, 302, 1, 1, 0, 0, 0],
            [298, 503, 5, 25, 0, -25, 0],
            [71, 503, 10, 26, 0, -25, 0],
            [2029, 452, 16, 26, 0, -25, 0],
            [1981, 452, 22, 26, 0, -25, 0],
            [2003, 452, 26, 26, 0, -25, 0],
            [152, 503, 26, 26, 0, -25, 0],
            [178, 503, 26, 26, 0, -25, 0],
            [204, 503, 26, 26, 0, -25, 0],
            [230, 503, 26, 26, 0, -25, 0],
            [1059, 452, 26, 35, 0, -25, 0],
            [465, 452, 26, 41, 0, -25, 0],
            [213, 452, 26, 47, 0, -25, 0],
            [879, 401, 26, 51, 0, -25, 0],
            [2020, 104, 26, 51, 0, -25, 0],
            [2020, 203, 26, 51, 0, -25, 0],
            [2019, 302, 26, 51, 0, -25, 0],
            [426, 401, 26, 51, 0, -25, 0],
            [452, 401, 30, 51, 0, -21, 0],
            [553, 401, 35, 51, 0, -16, 0],
            [588, 401, 40, 51, 0, -11, 0],
            [628, 401, 47, 51, 0, -4, 0],
            [726, 401, 51, 51, 0, 0, 0],
            [777, 401, 51, 51, 0, 0, 0],
            [828, 401, 51, 51, 0, 0, 0],
            [956, 401, 51, 51, 0, 0, 0],
            [1007, 401, 51, 51, 0, 0, 0],
            [1058, 401, 51, 51, 0, 0, 0],
            [1109, 401, 51, 51, 0, 0, 0],
            [1160, 401, 51, 51, 0, 0, 0],
            [1211, 401, 51, 51, 0, 0, 0],
            [905, 401, 51, 51, 0, 0, 0],
            [1333, 401, 51, 51, 0, 0, 0],
            [1384, 401, 51, 51, 0, 0, 0],
            [1435, 401, 51, 51, 0, 0, 0],
            [1486, 401, 51, 51, 0, 0, 0],
            [1537, 401, 51, 51, 0, 0, 0],
            [2046, 104, 2, 23, 0, 0, 0],
            [2046, 203, 2, 23, 0, 0, -3],
            [1176, 452, 23, 34, 0, 0, -1],
            [1319, 452, 19, 32, 0, 0, -2],
            [1154, 452, 22, 34, 0, 0, -1],
            [1199, 452, 23, 34, 0, 0, -1],
            [1338, 452, 23, 32, 0, 0, -2],
            [1222, 452, 23, 34, 0, 0, -1],
            [1131, 452, 23, 34, 0, 0, -1],
            [1245, 452, 23, 33, 0, 0, -1],
            [1108, 452, 23, 34, 0, 0, -1],
            [1085, 452, 23, 34, 0, 0, -1],
            [344, 503, 40, 24, 0, 0, 0],
            [256, 503, 42, 26, 0, 0, 0],
            [1583, 452, 43, 27, 0, 0, 0],
            [1496, 452, 44, 29, 0, 0, 0],
            [1407, 452, 45, 30, 0, 0, 0],
            [1361, 452, 46, 32, 0, 0, 0],
            [1452, 452, 44, 29, 0, 0, 0],
            [1540, 452, 43, 27, 0, 0, 0],
            [303, 503, 41, 25, 0, 0, 0],
            [411, 503, 17, 16, 0, -48, -44],
            [384, 503, 27, 24, 0, -43, -40],
            [1016, 452, 43, 40, 0, -35, -32],
            [356, 452, 49, 44, 0, -32, -30],
            [1994, 401, 53, 50, 0, -30, -27],
            [1299, 302, 61, 60, 0, -26, -22],
            [583, 302, 73, 70, 0, -20, -17],
            [405, 302, 87, 80, 0, -13, -12],
            [101, 302, 103, 94, 0, -5, -5],
            [97, 0, 113, 102, 0, 0, -1],
            [1652, 0, 93, 100, 0, -10, -2],
            [0, 0, 97, 104, 0, -8, 0],
            [822, 302, 77, 62, 0, -18, -21],
            [741, 302, 81, 66, 0, -16, -19],
            [656, 302, 85, 70, 0, -14, -17],
            [492, 302, 91, 76, 0, -11, -14],
            [308, 302, 97, 82, 0, -8, -11],
            [204, 302, 104, 92, 0, 0, -4],
            [2045, 302, 2, 2, 0, 0, 0],
            [428, 503, 4, 4, 0, 0, 0],
            [899, 302, 400, 60, 0, 0, 0],
            [1360, 302, 375, 53, 0, 0, 0]

        ],
        animations:{
            "1": {"frames": [138], "speed": 1},
            "2": {"frames": [139], "speed": 1},
            "4": {"frames": [141], "speed": 1},
            "5": {"frames": [142], "speed": 1},
            "6": {"frames": [143], "speed": 1},
            "7": {"frames": [144], "speed": 1},
            "0": {"frames": [137], "speed": 1},
            "8": {"frames": [145], "speed": 1},
            "3": {"frames": [140], "speed": 1},
            "9": {"frames": [146], "speed": 1},
            "asteroid3": {"frames": [37], "speed": 1},
            "enemy2Hit": {
                "frames": [21, 22, 23, 24, 25, 26],
                "next": "enemy2Idle",
                "speed": 1
            },
            "powerup": {
                "frames": [
                    39,
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48,
                    49,
                    50,
                    51,
                    52,
                    53,
                    54,
                    55,
                    56,
                    57,
                    58,
                    59,
                    60,
                    61,
                    62,
                    63,
                    64,
                    65,
                    66,
                    67,
                    39
                ],
                "speed": 1
            },
            "asteroid4": {"frames": [38], "speed": 1},
            "shield": {
                "frames": [
                    68,
                    69,
                    70,
                    71,
                    72,
                    73,
                    74,
                    75,
                    76,
                    77,
                    78,
                    79,
                    80,
                    81,
                    82,
                    83,
                    84,
                    85,
                    86,
                    87,
                    88,
                    89,
                    90,
                    91,
                    92,
                    93,
                    94,
                    95,
                    96,
                    68
                ],
                "speed": 1
            },
            "life": {
                "frames": [147, 148, 149, 150, 151, 152, 153, 154, 155, 98],
                "speed": 0.4
            },
            "shieldHUD": {"frames": [97], "speed": 1},
            "heroPrize": {
                "frames": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0],
                "speed": 1
            },
            "progessHUD": {
                "frames": [
                    98,
                    99,
                    99,
                    100,
                    100,
                    101,
                    101,
                    102,
                    102,
                    103,
                    103,
                    104,
                    104,
                    105,
                    105,
                    106,
                    106,
                    107,
                    107,
                    108,
                    108,
                    109,
                    109,
                    110,
                    110,
                    111,
                    111,
                    112,
                    112,
                    113,
                    113,
                    114,
                    114,
                    115,
                    115,
                    116,
                    116,
                    117,
                    117,
                    118,
                    118,
                    119,
                    119,
                    120,
                    120,
                    121,
                    121,
                    122,
                    122,
                    123,
                    123,
                    124,
                    124,
                    125,
                    125,
                    126,
                    126,
                    127,
                    127,
                    128,
                    128,
                    129,
                    129,
                    130,
                    130,
                    131,
                    131,
                    132,
                    132,
                    133
                ],
                "speed": 1
            },
            "powerHUD": {"frames": [134], "speed": 1},
            "enemy1Hit": {
                "frames": [28, 29, 30, 31, 32, 33],
                "next": "enemy1Idle",
                "speed": 1
            },
            "asteroid2": {"frames": [36], "speed": 1},
            "enemy1Idle": {"frames": [27], "speed": 1},
            "healthHUD": {"frames": [34], "speed": 1},
            "star1": {"frames": [98], "speed": 1},
            "explosion": {
                "frames": [
                    156,
                    157,
                    158,
                    159,
                    160,
                    161,
                    162,
                    163,
                    164,
                    165,
                    166,
                    167,
                    168,
                    169,
                    170,
                    171,
                    172,
                    172,
                    173
                ],
                "speed": 0.4
            },
            "star2": {"frames": [174], "speed": 1},
            "star3": {"frames": [175], "speed": 1},
            "heroIdle": {"frames": [0], "speed": 1},
            "enemy2Idle": {"frames": [20], "speed": 1},
            "gameOver": {"frames": [177], "speed": 1},
            "asteroid1": {"frames": [35], "speed": 1},
            "bullet": {"frames": [135, 136], "speed": 1},
            "heroHit": {
                "frames": [0, 14, 15, 16, 17, 18, 19],
                "next": "heroIdle",
                "speed": 0.4
            },
            "title": {"frames": [176], "speed": 1}
        }
    };
    spriteSheet = new createjs.SpriteSheet(data);
}

/**
 * 创建玩家战机
 */
function buildPlayer() {
    player = new createjs.Sprite(spriteSheet,"heroIdle");
    player.rotation=90;
    player.x = player.getBounds().height;
    player.y = (sHeight/2) - ((player.getBounds().width)/2);
    stage.addChild(player);
    /*临时点，用作辅助定位目标对象坐标
    var shapeTemp = new createjs.Shape();
    shapeTemp.graphics.beginFill("#ff0000").drawCircle(player.x, player.y, 1);
    stage.addChild(shapeTemp);*/
}

/**
 * 创建敌机，将多个敌机放入数组enemyClip中
 * part1_x 第一阶段敌人
 * part2_x 第二阶段敌人
 */
function buildEnemy() {
    var part1_1,part1_2,part2_1,part2_2,part2_3,part2_4;
    part1_1 = new createjs.Sprite(spriteSheet,"enemy1Idle");
    part1_2 = new createjs.Sprite(spriteSheet,"enemy2Idle");
    part1_1.rotation = 90;
    part1_2.rotation = 90;

    part2_1 = new createjs.Sprite(spriteSheet,"asteroid1");
    part2_2 = new createjs.Sprite(spriteSheet,"asteroid2");
    part2_3 = new createjs.Sprite(spriteSheet,"asteroid3");
    part2_4 = new createjs.Sprite(spriteSheet,"asteroid4");
    enemyClip.push(part1_1,part1_2,part2_1,part2_2,part2_3,part2_4);
    buildEnemies();
}

/**
 *将enemyClip中的敌机对象拆出放入舞台
 *
 *
 * 生成min~max之间的随机数公式：Math.floor(Math.random()*(max-min+1)+min)
 */
function buildEnemies() {
    var i,temp;
    for(i=0;i<20;i++) {
        if(part == 1){
            //随机从上下两侧产生飞机
            // temp = Math.floor(Math.random() * 2);
            // enemyClip[temp].x = Math.floor(Math.random() * 701 + 300);//x坐标随机300~1000之间
            // var tempY = Math.random()*600;
            // if(temp == 0) {
            //     enemyClip[temp].y = -(enemyClip[temp].getBounds().width);
            // }else{
            //     enemyClip[temp].y = 600;
            // }
            // var en = enemyClip[temp].clone();
            // enemy.push(en);
            // createjs.Tween.get(en).wait(5000*i).to({x:0,y:tempY},5000,createjs.Ease.sineInOut(-2));
            // stage.addChild(en);

            //随机从最右侧产生飞机
            temp = Math.floor(Math.random() * 2);
            enemyClip[temp].x = Math.floor(Math.random() * enemyClip[temp].getBounds().height+1050);//x坐标随机1000~1000+敌机长度之间
            enemyClip[temp].y = Math.floor(Math.random()*(601+enemyClip[temp].getBounds().width)-enemyClip[temp].getBounds().width);
            console.log(enemyClip[temp].x)
            console.log(enemyClip[temp].y)
            var en = enemyClip[temp].clone();
            enemy.push(en);
            createjs.Tween.get(en).to({x:0,y:Math.random()*600},1,createjs.Ease.sineInOut(-2));
            stage.addChild(en);

        }
    }

}

/**
 * 通过键盘操作执行相应反馈
 *
 * handleKeyDown 按下键盘
 * handleKeyUp 松开键盘
 */
function setControl() {
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}

/**
 * 通过按下键盘操作做出反馈
 */
function handleKeyDown(e){
    //是为了更好的兼容IE浏览器和非ie浏览器。
    e = !e ? window.event : e;
    switch(e.keyCode){
        case ARROW_KEY_UP:
            upKeyDown = true;
            break;
        case ARROW_KEY_DOWN:
            downKeyDown = true;
            break;
        case ARROW_KEY_LEFT:
            leftKeyDown = true;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = true;
            break;
        case SPACE_KEY:
            spaceKeyDown = true;
            break;
    };
    handleKey(upKeyDown,downKeyDown,spaceKeyDown,leftKeyDown,rightKeyDown);
}

/**
 * 通过松开键盘操作做出反馈
 */
function handleKeyUp(e){
    e = !e ? window.event : e;
    switch(e.keyCode){
        case ARROW_KEY_UP:
            upKeyDown = false;
            break;
        case ARROW_KEY_DOWN:
            downKeyDown = false;
            break;
        case ARROW_KEY_LEFT:
            leftKeyDown = false;
            break;
        case ARROW_KEY_RIGHT:
            rightKeyDown = false;
            break;
        case SPACE_KEY:
            spaceKeyDown = false;
            break;
    };
    handleKey(upKeyDown,downKeyDown,spaceKeyDown,leftKeyDown,rightKeyDown);
}

/**
 * 按下空格，发射一枚子弹
 * fireAble是一个bool值，默认是true，当玩家飞机被摧毁后，有段时间是处于无敌状态然后把fireAble设置为false，
 * 无敌状态不能发射子弹，createjs.Sound.play("shot");可以直接调用你在preload中载入的声音，不需要像explosion.mp3一样，
 * 使用前需要注册，这样每次按键都会播放一次发射的声音，并产生一个白色的子弹，
 * 当然子弹现在也是不能动的，后面的tick相应函数中会让它动起来。
 */

function handleKey(upKeyDown,downKeyDown,spaceKeyDown,leftKeyDown,rightKeyDown) {
    if(spaceKeyDown){
        if(fireAble){
            bullet = new createjs.Sprite(spriteSheet,"bullet");
            bullet.x = player.x;
            bullet.y = player.y+(player.getBounds().width)/2;
            bullet.rotation = -90;
            createjs.Tween.get(bullet).to({x:sWidth},6000,createjs.Ease.linear);
            fires.push(bullet);
            createjs.Sound.play("shot");
            stage.addChild(bullet);
        }
    }
    if(upKeyDown){
        player.y -= 20;
    }
    if(downKeyDown){
        player.y += 20;
    }
    if(leftKeyDown){
        player.x -= 20;
    }
    if(rightKeyDown){
        player.x += 20;
    }
}

/**
 * 开始游戏
 */
function startGame() {
    createjs.Ticker.setFPS(fps);
    createjs.Ticker.addEventListener('tick',function () {
        updateGame();//更新游戏元素的位置，更新分数等
        checkGame();//检查游戏中的元素是否发生碰撞，敌机被击落，还是飞出屏幕等等
        stage.update();
    });
}

function updateGame() {
    updateStar();
}

function checkGame() {
    
}

/**
 * 让星空背景的星星移动，透明度越高飞得越快
 */
function updateStar() {
    if(isPerfect){
        var i,star,xPos;
        for(i=0;i<200;i++){
            star = starArr[i];
            xPos = star.x - 5*star.alpha;
            if(xPos <= 0){
                xPos = sWidth;
            }
            star.x = xPos;
        }
    }
}
































function openP() {
    isPerfect = true;
    fps = 60;
}

function closeP() {
    isPerfect = false;
    fps = 30;
}
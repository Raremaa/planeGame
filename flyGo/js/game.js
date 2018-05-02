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
var enemy = new Array();//陨石和星球障碍(不算分)
var fireAble = true; //是否可开火
var enemyClip = new Array;//敌机Sprite,一共2
var sWidth;//canvas宽度
var sHeight;//canvas高度
var starSky;//星空背景
var queue;//preload插件实现预加载类
var spriteSheet;//雪碧图
var fps = 60; //fps
var radishS; //星球
var enemyScore = new Array();//算分数的敌机
var livesText;//生命值文本对象
var scoreText;//分数文本对象
var runAble = true;//是否可移动
var collision = false;//是否发生碰撞
var isPerfect = true;//高画质游戏(尚待实现)
var flag = 0;//加载状态
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
    queue.on("fileload", progressWaiting);
    queue.on("complete", handleComplete);
    queue.loadManifest([
        {id: "sprite", src: "./images/sprite.png"},
        {id: "fireEnemy", src: "./images/fireEnemy.png"},
        {id: "shot", src: "./sound/shot.mp3"},
        {id: "explosion", src: "./sound/explosion.mp3"},
        {id: "bgm", src: "./sound/bgm.ogg"}
    ]);
}

function progressWaiting() {
    if(flag == 0){
        console.log("雪碧图加载完毕");
    }
    if(flag == 1){
        console.log("星球加载完毕");
    }
    if(flag == 2){
        console.log("枪声音效加载完毕");
    }
    if(flag == 3){
        console.log("爆炸音效加载完毕");
    }
    if(flag == 4){
        console.log("背景音乐音效加载完毕");
    }
    flag++;
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
    var i, star, w, h, alpha;
    for (i = 0; i < 200; i++) {
        starSky = new createjs.Container();
        star = new createjs.Shape();
        w = Math.floor(Math.random() * sWidth);
        h = Math.floor(Math.random() * sHeight);
        alpha = Math.random();
        star.graphics.beginFill("#FFF").drawCircle(0, 0, 1);
        star.x = w;
        star.y = h;
        star.alpha = alpha;
        starSky.addChild(star);
        starArr.push(star);
        stage.addChild(starSky);
        createjs.Sound.play("bgm",{loop:-1});
    }
}

/**
 * 计分板信息
 *
 * livesText 生命值
 * scoreText 分数
 */
function buildMsg() {
    livesText = new createjs.Text("lives:" + lives, "40px console", "#FFF");
    livesText.x = 5;
    livesText.y = 10;
    stage.addChildAt(livesText,1);

    scoreText = new createjs.Text("score:" + score, "40px console", "#FFF");
    scoreText.x = 800;
    scoreText.y = 10;
    stage.addChildAt(scoreText,1);
}

/**
 * 根据雪碧图创建游戏图片资源
 * 这里我采用的制作好的雪碧图，有一些多于的资源和SpriteSheet，供后期完善
 */
function buildSpriteSheet() {
    var data = {
        images: [queue.getResult("sprite")],
        frames: [
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
        animations: {
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

    var data2 = {
        images: [queue.getResult("fireEnemy")],
        frames: [
            [0, 0, 142, 140, 0, 0, 0]
        ],
        animations: {
            "radish": 0
        }
    };
    radishS = new createjs.SpriteSheet(data2);
}

/**
 * 创建玩家战机并放入舞台之中
 */
function buildPlayer() {
    player = new createjs.Sprite(spriteSheet, "heroIdle");
    player.rotation = 90;
    player.x = player.getBounds().height;
    player.y = (sHeight / 2) - ((player.getBounds().width) / 2);
    stage.addChild(player);
    /*临时点，用作辅助定位目标对象坐标
    var shapeTemp = new createjs.Shape();
    shapeTemp.graphics.beginFill("#ff0000").drawCircle(player.x, player.y, 1);
    stage.addChild(shapeTemp);*/
}

/**
 * 创建敌人，将多个敌人放入数组enemyClip中
 *  e1,e2:敌机(算分)
 *  e3,e4,e5,e6:陨石
 *  e7:星球
 */
function buildEnemy() {
    var e1, e2, e3, e4, e5, e6, e7;
    e1 = new createjs.Sprite(spriteSheet, "enemy1Idle");
    e2 = new createjs.Sprite(spriteSheet, "enemy2Idle");
    e1.rotation = 90;
    e2.rotation = 90;
    e3 = new createjs.Sprite(spriteSheet, "asteroid1");
    e4 = new createjs.Sprite(spriteSheet, "asteroid2");
    e5 = new createjs.Sprite(spriteSheet, "asteroid3");
    e6 = new createjs.Sprite(spriteSheet, "asteroid4");
    e7 = new createjs.Sprite(radishS, "radish");
    e7.rotation = -90;
    enemyClip.push(e1, e2, e3, e4, e5, e6, e7);
    buildEnemies();
}

/**
 *将enemyClip中的敌人对象通过随机算法放入舞台中
 *  随机算法从上下两侧产生敌机(算分，存在enemyScore中)
 *  随机算法从最右侧产生敌机(算分，存在enemyScore中)
 *  随机算法从最右侧产生陨石(不算分，存在enemy中)
 *  随机算法从最顶部产生星球(不算分，存在enemy中)
 *  这里的算法各不相同
 *
 * ===生成min~max之间的随机数公式：b jMath.floor(Math.random()*(max-min+1)+min)===
 */
function buildEnemies() {
    var i, temp;
    for (i = 0; i < 20; i++) {

        //firesEnemy = new createjs.Sprite(firesEnemySprite, "fireE");//子弹Shape
        //随机从上下两侧产生飞机
        temp = Math.floor(Math.random() * 2);
        enemyClip[temp].x = Math.floor(Math.random() * 501 + 500);//x坐标随机300~1000之间
        var tempY = Math.random() * 600;
        if (temp == 0) {
            enemyClip[temp].y = -(enemyClip[temp].getBounds().width);
        } else {
            enemyClip[temp].y = 600;
        }
        var en = enemyClip[temp].clone();
        enemyScore.push(en);
        createjs.Tween.get(en).wait(5000 * i).to({x: -300, y: tempY}, 6000, createjs.Ease.sineInOut(-2));
        stage.addChild(en);

        //随机从最右侧产生飞机
        temp = Math.floor(Math.random() * 2);
        enemyClip[temp].x = Math.floor(Math.random() * enemyClip[temp].getBounds().height + 1050);//x坐标随机1000~1000+敌机长度之间
        enemyClip[temp].y = Math.floor(Math.random() * (601 + enemyClip[temp].getBounds().width) - enemyClip[temp].getBounds().width);
        var en = enemyClip[temp].clone();
        enemyScore.push(en);
        createjs.Tween.get(en).wait(5000 * i).to({x: -300, y: Math.random() * 600}, 6000, createjs.Ease.circInOut(-2));
        stage.addChild(en);

    }
    //随机产生陨石
    for (i = 0; i < 50; i++) {
        temp = Math.floor(Math.random() * 4 + 2);
        enemyClip[temp].x = 1250;
        enemyClip[temp].y = Math.floor(Math.random() * 600);
        var en = enemyClip[temp].clone();
        enemy.push(en);
        createjs.Tween.get(en).wait(2000 * i).to({x: -300}, 3000 - 10 * i, createjs.Ease.linear);
        stage.addChild(en);
    }
    //随机产生星球
    for(i=0;i<50;i++){
        temp = 6;
        enemyClip[temp].x = Math.floor(Math.random()*1000);
        enemyClip[temp].y = 0;
        var en = enemyClip[temp].clone();
        enemy.push(en);
        createjs.Tween.get(en).wait(2000 * i).to({x: -150, y:Math.random()*600}, 3000-10*i, createjs.Ease.circInOut(-2));
        stage.addChild(en);
    }
}

/**
 * 按键控制记录
 *
 * handleKeyDown 按下键盘
 * handleKeyUp 松开键盘
 */
function setControl() {
    window.onkeydown = handleKeyDown;
    window.onkeyup = handleKeyUp;
}

/**
 * 记录按下的按键
 */
function handleKeyDown(e) {
    //是为了更好的兼容IE浏览器和非ie浏览器。
    e = !e ? window.event : e;
    switch (e.keyCode) {
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
            playFire();
            break;
    }
    ;
    // handleKey(upKeyDown, downKeyDown, spaceKeyDown, leftKeyDown, rightKeyDown);
}

/**
 * 记录松开的按键
 */
function handleKeyUp(e) {
    e = !e ? window.event : e;
    switch (e.keyCode) {
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
            playFire();
            break;
    }
    ;
    // handleKey(upKeyDown, downKeyDown, spaceKeyDown, leftKeyDown, rightKeyDown);
}

/**
 * 发射子弹(按空格键)
 */

function playFire() {
    if (spaceKeyDown) {
        if (fireAble) {
            bullet = new createjs.Sprite(spriteSheet, "bullet");
            bullet.x = player.x;
            bullet.y = player.y + (player.getBounds().width) / 2;
            bullet.rotation = -90;
            createjs.Tween.get(bullet).to({x: sWidth}, 4000, createjs.Ease.linear);
            fires.push(bullet);
            createjs.Sound.play("shot");
            stage.addChild(bullet);
        }
    }
}

/**
 * 开始游戏
 * 初始化生命值与分数
 */
function startGame() {
    lives = 5;
    score = 0;
    createjs.Ticker.setFPS(fps);
    createjs.Ticker.addEventListener('tick', function () {
        updateGame();//更新游戏元素，对相应事件做出响应
        checkGame();//检查游戏状态，在玩家无生命值或无任何敌人时结束游戏
        stage.update();//刷新舞台
    });
}

/**
 * 更新游戏
 * 飞机移动指令放在了这个模块而没有放在资源准备模块是因为采用Tick事件可以让飞机移动更流畅(设置了FPS)
 * 子弹放在了资源准备模块是出于子弹是否在Tick事件内并不会对其造成影响(小资源)
 */
function updateGame() {
    updateStar();//动态星空背景
    updateEnemy();//敌机碰撞检测，刷新敌机
    updateMsg();//计分板更新声明和分数
    updatePlayer();//根据按键做出相应
}

/**
 * 根据按键做出相应
 */
function updatePlayer() {
    if (runAble) {
        if (upKeyDown) {
            if (player.y > 0) {
                player.y -= speed;
            }
        }
        if (downKeyDown) {
            if (player.y < 600 - player.getBounds().width) {
                player.y += speed;
            }
        }
        if (leftKeyDown) {
            if (player.x > player.getBounds().height) {
                player.x -= speed;
            }
        }
        if (rightKeyDown) {
            if (player.x < 1000) {
                player.x += speed;
            }
        }
    }
}

/**
 * 让星空背景的星星移动，透明度越高飞得越快
 */
function updateStar() {
    if (isPerfect) {
        var i, star, xPos;
        for (i = 0; i < 200; i++) {
            star = starArr[i];
            xPos = star.x - 5 * star.alpha;
            if (xPos <= 0) {
                xPos = sWidth;
            }
            star.x = xPos;
        }
    }
}

/**
 * 碰撞检测
 * 检测一：检测战机是否与敌人(算分)发生碰撞并做出相应响应
 * 检测二：检测子弹是否与敌人发生碰撞(这里只统计敌机，也就是算分数的敌人，陨石和星球不算分数)
 * 检测三：检测战机是否与陨石和星球发生碰撞做出相应
 */
function updateEnemy() {
    var i, j, fireTemp, enemyScoreTemp;

    //检测战机是否与敌人发生碰撞(算分的)
    for (i = 0; i < enemyScore.length; i++) {
        var temp = enemyScore[i];
        var px = player.x - player.getBounds().height;
        var py = player.y;
        var pw = player.getBounds().height;
        var ph = player.getBounds().width;

        try {
            var ex = temp.x - temp.getBounds().height;
            var ey = temp.y;
            var ew = temp.getBounds().height;
            var eh = temp.getBounds().width;
        } catch (e) {
            continue;
        }

        if((ex>px&&ex-px<pw)&&(ey>py&&ey-py<ph)
            || (ex<px&&px-ex<ew)&&(ey<py&&py-ey<eh)
            || (ex<px&&px-ex<ew)&&(ey>py&&ey-py<ph)
            || (ex>px&&ex-px<pw)&&(ey<py&&py-ey<eh)){
            collision = true;
        }
        // try {
        //     collision = ndgmr.checkPixelCollision(player, temp);
        // } catch (e) {
        //     console.log(e);
        // }
        if (collision) {
            lives -= 1;
            stage.removeChild(player);
            var heroHit = new createjs.Sprite(spriteSheet, "heroHit");
            heroHit.x = player.x;
            heroHit.y = player.y;
            heroHit.rotation = 90;
            player.x = -9999;
            player.y = -9999;
            fireAble = false;
            runAble = false;
            //清除动画
            stage.removeChild(enemy[i]);
            heroHit.addEventListener('animationend', function (e) {
                stage.removeChild(e.target);
            });
            stage.addChild(heroHit);
            var setTime = setTimeout(function () {
                player = new createjs.Sprite(spriteSheet, "heroIdle");
                player.rotation = 90;
                player.x = 100;
                player.y = (sHeight / 2) - ((player.getBounds().width) / 2);
                stage.addChild(player);
                fireAble = true;
                runAble = true;
            }, 1000);
            collision = false;
            break;
        }

    }

    //检测战机是都与敌人发生碰撞(陨石和星球，不算分)
    for (i = 0; i < enemy.length; i++) {
        var temp = enemy[i];
        var px = player.x - player.getBounds().height;
        var py = player.y;
        var pw = player.getBounds().height;
        var ph = player.getBounds().width;

        try {
            var ex = temp.x;
            var ey = temp.y;
            var ew = temp.width;
            var eh = temp.height;
        } catch (e) {
            continue;
        }

        if((ex>px&&ex-px<pw)&&(ey>py&&ey-py<ph)
            || (ex<px&&px-ex<ew)&&(ey<py&&py-ey<eh)
            || (ex<px&&px-ex<ew)&&(ey>py&&ey-py<ph)
            || (ex>px&&ex-px<pw)&&(ey<py&&py-ey<eh)){
            collision = true;
        }
        // try {
        //     collision = ndgmr.checkPixelCollision(player, temp);
        // } catch (e) {
        //     console.log(e);
        // }
        if (collision) {
            lives -= 1;
            stage.removeChild(player);
            var heroHit = new createjs.Sprite(spriteSheet, "heroHit");
            heroHit.x = player.x;
            heroHit.y = player.y;
            heroHit.rotation = 90;
            player.x = -9999;
            player.y = -9999;
            fireAble = false;
            runAble = false;
            //清除动画
            stage.removeChild(enemy[i]);
            heroHit.addEventListener('animationend', function (e) {
                stage.removeChild(e.target);
            });
            stage.addChild(heroHit);
            var setTime = setTimeout(function () {
                player = new createjs.Sprite(spriteSheet, "heroIdle");
                player.rotation = 90;
                player.x = 100;
                player.y = (sHeight / 2) - ((player.getBounds().width) / 2);
                stage.addChild(player);
                fireAble = true;
                runAble = true;
            }, 1000);
            collision = false;
            break;
        }

    }

    //检测子弹是否碰到敌机(加分与撞毁)
    for (i = 0; i < fires.length; i++) {
        for (j = 0; j < enemyScore.length; j++) {
            fireTemp = fires[i];
            enemyScoreTemp = enemyScore[j];
            try {
                var fx = fireTemp.x;
                var fy = fireTemp.y;
                var ex = enemyScoreTemp.x;
                var ey = enemyScoreTemp.y;
                var ew = enemyScoreTemp.getBounds().width;
                var eh = enemyScoreTemp.getBounds().height;
            }
            catch (e) {
                break;
                //splice清除会造成fireTemp.property的空指针异常
                //splice已经清除内循环遍历对象的前提下，直接跳出内循环，提高效率；
            }
            ;


            if (fy < (ey + ew) && fy > ey && fx < ex && fx > (ex - eh)) {
                score += 10;
                fires.splice(i, 1);
                enemyScore.splice(j, 1);
                //j-=1;i-=1;fires.length-=1;enemyScore.length-=1;
                stage.removeChild(fireTemp);
                stage.removeChild(enemyScoreTemp);
                createjs.Sound.play("explosion");
                var exp1 = new createjs.Sprite(spriteSheet, "explosion");
                exp1.x = ex;
                exp1.y = ey;
                //爆炸动画完成清除动画
                exp1.addEventListener('animationend', function (e) {
                    stage.removeChild(e.target);
                });
                stage.addChild(exp1);

            }
        }
    }
}

/**
 * 计分板更新分数和剩余生命值
 */

function updateMsg() {
    scoreText.text = "score:" + score;
    livesText.text = "lives:" + lives;
}

/**
 * 检查游戏状态，在玩家无生命值或无任何敌人时结束游戏
 * 在敌机飞出舞台时移除舞台资源
 */
function checkGame() {
    if (lives <= 0 /*lives = 5*/) {
        createjs.Sound.stop();
        stage.removeAllChildren();

        //game over
        var exp1 = new createjs.Sprite(spriteSheet, "gameOver");
        exp1.x = 300;
        exp1.y = 250;
        //清除动画
        exp1.addEventListener('animationend', function (e) {
            stage.removeChild(e.target);
        });
        stage.addChild(exp1);

    }
    for(var i = 0;i<enemy.length;i++){
        if (enemy[i].x<0 || enemy[i].y>600){
            stage.removeChild(enemy[i]);
            enemy.splice(i,1);
        }
    }
}
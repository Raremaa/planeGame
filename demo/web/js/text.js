
    var stage = new createjs.StageGL("text");//舞台
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', function () {
        for (var i = 0; i < 9; i++) {
            console.log(i);
        }
        stage.update();
    });


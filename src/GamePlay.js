var AMOUNT_DIAMONDS = 30;
var AMOUNT_CATS = 30;
var REPLAY = () => {
    setTimeout(function(){
        window.location.reload()
    }, 3000)
}
GamePlayManager = {
    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;
        this.countSmile = -1;
    },
    preload: function () {
        game.load.image('background', 'assets/images/background.png');
        game.load.spritesheet('rickAndMorty', 'assets/images/rickAndMorty.png', 84, 156, 2);
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 4);
        game.load.image('explosion', 'assets/images/explosion.png');
        game.load.image('head', 'assets/images/head.png');
        game.load.image('cat1', 'assets/images/cat1.png');
        game.load.image('cat2', 'assets/images/cat2.png');
    },
    create: function () {
        game.add.sprite(0, 0, 'background');

        this.catArray = [];
        for (var i = 0; i < AMOUNT_CATS; i++) {
            var xcat = game.rnd.integerInRange(1, 1140);
            var ycat = game.rnd.integerInRange(600, 950);

            var cat = game.add.sprite(xcat, ycat, 'cat' + game.rnd.integerInRange(1, 2));
            cat.vel = 0.2 + game.rnd.frac() * 2;
            cat.alpha = 1;
            cat.scale.setTo(0.3);
            this.catArray[i] = cat;
        }

        this.head = game.add.sprite(500, 20, 'head');
        this.rickAndMorty = game.add.sprite(0, 0, "rickAndMorty");
        this.rickAndMorty.frame = 0;
        this.rickAndMorty.x = game.width / 2;
        this.rickAndMorty.y = game.height / 2;
        this.rickAndMorty.anchor.setTo(0.5);

        game.input.onDown.add(this.onTap, this);

        this.diamonds = [];
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            var diamond = game.add.sprite(100, 100, 'diamonds');
            diamond.frame = game.rnd.integerInRange(0, 3);
            diamond.scale.setTo(0.30 + game.rnd.frac());
            diamond.anchor.setTo(0.5);
            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);

            this.diamonds[i] = diamond;
            var rectCurrenDiamond = this.getBoundsDiamond(diamond);
            var rectrickAndMorty = this.getBoundsDiamond(this.rickAndMorty);
            while (this.isOverlapingOtherDiamond(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectrickAndMorty, rectCurrenDiamond)) {
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrenDiamond = this.getBoundsDiamond(diamond);
            }
        }

        this.explosionGroup = game.add.group();
        for (var i = 0; i < 10; i++) {
            this.explosion = this.explosionGroup.create(100, 100, 'explosion');
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }

        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }
   
        this.scoreText = game.add.text(game.width / 2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);
        this.totalTime = 10;
        this.timerText = game.add.text(1000, 40, this.totalTime + '', style);
        this.timerText.anchor.setTo(0.5);

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function () {
            if (this.flagFirstMouseDown) {
                this.totalTime--;
                this.timerText.text = this.totalTime + '';
                if (this.totalTime <= 0) {
                    game.time.events.remove(this.timerGameOver);
                    this.endGame = true;
                    this.showFinalMessage('Boo, not cool!')
                    REPLAY();
                }
            }
        }, this)


    },
    increaseScore: function () {

        this.countSmile = 0;
        this.rickAndMorty.frame = 1;

        this.currentScore += 100;
        this.scoreText.text = this.currentScore;

        this.amountDiamondsCaught += 1;
        if (this.amountDiamondsCaught >= AMOUNT_DIAMONDS) {
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage("I like what you've got, \n good job!");
            REPLAY();
        }
    },
    showFinalMessage: function (msg) {
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = "#000000";
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

        var bg = game.add.sprite(0, 0, bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: "bold 60pt Arial",
            fill: "#FFFFFF",
            align: "center"
        }

        this.textFieldFinalMsg = game.add.text(game.width / 2, game.height / 2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },
    onTap: function () {

        this.flagFirstMouseDown = true;
    },
    getBoundsDiamond: function (currentDiamond) {
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    isRectanglesOverlapping: function (rect1, rect2) {
        if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
            return false;
        }
        if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
            return false;
        }
        return true;
    },
    isOverlapingOtherDiamond: function (index, rect2) {
        for (var i = 0; i < index; i++) {
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if (this.isRectanglesOverlapping(rect1, rect2)) {
                return true;
            }
        }
        return false;
    },
    getBoundsrickAndMorty: function () {
        var x0 = this.rickAndMorty.x - Math.abs(this.rickAndMorty.width) / 4;
        var width = Math.abs(this.rickAndMorty.width) / 2;
        var y0 = this.rickAndMorty.y - this.rickAndMorty.height / 2;
        var height = this.rickAndMorty.height;

        return new Phaser.Rectangle(x0, y0, width, height);
    },
    render: function () {
        //game.debug.spriteBounds(this.rickAndMorty);
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            //game.debug.spriteBounds(this.diamonds[i]);
        }
    },
    update: function () {
        if (this.flagFirstMouseDown && !this.endGame) {

            for (var i = 0; i < AMOUNT_CATS; i++) {
                var cat = this.catArray[i];
                cat.y -= cat.vel;
                if (cat.y < -50) {
                    cat.y = 700;
                    cat.x = game.rnd.integerInRange(1, 1140);
                }
            }

            if (this.countSmile >= 0) {
                this.countSmile++;
                if (this.countSmile > 50) {
                    this.countSmile = -1;
                    this.rickAndMorty.frame = 0;
                }
            }

            this.head.x--;
            if (this.head.x < -300) {
                this.head.x = 1300;
            }

            /*this.fishes.x += 0.3;
            if (this.fishes.x > 1300) {
                this.fishes.x = -300;
            }*/

            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.rickAndMorty.x;
            var distY = pointerY - this.rickAndMorty.y;

            if (distX > 0) {
                this.rickAndMorty.scale.setTo(1, 1);
            } else {
                this.rickAndMorty.scale.setTo(-1, 1);
            }

            this.rickAndMorty.x += distX * 0.02;
            this.rickAndMorty.y += distY * 0.02;

            for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
                var rectrickAndMorty = this.getBoundsrickAndMorty();
                var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);


                if (this.diamonds[i].visible && this.isRectanglesOverlapping(rectrickAndMorty, rectDiamond)) {
                    this.increaseScore();
                    this.diamonds[i].visible = false;

                    var explosion = this.explosionGroup.getFirstDead();
                    if (explosion != null) {
                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        explosion.tweenAlpha.onComplete.add(function (currentTarget, currentTween) {
                            currentTarget.kill();
                        }, this);
                    }
                }


            }
        }
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");
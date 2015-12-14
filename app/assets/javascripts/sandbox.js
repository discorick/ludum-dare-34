$(window).on("blur focus", function (e) {
    var prevType = $(this).data("prevType");
    if (prevType != e.type) {
        switch (e.type) {
            case "blur":
                if (music)
                    music.pause();
                break;
            case "focus":
                if (music)
                    music.resume();
                break;
        }
    }
    $(this).data("prevType", e.type);
});

var music = null;

var windowWidth = 414;
var windowHeight = 736;
var cameraPos = null;
var cameraLerp = 0.1;

var gameover = false;
var gameend = false;

var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    game.load.image('bg', 'assets/bg.png');
    game.load.image('grass', 'assets/grass.png');
    game.load.spritesheet('branch', 'assets/branch.png', 16, 16, 2);
    game.load.spritesheet('branch-flip', 'assets/branch-flip.png', 16, 16, 2);
    game.load.spritesheet('wind', 'assets/wind.png', 414, 80, 20);
    game.load.spritesheet('wind-flip', 'assets/wind-flip.png', 414, 80, 20);
    game.load.spritesheet('sun', 'assets/dizzy_sun.png', 80, 80, 24);
    game.load.spritesheet('tree', 'assets/tree-strip.png', 32, 32);
    game.load.audio('bgmusic', 'assets/bgmusic01.ogg');
}

function render() {
    //game.debug.geom(left, '#0fffff');
}

var createTrunkEvent = null;
var createWindEvent = null;

function create() {
    game.stage.backgroundColor = 0xC0FFEE;
    game.world.setBounds(0, 0, windowWidth, 10400);
    game.camera.setPosition(0, game.world.height);
    cameraPos = new Phaser.Point(0, game.world.height);

    game.add.sprite(0, 0, 'bg');
    var grass = game.add.tileSprite(0, game.world.height - 64, game.world.width, 64, 'grass');
    grass.anchor.setTo(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    createSun();

    music = game.add.audio('bgmusic', 1, true);
    music.loop = true;
    music.play();

    createRoot();
    createTrunkEvent = game.time.events.loop(Phaser.Timer.SECOND / 2, createTrunk, this);
    createWindEvent = game.time.events.loop(Phaser.Timer.SECOND, createWind, this);
}

var count = 0;
var root = null;
var trunks = null;
var lastTrunk = null;
var trunkZoom = 1.5;
var trunkSize = 32 * trunkZoom;

function createRoot() {
    root = game.add.sprite(game.world.width / 2, game.world.height - trunkSize / 2, 'tree', 0);
    root.anchor.setTo(0.5, 1);
    root.scale.setTo(trunkZoom, trunkZoom);
    count++;
}

var maxBias = trunkSize / 2;

function createTrunk() {
    if (!trunks) {
        trunks = game.add.group();

        var group = game.add.group();
        var trunk = game.add.sprite(root.x, root.y - trunkSize, 'tree', game.rnd.integerInRange(0, 5));
        trunk.anchor.setTo(0.5, 1);
        game.add.tween(trunk.scale).to({
            x: 1.5,
            y: 1.5
        }, 200, Phaser.Easing.Bounce.Out, true);
        group.add(trunk);
    } else {
        var group = game.add.group();
        var prop = game.rnd.integerInRange(-trunkSize / 8, trunkSize / 8);
        var bias = ((sun.x + sun.width / 2) - lastTrunk.x);
        bias = Math.abs(bias) > maxBias ? (Math.sign(bias) * maxBias) : bias;
        var trunk = game.add.sprite(lastTrunk.x + bias + prop, lastTrunk.y - trunkSize, 'tree', game.rnd.integerInRange(0, 5));
        trunk.anchor.setTo(0.5, 1);
        game.add.tween(trunk.scale).to({
            x: 1.5,
            y: 1.5
        }, 200, Phaser.Easing.Bounce.Out, true);
        group.add(trunk);
    }

    if (game.rnd.integerInRange(0, 2) == 0) {
        var branch = createBranch(trunk, count % 2 == 0);
        group.add(branch);
    }

    trunks.add(group);
    lastTrunk = trunk;
    count++;
}

function createBranch(trunk, inverse) {
    var delay = game.rnd.integerInRange(200, 2000);
    if (!inverse) {
        var branch = game.add.sprite(trunk.x, trunk.y + trunk.height / 2, 'branch');
        branch.anchor.setTo(0, 1);
    } else {
        var branch = game.add.sprite(trunk.x, trunk.y + trunk.height / 2, 'branch-flip');
        branch.anchor.setTo(1, 1);
    }
    branch.scale.setTo(0, 0);
    setTimeout(function () {
        var tween = game.add.tween(branch.scale).to({
            x: 2.0,
            y: 2.0
        }, 100, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(function () {
            branch.animations.add('grow');
            branch.animations.play('grow', 4, false);
        }, this);
    }, delay);
    return branch;
}

function Camerafollow(target, offsetX, offsetY) {
    cameraPos.x += (target.x - cameraPos.x + offsetX) * cameraLerp; // smoothly adjust the x position
    cameraPos.y += (target.y - cameraPos.y + offsetY) * cameraLerp; // smoothly adjust the y position
    game.camera.focusOnXY(cameraPos.x, cameraPos.y); // apply smoothed virtual positions to actual camera
}

function update() {
    if (lastTrunk)
        Camerafollow(lastTrunk, 0, 100);

    if (!gameover && !gameend) {
        updateSun();

        if (trunks)
            shakeTree();

        if (trunks)
            checkTrunkOutofBound();

        if (trunks)
            checkTrunkReachtop();
    }

    if (cursors.left.isDown) {
        if (sun.x > -sun.width / 2) {
            sun_shadow.x -= 6;
            sun.x -= 6;
        }
    } else if (cursors.right.isDown) {
        if (sun.x < windowWidth - sun.width / 2) {
            sun_shadow.x += 6;
            sun.x += 6;
        }
    }
}

var wind = null;
var windPower = 50;
var power = 0;
var maxCum = 30;

function createWind() {
    if (game.rnd.integerInRange(0, 1) == 0 && !wind) {
        var random = game.rnd.integerInRange(-windPower, windPower) / 10;
        setTimeout(function () {
            power = random;
        }, 2000);
        if (random != 0) {
            if (random > 0) {
                wind = game.add.sprite(windowWidth / 2, game.camera.position.y, 'wind-flip');
            } else {
                wind = game.add.sprite(windowWidth / 2, game.camera.position.y, 'wind');
            }
            var scale = 0.5 + Math.abs(random) / 10;
            wind.anchor.setTo(0.5, 0.5);
            wind.scale.setTo(scale, scale);
            wind.animations.add('blow');
            wind.animations.play('blow', 5, false, true);
            wind.animations.currentAnim.onComplete.add(function () {
                wind = null;
            }, this);
        }
    }
}

function shakeTree() {
    for (var i = 0, len = trunks.children.length; i < len; i++) {
        var trunk = trunks.children[i].children[0];
        var count = -1;
        if (trunk.y < game.camera.position.y + windowHeight / 2 + trunkSize) {
            count++;
        }
        if (trunk.y < game.camera.position.y + windowHeight / 2 + trunkSize) {
            var newX = trunk.x + (power * (i - count > maxCum ? maxCum : i - count));
            //trunk.x += (newX - trunk.x) * 0.1;
            for (var k = 0; k < trunks.children[i].length; k++) {
                var child = trunks.children[i].children[k];
                child.x += (newX - child.x) * 0.1;
            }
        }
    }

    //console.log(power);

    if (Math.abs(power) >= 0.001)
        power /= 1.1;
}

function removeEvents() {
    game.time.events.remove(createTrunkEvent);
    game.time.events.remove(createWindEvent);
}

function checkTrunkReachtop() {
    if (lastTrunk.y < 200) {
        removeEvents();
        gameend = true;
        console.log('end');
    }
}

function checkTrunkOutofBound() {
    for (var i = 0, len = trunks.children.length; i < len; i++) {
        var trunk = trunks.children[i].children[0];
        if (((trunk.x - trunk.width / 2) < 0) || (trunk.x + trunk.width / 2) > windowWidth) {
            game.physics.startSystem(Phaser.Physics.P2JS);
            game.physics.p2.gravity.y = 980;
            for (var j = 0; j < len; j++) {
                for (var k = 0; k < trunks.children[j].length; k++) {
                    game.physics.p2.enable(trunks.children[j].children[k], false);
                }
            }
            removeEvents();
            gameover = true;
            console.log('bye');
            break;
        }
    }
}

function updateSun() {
    sun.y = sun_shadow.y = game.camera.position.y - windowHeight / 2;
    if (wind)
        wind.y = game.camera.position.y;
}

function createSun() {
    sun_shadow = game.add.sprite(167, 5, 'sun');
    sun_shadow.animations.add('whirl');
    sun_shadow.animations.play('whirl', 20, true);
    sun_shadow.anchor.set(-0.02);
    sun_shadow.tint = 0x000000;
    sun_shadow.alpha = 0.6;

    sun = game.add.sprite(167, 5, 'sun');
    sun.animations.add('whirl');
    sun.animations.play('whirl', 20, true);
}

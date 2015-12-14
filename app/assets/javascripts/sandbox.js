var windowWidth = 414;
var windowHeight = 736;
var cameraPos = null;
var cameraLerp = 0.1;

var gameover = false;

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
    game.load.image('bud-1', 'assets/bud-1.png');
    game.load.image('branch-1', 'assets/branch-1.png');
    game.load.spritesheet('sun', 'assets/dizzy_sun.png', 80, 80, 24);
    game.load.spritesheet('tree', 'assets/tree-strip.png', 32, 32);
    game.load.audio('bgmusic', 'assets/bgmusic01.ogg');
}

function render() {
    //game.debug.geom(left, '#0fffff');
}

var createTrunkEvent = null;

function create() {
    game.stage.backgroundColor = 0xC0FFEE;
    game.world.setBounds(0, 0, windowWidth, 7160);
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
        
        var trunk = game.add.sprite(root.x, root.y - trunkSize, 'tree', game.rnd.integerInRange(0, 5));
        trunk.anchor.setTo(0.5, 1);
        game.add.tween(trunk.scale).to({
            x: 1.5,
            y: 1.5
        }, 200, Phaser.Easing.Bounce.Out, true);
    } else {
        var bias = ((sun.x + sun.width / 2) - lastTrunk.x);
        bias = Math.abs(bias) > maxBias ? Math.sign(bias) * maxBias : bias;
        var trunk = game.add.sprite(lastTrunk.x + bias, lastTrunk.y - trunkSize, 'tree', game.rnd.integerInRange(0, 5));
        trunk.anchor.setTo(0.5, 1);
        game.add.tween(trunk.scale).to({
            x: 1.5,
            y: 1.5
        }, 200, Phaser.Easing.Bounce.Out, true);
    }
    trunks.add(trunk);
    lastTrunk = trunk;
    count++;
}

function Camerafollow(target, offsetX, offsetY) {
    cameraPos.x += (target.x - cameraPos.x + offsetX) * cameraLerp; // smoothly adjust the x position
    cameraPos.y += (target.y - cameraPos.y + offsetY) * cameraLerp; // smoothly adjust the y position
    game.camera.focusOnXY(cameraPos.x, cameraPos.y); // apply smoothed virtual positions to actual camera
}

function update() {
    if (lastTrunk)
        Camerafollow(lastTrunk, 0, 100);
    
    if (!gameover) {
        updateSun();

        if (trunks)
            checkTrunkOutofBound();
        
        if (trunks)
            shakeTree();
    }

    if (cursors.left.isDown) {
        if (sun.x > 10) {
            sun_shadow.x -= 6;
            sun.x -= 6;
        }
    } else if (cursors.right.isDown) {
        if (sun.x < 324) {
            sun_shadow.x += 6;
            sun.x += 6;
        }
    }
}


var windPower = 1;
var power = 0;
var maxCum = 30;

function shakeTree() {
    if (game.time.now % 9 < 2)
        power = game.rnd.integerInRange(-windPower, windPower);
    
    for (var i = 0, len = trunks.children.length; i < len; i++) {
        var trunk = trunks.children[i];
        if(trunk.y < game.camera.position.y + windowHeight / 2 + trunkSize) {
            var newX = trunk.x + (power * (i > maxCum ? maxCum : i));
            trunk.x += (newX - trunk.x) * 0.1;
        }
    }
}

function checkTrunkOutofBound() {
    for (var i = 0, len = trunks.children.length; i < len; i++) {
        var trunk = trunks.children[i];
        if (((trunk.x - trunk.width / 2) < 0) || (trunk.x + trunk.width / 2) > windowWidth) {
            console.log('bye');
            game.physics.startSystem(Phaser.Physics.P2JS);
            game.physics.p2.gravity.y = 980;
            for (var j = 0; j < len; j++) {
                game.physics.p2.enable(trunks.children[j], false);
            }
            game.time.events.remove(createTrunkEvent);
            gameover = true;
            break;
        }
    }
}

function updateSun() {
    sun.y = sun_shadow.y = game.camera.position.y - windowHeight / 2;
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

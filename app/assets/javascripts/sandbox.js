var windowWidth = 414;
var windowHeight = 736;
var cameraPos = null;
var cameraLerp = 0.1;

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

    game.load.spritesheet('sun', 'assets/dizzy_sun.png', 80, 80, 24);
    game.load.spritesheet('tree', 'assets/tree-strip.png', 16, 16);
    game.load.audio('bgmusic', 'assets/bgmusic01.ogg');
}

function render() {
    //game.debug.geom(left, '#0fffff');
}

function create() {
    game.stage.backgroundColor = 0xC0FFEE;
    game.world.setBounds(0, 0, windowWidth, windowHeight * 10);
    game.camera.setPosition(0, game.world.height);
    cameraPos = new Phaser.Point(0, game.world.height);

    cursors = game.input.keyboard.createCursorKeys();
    createSun();

    music = game.add.audio('bgmusic', 1, true);
    music.loop = true;
    music.play();

    createRoot();
    game.time.events.loop(Phaser.Timer.SECOND, createTrunk, this);
}

var count = 0;
var root = null;
var trunks = null;
var lastTrunk = null;

function createRoot() {
    root = game.add.sprite(game.world.width / 2, game.world.height - 32, 'tree', 0);
    root.anchor.setTo(0.5, 1);
    root.scale.setTo(2, 2);
    count++;
}

function createTrunk() {
    if(!trunks) {
        trunks = game.add.group();
        var trunk = game.add.sprite(root.x, root.y - 32, 'tree', game.rnd.integerInRange(0, 5));
        trunk.anchor.setTo(0.5, 1);
        game.add.tween(trunk.scale).to({x: 2.0, y: 2.0}, 200, Phaser.Easing.Bounce.Out, true);
    } else {
        var trunk = game.add.sprite(lastTrunk.x, lastTrunk.y - 32, 'tree', game.rnd.integerInRange(0, 5));
        trunk.anchor.setTo(0.5, 1);
        game.add.tween(trunk.scale).to({x: 2.0, y: 2.0}, 200, Phaser.Easing.Bounce.Out, true);
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
    if(lastTrunk)
        Camerafollow(lastTrunk, 0, 100);
    
    updateSun();
    
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
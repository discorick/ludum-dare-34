var game = new Phaser.Game(414, 736, Phaser.AUTO, 'game', {
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

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
//    game.physics.p2.gravity.y = 98;

    game.load.spritesheet('sun', 'assets/dizzy_sun.png', 80, 80, 24);
    game.load.spritesheet('tree', 'assets/tree-strip.png', 16, 16);
    game.load.audio('bgmusic', 'assets/bgmusic01.ogg');
}

var worldThick = 50;
var left = null;
var right = null;
var topFloor = null;
var bottomFloor = null;
var worldCollisionGroup = null;
var trunkCollisionGroup = null;

function createWorld() {
    left = game.add.graphics(-worldThick / 2, game.stage.height / 2);
    game.physics.p2.enable(left);
    left.body.setRectangle(worldThick, game.stage.height);
    left.body.static = true;
    left.key = "world";

    right = game.add.graphics(game.stage.width, game.stage.height / 2);
    game.physics.p2.enable(right);
    right.body.setRectangle(worldThick, game.stage.height);
    right.body.static = true;
    right.key = "world";

    topFloor = game.add.graphics(game.stage.width / 2, -worldThick / 2);
    game.physics.p2.enable(topFloor);
    topFloor.body.setRectangle(game.stage.width, worldThick);
    topFloor.body.static = true;
    topFloor.key = "world";

    bottomFloor = game.add.graphics(game.stage.width / 2, game.stage.height);
    game.physics.p2.enable(bottomFloor);
    bottomFloor.body.setRectangle(game.stage.width, worldThick);
    bottomFloor.body.static = true;
    bottomFloor.key = "world";

    left.body.setCollisionGroup(worldCollisionGroup);
    right.body.setCollisionGroup(worldCollisionGroup);
    topFloor.body.setCollisionGroup(worldCollisionGroup);
    bottomFloor.body.setCollisionGroup(worldCollisionGroup);

    left.body.collides([trunkCollisionGroup, worldCollisionGroup]);
    right.body.collides([trunkCollisionGroup, worldCollisionGroup]);
    topFloor.body.collides([trunkCollisionGroup, worldCollisionGroup]);
    bottomFloor.body.collides([trunkCollisionGroup, worldCollisionGroup]);
}

function render() {
    //game.debug.geom(left, '#0fffff');
}

var worldMaterial = null;
var trunkMaterial = null;

function create() {
    game.stage.backgroundColor = 0xC0FFEE;

    worldMaterial = game.physics.p2.createMaterial('worldMaterial');
    trunkMaterial = game.physics.p2.createMaterial('trunkMaterial');

    trunkCollisionGroup = game.physics.p2.createCollisionGroup();
    worldCollisionGroup = game.physics.p2.createCollisionGroup();

    game.physics.p2.updateBoundsCollisionGroup();

    createWorld();
    createSun();
    //  Length, xAnchor, yAnchor
    createRope(20, 200, game.stage.height - 100);

    game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

    var groundWorldCM = game.physics.p2.createContactMaterial(trunkMaterial, worldMaterial, {
        friction: 0.1
    });
    var groundTrunkCM = game.physics.p2.createContactMaterial(trunkMaterial, trunkMaterial, {
        friction: 0.6
    });

    cursors = game.input.keyboard.createCursorKeys();

    music = game.add.audio('bgmusic', 1, true);
    music.loop = true;
    music.play();

    game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);
}

function updateCounter() {
    game.physics.p2.gravity.x = game.rnd.integerInRange(-10, 10);
}

function update() {
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

function createRope(length, xAnchor, yAnchor) {

    var lastRect;
    var height = 32; //  Height for the physics body - your image height is 8px
    var width = 32; //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    var maxForce = 200; //  The force that holds the rectangles together.

    for (var i = 0; i <= length; i++) {
        var x = xAnchor; //  All rects are on the same x position
        var y = yAnchor - (i * height); //  Every new rect is positioned below the last
        
        newRect = game.add.sprite(x, y, 'tree', game.rnd.integerInRange(0, 5));
        newRect.scale.setTo(2, 2);

        //  Enable physicsbody
        game.physics.p2.enable(newRect, true);
        
        //newRect.body.damping = 0;
        
        //newRect.body.angularDamping = 0;

        //  Set custom rectangle
        newRect.body.setRectangle(width, height);

        newRect.body.setMaterial(trunkMaterial);

        newRect.body.setCollisionGroup(trunkCollisionGroup);

        newRect.body.collides([trunkCollisionGroup, worldCollisionGroup], clearAllConstraints, this);

        if (i === 0) {
            newRect.body.static = true;
        } else {
            newRect.body.mass = 0.1 * (length / i);
//            newRect.body.mass *= newRect.body.mass;
        }

        if (i === length) {
            //game.physics.p2.createSpring(newRect, sun, 200, 10, 0.01);
//            newRect.body.static = true;
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect) {
            game.physics.p2.createRevoluteConstraint(newRect, [-width / 2, height / 2], lastRect, [-width / 2, -height / 2], maxForce);
            //game.physics.p2.createRevoluteConstraint(newRect, [0, height / 2], lastRect, [0, -height / 2], maxForce * (length / i));
            game.physics.p2.createRevoluteConstraint(newRect, [width / 2, height / 2], lastRect, [width / 2, -height / 2], maxForce);
        }
        lastRect = newRect;
    }
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

function clearAllConstraints(body1, body2) {
    if (body2.sprite.key == "world") {
        game.physics.p2.gravity.y = 980;
        var allConstraints = game.physics.p2.world.constraints.splice(0, game.physics.p2.world.constraints.length);
        if (allConstraints.length > 0) {
            for (i = 0; i <= allConstraints.length; i++) {
                game.physics.p2.removeConstraint(allConstraints[i]);
            }
        }
    }
}

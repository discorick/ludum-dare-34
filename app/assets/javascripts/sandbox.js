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
    game.physics.p2.gravity.y = 1200;

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('tree', 'assets/tree-strip.png', 16, 16);
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
    game.physics.p2.enable(left, true);
    left.body.setRectangle(worldThick, game.stage.height);
    left.body.static = true;
    left.key = "world";

    right = game.add.graphics(game.stage.width - worldThick / 2, game.stage.height / 2);
    game.physics.p2.enable(right, true);
    right.body.setRectangle(worldThick, game.stage.height);
    right.body.static = true;
    right.key = "world";

    topFloor = game.add.graphics(game.stage.width / 2, -worldThick / 2);
    game.physics.p2.enable(topFloor, true);
    topFloor.body.setRectangle(game.stage.width, worldThick);
    topFloor.body.static = true;
    topFloor.key = "topFlworldoor";

    bottomFloor = game.add.graphics(game.stage.width / 2, game.stage.height - worldThick / 2);
    game.physics.p2.enable(bottomFloor, true);
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

    //star = game.add.sprite(200, 200, 'star');
    //game.physics.p2.enable(star, true);

    //  Length, xAnchor, yAnchor
    createRope(20, 200, game.stage.height - 10);

    createWorld();

    game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

    var groundWorldCM = game.physics.p2.createContactMaterial(trunkMaterial, worldMaterial, {
        friction: 0.1
    });
    var groundTrunkCM = game.physics.p2.createContactMaterial(trunkMaterial, trunkMaterial, {
        friction: 0.6
    });
}

function update() {

}

function createRope(length, xAnchor, yAnchor) {

    var lastRect;
    var height = 32; //  Height for the physics body - your image height is 8px
    var width = 32; //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    var maxForce = 2000; //  The force that holds the rectangles together.

    for (var i = 0; i <= length; i++) {
        var x = xAnchor; //  All rects are on the same x position
        var y = yAnchor - (i * height); //  Every new rect is positioned below the last

        if (i % 2 === 0) {
            //  Add sprite (and switch frame every 2nd time)
            newRect = game.add.sprite(x, y, 'tree', game.rnd.integerInRange(0, 5));
            newRect.scale.setTo(2, 2);
        } else {
            newRect = game.add.sprite(x, y, 'tree', game.rnd.integerInRange(0, 5));
            newRect.scale.setTo(2, 2);
            lastRect.bringToTop();
        }

        //  Enable physicsbody
        game.physics.p2.enable(newRect, false);

        //  Set custom rectangle
        newRect.body.setRectangle(width, height);

        newRect.body.setMaterial(trunkMaterial);

        newRect.body.setCollisionGroup(trunkCollisionGroup);

        //newRect.body.collides([trunkCollisionGroup, worldCollisionGroup]);

        if (i === 0) {
            newRect.body.static = true;
        } else {
            //  Anchor the first one created
            //            newRect.body.velocity.x = 400; //  Give it a push :) just for fun
            newRect.body.mass = length / i; //  Reduce mass for evey rope element

            newRect.body.collides([trunkCollisionGroup, worldCollisionGroup], clearAllConstraints, this);
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect) {
            game.physics.p2.createRevoluteConstraint(newRect, [0, 15], lastRect, [0, -15], maxForce);
        }

        lastRect = newRect;

    }
}

function clearAllConstraints(body1, body2) {
    if (body2.sprite.key == "world") {
        var allConstraints = game.physics.p2.world.constraints.splice(0, game.physics.p2.world.constraints.length);
        if (allConstraints.length > 0) {
            for (i = 0; i <= allConstraints.length; i++) {
                game.physics.p2.removeConstraint(allConstraints[i]);
            }
        }
    }
}

var game = new Phaser.Game(414, 736, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();
    
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1200;

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('sun', 'assets/dizzy_sun.png', 80, 80, 24);
}



function create() {
    game.stage.backgroundColor = 0xbada55;
    
    star = game.add.sprite(200, 200, 'star');
    game.physics.p2.enable(star, true);
    
    //  Length, xAnchor, yAnchor
    createRope(40, 400, 64);
    createSun();

    cursors = game.input.keyboard.createCursorKeys();

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
    var height = 20;        //  Height for the physics body - your image height is 8px
    var width = 16;         //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    var maxForce = 20000;   //  The force that holds the rectangles together.

    for (var i = 0; i <= length; i++)
    {
        var x = xAnchor;                    //  All rects are on the same x position
        var y = yAnchor + (i * height);     //  Every new rect is positioned below the last

        if (i % 2 === 0)
        {
            //  Add sprite (and switch frame every 2nd time)
            newRect = game.add.sprite(x, y, 'star', 1);
        }   
        else
        {
            newRect = game.add.sprite(x, y, 'star', 0);
            lastRect.bringToTop();
        }

        //  Enable physicsbody
        game.physics.p2.enable(newRect, true);

        //  Set custom rectangle
        newRect.body.setRectangle(width, height);

        if (i === 0)
        {
            newRect.body.static = true;
        }
        else
        {  
            //  Anchor the first one created
            newRect.body.velocity.x = 400;      //  Give it a push :) just for fun
            newRect.body.mass = length / i;     //  Reduce mass for evey rope element
        }

        //  After the first rectangle is created we can add the constraint
        if (lastRect)
        {
            game.physics.p2.createRevoluteConstraint(newRect, [0, -10], lastRect, [0, 10], maxForce);
        }

        lastRect = newRect;

    }

}

function createSun() {
    sun_shadow = game.add.sprite(167, 0, 'sun');
    sun_shadow.animations.add('whirl');
    sun_shadow.animations.play('whirl', 20, true);
    sun_shadow.anchor.set(-0.02);
    sun_shadow.tint = 0x000000;
    sun_shadow.alpha = 0.6;

    sun = game.add.sprite(167, 0, 'sun');
    sun.animations.add('whirl');
    sun.animations.play('whirl', 20, true);
}

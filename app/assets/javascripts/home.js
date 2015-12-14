var game = new Phaser.Game(414, 736, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.refresh();

  game.load.spritesheet('start_btn', 'assets/start_btn.png', 200, 120);
  game.load.spritesheet('sun', 'assets/dizzy_sun.png', 80, 80, 24);
  game.load.spritesheet('gameover', 'assets/gameover.png', 414, 260, 16);
  game.load.image('tree', 'assets/tree-strip.png');
  game.load.image('grass1', 'assets/grass1.png');
  game.load.image('grass2', 'assets/grass2.png');
  game.load.audio('bgmusic', 'assets/bgmusic01.ogg');
}

function create() {
  game.stage.backgroundColor = 0xc0ffee;
  drawGrass();

  createSun();

  cursors = game.input.keyboard.createCursorKeys();

  music = game.add.audio('bgmusic',1,true);
  music.loop = true;
  music.play();

  button = game.add.button(game.world.centerX - 100, 300, 'start_btn', gameStart, this, 1, 0, 2);

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

function gameStart() {
  // game start here
}

function drawGrass(){
  var tiles_across = 14;
  var tiles_up = 3;

  var x_max = 414;
  var y_max = 736 - 32;

  for(var up=0;up < tiles_up; up++){
    var y = y_max - (up * 32);

    for(var across=0;across < tiles_across; across++){
      var even = (across % 2 === 0) ? true : false;
      var grass = even ? "grass1" : "grass2";

      var x = x_max - (across * 32);
      var sprite = game.add.sprite(x, y, grass);
      sprite.scale.setTo(2, 2);
    }
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

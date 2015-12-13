var game = new Phaser.Game(414, 736, Phaser.AUTO, 'swindy-tree', { preload: preload, create: create, update: update });

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.scale.refresh();

  game.load.image('tree', 'assets/tree-strip.png');
  game.load.image('grass1', 'assets/grass1.png');
  game.load.image('grass2', 'assets/grass2.png');
}

function create() {
  game.stage.backgroundColor = 0xbada55;
  drawGrass();
}

function update() {

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

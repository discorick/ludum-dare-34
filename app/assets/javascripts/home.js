var game = new Phaser.Game(1024, 768, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('tree', 'assets/tree-01.png');
  game.load.image('tree', 'assets/tree-02.png');
  game.load.image('tree', 'assets/tree-bite-01.png');
  game.load.image('tree', 'assets/tree-bite-02.png');
}

function create() {

}

function update() {

}

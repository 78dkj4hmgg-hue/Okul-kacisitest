// Basic Endless Runner Core (Phaser 3)
// Step 1: Movement, lanes, jump, obstacles, score, game over

let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: "#87CEEB",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let game = new Phaser.Game(config);

let player;
let ground;
let obstacles;
let lanes = [90, 180, 270];
let currentLane = 1;
let score = 0;
let scoreText;
let isGameOver = false;

function preload() {
  // Basit şekillerle geçici sprite’lar
  this.load.image("player", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAfCAYAAACn8a6AAAAACXBIWXMAAAsTAAALEwEAmpwYAAAANElEQVR4nGP8//8/AyUYTFhgwAIYGBgY/jMwMDCQkJCQ4D8SDAwMDAwGAB7uBv1cY3+EAAAAAElFTkSuQmCC");
  this.load.image("obstacle", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAKUlEQVR4AWP4//8/AyUYTFhgwAIYGBgY/jMwMDCQkJAAAJ2RBz0lJx8kAAAAAElFTkSuQmCC");
}

function create() {
  // Zemin
  ground = this.add.rectangle(180, 620, 360, 40, 0x2ecc71);
  this.physics.add.existing(ground, true);

  // Oyuncu
  player = this.physics.add.sprite(lanes[currentLane], 520, "player");
  player.setCollideWorldBounds(true);

  this.physics.add.collider(player, ground);

  // Engeller
  obstacles = this.physics.add.group();

  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, obstacles, hitObstacle, null, this);

  // Skor
  scoreText = this.add.text(10, 10, "Skor: 0", {
    fontSize: "18px",
    fill: "#000"
  });

  // Engel üretimi
  this.time.addEvent({
    delay: 1200,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });

  // Dokunma kontrolleri (swipe)
  let startX = 0;
  let startY = 0;

  this.input.on("pointerdown", (p) => {
    startX = p.x;
    startY = p.y;
  });

  this.input.on("pointerup", (p) => {
    let dx = p.x - startX;
    let dy = p.y - startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) moveRight();
      else if (dx < -30) moveLeft();
    } else {
      if (dy < -30) jump();
    }
  });
}

function update() {
  if (isGameOver) return;

  score++;
  scoreText.setText("Skor: " + score);

  obstacles.children.iterate((obs) => {
    if (obs && obs.y > 700) obs.destroy();
  });
}

function moveLeft() {
  if (currentLane > 0) {
    currentLane--;
    player.x = lanes[currentLane];
  }
}

function moveRight() {
  if (currentLane < lanes.length - 1) {
    currentLane++;
    player.x = lanes[currentLane];
  }
}

function jump() {
  if (player.body.touching.down) {
    player.setVelocityY(-600);
  }
}

function spawnObstacle() {
  if (isGameOver) return;

  let lane = Phaser.Math.Between(0, lanes.length - 1);
  let obs = obstacles.create(lanes[lane], -20, "obstacle");
  obs.setVelocityY(300);
  obs.setImmovable(true);
}

function hitObstacle() {
  isGameOver = true;
  player.setTint(0xff0000);
  this.add.text(80, 300, "GAME OVER", {
    fontSize: "32px",
    fill: "#ff0000"
  });
}
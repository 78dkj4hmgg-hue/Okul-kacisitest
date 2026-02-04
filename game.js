// game.js

// === CONFIGURATION ===
const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#87CEEB', // açık gökyüzü
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1200 }, debug: false }
  },
  scene: [MenuScene, GameScene, GameOverScene]
};

let selectedCharacter = 'Ali'; // başlangıç karakteri
let totalNotes = 0;

const game = new Phaser.Game(config);

// === MENU SCENE ===
function MenuScene() { Phaser.Scene.call(this, { key: 'MenuScene' }); }
MenuScene.prototype = Object.create(Phaser.Scene.prototype);

MenuScene.prototype.preload = function() {
  // Placeholder: spritelar veya arka plan görselleri yüklenebilir
};

MenuScene.prototype.create = function() {
  // Hareketli arka plan (basit bulut simülasyonu)
  this.clouds = [];
  for(let i=0; i<5; i++){
    const cloud = this.add.rectangle(Phaser.Math.Between(0,360), Phaser.Math.Between(0,200), 80, 30, 0xffffff, 0.6);
    cloud.speed = Phaser.Math.Between(10,30);
    this.clouds.push(cloud);
  }

  // Başlık
  this.add.text(180, 80, 'OKUL KAÇIŞI', { fontSize: '32px', color:'#000', fontStyle:'bold' }).setOrigin(0.5);

  // Karakterler ve kilit durumu
  this.characters = ['Ali','Talib','Yusuf','Elekber'];
  this.charIndex = 0;

  this.charText = this.add.text(180, 200, this.characters[this.charIndex], { fontSize:'28px', color:'#000' }).setOrigin(0.5);

  this.notesText = this.add.text(180, 250, `Not: ${totalNotes}`, { fontSize:'20px', color:'#000' }).setOrigin(0.5);

  // Instagram bonus butonu
  this.igBtn = this.add.text(180, 300, '📸 @__cab666 → +100', { fontSize:'16px', backgroundColor:'#E1306C', color:'#fff', padding:{x:10,y:5} }).setOrigin(0.5).setInteractive();
  this.igBtn.on('pointerdown', ()=>{
    totalNotes +=100;
    this.notesText.setText(`Not: ${totalNotes}`);
  });

  // Karakter değiştirme okları
  this.leftArrow = this.add.text(50, 200, '<', { fontSize:'32px', color:'#000' }).setOrigin(0.5).setInteractive();
  this.rightArrow = this.add.text(310, 200, '>', { fontSize:'32px', color:'#000' }).setOrigin(0.5).setInteractive();

  this.leftArrow.on('pointerdown', ()=>{
    this.charIndex = (this.charIndex -1 + this.characters.length) % this.characters.length;
    this.charText.setText(this.characters[this.charIndex]);
    selectedCharacter = this.characters[this.charIndex];
  });
  this.rightArrow.on('pointerdown', ()=>{
    this.charIndex = (this.charIndex +1) % this.characters.length;
    this.charText.setText(this.characters[this.charIndex]);
    selectedCharacter = this.characters[this.charIndex];
  });

  // Başla butonu
  this.startBtn = this.add.text(180, 400, '▶ BAŞLA', { fontSize:'28px', backgroundColor:'#000', color:'#fff', padding:{x:20,y:10} }).setOrigin(0.5).setInteractive();
  this.startBtn.on('pointerdown', ()=>{
    this.scene.start('GameScene');
  });
};

MenuScene.prototype.update = function(time, delta){
  // Bulutları hareket ettir
  for(let cloud of this.clouds){
    cloud.y += cloud.speed * delta/1000;
    if(cloud.y > 640) cloud.y = -30;
  }
};

// === GAME SCENE ===
function GameScene() { Phaser.Scene.call(this, { key:'GameScene'});}
GameScene.prototype = Object.create(Phaser.Scene.prototype);

GameScene.prototype.create = function(){
  this.score = 0;
  this.notesCollected = 0;

  // Zemin
  this.ground = this.add.rectangle(180, 630, 360, 20, 0x228B22);
  this.physics.add.existing(this.ground, true);

  // Oyuncu
  this.player = this.add.rectangle(180, 580, 40, 40, 0x000000);
  this.physics.add.existing(this.player);
  this.player.body.setCollideWorldBounds(true);
  this.physics.add.collider(this.player, this.ground);

  // Engeller
  this.obstacles = this.physics.add.group();
  this.time.addEvent({ delay:1500, loop:true, callback:()=>{
    const obs = this.add.rectangle(Phaser.Math.Between(40,320), 600, 50, 30, 0xff0000);
    this.physics.add.existing(obs);
    obs.body.setImmovable(true);
    obs.body.setVelocityY(-300); // yukarı değil, aşağıya gitmesi için pozitif hız
    this.obstacles.add(obs);
  }});

  this.physics.add.overlap(this.player, this.obstacles, ()=>{
    this.scene.start('GameOverScene', { score:this.score });
  });

  // Notlar
  this.notes = this.physics.add.group();
  this.time.addEvent({ delay:1200, loop:true, callback:()=>{
    const note = this.add.rectangle(Phaser.Math.Between(40,320), 0, 20, 20, 0xffff00);
    this.physics.add.existing(note);
    note.body.setVelocityY(200);
    this.notes.add(note);
  }});
  this.physics.add.overlap(this.player, this.notes, (p,n)=>{
    n.destroy();
    this.notesCollected++;
    this.score +=10;
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  this.scoreText = this.add.text(10,10, `Skor: ${this.score}`, { fontSize:'18px', color:'#000'});
};

GameScene.prototype.update = function(time, delta){
  // Player hareketi
  if(this.cursors.left.isDown) this.player.x -=200*delta/1000;
  if(this.cursors.right.isDown) this.player.x +=200*delta/1000;
  if(this.cursors.up.isDown && this.player.body.touching.down){
    this.player.body.setVelocityY(-500);
  }

  this.score++;
  this.scoreText.setText(`Skor: ${this.score}`);
};

// === GAME OVER SCENE ===
function GameOverScene() { Phaser.Scene.call(this, { key:'GameOverScene'});}
GameOverScene.prototype = Object.create(Phaser.Scene.prototype);

GameOverScene.prototype.init = function(data){
  this.finalScore = data.score || 0;
};

GameOverScene.prototype.create = function(){
  this.add.text(180,200,'GAME OVER',{ fontSize:'32px', color:'#000'}).setOrigin(0.5);
  this.add.text(180,250,`Skor: ${this.finalScore}`,{ fontSize:'20px', color:'#000'}).setOrigin(0.5);

  const retry = this.add.text(180,330,'TEKRAR OYNA',{ fontSize:'22px', backgroundColor:'#000', color:'#fff', padding:{x:15,y:8} }).setOrigin(0.5).setInteractive();
  const menu = this.add.text(180,390,'MENÜ',{ fontSize:'22px', backgroundColor:'#000', color:'#fff', padding:{x:15,y:8} }).setOrigin(0.5).setInteractive();

  retry.on('pointerdown', ()=>{ this.scene.start('GameScene'); });
  menu.on('pointerdown', ()=>{ this.scene.start('MenuScene'); });
};

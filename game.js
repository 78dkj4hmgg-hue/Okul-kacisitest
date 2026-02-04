// game.js - Tam Subway Surfers tarzı

// ======== CONFIGURATION ========
const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  backgroundColor: '#87CEEB',
  physics: { default: 'arcade', arcade: { gravity: { y: 1200 }, debug: false } },
  scene: [MenuScene, GameScene, GameOverScene]
};

let selectedCharacter = 'Ali';
let totalNotes = 0;

const game = new Phaser.Game(config);

// ======== MENU SCENE ========
function MenuScene() { Phaser.Scene.call(this, { key: 'MenuScene' }); }
MenuScene.prototype = Object.create(Phaser.Scene.prototype);

MenuScene.prototype.preload = function() {
  // Placeholder: sprites veya arka plan yükleyebilirsin
};

MenuScene.prototype.create = function() {
  // Parallax arka plan: şehir silüeti + bulutlar
  this.bg = [];
  for(let i=0;i<3;i++){
    let rect = this.add.rectangle(180, 400 - i*150, 360, 150, 0xA9A9A9).setAlpha(0.6);
    rect.speed = (i+1)*10;
    this.bg.push(rect);
  }

  this.clouds = [];
  for(let i=0;i<5;i++){
    let cloud = this.add.ellipse(Phaser.Math.Between(0,360), Phaser.Math.Between(0,200), 80, 30, 0xffffff, 0.8);
    cloud.speed = Phaser.Math.Between(5,25);
    this.clouds.push(cloud);
  }

  // Başlık
  this.add.text(180, 60, 'OKUL KAÇIŞI', { fontSize: '32px', color:'#000', fontStyle:'bold' }).setOrigin(0.5);

  // Karakter seçimi
  this.characters = [
    {name:'Ali', cost:0},
    {name:'Talib', cost:100},
    {name:'Yusuf', cost:150},
    {name:'Elekber', cost:400}
  ];
  this.charIndex = 0;
  this.charText = this.add.text(180, 200, this.characters[this.charIndex].name, { fontSize:'28px', color:'#000' }).setOrigin(0.5);
  this.updateCharLockText();

  // Not göstergesi
  this.notesText = this.add.text(180, 250, `Not: ${totalNotes}`, { fontSize:'20px', color:'#000' }).setOrigin(0.5);

  // Instagram bonus butonu
  this.igBtn = this.add.text(180, 300, '📸 @__cab666 → +100', { fontSize:'16px', backgroundColor:'#E1306C', color:'#fff', padding:{x:10,y:5} }).setOrigin(0.5).setInteractive();
  this.igBtn.on('pointerdown', ()=>{
    totalNotes +=100;
    this.notesText.setText(`Not: ${totalNotes}`);
  });

  // Karakter değişim okları
  this.leftArrow = this.add.text(50, 200, '<', { fontSize:'32px', color:'#000' }).setOrigin(0.5).setInteractive();
  this.rightArrow = this.add.text(310, 200, '>', { fontSize:'32px', color:'#000' }).setOrigin(0.5).setInteractive();
  this.leftArrow.on('pointerdown', ()=>{ this.changeChar(-1); });
  this.rightArrow.on('pointerdown', ()=>{ this.changeChar(1); });

  // Başla butonu
  this.startBtn = this.add.text(180, 400, '▶ BAŞLA', { fontSize:'28px', backgroundColor:'#000', color:'#fff', padding:{x:20,y:10} }).setOrigin(0.5).setInteractive();
  this.startBtn.on('pointerdown', ()=>{
    // Kilitli karakter seçilirse uyarı
    if(totalNotes < this.characters[this.charIndex].cost){
      alert('Bu karakter kilitli! Yeterli notun yok.');
      return;
    }
    selectedCharacter = this.characters[this.charIndex].name;
    this.scene.start('GameScene');
  });
};

MenuScene.prototype.update = function(time, delta){
  // Bulut hareketi
  for(let cloud of this.clouds){
    cloud.x += cloud.speed * delta/1000;
    if(cloud.x > 360) cloud.x = 0;
  }
  // Parallax şehir hareketi
  for(let bg of this.bg){
    bg.y += bg.speed * delta/1000;
    if(bg.y>640) bg.y = 0;
  }
};

MenuScene.prototype.changeChar = function(dir){
  this.charIndex = (this.charIndex + dir + this.characters.length) % this.characters.length;
  this.charText.setText(this.characters[this.charIndex].name);
  this.updateCharLockText();
};

MenuScene.prototype.updateCharLockText = function(){
  const charData = this.characters[this.charIndex];
  if(totalNotes >= charData.cost) this.charText.setColor('#00aa00');
  else this.charText.setColor('#aa0000');
};

// ======== GAME SCENE ========
function GameScene() { Phaser.Scene.call(this, { key:'GameScene'});}
GameScene.prototype = Object.create(Phaser.Scene.prototype);

GameScene.prototype.create = function(){
  this.score = 0;

  // Zemin
  this.ground = this.add.rectangle(180, 630, 360, 20, 0x228B22);
  this.physics.add.existing(this.ground,true);

  // Oyuncu
  this.player = this.add.rectangle(180,580,40,40,0x000000);
  this.physics.add.existing(this.player);
  this.player.body.setCollideWorldBounds(true);
  this.physics.add.collider(this.player,this.ground);

  // Engeller
  this.obstacles = this.physics.add.group();
  this.time.addEvent({ delay:1500, loop:true, callback:()=>{
    const obs = this.add.rectangle(Phaser.Math.Between(40,320), 600, 50, 30, 0xff0000);
    this.physics.add.existing(obs);
    obs.body.setImmovable(true);
    obs.body.setVelocityY(-300); // prototip, aşağıya doğru hız
    this.obstacles.add(obs);
  }});

  // Notlar
  this.notes = this.physics.add.group();
  this.time.addEvent({ delay:1200, loop:true, callback:()=>{
    const note = this.add.rectangle(Phaser.Math.Between(40,320),0,20,20,0xffff00);
    this.physics.add.existing(note);
    note.body.setVelocityY(200);
    this.notes.add(note);
  }});

  this.physics.add.overlap(this.player,this.notes,(p,n)=>{
    n.destroy();
    this.score +=10;
  });

  // Kontroller
  this.cursors = this.input.keyboard.createCursorKeys();
  this.input.addPointer(1); // dokunmatik destek
  this.input.on('pointermove', pointer=>{
    if(pointer.x < this.player.x) this.player.x -=200* this.game.loop.delta/1000;
    else if(pointer.x > this.player.x) this.player.x +=200* this.game.loop.delta/1000;
  });

  this.scoreText = this.add.text(10,10, `Skor: ${this.score}`, { fontSize:'18px', color:'#000' });
};

GameScene.prototype.update = function(time, delta){
  if(this.cursors.left.isDown) this.player.x -=200*delta/1000;
  if(this.cursors.right.isDown) this.player.x +=200*delta/1000;
  if(this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(-500);

  this.scoreText.setText(`Skor: ${this.score}`);
};

// ======== GAME OVER SCENE ========
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

(() => {
  const WORLD_WIDTH = 2304;
  const WORLD_HEIGHT = 1536;
  const ENEMY_HITBOXES = Object.freeze({
    humanoid: Object.freeze({ width: 40, height: 68, offsetX: 12, offsetY: 6 }),
    hound: Object.freeze({ width: 39, height: 33, offsetX: 5, offsetY: 9 })
  });

  const STYLES = {
    mago: { coat: 0x263d67, shade: 0x15233f, trim: 0x5fd5df, metal: 0xd7bd79, skin: 0xe1ba91, hood: 0x182b4d },
    necromante: { coat: 0x342a49, shade: 0x1a1728, trim: 0x9d83bd, metal: 0xc9d2ca, skin: 0xc5b0a3, hood: 0x241d35 },
    arqueiro: { coat: 0x486048, shade: 0x25382d, trim: 0xc9a56d, metal: 0x8b684b, skin: 0xddb895, hood: 0x354b3a },
    ladino: { coat: 0x683b48, shade: 0x30232c, trim: 0xdd8169, metal: 0xc3b8a4, skin: 0xcda987, hood: 0x402a37 },
    guerreiro: { coat: 0x59646a, shade: 0x313a40, trim: 0x9c5449, metal: 0xb7c2c4, skin: 0xd7b08b, hood: 0x424b50 },
    paladino: { coat: 0xc8c1a3, shade: 0x767766, trim: 0xe5c270, metal: 0xe3cf8e, skin: 0xe0bc96, hood: 0x96927c },
    clerigo: { coat: 0xd0c7ac, shade: 0x827f72, trim: 0x8cc5c1, metal: 0xe0bd6e, skin: 0xe2bb98, hood: 0xaaa58e },
    bardo: { coat: 0x376965, shade: 0x203b3d, trim: 0xd6a95f, metal: 0xc5a36b, skin: 0xe0bd9a, hood: 0x28504e }
  };

  const CLASS_NAMES = {
    mago: 'Mago', necromante: 'Necromante', arqueiro: 'Arqueiro', ladino: 'Ladino',
    guerreiro: 'Guerreiro', paladino: 'Paladino', clerigo: 'Clérigo', bardo: 'Bardo'
  };

  function polygon(graphics, points, fill, outline = 0x201d22, lineWidth = 2) {
    graphics.fillStyle(fill, 1);
    graphics.lineStyle(lineWidth, outline, 1);
    graphics.beginPath();
    graphics.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) graphics.lineTo(points[i][0], points[i][1]);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }

  function makeTexture(scene, key, draw, width = 64, height = 80) {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  function phaserKeyCode(code, fallback) {
    const codeName = code?.startsWith('Key') ? code.slice(3) : code?.startsWith('Digit') ? ({0:'ZERO',1:'ONE',2:'TWO',3:'THREE',4:'FOUR',5:'FIVE',6:'SIX',7:'SEVEN',8:'EIGHT',9:'NINE'})[code.slice(5)] : ({Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',ArrowUp:'UP',ArrowDown:'DOWN',ArrowLeft:'LEFT',ArrowRight:'RIGHT',Enter:'ENTER'})[code];
    return Phaser.Input.Keyboard.KeyCodes[codeName] || Phaser.Input.Keyboard.KeyCodes[fallback];
  }

  function drawHero(graphics, classId, pose = 0, appearance = {}) {
    const defaults = window.APPEARANCE_DEFAULTS || { gender: 'masculino', skinColor: 0xe1ba91, hairColor: 0x493126, beard: false };
    const selected = { ...defaults, ...appearance };
    const p = { ...STYLES[classId], skin: selected.skinColor, hair: selected.hairColor };
    const step = pose === 1 ? -3 : pose === 2 ? 3 : 0;
    const attack = pose === 3;
    const feminine = selected.gender === 'feminino';

    // Layered cloak, trousers, boots and fitted tunic.
    polygon(graphics, [[17,27],[48,26],[57,63],[49,72],[13,70],[7,60]], p.shade, 0x1c1a20, 3);
    graphics.fillStyle(0x171a1c, 1); graphics.fillRect(20, 54 + step, 10, 14); graphics.fillRect(35, 54 - step, 10, 14);
    graphics.fillStyle(0x282329, 1); graphics.fillRect(17, 66 + step, 16, 8); graphics.fillRect(32, 66 - step, 17, 8);
    graphics.fillStyle(0x9a7955, 1); graphics.fillRect(17, 65 + step, 14, 3); graphics.fillRect(33, 65 - step, 14, 3);
    polygon(graphics, [[17,29],[47,27],[51,54],[43,61],[19,59],[12,49]], p.coat, 0x25212a, 3);
    polygon(graphics, [[20,33],[31,38],[43,32],[40,54],[22,54]], p.shade, p.shade, 1);
    graphics.fillStyle(p.trim, 1); graphics.fillRect(30, 36, 4, 18);
    graphics.fillStyle(p.metal, 1); graphics.fillRect(20, 48, 25, 4); graphics.fillCircle(33, 50, 3);
    graphics.fillStyle(p.coat, 1); graphics.fillRoundedRect(9, 31, 11, 19, 3); graphics.fillRoundedRect(44, 30, 11, 19, 3);
    graphics.fillStyle(p.metal, 1); graphics.fillRect(10, 45, 9, 5); graphics.fillRect(45, 45, 9, 5);

    // Class-specific garment details and silhouettes.
    if (classId === 'mago' || classId === 'necromante') {
      polygon(graphics, [[15,38],[29,43],[18,65],[7,59]], p.coat, 0x24202a, 2);
      polygon(graphics, [[44,38],[34,43],[50,65],[58,58]], p.coat, 0x24202a, 2);
      graphics.fillStyle(p.trim, 1); graphics.fillCircle(33, 47, 4);
    }
    if (classId === 'arqueiro' || classId === 'ladino') {
      graphics.fillStyle(p.metal, 1); graphics.fillRect(17, 33, 7, 16); graphics.fillRect(42, 32, 7, 16);
      graphics.fillStyle(p.shade, 1); graphics.fillRect(22, 56, 22, 4);
    }
    if (classId === 'guerreiro' || classId === 'paladino') {
      polygon(graphics, [[18,31],[29,34],[28,48],[18,48]], p.metal, 0x34383a, 2);
      polygon(graphics, [[37,33],[48,30],[49,48],[38,49]], p.metal, 0x34383a, 2);
      graphics.fillStyle(p.trim, 1); graphics.fillRect(29, 34, 8, 20);
      if (classId === 'paladino') {
        graphics.fillStyle(p.metal, 1); graphics.fillRect(32, 34, 3, 12); graphics.fillRect(28, 38, 11, 3);
      }
    }
    if (classId === 'clerigo') {
      graphics.fillStyle(p.trim, 1); graphics.fillRect(21, 34, 4, 19); graphics.fillRect(40, 34, 4, 19);
      graphics.fillStyle(p.metal, 1); graphics.fillCircle(33, 45, 5);
      graphics.fillStyle(p.coat, 1); graphics.fillCircle(33, 45, 2);
    }
    if (classId === 'bardo') {
      polygon(graphics, [[20,34],[32,40],[43,31],[41,54],[22,52]], p.trim, 0x30242a, 2);
      graphics.fillStyle(p.metal, 1); graphics.fillCircle(40, 59, 7);
      graphics.fillStyle(p.shade, 1); graphics.fillCircle(40, 59, 4);
      graphics.lineStyle(1, 0xe4cb8e, 1); graphics.lineBetween(38, 55, 38, 63); graphics.lineBetween(41, 55, 41, 63);
    }

    // Hair sits behind the face and remains visible around hoods and helmets.
    graphics.fillStyle(p.hair, 1); graphics.fillEllipse(33, 19, feminine ? 27 : 24, 26);
    if (feminine) {
      graphics.fillRoundedRect(17, 19, 7, 25, 3); graphics.fillRoundedRect(42, 19, 7, 25, 3);
    }

    // Face, hair, hood and circlet.
    graphics.fillStyle(p.skin, 1); graphics.fillEllipse(33, 22, 21, 24);
    graphics.fillStyle(p.shade, 1); graphics.fillRect(22, 19, 22, 5);
    graphics.fillStyle(0xf2dfbf, 1); graphics.fillCircle(27, 23, 1.5); graphics.fillCircle(39, 23, 1.5);
    graphics.lineStyle(2, p.shade, 1); graphics.lineBetween(29, 30, 37, 30);
    if (['mago','necromante','arqueiro','ladino'].includes(classId)) {
      polygon(graphics, [[15,22],[18,7],[30,12],[33,2],[39,12],[51,7],[51,24],[44,17],[22,18]], p.hood, 0x201d24, 3);
      graphics.fillStyle(p.trim, 1); graphics.fillRect(23, 16, 21, 3);
      graphics.fillStyle(p.skin, 1); graphics.fillEllipse(33, 24, 15, 12);
      graphics.fillStyle(p.shade, 1); graphics.fillRect(22, 20, 22, 4);
      graphics.fillStyle(0xf2dfbf, 1); graphics.fillCircle(28, 24, 1.4); graphics.fillCircle(38, 24, 1.4);
    } else if (classId === 'guerreiro' || classId === 'paladino') {
      polygon(graphics, [[17,20],[20,8],[45,8],[49,20],[45,31],[21,31]], p.metal, 0x33383c, 3);
      graphics.fillStyle(p.shade, 1); graphics.fillRect(22, 21, 22, 5);
      graphics.fillStyle(0xf0d78d, 1); graphics.fillRect(31, 7, 5, 9);
    } else if (classId === 'bardo') {
      polygon(graphics, [[17,17],[26,10],[43,10],[50,18],[41,17],[32,20],[23,17]], p.coat, 0x29232a, 2);
      graphics.fillStyle(p.trim, 1); graphics.fillTriangle(39, 12, 54, 9, 46, 24);
    } else {
      graphics.fillStyle(p.coat, 1); graphics.fillEllipse(33, 15, 31, 14);
      graphics.fillStyle(p.trim, 1); graphics.fillRect(19, 18, 28, 3);
    }

    if (feminine) {
      graphics.fillStyle(p.hair, 1); graphics.fillRoundedRect(17, 24, 5, 15, 2); graphics.fillRoundedRect(44, 24, 5, 15, 2);
      graphics.fillStyle(p.trim, 1); graphics.fillRect(27, 35, 12, 2);
    }
    if (selected.beard) {
      polygon(graphics, [[24,27],[28,29],[33,28],[38,29],[42,27],[40,34],[33,38],[26,34]], p.hair, 0x211d1b, 1);
      graphics.fillStyle(p.skin, 1); graphics.fillRect(30, 28, 2, 1); graphics.fillRect(35, 28, 2, 1);
    }

    // Signature weapon silhouette, always visible in idle and cast frames.
    graphics.lineStyle(4, 0x34251d, 1);
    if (classId === 'mago' || classId === 'necromante' || classId === 'clerigo') {
      graphics.lineBetween(53, 54, 58, 12);
      graphics.lineStyle(2, p.metal, 1); graphics.lineBetween(53, 54, 58, 12);
      graphics.fillStyle(p.trim, 1); graphics.fillCircle(58, 10, classId === 'necromante' ? 7 : 6);
      graphics.fillStyle(p.shade, 1); graphics.fillCircle(58, 10, 3);
      if (classId === 'necromante') { graphics.fillStyle(0xe7dfc9, 1); graphics.fillCircle(55, 8, 1.5); graphics.fillCircle(61, 8, 1.5); }
    } else if (classId === 'arqueiro') {
      graphics.lineStyle(4, 0x704d35, 1); graphics.beginPath(); graphics.arc(56, 37, 17, -1.2, 1.2, false); graphics.strokePath();
      graphics.lineStyle(1, 0xe3d4b8, 1); graphics.lineBetween(44, 22, 44, 52);
      graphics.lineStyle(2, 0x6d5138, 1); graphics.lineBetween(21, 14, 18, 29); graphics.lineBetween(24, 14, 21, 29);
    } else if (classId === 'ladino') {
      graphics.lineStyle(3, p.metal, 1); graphics.lineBetween(48, 44, 61, 29); graphics.lineBetween(14, 43, 5, 31);
      graphics.lineStyle(2, 0xe8dcc4, 1); graphics.lineBetween(49, 43, 61, 29); graphics.lineBetween(14, 43, 5, 31);
    } else {
      graphics.lineStyle(5, 0x5b4633, 1); graphics.lineBetween(48, 51, 60, 16);
      graphics.lineStyle(3, p.metal, 1); graphics.lineBetween(48, 51, 60, 16);
      graphics.fillStyle(p.metal, 1); graphics.fillTriangle(57, 21, 63, 11, 63, 25);
      if (classId === 'guerreiro' || classId === 'paladino') {
        graphics.fillStyle(p.shade, 1); graphics.fillRoundedRect(3, 38, 15, 24, 4);
        graphics.lineStyle(2, p.metal, 1); graphics.strokeRoundedRect(3, 38, 15, 24, 4);
        graphics.fillStyle(p.trim, 1); graphics.fillRect(9, 42, 3, 15); graphics.fillRect(5, 48, 11, 3);
      }
    }
    if (attack) {
      graphics.lineStyle(3, p.trim, .9); graphics.beginPath(); graphics.arc(40, 43, 25, -1.1, .9, false); graphics.strokePath();
      graphics.fillStyle(p.trim, .14); graphics.fillCircle(47, 37, 16);
    }
  }

  function createHeroTextures(scene, character) {
    const classId = CLASS_DATA.some((cls) => cls.id === character.classId) ? character.classId : CLASS_DATA[0].id;
    const defaults = window.APPEARANCE_DEFAULTS || { gender: 'masculino', skinColor: 0xe1ba91, hairColor: 0x493126, beard: false };
    const appearance = { ...defaults, ...(character.appearance || {}) };
    const appearanceKey = [appearance.gender, appearance.skinColor.toString(16), appearance.hairColor.toString(16), appearance.beard ? 'beard' : 'clean'].join('-');
    const heroKey = `hero-${classId}-${appearanceKey}`;
    for (const [pose, suffix] of [[0,'idle'],[1,'walk-a'],[2,'walk-b'],[3,'attack']]) {
      makeTexture(scene, `${heroKey}-${suffix}`, (graphics) => drawHero(graphics, classId, pose, appearance));
    }
    if (!scene.anims.exists(`${heroKey}-walk`)) {
      scene.anims.create({ key: `${heroKey}-idle`, frames: [{ key: `${heroKey}-idle` }], frameRate: 1, repeat: -1 });
      scene.anims.create({ key: `${heroKey}-walk`, frames: [{ key: `${heroKey}-walk-a` }, { key: `${heroKey}-walk-b` }], frameRate: 7, repeat: -1 });
      scene.anims.create({ key: `${heroKey}-attack`, frames: [{ key: `${heroKey}-attack` }], frameRate: 1, repeat: 0 });
    }
    return heroKey;
  }

  function createPreviewTexture(scene, classId, appearance) {
    const safeClass = STYLES[classId] ? classId : CLASS_DATA[0].id;
    const defaults = window.APPEARANCE_DEFAULTS || { gender: 'masculino', skinColor: 0xe1ba91, hairColor: 0x493126, beard: false };
    const selected = { ...defaults, ...(appearance || {}) };
    const key = `preview-${safeClass}-${selected.gender}-${selected.skinColor.toString(16)}-${selected.hairColor.toString(16)}-${selected.beard ? 'beard' : 'clean'}`;
    makeTexture(scene, key, (graphics) => drawHero(graphics, safeClass, 0, selected));
    return key;
  }

  function makeEnemyTexture(scene, kind) {
    const key = `plateau-enemy-${kind}`;
    makeTexture(scene, key, (g) => {
      if (kind === 3) {
        polygon(g, [[6,31],[12,19],[22,16],[34,19],[43,27],[37,38],[19,41],[8,37]], 0x8a5b42, 0x251c1b, 3);
        g.fillStyle(0x4b3028, 1); g.fillTriangle(15,20,15,10,22,19); g.fillTriangle(33,19,39,10,38,24);
        g.fillStyle(0xe4bc75, 1); g.fillCircle(36,26,2); g.fillCircle(37,32,1.5);
        g.fillStyle(0x312321, 1); g.fillEllipse(23,39,23,8);
        return;
      }
      const armor = kind === 0 ? 0x873e37 : kind === 1 ? 0x92734b : 0x68736e;
      polygon(g, [[19,27],[45,26],[50,56],[43,67],[16,65],[10,51]], armor, 0x241e20, 3);
      g.fillStyle(0x332a29, 1); g.fillRect(18,56,10,14); g.fillRect(34,56,10,14);
      g.fillStyle(0x4c3730, 1); g.fillRect(15,67,16,6); g.fillRect(32,67,16,6);
      g.fillStyle(0xcbb388, 1); g.fillEllipse(32,20,20,21);
      polygon(g, [[17,20],[19,7],[44,7],[49,20],[43,17],[21,18]], 0x514a40, 0x211e20, 3);
      g.fillStyle(0x191a19, 1); g.fillRect(23,21,19,4);
      g.fillStyle(0xea966e, 1); g.fillCircle(27,22,1.5); g.fillCircle(38,22,1.5);
      if (kind === 0) {
        g.lineStyle(3, 0xb7a68b, 1); g.lineBetween(10,42,54,49); g.lineBetween(18,39,43,57);
        g.lineStyle(4, 0x352820, 1); g.lineBetween(48,50,60,14);
      } else if (kind === 1) {
        g.lineStyle(4, 0x684a32, 1); g.beginPath(); g.arc(54,38,16,-1.15,1.15,false); g.strokePath();
        g.lineStyle(1, 0xe3d6bb, 1); g.lineBetween(43,24,43,51);
        g.lineStyle(2, 0x69513a, 1); g.lineBetween(20,14,18,29); g.lineBetween(24,14,21,29);
      } else {
        g.fillStyle(0x414d48, 1); g.fillRoundedRect(2,37,18,27,4);
        g.lineStyle(2, 0xb5ac92, 1); g.strokeRoundedRect(2,37,18,27,4);
        g.fillStyle(0x8c4b3e, 1); g.fillRect(8,42,4,15); g.fillRect(4,47,12,4);
        g.lineStyle(4, 0x5a4734, 1); g.lineBetween(45,48,60,18);
      }
    });
    return key;
  }

  class PlateauScene extends Phaser.Scene {
    constructor() { super('plateaus'); }

    init(data = {}) { this.character = data.character || window.pendingCharacter; }

    create() {
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.createWorld();
      this.heroKey = createHeroTextures(this, this.character);
      this.createCombatTextures();
      this.vfx = new window.VFXManager(this);
      this.createInput();
      this.enemies = this.physics.add.group();
      this.projectiles = [];
      this.skillHitZones = [];
      this.loot = [];
      this.spawnPatrol();
      this.spawnSavedLoot();
      this.player = this.physics.add.sprite(this.character.x || 250, this.character.y || 450, `${this.heroKey}-idle`);
      this.player.setDepth(this.player.y).setCollideWorldBounds(true);
      this.player.body.setSize(24,28).setOffset(20,40);
      this.player.play(`${this.heroKey}-idle`);
      this.obstacles = this.physics.add.staticGroup();
      this.createRocks();
      this.physics.add.collider(this.player, this.obstacles);
      this.physics.add.collider(this.enemies, this.obstacles);
      this.physics.add.collider(this.player, this.enemies);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.startFollow(this.player, true, .075, .075);
      this.cameras.main.setZoom(1.05);
      this.cameras.main.setBackgroundColor('#30251b');
      this.lastEnemyHit = 0;
      this.lastAttack = 0;
      this.skillCooldowns = {1:0,2:0,3:0,4:0,5:0};
      this.invulnerableUntil = 0;
      this.dodgeActiveUntil = 0;
      this.dodgeCooldownUntil = 0;
      this.manaRegenAt = 0;
      this.lastHudEmitAt = 0;
      this.isWalking = false;
      this.events.once('shutdown', () => {
        this.projectiles?.slice().forEach(shot => this.removeProjectile(shot));
        this.skillHitZones?.slice().forEach(zone => this.removeSkillHitZone(zone));
        this.vfx?.destroy();
      });
      this.emit('A patrulha da fortaleza está à frente. Aproxime-se com cuidado.');
    }

    createInput() {
      const controls = window.gameSettings?.controls || {};
      this.keys = this.input.keyboard.addKeys({
        w: phaserKeyCode(controls.moveUp, 'W'), a: phaserKeyCode(controls.moveLeft, 'A'),
        s: phaserKeyCode(controls.moveDown, 'S'), d: phaserKeyCode(controls.moveRight, 'D'),
        up: Phaser.Input.Keyboard.KeyCodes.UP, down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT, right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        skill1: phaserKeyCode(controls.skill1,'ONE'), skill2: phaserKeyCode(controls.skill2,'TWO'),
        skill3: phaserKeyCode(controls.skill3,'THREE'), skill4: phaserKeyCode(controls.skill4,'FOUR'),
        skill5: phaserKeyCode(controls.skill5,'FIVE'),
        attack: phaserKeyCode(controls.attack, 'SPACE'), dodge: phaserKeyCode(controls.dodge, 'SHIFT'),
        interact: phaserKeyCode(controls.interact, 'E')
      }, false);
      // Phaser's KeyboardManager is game-global. Don't let gameplay keys call
      // preventDefault on DOM inputs, and release any captures when this scene stops.
      const gameplayKeyCodes = Object.values(this.keys).map(key => key.keyCode);
      this.input.keyboard.removeCapture(gameplayKeyCodes);
      this.events.once('shutdown', () => this.input.keyboard.removeCapture(gameplayKeyCodes));
      this.input.on('pointerdown', (pointer) => {
        if (pointer.leftButtonDown()) this.attack();
      });
    }

    getAim() {
      const pointer = this.input.activePointer;
      const dx = (pointer?.worldX ?? this.player.x + (this.player.flipX ? -1 : 1)) - this.player.x;
      const dy = (pointer?.worldY ?? this.player.y) - this.player.y;
      return Math.atan2(dy, dx);
    }

    createWorld() {
      makeTexture(this, 'plateau-ground', (g) => {
        g.fillStyle(0x493a2c, 1); g.fillRect(0,0,96,96);
        const patches = [[7,10,19,12,0x554331],[42,13,23,9,0x3b3025],[18,37,27,14,0x604a35],[61,46,25,17,0x413327],[3,72,29,13,0x51402e],[48,78,31,10,0x5b4631]];
        for (const [x,y,w,h,color] of patches) { g.fillStyle(color,1); g.fillRoundedRect(x,y,w,h,5); }
        g.fillStyle(0x8e744c,.55); g.fillCircle(13,30,2); g.fillCircle(81,30,2); g.fillCircle(39,65,2);
      }, 96, 96);
      this.add.tileSprite(0,0,WORLD_WIDTH,WORLD_HEIGHT,'plateau-ground').setOrigin(0).setDepth(-1000);
      const trail = this.add.graphics().setDepth(-900);
      trail.lineStyle(126, 0x625844, 1); trail.beginPath(); trail.moveTo(60,1180); trail.lineTo(420,980); trail.lineTo(770,900); trail.lineTo(1020,620); trail.lineTo(1420,560); trail.strokePath();
      trail.lineStyle(104, 0x897b59, 1); trail.beginPath(); trail.moveTo(60,1180); trail.lineTo(420,980); trail.lineTo(770,900); trail.lineTo(1020,620); trail.lineTo(1420,560); trail.strokePath();
      this.add.ellipse(90,1180,360,72,0x74694d).setDepth(-899);
      this.add.ellipse(90,1180,360,47,0x9c8c64).setDepth(-898);
      this.createFortress();
      this.createGodfallScar();
      this.add.text(1110, 560, 'FORTALEZA EM RUÍNAS', {fontFamily:'Georgia',fontSize:'17px',color:'#ead9ac',stroke:'#1c211d',strokeThickness:4,letterSpacing:2}).setDepth(-100);
      this.add.text(180, 1260, 'ACAMPAMENTO DA RESISTÊNCIA', {fontFamily:'Georgia',fontSize:'13px',color:'#d5c9a8',stroke:'#1c211d',strokeThickness:3,letterSpacing:1}).setDepth(-100);
      this.createGrassDetails();
      const glow=this.add.graphics().setDepth(-700);
      glow.fillStyle(0xd7a553,.065);glow.fillEllipse(560,360,740,360);
      glow.fillStyle(0xe0ae61,.05);glow.fillEllipse(1380,590,880,400);
      glow.fillStyle(0x21160f,.2);glow.fillEllipse(1920,1320,1000,500);
    }

    createGodfallScar() {
      const scar = this.add.graphics().setDepth(-650);
      scar.fillStyle(0x241b14,.42); scar.fillEllipse(577,738,292,92);
      scar.lineStyle(5,0x9d7944,.38); scar.strokeEllipse(577,738,265,72);
      scar.lineStyle(2,0xc7a15e,.48);
      scar.beginPath(); scar.moveTo(576,700); scar.lineTo(565,723); scar.lineTo(590,737); scar.lineTo(568,752); scar.lineTo(581,777); scar.strokePath();
      scar.beginPath(); scar.moveTo(514,728); scar.lineTo(548,739); scar.lineTo(535,759); scar.strokePath();
      scar.beginPath(); scar.moveTo(638,716); scar.lineTo(612,737); scar.lineTo(639,752); scar.strokePath();
      polygon(scar,[[554,716],[567,676],[584,689],[580,724]],0x857052,0x34281c,3);
      polygon(scar,[[566,677],[576,650],[590,680],[584,690]],0xb0935d,0x493722,2);
      polygon(scar,[[617,748],[646,733],[660,748],[641,759]],0x766348,0x35291d,2);
      polygon(scar,[[492,752],[515,735],[531,749],[515,765]],0x67563d,0x34291e,2);
      scar.fillStyle(0xd7ad62,.7); scar.fillCircle(578,738,4);
      scar.lineStyle(1,0xe0ba70,.45); scar.lineBetween(578,738,582,709); scar.lineBetween(578,738,615,742); scar.lineBetween(578,738,546,747);
    }

    createFortress() {
      const g = this.add.graphics().setDepth(-200);
      g.fillStyle(0x1b130e,.42); g.fillEllipse(1260,655,410,155);
      g.fillStyle(0x756047,1); g.fillRect(1120,420,305,205); g.fillRect(1088,462,74,175); g.fillRect(1387,444,80,194);
      g.fillStyle(0x917653,1); g.fillRect(1107,403,327,23); g.fillRect(1078,443,94,24); g.fillRect(1376,424,102,24);
      g.fillStyle(0x58432f,1); g.fillTriangle(1095,404,1145,361,1190,404); g.fillTriangle(1378,425,1425,381,1484,425);
      g.fillStyle(0x382a1e,1); g.fillRect(1215,514,44,111); g.fillRect(1290,510,38,62); g.fillRect(1140,479,20,31); g.fillRect(1392,462,25,30);
      g.fillStyle(0x4a3423,1); g.fillRect(1223,524,28,101);
      g.lineStyle(2,0xb29a70,.7); g.lineBetween(1180,430,1180,615); g.lineBetween(1350,430,1350,615); g.lineBetween(1089,470,1160,470);
      for (let x=1180;x<1360;x+=42) { g.fillStyle(0xa08861,1); g.fillRect(x,450,18,13); }
      g.lineStyle(2,0x59452f,.8);g.lineBetween(1120,470,1424,470);g.lineBetween(1120,535,1425,535);g.lineBetween(1120,590,1425,590);
      for(const [x,y] of [[1200,482],[1268,494],[1340,477],[1168,547],[1248,559],[1361,548],[1188,600],[1328,601]]){
        g.lineStyle(1,0x57452f,.8);g.lineBetween(x,y,x+23,y+4);g.lineBetween(x+7,y+20,x+32,y+22);
      }
      g.lineStyle(4,0x4a3424,.9);g.beginPath();g.moveTo(1097,474);g.lineTo(1101,522);g.lineTo(1113,531);g.lineTo(1117,567);g.strokePath();
      g.lineStyle(3,0x4a3424,.85);g.beginPath();g.moveTo(1468,466);g.lineTo(1461,505);g.lineTo(1473,520);g.lineTo(1462,553);g.strokePath();
    }

    createGrassDetails() {
      const detail = this.add.graphics().setDepth(-500);
      for (let i=0;i<155;i+=1) {
        const x = 80 + ((i * 197) % (WORLD_WIDTH - 160));
        const y = 100 + ((i * 131) % (WORLD_HEIGHT - 200));
        detail.lineStyle(2, i % 3 === 0 ? 0x9a8050 : 0x796747, .65);
        detail.lineBetween(x,y,x-4,y-10); detail.lineBetween(x,y,x+2,y-12);
        if (i % 9 === 0) { detail.fillStyle(0xc9a974,.8); detail.fillCircle(x+5,y-6,2); }
      }
      const banner = this.add.graphics().setDepth(-300);
      banner.fillStyle(0x5d302d,1); banner.fillRect(1496,500,8,76);
      banner.fillStyle(0xa85542,1); banner.fillTriangle(1500,503,1542,510,1500,535);
      banner.lineStyle(2,0xd0ad6e,1); banner.lineBetween(1510,511,1531,516); banner.lineBetween(1510,520,1525,523);
    }

    createCombatTextures() {
      makeEnemyTexture(this,0); makeEnemyTexture(this,1); makeEnemyTexture(this,2); makeEnemyTexture(this,3);
      makeTexture(this,'spell-orb',(g)=>{g.fillStyle(0x4dcbd3,.22);g.fillCircle(24,24,23);g.fillStyle(0x72eff0,1);g.fillCircle(24,24,13);g.fillStyle(0xffffff,1);g.fillCircle(20,19,4);},48,48);
      makeTexture(this,'spell-fire',(g)=>{g.fillStyle(0xeda24f,.24);g.fillCircle(24,24,23);g.fillStyle(0xef6948,1);g.fillCircle(24,24,13);g.fillStyle(0xffe0a1,1);g.fillCircle(20,19,4);},48,48);
      makeTexture(this,'spell-holy',(g)=>{g.fillStyle(0xe6c76b,.25);g.fillCircle(24,24,23);g.fillStyle(0xf3de9b,1);g.fillCircle(24,24,12);g.fillStyle(0xffffff,1);g.fillRect(22,12,4,24);g.fillRect(12,22,24,4);},48,48);
      makeTexture(this,'spell-note',(g)=>{g.fillStyle(0x5ee1d2,.2);g.fillCircle(24,24,22);g.fillStyle(0xf1c46d,1);g.fillEllipse(20,28,13,9);g.lineStyle(4,0xf1c46d,1);g.lineBetween(26,26,26,8);g.lineBetween(26,8,36,11);},48,48);
      makeTexture(this,'spell-bone',(g)=>{g.fillStyle(0x9c80c0,.22);g.fillCircle(24,24,22);g.fillStyle(0xe1dac4,1);g.fillEllipse(24,22,16,20);g.fillStyle(0x292533,1);g.fillCircle(20,20,2.5);g.fillCircle(28,20,2.5);g.fillRect(21,28,6,2);},48,48);
      makeTexture(this,'necromancer-skull',(g)=>{
        g.fillStyle(0x211a2d,.55);g.fillCircle(28,28,24);
        g.fillStyle(0xded5c0,1);g.lineStyle(3,0x766783,1);g.fillEllipse(28,23,27,30);g.strokeEllipse(28,23,27,30);
        g.fillStyle(0x302638,1);g.fillEllipse(21,23,7,9);g.fillEllipse(35,23,7,9);g.fillTriangle(28,27,25,33,31,33);
        g.fillStyle(0xc8bda7,1);g.fillRoundedRect(19,34,18,8,3);g.lineStyle(1,0x7e7186,1);g.lineBetween(23,35,23,41);g.lineBetween(28,35,28,42);g.lineBetween(33,35,33,41);
        g.fillStyle(0xb9a0d5,1);g.fillCircle(21,23,2);g.fillCircle(35,23,2);
      },56,56);
      makeTexture(this,'summoned-skeleton',(g)=>{g.fillStyle(0x17151d,.35);g.fillEllipse(24,48,34,10);g.fillStyle(0xd8d1be,1);g.fillEllipse(24,13,18,19);g.fillStyle(0x24232a,1);g.fillEllipse(19,13,4,5);g.fillEllipse(29,13,4,5);g.fillStyle(0x9b8bae,1);g.fillTriangle(24,20,20,24,28,24);g.lineStyle(5,0xd8d1be,1);g.lineBetween(14,26,7,40);g.lineBetween(34,26,41,40);g.lineBetween(20,31,18,48);g.lineBetween(28,31,30,48);g.lineStyle(3,0xada592,1);g.lineBetween(17,34,31,34);g.lineBetween(15,39,33,39);g.lineBetween(16,44,32,44);g.lineStyle(3,0x6b547f,1);g.lineBetween(42,43,43,18);g.lineStyle(4,0xb8a4d1,1);g.lineBetween(39,20,47,20);},48,56);
      makeTexture(this,'spell-arrow',(g)=>{g.lineStyle(5,0x704a30,1);g.lineBetween(7,39,39,7);g.lineStyle(2,0xf0d8a8,1);g.lineBetween(7,39,39,7);g.fillStyle(0xf0d8a8,1);g.fillTriangle(39,7,29,9,37,17);g.fillTriangle(7,39,6,29,16,38);},48,48);
      makeTexture(this,'spell-blood',(g)=>{g.fillStyle(0x8e394e,.22);g.fillCircle(24,24,22);g.fillStyle(0xd96062,1);g.fillTriangle(24,4,9,28,24,41);g.fillTriangle(24,4,39,28,24,41);},48,48);
      makeTexture(this,'rock',(g)=>{polygon(g,[[6,35],[11,15],[24,5],[44,12],[58,31],[46,49],[17,48]],0x596153,0x333a32,3);g.fillStyle(0x7a806e,1);g.fillTriangle(13,17,26,7,31,19);g.lineStyle(2,0x434a40,1);g.lineBetween(33,17,29,34);g.lineBetween(45,21,50,31);},64,56);
      makeTexture(this,'loot-glow',(g)=>{g.fillStyle(0xf0ce7c,.25);g.fillCircle(24,24,22);g.fillStyle(0xf0ce7c,1);g.fillPoints([{x:24,y:7},{x:41,y:24},{x:24,y:41},{x:7,y:24}],true);g.fillStyle(0xffefbd,1);g.fillCircle(24,24,5);},48,48);
    }

    createRocks() {
      for (const [x,y,s] of [[410,690,.9],[620,430,1.1],[820,1040,1.3],[1600,730,1.2],[1830,1160,1],[990,1280,.85],[1680,300,.8]]) {
        const rock = this.obstacles.create(x,y,'rock').setScale(s).setDepth(y);
        rock.body.setSize(34,24).setOffset(15,25); rock.refreshBody();
      }
      this.add.image(1450,680,'rock').setScale(1.9).setTint(0x7e7865).setDepth(680);
    }

    configureEnemyHitbox(enemy, kind) {
      const shape = kind === 3 ? ENEMY_HITBOXES.hound : ENEMY_HITBOXES.humanoid;
      enemy.body.setSize(shape.width, shape.height).setOffset(shape.offsetX, shape.offsetY);
    }

    spawnPatrol() {
      const patrol = [
        {kind:0,x:735,y:420,hp:74,maxHp:74,speed:62,damage:13,xp:14,r:16,name:'Guarda da Corrente'},
        {kind:2,x:850,y:510,hp:112,maxHp:112,speed:43,damage:17,xp:21,r:19,name:'Escudeiro de Pedreira'},
        {kind:1,x:1040,y:390,hp:58,maxHp:58,speed:35,damage:12,xp:18,r:15,name:'Besteiro da Fortaleza'},
        {kind:3,x:930,y:650,hp:54,maxHp:54,speed:90,damage:12,xp:12,r:14,name:'Cão de Tributo'},
        {kind:0,x:1190,y:680,hp:82,maxHp:82,speed:60,damage:15,xp:16,r:17,name:'Capataz de Varek'}
      ];
      for (const data of patrol) {
        const enemy = this.enemies.create(data.x,data.y,`plateau-enemy-${data.kind}`);
        Object.assign(enemy,data,{alive:true,attackAt:0,flashUntil:0});
        enemy.setCollideWorldBounds(true).setDepth(data.y);
        this.configureEnemyHitbox(enemy,data.kind);
        enemy.healthBack = this.add.rectangle(data.x,data.y-39,46,5,0x191a18).setDepth(data.y+2);
        enemy.healthFill = this.add.rectangle(data.x-23,data.y-39,46,4,0xb85749).setOrigin(0,0.5).setDepth(data.y+3);
        enemy.label = this.add.text(data.x,data.y-54,data.name,{fontFamily:'Georgia',fontSize:'10px',color:'#eee0c2',stroke:'#201f1d',strokeThickness:3}).setOrigin(.5).setDepth(data.y+4).setAlpha(0);
      }
    }

    spawnSavedLoot() {
      for (const item of this.character.droppedItems || []) this.createLoot(item.x,item.y,item.name,item.slot,item.rarity || 'Comum');
    }

    update(time, delta) {
      if (!this.player?.active) return;
      const dt = Math.min(delta / 1000, .04);
      const moveX = (this.keys.d.isDown || this.keys.right.isDown ? 1 : 0) - (this.keys.a.isDown || this.keys.left.isDown ? 1 : 0);
      const moveY = (this.keys.s.isDown || this.keys.down.isDown ? 1 : 0) - (this.keys.w.isDown || this.keys.up.isDown ? 1 : 0);
      const magnitude = Math.hypot(moveX,moveY) || 1;
      const x = moveX / magnitude, y = moveY / magnitude;
      const walking = !!(moveX || moveY);
      if (Phaser.Input.Keyboard.JustDown(this.keys.dodge) && this.character.stamina >= 18 && time > this.dodgeCooldownUntil) {
        this.character.stamina -= 18;
        const dodgeX = walking ? x : (this.player.flipX ? -1 : 1);
        const dodgeY = walking ? y : 0;
        this.player.setVelocity(dodgeX*390,dodgeY*390);
        this.invulnerableUntil = time+240; this.dodgeActiveUntil = time+210; this.dodgeCooldownUntil = time+700;
        this.player.setAlpha(.55);
        this.time.delayedCall(280,()=>this.player?.setAlpha(1));
        this.burst(this.player.x,this.player.y,0xb8d8d2,10,130);
      } else if (time >= this.dodgeActiveUntil) {
        const speed = this.character.stamina > 0 ? 170 : 110;
        this.player.setVelocity(x*speed,y*speed);
        if (walking && this.character.stamina > 0) this.character.stamina=Math.max(0,this.character.stamina-(this.keys.dodge.isDown?8:0)*dt);
      }
      if (walking) this.player.setFlipX(x<0);
      this.isWalking=walking;
      this.player.setDepth(this.player.y);
      const animation = walking ? `${this.heroKey}-walk` : `${this.heroKey}-idle`;
      if (this.player.anims.currentAnim?.key !== animation && time > (this.attackAnimUntil || 0)) this.player.play(animation,true);
      if (!walking && time > this.dodgeActiveUntil) this.character.stamina=Math.min(this.character.maxStamina,this.character.stamina+22*dt);

      if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) this.attack();
      for (let slot=1;slot<=5;slot+=1) if (Phaser.Input.Keyboard.JustDown(this.keys[`skill${slot}`])) this.castSkill(slot);
      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.pickupLoot();
      this.updateEnemies(time,dt);
      this.updateProjectiles(delta);
      if (time>=this.manaRegenAt) this.character.mana=Math.min(this.character.maxMana,this.character.mana+5*dt);
      this.character.x=this.player.x; this.character.y=this.player.y;
      if(time-this.lastHudEmitAt>90){this.lastHudEmitAt=time;this.emit('hud');}
    }

    updateEnemies(time,dt) {
      this.enemies.getChildren().forEach((enemy)=>{
        if (!enemy.active || !enemy.alive) return;
        const dx=this.player.x-enemy.x,dy=this.player.y-enemy.y,distance=Math.hypot(dx,dy)||1;
        const chaseRange=enemy.kind===1?850:420;
        const speedScale=time < (enemy.slowUntil || 0) ? 0.48 : 1;
        if (enemy.kind===1 && distance<205) enemy.setVelocity(-dx/distance*enemy.speed*.72*speedScale,-dy/distance*enemy.speed*.72*speedScale);
        else if (distance>chaseRange) enemy.setVelocity(0,0);
        else if (enemy.kind===1 && distance>450) enemy.setVelocity(dx/distance*enemy.speed*speedScale,dy/distance*enemy.speed*speedScale);
        else if (enemy.kind!==1 && distance>48) enemy.setVelocity(dx/distance*enemy.speed*speedScale,dy/distance*enemy.speed*speedScale);
        else enemy.setVelocity(0,0);
        enemy.setDepth(enemy.y); enemy.healthBack.setPosition(enemy.x,enemy.y-40); enemy.healthFill.setPosition(enemy.x-23,enemy.y-40).setScale(Math.max(0,enemy.hp/enemy.maxHp),1);
        enemy.label.setPosition(enemy.x,enemy.y-55).setAlpha(distance<130?.9:0);
        if (enemy.kind===1 && distance<560 && time-enemy.attackAt>2200 && time>this.invulnerableUntil && time>=(enemy.silencedUntil||0)) {
          this.enemyRangedAttack(enemy,time);
        } else if (enemy.kind!==1 && distance<Math.max(enemy.r+60,78) && time-enemy.attackAt>1050 && time>this.invulnerableUntil && time>=(enemy.silencedUntil||0)) {
          enemy.attackAt=time; this.damagePlayer(enemy.damage);
          this.burst(this.player.x,this.player.y,0xd66a57,7,90);
        }
        if (time<enemy.flashUntil) enemy.setTint(0xffffff); else if(time<(enemy.slowUntil||0))enemy.setTint(0x91c3ca);else enemy.clearTint();
      });
    }

    enemyRangedAttack(enemy,time) {
      enemy.attackAt=time;
      const aimX=this.player.x, aimY=this.player.y;
      const warning=this.add.circle(aimX,aimY,29,0xb8473e,.2).setStrokeStyle(2,0xd9735d,.9).setDepth(aimY+15);
      this.tweens.add({targets:warning,alpha:0,scale:1.25,duration:420,onComplete:()=>warning.destroy()});
      this.time.delayedCall(360,()=>{
        if(!this.sys.isActive()||!enemy.active)return;
        const arrow=this.add.image(enemy.x,enemy.y-12,'spell-arrow').setScale(.8).setDepth(enemy.y+20);
        const angle=Phaser.Math.Angle.Between(arrow.x,arrow.y,aimX,aimY);
        arrow.setRotation(angle+Math.PI/4);
        const travel=Phaser.Math.Clamp(Phaser.Math.Distance.Between(arrow.x,arrow.y,aimX,aimY)/440*1000,180,1050);
        this.tweens.add({targets:arrow,x:aimX,y:aimY,duration:travel,ease:'Linear',onComplete:()=>{
          if(this.sys.isActive()&&Phaser.Math.Distance.Between(this.player.x,this.player.y,aimX,aimY)<47&&this.time.now>this.invulnerableUntil){
            this.damagePlayer(enemy.damage);this.burst(aimX,aimY,0xd66a57,7,90);
          }
          arrow.destroy();
        }});
      });
    }

    attack() {
      const time=this.time.now;
      if (time-this.lastAttack<500 || this.character.stamina<9) return;
      this.lastAttack=time; this.character.stamina-=9;
      const id=this.character.classId;
      const angle=this.getAim();
      this.playHeroAction();
      if (['mago','arqueiro','clerigo','bardo','necromante'].includes(id)) {
        const texture=id==='mago'?'spell-orb':id==='arqueiro'?'spell-arrow':id==='clerigo'?'spell-holy':id==='bardo'?'spell-note':'necromancer-skull';
        if (id==='necromante' && this.character.mana<10) {this.emit('Sem mana para ordenar ao morto-vivo.');return;}
        if (id==='necromante') this.character.mana-=10;
        const damage=id==='necromante'?22:id==='mago'?21:id==='arqueiro'?19:15;
        const speed=id==='arqueiro'?620:360;
        this.fireProjectile(angle,texture,damage,speed,id==='necromante',1,{range:620,hitboxRadius:id==='necromante'?12:7,smokeTrail:id==='necromante'});
      } else {
        const range=id==='ladino'?78:86;
        const color=id==='ladino'?0xd9656a:id==='paladino'?0xf0d279:0xd9d4bd;
        const damage=id==='ladino'?19:22;
        const arc=id==='ladino'?Math.PI*.55:Math.PI*.62;
        this.slash(this.player.x,this.player.y,color,range,angle);
        this.hitArc(this.player.x,this.player.y,angle,range,arc,damage);
      }
      this.emit('hud');
    }

    hitArc(x,y,angle,range,arc,damage,status=null,statusDuration=2200) {
      for (const enemy of this.enemies.getChildren()) {
        if (!enemy.active || !enemy.alive) continue;
        const body=enemy.body,left=body.x,right=left+body.width,top=body.y,bottom=top+body.height;
        const points=[
          {x:Phaser.Math.Clamp(x,left,right),y:Phaser.Math.Clamp(y,top,bottom)},
          {x:left,y:top},{x:right,y:top},{x:left,y:bottom},{x:right,y:bottom},
          {x:(left+right)/2,y:(top+bottom)/2}
        ];
        const overlapsArc=points.some(point=>{
          const dx=point.x-x,dy=point.y-y,distance=Math.hypot(dx,dy);
          if(distance>range)return false;
          if(distance===0)return true;
          const difference=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));
          return Math.abs(difference)<=arc/2;
        });
        if(overlapsArc)this.damageEnemy(enemy,damage,status,statusDuration);
      }
    }

    hitDashPath(x1,y1,x2,y2,damage,status,statusDuration,color) {
      for (const enemy of this.enemies.getChildren()) {
        if (!enemy.active || !enemy.alive) continue;
        const body=enemy.body;
        const bodyArea={x:body.x-13,y:body.y-13,right:body.x+body.width+13,bottom:body.y+body.height+13};
        const dashLine=new Phaser.Geom.Line(x1,y1,x2,y2);
        if (Phaser.Geom.Intersects.LineToRectangle(dashLine,bodyArea)) {
          this.damageEnemy(enemy,damage,status,statusDuration);
          this.burst(enemy.x,enemy.y,color,5,70);
        }
      }
    }

    createSkillHitZone(x,y,radius,skill,color) {
      const zone=this.add.circle(x,y,radius,color,.09).setStrokeStyle(2,color,.8).setDepth(y+14);
      this.physics.add.existing(zone);
      zone.body.setCircle(radius).setAllowGravity(false).setImmovable(true);
      const record={object:zone,expires:this.time.now+180,collider:null,hitTargets:new Set()};
      record.collider=this.physics.add.overlap(zone,this.enemies,(shape,enemy)=>{
        if(!shape.active||!enemy?.active||!enemy.alive||record.hitTargets.has(enemy))return;
        record.hitTargets.add(enemy);
        this.damageEnemy(enemy,skill.damage,skill.status,skill.statusDuration||skill.duration);
      });
      this.skillHitZones.push(record);
      this.ring(x,y,color,radius);
      this.tweens.add({targets:zone,alpha:0,scale:1.08,duration:180,onComplete:()=>this.removeSkillHitZone(record)});
      return record;
    }

    removeSkillHitZone(record) {
      if(!record||!this.skillHitZones?.includes(record))return;
      this.skillHitZones=this.skillHitZones.filter(zone=>zone!==record);
      if(record.collider)this.physics.world.removeCollider(record.collider);
      this.tweens.killTweensOf(record.object);
      record.object.body.enable=false;
      record.object.destroy();
      record.hitTargets.clear();
    }

    removeProjectile(shot) {
      if(!shot||shot.removed)return;
      shot.removed=true;
      if(shot.overlapCollider)this.physics.world.removeCollider(shot.overlapCollider);
      if(shot.obstacleCollider)this.physics.world.removeCollider(shot.obstacleCollider);
      if(shot.sprite?.body)shot.sprite.body.enable=false;
      shot.sprite?.destroy();shot.tail?.destroy();
      shot.smokeParticles?.forEach(particle=>{this.tweens.killTweensOf(particle);particle.destroy();});
      shot.smokeParticles?.clear();shot.hitTargets?.clear();
      this.projectiles=this.projectiles.filter(projectile=>projectile!==shot);
    }

    castSkill(slot=1) {
      const time=this.time.now,skills=window.CLASS_SKILLS[this.character.classId]||[],skill=skills[slot-1];
      if(!skill)return;
      const readyAt=this.skillCooldowns[slot]||0;
      if(time<readyAt){this.emit(`${skill.name}: recarga ${((readyAt-time)/1000).toFixed(1)} s.`);return;}
      const resource=skill.costType==='mana'?'mana':'stamina';
      if(this.character[resource]<skill.cost){this.emit(`${resource==='mana'?'Mana':'Vigor'} insuficiente para ${skill.name}.`);return;}
      const aim=this.getAim();
      const aimPoint=this.input.activePointer;
      const targetX=Number.isFinite(aimPoint?.worldX)?aimPoint.worldX:this.player.x+Math.cos(aim)*780;
      const targetY=Number.isFinite(aimPoint?.worldY)?aimPoint.worldY:this.player.y+Math.sin(aim)*780;
      this.character[resource]-=skill.cost;
      this.skillCooldowns[slot]=time+skill.cooldown*1000;
      if(resource==='mana')this.manaRegenAt=time+900;
      this.playHeroAction('skill');
      const color=skill.color||0xd1a35c;
      const isSummon=skill.effect.startsWith('summon');
      const texture=isSummon?'summoned-skeleton':this.character.classId==='arqueiro'?'spell-arrow':this.character.classId==='ladino'?'spell-blood':this.character.classId==='bardo'?'spell-note':['paladino','clerigo'].includes(this.character.classId)?'spell-holy':skill.icon==='fire'?'spell-fire':'spell-orb';
      const launch=(angle=aim,damage=skill.damage,spread=0)=>this.fireProjectile(angle+spread,texture,damage,skill.speed||420,isSummon,skill.scale||1,{range:skill.range||780,hitboxRadius:skill.hitboxRadius||(isSummon?11:7),status:skill.status,statusDuration:skill.statusDuration||skill.duration});
      switch(skill.effect){
        case 'projectile': case 'summon': launch(aim); break;
        case 'melee': {
          const arc=(skill.arcDeg||110)*Math.PI/180;
          this.slash(this.player.x,this.player.y,color,skill.range||86,aim);
          this.hitArc(this.player.x,this.player.y,aim,skill.range||86,arc,skill.damage,skill.status,skill.statusDuration||skill.duration);
          this.burst(this.player.x+Math.cos(aim)*34,this.player.y+Math.sin(aim)*34,color,7,90);
          break;
        }
        case 'volley': case 'summonVolley':
        case 'multi': case 'summonMulti':
          for(let i=0;i<(skill.count||3);i+=1)launch(aim,(skill.damage||0),(i-(skill.count-1)/2)*(skill.spread||.12));
          break;
        case 'area': case 'areaGuard': {
          if(this.character.classId==='guerreiro'&&skill.icon==='cleave'){
            this.slash(this.player.x,this.player.y,color,skill.radius||105,aim);
            this.hitArc(this.player.x,this.player.y,aim,skill.radius||105,Math.PI*2/3,skill.damage,skill.status,skill.statusDuration||skill.duration);
          } else {
            const selfCentered=skill.effect==='areaGuard'||(this.character.classId==='guerreiro'&&skill.icon==='spin');
            const x=selfCentered?this.player.x:targetX,y=selfCentered?this.player.y:targetY;
            this.burst(x,y,color,18,145);
            this.createSkillHitZone(x,y,skill.radius||140,skill,color);
          }
          if(skill.effect==='areaGuard')this.invulnerableUntil=time+(skill.duration||2000);
          this.cameraShake(90,.0025);break;
        }
        case 'dash': {
          const startX=this.player.x,startY=this.player.y,dash=skill.dash||100;
          const endX=startX+Math.cos(aim)*dash,endY=startY+Math.sin(aim)*dash;
          this.player.setPosition(endX,endY);this.player.setVelocity(0,0);
          this.slash(endX,endY,color,skill.radius||80,aim);this.burst(endX,endY,color,12,130);
          if(skill.damage>0)this.hitDashPath(startX,startY,endX,endY,skill.damage,skill.status,skill.statusDuration||skill.duration,color);
          break;
        }
        case 'heal': case 'healGuard': {
          const healed=Math.min(skill.damage,this.character.maxLife-this.character.life);this.character.life+=healed;
          this.ring(this.player.x,this.player.y,color,120);this.burst(this.player.x,this.player.y,color,20,100);
          if(skill.effect==='healGuard')this.invulnerableUntil=time+(skill.duration||2200);
          this.emit(`${skill.name}: ${healed} de vida restaurada.`);break;
        }
        case 'guard':
          this.invulnerableUntil=time+(skill.duration||4000);this.ring(this.player.x,this.player.y,color,125);this.burst(this.player.x,this.player.y,color,12,75);break;
        case 'stamina': case 'staminaGuard':
          this.character.stamina=Math.min(this.character.maxStamina,this.character.stamina+skill.damage);
          this.ring(this.player.x,this.player.y,color,120);this.burst(this.player.x,this.player.y,color,16,95);
          if(skill.effect==='staminaGuard')this.invulnerableUntil=time+(skill.duration||1800);break;
      }
      this.emit(`${skill.name} usada. Recarga: ${skill.cooldown}s.`);this.emit('hud');
    }

    playHeroAction(sound = 'attack') {
      window.gameAudio?.play(sound);
      this.player.play(`${this.heroKey}-attack`,true);
      this.attackAnimUntil=this.time.now+220;
      this.time.delayedCall(220,()=>{if(this.player?.active)this.player.play(`${this.heroKey}-${this.isWalking?'walk':'idle'}`,true);});
    }

    fireProjectile(angle,texture,damage,speed,summoned=false,scale=1,options={}) {
      if(!Number.isFinite(angle))return;
      const x=this.player.x,y=this.player.y-7;
      const shot=this.physics.add.image(x,y,texture).setScale(scale).setDepth(y+20);
      const radius=options.hitboxRadius||Math.max(5,7*scale);
      shot.body.setCircle(radius);shot.body.setAllowGravity(false);
      shot.setRotation(summoned?0:angle+Math.PI/4).setFlipX(summoned&&Math.cos(angle)<0);
      shot.setVelocity(Math.cos(angle)*speed,Math.sin(angle)*speed);
      const tail=this.add.graphics().setDepth(shot.depth-1);
      const record={sprite:shot,tail,damage,speed,angle,summoned,smokeTrail:options.smokeTrail===true,smokeAt:0,smokeParticles:new Set(),status:options.status,statusDuration:options.statusDuration,
        range:options.range||780,startX:x,startY:y,expires:this.time.now+(options.range||780)/speed*1000,hitTargets:new Set(),removed:false};
      record.overlapCollider=this.physics.add.overlap(shot,this.enemies,(projectile,enemy)=>{
        if(record.removed||!projectile.active||!enemy?.active||!enemy.alive||record.hitTargets.has(enemy))return;
        record.hitTargets.add(enemy);
        this.damageEnemy(enemy,record.damage,record.status,record.statusDuration);
        this.burst(projectile.x,projectile.y,record.summoned?0xb99adf:0xf1d996,8,85);
        this.removeProjectile(record);
      });
      record.obstacleCollider=this.physics.add.collider(shot,this.obstacles,()=>this.removeProjectile(record));
      this.projectiles.push(record);
      this.burst(x,y,summoned?0xa88bc6:0xecd18a,5,55);
    }

    updateProjectiles(delta) {
      const now=this.time.now;
      for(const shot of this.projectiles.slice()){
        if(shot.removed)continue;
        if(!shot.sprite.active||now>=shot.expires||Phaser.Math.Distance.Between(shot.startX,shot.startY,shot.sprite.x,shot.sprite.y)>=shot.range){this.removeProjectile(shot);continue;}
        shot.sprite.setDepth(shot.sprite.y+10);
        if(shot.smokeTrail){
          shot.tail.clear();
          if(now>=shot.smokeAt){
            shot.smokeAt=now+45;
            const particle=this.add.circle(shot.sprite.x-Math.cos(shot.angle)*10,shot.sprite.y-Math.sin(shot.angle)*10,Phaser.Math.Between(4,7),Phaser.Utils.Array.GetRandom([0x76528d,0x9b72b5,0xb89acb]),.48).setDepth(shot.sprite.depth-1);
            shot.smokeParticles.add(particle);
            this.tweens.add({targets:particle,x:particle.x-Math.cos(shot.angle)*14+Phaser.Math.Between(-4,4),y:particle.y-Math.sin(shot.angle)*14+Phaser.Math.Between(-4,4),alpha:0,scale:1.7,duration:420,onComplete:()=>{shot.smokeParticles.delete(particle);particle.destroy();}});
          }
        }else{
          shot.tail.clear();shot.tail.lineStyle(shot.summoned?3:2,shot.summoned?0xb69bd7:0xf0d9a6,.7);
          shot.tail.lineBetween(shot.sprite.x,shot.sprite.y,shot.sprite.x-Math.cos(shot.angle)*18,shot.sprite.y-Math.sin(shot.angle)*18);
        }
      }
    }

    slash(x,y,color,radius,angle=this.getAim()) {
      const graphic=this.add.graphics().setDepth(y+30);
      graphic.lineStyle(8,color,.95);graphic.beginPath();graphic.arc(0,0,radius,-1.05,1.1,false);graphic.strokePath();
      graphic.setPosition(x,y-8);graphic.setRotation(angle);
      this.tweens.add({targets:graphic,alpha:0,scaleX:1.2,scaleY:1.2,duration:230,onComplete:()=>graphic.destroy()});
      this.burst(x+24,y-18,color,6,100);
    }

    ring(x,y,color,radius) {
      const ring=this.add.circle(x,y,14,color,0).setStrokeStyle(6,color,.9).setDepth(y+15);
      this.tweens.add({targets:ring,radius,alpha:0,duration:480,ease:'Cubic.Out',onUpdate:()=>ring.setStrokeStyle(Math.max(1,6*(1-ring.radius/radius)),color,Math.max(0,1-ring.radius/radius)),onComplete:()=>ring.destroy()});
    }

    burst(x,y,color,count,speed) {
      for(let i=0;i<count;i+=1){
        const angle=Math.random()*Math.PI*2,dist=Phaser.Math.Between(8,22),size=Phaser.Math.Between(2,5);
        const particle=this.add.circle(x+Math.cos(angle)*dist,y+Math.sin(angle)*dist,size,color,.9).setDepth(y+40);
        this.tweens.add({targets:particle,x:particle.x+Math.cos(angle)*speed*.3,y:particle.y+Math.sin(angle)*speed*.3,alpha:0,scale:.25,duration:Phaser.Math.Between(260,480),onComplete:()=>particle.destroy()});
      }
    }

    cameraShake(duration=80,intensity=.002) {this.cameras.main.shake(duration,intensity);}

    damageEnemy(enemy,amount,status=null,statusDuration=2200) {
      if(!enemy?.active||!enemy.alive)return;
      window.gameAudio?.play('hit');
      enemy.hp-=amount;enemy.flashUntil=this.time.now+100;enemy.healthFill.setScale(Math.max(0,enemy.hp/enemy.maxHp),1);
      const color=status==='sangramento'?0xd65a63:0xf1d996;
      const number=this.add.text(enemy.x,enemy.y-47,`-${amount}`,{fontFamily:'Georgia',fontSize:'15px',fontStyle:'bold',color:`#${color.toString(16)}`,stroke:'#211e1d',strokeThickness:3}).setOrigin(.5).setDepth(enemy.y+20);
      this.tweens.add({targets:number,y:number.y-27,alpha:0,duration:620,onComplete:()=>number.destroy()});
      if(status==='sangramento'){enemy.setTint(0xc74754);this.time.delayedCall(700,()=>enemy.active&&enemy.clearTint());}
      if(status==='lento')enemy.slowUntil=this.time.now+statusDuration;
      if(enemy.hp<=0){enemy.alive=false;enemy.setVelocity(0,0);enemy.setTint(0x5b4b40);enemy.setAlpha(.45).setActive(false);enemy.body.enable=false;enemy.healthBack.destroy();enemy.healthFill.destroy();enemy.label.destroy();
        this.character.kills=(this.character.kills||0)+1;this.addExperience(enemy.xp);this.rollLoot(enemy);this.emit(`${enemy.name} derrotado. +${enemy.xp} XP.`);
        this.time.delayedCall(10000,()=>this.respawnEnemy(enemy));
      }
    }

    respawnEnemy(enemy) {
      if(!this.sys.isActive())return;
      enemy.alive=true;enemy.hp=enemy.maxHp;enemy.setAlpha(1).clearTint().setActive(true).setVisible(true).setPosition(enemy.spawnX||enemy.x,enemy.spawnY||enemy.y);enemy.body.enable=true;
      this.configureEnemyHitbox(enemy,enemy.kind);
      enemy.healthBack=this.add.rectangle(enemy.x,enemy.y-40,46,5,0x191a18).setDepth(enemy.y+2);
      enemy.healthFill=this.add.rectangle(enemy.x-23,enemy.y-40,46,4,0xb85749).setOrigin(0,.5).setDepth(enemy.y+3);
      enemy.label=this.add.text(enemy.x,enemy.y-55,enemy.name,{fontFamily:'Georgia',fontSize:'10px',color:'#eee0c2',stroke:'#201f1d',strokeThickness:3}).setOrigin(.5).setDepth(enemy.y+4).setAlpha(0);
    }

    addExperience(amount) {
      this.character.xp=(this.character.xp||0)+amount;
      while(this.character.xp>=this.character.xpNext){this.character.xp-=this.character.xpNext;this.character.level+=1;this.character.xpNext=Math.floor(this.character.xpNext*1.35);this.character.maxLife+=5;this.character.maxMana+=3;this.character.maxStamina+=3;this.character.life=this.character.maxLife;this.character.mana=this.character.maxMana;this.character.stamina=this.character.maxStamina;this.emit(`Nível ${this.character.level}! Os recursos máximos aumentaram.`);}
    }

    rollLoot(enemy) {
      const pieces=[
        {name:'Elmo de Ferro da Patrulha',slot:'Capacete',chance:.08,rarity:'Comum'},
        {name:'Peitoral de Couro Reforçado',slot:'Peitoral',chance:.08,rarity:'Comum'},
        {name:'Manoplas do Capataz',slot:'Luvas',chance:.04,rarity:'Incomum'},
        {name:'Botas de Marcha dos Planaltos',slot:'Botas',chance:.08,rarity:'Comum'},
        {name:this.character.weapon,slot:'Arma',chance:.04,rarity:'Incomum'}
      ];
      const found=pieces.filter(piece=>Math.random()<piece.chance);
      if(!found.length)return;
      for(const piece of found)this.createLoot(enemy.x+Phaser.Math.Between(-28,28),enemy.y+Phaser.Math.Between(-18,18),piece.name,piece.slot,piece.rarity);
      this.emit(`Equipamento caiu: ${found.map(piece=>piece.name).join(', ')}. Pressione E para pegar.`);
    }

    createLoot(x,y,name,slot,rarity) {
      const icon=this.add.image(x,y,'loot-glow').setScale(.62).setDepth(y+5);
      this.tweens.add({targets:icon,y:y-6,yoyo:true,repeat:-1,duration:550,ease:'Sine.InOut'});
      const label=this.add.text(x,y-24,name,{fontFamily:'Georgia',fontSize:'11px',color:rarity==='Raro'?'#d8a8e8':'#f0d596',stroke:'#171a18',strokeThickness:3}).setOrigin(.5).setDepth(y+6).setAlpha(.85);
      const loot={x,y,name,slot,rarity,icon,label};this.loot.push(loot);return loot;
    }

    pickupLoot() {
      const item=this.loot.map(loot=>({loot,distance:Phaser.Math.Distance.Between(this.player.x,this.player.y,loot.x,loot.y)})).filter(entry=>entry.distance<70).sort((a,b)=>a.distance-b.distance)[0]?.loot;
      if(!item){this.emit('Nenhum item próximo para pegar.');return;}
      item.icon.destroy();item.label.destroy();this.loot=this.loot.filter(loot=>loot!==item);
      window.gameAudio?.play('pickup');
      const equipmentKey={Capacete:'helmet',Peitoral:'chest',Luvas:'gloves',Botas:'boots'}[item.slot];
      if(item.slot==='Arma')this.character.weapon=item.name;else this.character.equipment[equipmentKey]=item.name;
      this.character.inventory=this.character.inventory||[];this.character.inventory.push({name:item.name,slot:item.slot,rarity:item.rarity});
      this.emit(`Equipado: ${item.name}.`);this.emit('hud');this.save();
    }

    damagePlayer(amount) {
      this.character.life=Math.max(0,this.character.life-amount);
      if(this.character.life<=0){this.character.life=Math.ceil(this.character.maxLife*.65);this.player.setPosition(250,450);this.character.x=250;this.character.y=450;this.emit('Você caiu e voltou ao acampamento. A patrulha permanece.');}
      else this.emit('Você foi atingido. Espere uma abertura antes de atacar.');
    }

    save() {if(window.gameAPI)window.gameAPI.saveCharacter(this.character).catch(()=>{});}
    emit(message) {window.dispatchEvent(new CustomEvent('plateau:message',{detail:message}));}
  }

  window.createHeroPreviewTexture=createPreviewTexture;
  window.PlateauScene=PlateauScene;
})();

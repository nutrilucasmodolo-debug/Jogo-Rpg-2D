const NECRO_LIMITS = Object.freeze({
  maxActive: 15,
  corpseWindow: 5000,
  defaultDetectRange: 440,
  attackHitboxWidth: 34,
  attackHitboxHeight: 26,
  despawnFadeMs: 380
});

const NECROMANCER_SKILLS = [
  { name:'Levantar Caveiras', description:'Ergue três caveiras guerreiras ao seu redor.', effect:'minion', costType:'mana', cost:32, cooldown:14, damage:14, icon:'skull', color:0xc7b695, mode:'aroundPlayer', minionType:'skeletonWarrior', count:3, duration:10000, health:88, speed:118, attackRange:48, attackCooldown:1050, attackWindow:240, detectRange:440 },
  { name:'Mãos dos Mortos', description:'Mãos esqueléticas prendem e ferem inimigos na área.', effect:'minion', costType:'mana', cost:36, cooldown:18, damage:7, icon:'tomb', color:0x8d788e, mode:'targetArea', minionType:'deadHands', count:3, duration:6000, health:52, speed:0, attackRange:72, attackCooldown:800, attackWindow:260, hitboxWidth:104, hitboxHeight:72, status:'lento', statusDuration:1000, detectRange:105 },
  { name:'Legião Espectral', description:'Lança quatro almas que atravessam e perseguem inimigos.', effect:'minion', costType:'mana', cost:40, cooldown:21, damage:16, icon:'soul', color:0xb8a6d5, mode:'line', minionType:'spectralSoul', count:4, duration:8000, health:48, speed:230, attackRange:48, attackCooldown:1050, attackWindow:650, chargeDuration:650, detectRange:500, lineSpacing:46 },
  { name:'Portal do Além', description:'Abre um portal que envia caveiras aliadas para a batalha.', effect:'minion', costType:'mana', cost:48, cooldown:30, damage:12, icon:'tomb', color:0x9c80b8, mode:'portal', minionType:'skeletonWarrior', count:1, duration:8000, health:58, speed:112, attackRange:46, attackCooldown:1150, attackWindow:240, detectRange:440, spawnInterval:1500, portalHealth:110, minionDuration:6500 },
  { name:'Ressurreição', description:'Ergue como caveiras os inimigos mortos há pouco.', effect:'minion', costType:'mana', cost:54, cooldown:34, damage:16, icon:'army', color:0xc2a6d6, mode:'fromCorpses', minionType:'skeletonWarrior', count:15, duration:12000, health:72, speed:105, attackRange:48, attackCooldown:1100, attackWindow:240, detectRange:460, corpseWindow:5000, damageScale:.82, healthScale:.62, speedScale:.9 }
];

const MINION_TEXTURES = Object.freeze({
  skeletonWarrior:'godfall-necro-skeleton',
  deadHands:'godfall-necro-hands',
  spectralSoul:'godfall-necro-soul',
  portal:'godfall-necro-portal'
});

function makeTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) return;
  const graphics = scene.make.graphics({ x:0, y:0, add:false });
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function createNecromancerTextures(scene) {
  makeTexture(scene,MINION_TEXTURES.skeletonWarrior,48,64,(g)=>{
    g.fillStyle(0x171512,.36);g.fillEllipse(24,59,34,8);
    g.fillStyle(0xd7cdb4,1);g.fillEllipse(24,14,23,22);g.fillStyle(0x241d1a,1);g.fillEllipse(18,14,5,7);g.fillEllipse(30,14,5,7);
    g.fillStyle(0xb98d65,1);g.fillTriangle(24,20,20,25,28,25);
    g.lineStyle(5,0xcfc3a8,1);g.lineBetween(16,27,14,48);g.lineBetween(32,27,34,48);g.lineBetween(17,35,31,35);
    g.lineStyle(4,0xb9aa8e,1);g.lineBetween(17,46,15,59);g.lineBetween(31,46,34,59);g.lineBetween(14,31,5,43);g.lineBetween(34,31,44,24);
    g.lineStyle(3,0x9f8b6f,1);g.lineBetween(18,39,30,39);g.lineBetween(18,43,30,43);
    g.lineStyle(3,0x70563e,1);g.lineBetween(43,27,46,8);g.lineBetween(41,11,48,11);
  });
  makeTexture(scene,MINION_TEXTURES.deadHands,48,48,(g)=>{
    g.fillStyle(0x171512,.32);g.fillEllipse(24,43,38,7);g.lineStyle(7,0xc8b99d,1);g.lineBetween(24,43,24,28);
    g.lineStyle(5,0xd7cbb2,1);g.lineBetween(24,29,9,23);g.lineBetween(24,29,17,12);g.lineBetween(24,29,27,8);g.lineBetween(24,29,37,13);g.lineBetween(24,29,42,23);
    g.fillStyle(0x261f1b,1);g.fillCircle(9,23,3);g.fillCircle(17,12,3);g.fillCircle(27,8,3);g.fillCircle(37,13,3);g.fillCircle(42,23,3);
    g.lineStyle(2,0x8c7860,.9);g.lineBetween(13,25,18,27);g.lineBetween(20,17,22,25);g.lineBetween(29,14,27,25);g.lineBetween(35,18,30,27);
  });
  makeTexture(scene,MINION_TEXTURES.spectralSoul,48,48,(g)=>{
    g.fillStyle(0x9b80bf,.15);g.fillCircle(24,24,23);g.fillStyle(0xc8b6e4,.84);g.fillCircle(24,22,14);
    g.fillStyle(0x30273b,1);g.fillEllipse(19,21,4,6);g.fillEllipse(29,21,4,6);g.fillStyle(0xeadff4,.9);g.fillTriangle(24,27,17,42,31,42);
    g.fillStyle(0xa289bf,.7);g.fillTriangle(8,23,2,16,11,17);g.fillTriangle(40,23,46,16,37,17);
  });
  makeTexture(scene,MINION_TEXTURES.portal,72,72,(g)=>{
    g.fillStyle(0x161119,.44);g.fillEllipse(36,59,58,15);g.lineStyle(8,0x55416f,.94);g.strokeEllipse(36,39,43,48);
    g.lineStyle(4,0xb49acb,.9);g.strokeEllipse(36,39,27,35);g.fillStyle(0x241b32,.9);g.fillEllipse(36,39,26,34);
    g.lineStyle(3,0xe2c982,.8);g.beginPath();g.moveTo(37,18);g.lineTo(29,31);g.lineTo(39,38);g.lineTo(31,51);g.strokePath();
    g.fillStyle(0xbda6d2,.8);g.fillCircle(22,32,3);g.fillCircle(50,45,3);g.fillCircle(39,55,2);
  });
}

export class SkeletonMinion {
  constructor(manager) {
    this.manager=manager;
    this.scene=manager.scene;
    this.active=false;
    this.sprite=this.scene.physics.add.sprite(-1000,-1000,MINION_TEXTURES.skeletonWarrior);
    this.sprite.setActive(false).setVisible(false).setDepth(-10);
    this.sprite.body.setAllowGravity(false);this.sprite.body.enable=false;
    manager.group.add(this.sprite);
    this.hitbox=this.scene.add.zone(-1000,-1000,NECRO_LIMITS.attackHitboxWidth,NECRO_LIMITS.attackHitboxHeight);
    this.scene.physics.add.existing(this.hitbox);
    this.hitbox.setActive(false);this.hitbox.body.setAllowGravity(false);this.hitbox.body.enable=false;this.hitbox.owner=this;
    manager.attackZones.add(this.hitbox);
    this.hitCooldowns=new Map();
    this.hitTargets=new Set();
    this.attacking=false;
    this.flashUntil=0;
    this.attackTintUntil=0;
    this.expireTween=null;
  }

  activate(config,x,y,extras={}) {
    const now=this.scene.time.now;
    this.config={...config,...extras};
    this.active=true;this.attacking=false;this.isCharging=false;
    this.flashUntil=0;this.attackTintUntil=0;
    this.hitTargets.clear();this.hitCooldowns.clear();
    this.damage=Number(this.config.damage)||1;this.hp=Number(this.config.health)||50;this.maxHp=this.hp;
    this.expiresAt=now+(Number(this.config.duration)||10000);
    this.nextAttackAt=now+180;this.attackEndsAt=0;this.chargeEndsAt=0;
    this.followAngle=Number(extras.followAngle)||Math.random()*Math.PI*2;
    this.facingX=1;this.facingY=0;
    this.stationary=Boolean(extras.stationary);
    const texture=MINION_TEXTURES[this.config.minionType]||MINION_TEXTURES.skeletonWarrior;
    this.sprite.setTexture(texture).setPosition(x,y).setActive(true).setVisible(true).setAlpha(0).setScale(this.config.scale||1).clearTint();
    this.sprite.body.enable=true;this.sprite.body.setAllowGravity(false);this.sprite.body.setCollideWorldBounds(true);
    const bodySize=this.config.minionType==='spectralSoul'?22:this.config.minionType==='deadHands'?25:24;
    this.sprite.body.setSize(bodySize,bodySize+8);
    this.sprite.body.setOffset((48-bodySize)/2,(this.config.minionType==='deadHands'?12:22));
    this.sprite.body.reset(x,y);this.sprite.setDepth(y);
    this.hitbox.setActive(true);this.hitbox.body.setSize(this.config.hitboxWidth||NECRO_LIMITS.attackHitboxWidth,this.config.hitboxHeight||NECRO_LIMITS.attackHitboxHeight);
    this.hitbox.body.enable=false;
    this.manager.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({targets:this.sprite,alpha:1,scaleX:this.config.scale||1,scaleY:this.config.scale||1,duration:240,ease:'Back.Out'});
    if(extras.chargeDirection){
      const direction=extras.chargeDirection;
      this.facingX=direction.x;this.facingY=direction.y;
      this.isCharging=true;this.chargeEndsAt=now+(this.config.chargeDuration||650);
      this.beginAttack(null,now,this.config.chargeDuration||650,true);
      this.sprite.body.setVelocity(direction.x*(this.config.speed||220),direction.y*(this.config.speed||220));
    } else this.sprite.body.setVelocity(0,0);
    this.updateHitboxPosition();
  }

  nearestEnemy(range) {
    return this.scene.enemies.getChildren().filter((enemy)=>enemy.active&&enemy.alive)
      .map((enemy)=>({enemy,distance:Phaser.Math.Distance.Between(this.sprite.x,this.sprite.y,enemy.x,enemy.y)}))
      .filter((entry)=>entry.distance<=range).sort((a,b)=>a.distance-b.distance)[0]||null;
  }

  update(now,delta) {
    if(!this.active)return;
    if(now>=this.expiresAt){this.despawn(true,'expire');return;}
    const dt=Math.min(delta/1000,.05);
    if(now<this.flashUntil)this.sprite.setTint(0xe59c82);
    else if(now<this.attackTintUntil)this.sprite.setTint(0xc4a56e);
    else if(this.config.minionType==='deadHands')this.sprite.clearTint();
    if(this.isCharging){
      if(now<this.chargeEndsAt){this.updateHitboxPosition();this.sprite.setDepth(this.sprite.y+20);return;}
      this.isCharging=false;this.endAttack();this.nextAttackAt=now+Math.max(250,this.config.attackCooldown||1000);
    }
    if(this.attacking){
      if(now>=this.attackEndsAt)this.endAttack();
      else {this.updateHitboxPosition();return;}
    }
    const found=this.nearestEnemy(this.config.detectRange||NECRO_LIMITS.defaultDetectRange);
    const speed=Number(this.config.speed)||0;
    if(found){
      const target=found.enemy,dx=target.x-this.sprite.x,dy=target.y-this.sprite.y;
      if(Math.hypot(dx,dy)>0){this.facingX=dx/Math.hypot(dx,dy);this.facingY=dy/Math.hypot(dx,dy);}
      if(this.stationary){
        this.sprite.body.setVelocity(0,0);
        if(found.distance<=(this.config.attackRange||46)&&now>=this.nextAttackAt)this.beginAttack(target,now);
      }
      else if(found.distance>(this.config.attackRange||46)){
        const moveSpeed=Math.min(speed,Math.max(42,(found.distance-(this.config.attackRange||46))*3.2));
        this.sprite.body.setVelocity(this.facingX*moveSpeed,this.facingY*moveSpeed);
      } else {
        this.sprite.body.setVelocity(0,0);
        if(now>=this.nextAttackAt)this.beginAttack(target,now);
      }
    } else if(this.stationary||!speed){
      this.sprite.body.setVelocity(0,0);
    } else {
      const player=this.scene.player;
      const followX=player.x+Math.cos(this.followAngle)*58,followY=player.y+Math.sin(this.followAngle)*32;
      const dx=followX-this.sprite.x,dy=followY-this.sprite.y,distance=Math.hypot(dx,dy);
      if(distance>72)this.sprite.body.setVelocity(dx/distance*Math.min(speed,Math.max(35,(distance-48)*2.5)),dy/distance*Math.min(speed,Math.max(35,(distance-48)*2.5)));
      else this.sprite.body.setVelocity(0,0);
    }
    if(this.facingX!==0)this.sprite.setFlipX(this.facingX<0);
    this.sprite.setDepth(this.sprite.y);
    this.updateHitboxPosition();
  }

  beginAttack(target,now,duration=this.config.attackWindow||240,charging=false) {
    if(target){
      const dx=target.x-this.sprite.x,dy=target.y-this.sprite.y,length=Math.hypot(dx,dy)||1;
      this.facingX=dx/length;this.facingY=dy/length;
    }
    this.attacking=true;this.hitTargets.clear();
    this.attackEndsAt=now+duration;
    if(!charging)this.nextAttackAt=now+(this.config.attackCooldown||1050);
    this.hitbox.body.enable=true;
    this.updateHitboxPosition();
    if(!this.stationary&&!charging){
      const startX=this.sprite.x,startY=this.sprite.y;
      this.scene.tweens.add({targets:this.sprite,x:startX+this.facingX*12,y:startY+this.facingY*12,duration:100,yoyo:true,ease:'Quad.Out'});
    } else if(this.stationary){
      this.attackTintUntil=now+Math.min(duration,220);
    }
  }

  updateHitboxPosition() {
    if(!this.active)return;
    const width=this.config.hitboxWidth||NECRO_LIMITS.attackHitboxWidth;
    const height=this.config.hitboxHeight||NECRO_LIMITS.attackHitboxHeight;
    const centered=this.config.minionType==='deadHands';
    const x=this.sprite.x+(centered?0:this.facingX*width*.28);
    const y=this.sprite.y+(centered?0:this.facingY*height*.28);
    this.hitbox.setPosition(x,y);this.hitbox.body.reset(x,y);this.hitbox.body.setSize(width,height);
  }

  resolveAttack(enemy) {
    if(!this.active||!this.attacking||!this.hitbox.body.enable||!enemy?.active||!enemy.alive||this.hitTargets.has(enemy))return;
    this.hitTargets.add(enemy);
    this.scene.damageEnemy(enemy,this.damage,this.config.status||null,this.config.statusDuration||1000);
    if(this.config.color)this.manager.scene.burst(enemy.x,enemy.y,this.config.color,5,58);
  }

  takeDamage(amount,now,attacker) {
    if(!this.active||!attacker?.alive)return;
    const nextAt=this.hitCooldowns.get(attacker)||0;
    if(now<nextAt)return;
    this.hitCooldowns.set(attacker,now+(attacker.kind===1?1900:1050));
    this.hp-=Number(amount)||8;this.flashUntil=now+130;
    if(this.hp<=0)this.despawn(true,'slain');
  }

  endAttack() {
    this.attacking=false;this.hitbox.body.enable=false;
    if(this.active&&this.config.minionType==='deadHands')this.sprite.clearTint();
  }

  despawn(animate=true,reason='expire') {
    if(!this.active)return;
    this.active=false;this.endAttack();this.sprite.body.setVelocity(0,0);this.sprite.body.enable=false;
    this.hitbox.body.enable=false;this.hitbox.setActive(false);
    this.manager.removeActive(this);
    if(reason==='expire'||reason==='slain')this.scene.burst(this.sprite.x,this.sprite.y,this.config.color||0xb8a6cf,8,62);
    this.scene.tweens.killTweensOf(this.sprite);
    if(animate&&!this.manager.destroyed){
      this.expireTween=this.scene.tweens.add({targets:this.sprite,alpha:0,scaleX:.12,scaleY:.12,duration:NECRO_LIMITS.despawnFadeMs,ease:'Cubic.In',onComplete:()=>this.finishRelease()});
    } else this.finishRelease();
  }

  finishRelease() {
    this.expireTween=null;
    if(this.manager.destroyed){this.destroy();return;}
    this.sprite.setActive(false).setVisible(false).setAlpha(0).setPosition(-1000,-1000).setScale(1).clearTint();
    this.sprite.body.enable=false;this.hitbox.setActive(false);this.hitbox.body.enable=false;
    this.manager.returnToPool(this);
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.killTweensOf(this.hitbox);
    this.sprite.body.enable=false;this.hitbox.body.enable=false;
    this.sprite.destroy();this.hitbox.destroy();this.hitCooldowns.clear();this.hitTargets.clear();
  }
}

export class MinionManager {
  constructor(scene,options={}) {
    this.scene=scene;
    this.maxActive=Number(options.maxActive)||NECRO_LIMITS.maxActive;
    this.activeMinions=[];this.pool=[];this.allMinions=new Set();this.corpses=[];
    this.destroyed=false;this.portal=null;this.portalCollider=null;
    createNecromancerTextures(scene);
    this.group=scene.physics.add.group({allowGravity:false});
    this.attackZones=scene.physics.add.group({allowGravity:false});
    this.sceneCollider=scene.physics.add.collider(this.group,scene.obstacles);
    this.enemyBodyOverlap=scene.physics.add.overlap(this.group,scene.enemies,(sprite,enemy)=>{
      const minion=sprite.__minion;if(minion&&enemy?.active&&enemy.alive)minion.takeDamage(enemy.damage,scene.time.now,enemy);
    });
    this.attackOverlap=scene.physics.add.overlap(this.attackZones,scene.enemies,(zone,enemy)=>zone.owner?.resolveAttack(enemy));
    this.scene.events.once('shutdown',()=>this.destroy());
  }

  removeActive(minion) {this.activeMinions=this.activeMinions.filter((entry)=>entry!==minion);}

  returnToPool(minion) {
    if(this.destroyed||this.pool.includes(minion))return;
    this.pool.push(minion);
  }

  spawnMinion(config,x,y,extras={}) {
    if(this.destroyed)return null;
    while(this.activeMinions.length>=this.maxActive){
      const oldest=this.activeMinions[0];
      if(!oldest)break;
      oldest.despawn(true,'limit');
    }
    const minion=this.pool.pop()||new SkeletonMinion(this);
    this.allMinions.add(minion);minion.sprite.__minion=minion;
    minion.activate(config,x,y,{...extras,followAngle:extras.followAngle??(this.activeMinions.length*2.399)});
    this.activeMinions.push(minion);
    return minion;
  }

  noteCorpse(enemy,now=this.scene.time.now) {
    if(!enemy)return;
    this.pruneCorpses(now);
    this.corpses.push({x:enemy.x,y:enemy.y,time:now,expiresAt:now+NECRO_LIMITS.corpseWindow,kind:enemy.kind||0,name:enemy.name||'Inimigo',maxHp:enemy.maxHp||50,damage:enemy.damage||8,speed:enemy.speed||50,r:enemy.r||15});
  }

  pruneCorpses(now=this.scene.time.now) {this.corpses=this.corpses.filter((corpse)=>corpse.expiresAt>now);}

  pointerTarget() {
    const pointer=this.scene.input.activePointer;
    if(pointer&&Number.isFinite(pointer.worldX)&&Number.isFinite(pointer.worldY))return {x:pointer.worldX,y:pointer.worldY};
    const player=this.scene.player;
    return {x:player.x+(player.flipX?-180:180),y:player.y};
  }

  castSkill(slot) {
    const scene=this.scene,now=scene.time.now;
    const config=NECROMANCER_SKILLS[slot-1];
    if(!config)return;
    const readyAt=scene.skillCooldowns?.[slot]||0;
    if(now<readyAt){scene.emit(`${config.name}: recarga ${((readyAt-now)/1000).toFixed(1)} s.`);return;}
    if(scene.character[config.costType]<config.cost){scene.emit(`Mana insuficiente para ${config.name}.`);return;}
    const target=this.pointerTarget();
    if(config.mode==='fromCorpses'){
      this.pruneCorpses(now);
      if(!this.corpses.length){scene.emit('Não há inimigos mortos recentemente para ressuscitar.');return;}
    }
    scene.character[config.costType]-=config.cost;
    scene.skillCooldowns[slot]=now+config.cooldown*1000;
    scene.manaRegenAt=now+900;
    scene.playHeroAction('skill');
    switch(config.mode){
      case 'aroundPlayer':this.spawnAroundPlayer(config);break;
      case 'targetArea':this.spawnTargetArea(config,target);break;
      case 'line':this.spawnLine(config,target);break;
      case 'portal':this.openPortal(config,target);break;
      case 'fromCorpses':this.resurrectCorpses(config);break;
    }
    scene.ring(scene.player.x,scene.player.y,config.color||0xb8a6cf,85);
    scene.emit(`${config.name} invocada. Recarga: ${config.cooldown}s.`);scene.emit('hud');
  }

  spawnAroundPlayer(config) {
    const player=this.scene.player,count=config.count||3;
    for(let i=0;i<count;i+=1){
      const angle=(Math.PI*2*i/count)-Math.PI/2;
      const x=player.x+Math.cos(angle)*52,y=player.y+Math.sin(angle)*34;
      this.spawnMinion(config,x,y,{followAngle:angle});
    }
  }

  spawnTargetArea(config,target) {
    const count=config.count||3;
    for(let i=0;i<count;i+=1){
      const angle=(Math.PI*2*i/count)-Math.PI/2;
      const radius=count===1?0:34;
      this.spawnMinion(config,target.x+Math.cos(angle)*radius,target.y+Math.sin(angle)*radius,{stationary:true,centerHitbox:true});
    }
    this.scene.burst(target.x,target.y,config.color||0x9b84a9,16,105);
  }

  spawnLine(config,target) {
    const player=this.scene.player;
    const dx=target.x-player.x,dy=target.y-player.y,length=Math.hypot(dx,dy)||1;
    const direction={x:dx/length,y:dy/length};
    for(let i=0;i<(config.count||4);i+=1){
      const distance=24+i*(config.lineSpacing||46);
      this.spawnMinion(config,player.x+direction.x*distance,player.y+direction.y*distance,{chargeDirection:direction});
    }
  }

  resurrectCorpses(config) {
    this.pruneCorpses();
    const raised=this.corpses.splice(0,config.count||15);
    for(const corpse of raised){
      const large=corpse.kind===2;
      const type=corpse.kind===3?'skeletalHound':'skeletonWarrior';
      this.spawnMinion({...config,minionType:type,damage:Math.max(8,Math.round(corpse.damage*(config.damageScale||.82))),health:Math.max(38,Math.round(corpse.maxHp*(config.healthScale||.62))),speed:Math.max(64,Math.round(corpse.speed*(config.speedScale||.9))),scale:large?1.22:corpse.kind===3?.86:1,duration:config.duration},corpse.x,corpse.y,{followAngle:Math.random()*Math.PI*2});
      this.scene.burst(corpse.x,corpse.y,config.color||0xc2a6d6,10,92);
    }
    this.scene.emit(`${raised.length} ${raised.length===1?'caveira levantada':'caveiras levantadas'} dos cadáveres recentes.`);
  }

  openPortal(config,target) {
    this.closePortal(false);
    const portalSprite=this.scene.physics.add.sprite(target.x,target.y,MINION_TEXTURES.portal).setDepth(target.y+12).setAlpha(0);
    portalSprite.body.setAllowGravity(false);portalSprite.body.setImmovable(true);portalSprite.body.setCircle(22,14,18);portalSprite.body.reset(target.x,target.y);
    const collider=this.scene.physics.add.collider(portalSprite,this.scene.obstacles);
    const label=this.scene.add.text(target.x,target.y-46,`${config.portalHealth} / ${config.portalHealth}`,{fontFamily:'Georgia',fontSize:'10px',color:'#d8c5e5',stroke:'#19131d',strokeThickness:3}).setOrigin(.5).setDepth(target.y+18);
    const back=this.scene.add.rectangle(target.x,target.y-35,46,5,0x19151d).setDepth(target.y+17);
    const fill=this.scene.add.rectangle(target.x-23,target.y-35,46,4,0x9d75b2).setOrigin(0,.5).setDepth(target.y+18);
    this.portal={sprite:portalSprite,collider,label,back,fill,hp:config.portalHealth,maxHp:config.portalHealth,expiresAt:this.scene.time.now+config.duration,nextSpawnAt:this.scene.time.now,config,enemyCooldowns:new Map()};
    this.portalCollider=collider;
    this.scene.tweens.add({targets:portalSprite,alpha:.94,scaleX:1.12,scaleY:1.12,duration:450,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    this.scene.ring(target.x,target.y,config.color||0x9c80b8,100);this.scene.burst(target.x,target.y,config.color||0x9c80b8,18,110);
  }

  updatePortal(now) {
    const portal=this.portal;if(!portal)return;
    if(now>=portal.expiresAt){this.closePortal(true);return;}
    while(now>=portal.nextSpawnAt&&portal.nextSpawnAt<portal.expiresAt&&this.portal===portal){
      const angle=Math.random()*Math.PI*2;
      const spawnConfig={...portal.config,duration:portal.config.minionDuration||6000};
      this.spawnMinion(spawnConfig,portal.sprite.x+Math.cos(angle)*30,portal.sprite.y+Math.sin(angle)*22,{followAngle:angle});
      this.scene.burst(portal.sprite.x,portal.sprite.y,portal.config.color||0x9c80b8,5,48);
      portal.nextSpawnAt+=portal.config.spawnInterval||1500;
    }
    const nowPosition=portal.sprite.y;
    if(now>=portal.flashUntil)portal.sprite.clearTint();
    portal.label.setPosition(portal.sprite.x,portal.sprite.y-46).setText(`${Math.max(0,Math.ceil(portal.hp))} / ${portal.maxHp}`);
    portal.back.setPosition(portal.sprite.x,portal.sprite.y-35).setDepth(nowPosition+17);
    portal.fill.setPosition(portal.sprite.x-23,portal.sprite.y-35).setScale(Math.max(0,portal.hp/portal.maxHp),1).setDepth(nowPosition+18);
    portal.label.setDepth(nowPosition+18);
    const hitRange=70;
    for(const enemy of this.scene.enemies.getChildren()){
      if(!enemy.active||!enemy.alive||Phaser.Math.Distance.Between(enemy.x,enemy.y,portal.sprite.x,portal.sprite.y)>hitRange)continue;
      const ready=portal.enemyCooldowns.get(enemy)||0;
      if(now<ready)continue;
      portal.enemyCooldowns.set(enemy,now+(enemy.kind===1?1800:1050));
      portal.hp-=enemy.damage||8;portal.flashUntil=now+120;portal.sprite.setTint(0xe1a29a);
      if(portal.hp<=0){this.scene.emit('Os inimigos destruíram o Portal do Além.');this.closePortal(true);return;}
    }
  }

  closePortal(animate=true) {
    const portal=this.portal;if(!portal)return;
    this.portal=null;
    if(portal.collider)this.scene.physics.world.removeCollider(portal.collider);
    this.portalCollider=null;
    portal.sprite.body.enable=false;
    portal.label.destroy();portal.back.destroy();portal.fill.destroy();
    this.scene.tweens.killTweensOf(portal.sprite);
    if(animate&&!this.destroyed){
      this.scene.tweens.add({targets:portal.sprite,alpha:0,scaleX:.1,scaleY:.1,duration:360,onComplete:()=>portal.sprite.destroy()});
    } else portal.sprite.destroy();
    portal.enemyCooldowns.clear();
  }

  update(now,delta) {
    if(this.destroyed)return;
    this.pruneCorpses(now);this.updatePortal(now);
    for(const minion of this.activeMinions.slice())minion.update(now,delta);
  }

  destroy() {
    if(this.destroyed)return;
    this.destroyed=true;
    this.closePortal(false);
    for(const minion of this.allMinions)minion.destroy();
    this.allMinions.clear();this.activeMinions.length=0;this.pool.length=0;this.corpses.length=0;
    for(const collider of [this.sceneCollider,this.enemyBodyOverlap,this.attackOverlap])if(collider)this.scene.physics.world.removeCollider(collider);
    this.group.clear(false,false);this.attackZones.clear(false,false);
    this.group.destroy(false);this.attackZones.destroy(false);
    if(this.scene.minionManager===this)this.scene.minionManager=null;
  }
}

export function installNecromancerSystem(PlateauScene) {
  if(!PlateauScene?.prototype||PlateauScene.prototype.__necroSystemInstalled)return;
  window.CLASS_SKILLS.necromante=NECROMANCER_SKILLS;
  const prototype=PlateauScene.prototype;
  prototype.__necroSystemInstalled=true;

  const originalCreate=prototype.create;
  prototype.create=function(...args){
    originalCreate.apply(this,args);
    this.minionManager?.destroy();
    this.minionManager=new MinionManager(this);
    this.events.once('shutdown',()=>this.minionManager?.destroy());
  };

  const originalUpdate=prototype.update;
  prototype.update=function(time,delta){
    const result=originalUpdate.call(this,time,delta);
    this.minionManager?.update(time,delta);
    return result;
  };

  const originalDamageEnemy=prototype.damageEnemy;
  prototype.damageEnemy=function(enemy,amount,...args){
    const willDie=Boolean(enemy?.alive&&enemy.hp-amount<=0);
    const corpse=willDie?{x:enemy.x,y:enemy.y,kind:enemy.kind,name:enemy.name,maxHp:enemy.maxHp,damage:enemy.damage,speed:enemy.speed,r:enemy.r}:null;
    const result=originalDamageEnemy.call(this,enemy,amount,...args);
    if(corpse)this.minionManager?.noteCorpse(corpse,this.time.now);
    return result;
  };

  const originalCastSkill=prototype.castSkill;
  prototype.castSkill=function(slot){
    if(this.character?.classId==='necromante'&&this.minionManager)return this.minionManager.castSkill(slot);
    return originalCastSkill.call(this,slot);
  };
}

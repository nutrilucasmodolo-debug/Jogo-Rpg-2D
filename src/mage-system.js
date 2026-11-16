const MAGE_TEXTURES = Object.freeze({
  spark: 'godfall-mage-spark',
  fire: 'godfall-mage-meteor',
  ice: 'godfall-mage-ice'
});

function makeMageTexture(scene, key, draw) {
  if (scene.textures.exists(key)) return;
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(graphics);
  graphics.generateTexture(key, 40, 40);
  graphics.destroy();
}

function createMageTextures(scene) {
  makeMageTexture(scene, MAGE_TEXTURES.spark, g => {
    g.fillStyle(0x5961bd, .2); g.fillCircle(20, 20, 19);
    g.fillStyle(0xa9f7ff, 1); g.fillCircle(20, 20, 8);
    g.fillStyle(0xffffff, .95); g.fillCircle(17, 17, 3);
  });
  makeMageTexture(scene, MAGE_TEXTURES.fire, g => {
    g.fillStyle(0xffa54a, .35); g.fillCircle(20, 20, 18);
    g.fillStyle(0xe44d32, 1); g.fillCircle(20, 20, 12);
    g.fillStyle(0xffd47b, 1); g.fillCircle(16, 15, 6);
  });
  makeMageTexture(scene, MAGE_TEXTURES.ice, g => {
    g.fillStyle(0x85e5ee, .25); g.fillCircle(20, 20, 19);
    g.fillStyle(0xbdfaff, .95); g.fillTriangle(20, 3, 35, 20, 20, 37);
    g.fillStyle(0xf2ffff, 1); g.fillTriangle(20, 7, 28, 20, 20, 31);
  });
}

export class MageSkillSystem {
  constructor(scene) {
    this.scene = scene;
    this.effects = new Set();
    this.statusedEnemies = new Set();
    this.destroyed = false;
    createMageTextures(scene);
    scene.events.once('shutdown', () => this.destroy());
  }

  pointerWorld() {
    const pointer = this.scene.input.activePointer;
    if (pointer && Number.isFinite(pointer.worldX) && Number.isFinite(pointer.worldY)) return { x: pointer.worldX, y: pointer.worldY };
    return { x: this.scene.player.x + (this.scene.player.flipX ? -1 : 1) * 200, y: this.scene.player.y };
  }

  cast(slot) {
    const scene = this.scene;
    const skill = (window.CLASS_SKILLS.mago || [])[slot - 1];
    if (!skill) return;
    const now = scene.time.now;
    const readyAt = scene.skillCooldowns[slot] || 0;
    if (now < readyAt) { scene.emit(`${skill.name}: recarga ${((readyAt - now) / 1000).toFixed(1)} s.`); return; }
    if (scene.character.mana < skill.cost) { scene.emit(`Mana insuficiente para ${skill.name}.`); return; }

    const target = this.pointerWorld();
    scene.character.mana -= skill.cost;
    scene.skillCooldowns[slot] = now + skill.cooldown * 1000;
    scene.manaRegenAt = now + 900;
    scene.playHeroAction('skill');
    switch (skill.id) {
      case 'arcane-spark': this.fireProjectile(skill, target, 'spark'); break;
      case 'fire-rain': this.startFireRain(skill, target); break;
      case 'glacial-prison': this.fireProjectile(skill, target, 'ice'); break;
      case 'ether-step': this.etherStep(skill, target); break;
      case 'astral-pulse': this.astralPulse(skill); break;
    }
    scene.emit(`${skill.name} usada. Recarga: ${skill.cooldown}s.`);
    scene.emit('hud');
  }

  track(object, collider = null) {
    const record = { object, collider, expiresAt: Infinity, hitTargets: new Set() };
    object.__mageEffect = record;
    this.effects.add(record);
    return record;
  }

  createZone(x, y, radius, color, lifetime, onHit, alpha = .18) {
    const scene = this.scene;
    const zone = scene.add.circle(x, y, radius, color, alpha).setStrokeStyle(2, color, .82).setDepth(y + 15);
    scene.physics.add.existing(zone);
    zone.body.setCircle(radius).setAllowGravity(false).setImmovable(true);
    const record = this.track(zone);
    record.expiresAt = scene.time.now + lifetime;
    record.collider = scene.physics.add.overlap(zone, scene.enemies, (shape, enemy) => {
      if (!shape.active || !enemy?.active || !enemy.alive || record.hitTargets.has(enemy)) return;
      record.hitTargets.add(enemy);
      onHit(enemy, record);
    });
    scene.tweens.add({ targets: zone, alpha: 0, scale: 1.12, duration: lifetime, onComplete: () => this.remove(record) });
    return record;
  }

  fireProjectile(skill, target, textureKey) {
    const scene = this.scene;
    const originX = scene.player.x, originY = scene.player.y - 8;
    const dx = target.x - originX, dy = target.y - originY;
    const length = Math.hypot(dx, dy) || 1;
    const vx = dx / length, vy = dy / length;
    const sprite = scene.physics.add.image(originX, originY, MAGE_TEXTURES[textureKey]).setDepth(originY + 20);
    sprite.body.setCircle(skill.projectileRadius);
    sprite.body.setAllowGravity(false);
    sprite.setVelocity(vx * skill.speed, vy * skill.speed);
    sprite.setRotation(Math.atan2(vy, vx));
    const record = this.track(sprite);
    record.startX = originX; record.startY = originY; record.direction = { x: vx, y: vy };
    record.range = skill.range; record.skill = skill; record.kind = 'projectile'; record.projectileType = textureKey; record.remainingHits = textureKey === 'spark' ? 2 : 1;
    record.collider = scene.physics.add.overlap(sprite, scene.enemies, (shot, enemy) => {
      if (!shot.active || !enemy?.active || !enemy.alive || record.hitTargets.has(enemy)) return;
      record.hitTargets.add(enemy);
      if (textureKey === 'ice') {
        this.createIceZone(skill, shot.x, shot.y);
        this.remove(record);
      } else {
        scene.damageEnemy(enemy, skill.damage);
        scene.burst(enemy.x, enemy.y, skill.color, 6, 80);
        record.remainingHits -= 1;
        if (record.remainingHits <= 0) this.remove(record);
      }
    });
    record.obstacleCollider = scene.physics.add.collider(sprite, scene.obstacles, () => {
        if (record.projectileType === 'ice' && sprite.active) this.createIceZone(skill, sprite.x, sprite.y);
      this.remove(record);
    });
    record.colliders = [record.collider, record.obstacleCollider];
    record.expiresAt = scene.time.now + skill.range / skill.speed * 1000 + 250;
    scene.burst(originX, originY, skill.color, 5, 55);
  }

  createIceZone(skill, x, y) {
    this.scene.burst(x, y, skill.color, 20, 100);
    this.createZone(x, y, skill.radius, skill.color, 320, enemy => {
      this.scene.enemyStatusSystem?.apply(enemy, 'imobilizacao', { duration: skill.freezeDuration, color: 0x9cebf0 });
      this.statusedEnemies.add(enemy);
      this.scene.damageEnemy(enemy, skill.damage);
    }, .2);
  }

  startFireRain(skill, target) {
    const scene = this.scene;
    const circle = scene.add.circle(target.x, target.y, skill.radius, skill.color, .045).setStrokeStyle(2, skill.color, .7).setDepth(target.y + 2);
    const record = this.track(circle);
    record.kind = 'fireRain'; record.skill = skill; record.center = target;
    record.expiresAt = scene.time.now + skill.duration;
    record.nextMeteorAt = scene.time.now;
  }

  spawnMeteor(skill, x, y) {
    const scene = this.scene;
    const warning = scene.add.circle(x, y, skill.meteorRadius, skill.color, .1).setStrokeStyle(2, skill.color, .8).setDepth(y + 8);
    const meteor = scene.add.image(x, y - 125, MAGE_TEXTURES.fire).setScale(.9).setDepth(y + 24).setRotation(-.35);
    scene.tweens.add({ targets: meteor, x, y, scale: 1.15, angle: 25, duration: 380, ease: 'Quad.In' });
    const record = this.track(meteor);
    record.warning = warning;
    record.kind = 'meteor'; record.skill = skill; record.impactAt = scene.time.now + 380;
    record.x = x; record.y = y;
  }

  impactMeteor(record) {
    const { skill, x, y } = record;
    this.remove(record);
    this.scene.burst(x, y, skill.color, 12, 105);
    const impact = this.createZone(x, y, skill.meteorRadius, skill.color, 160, enemy => {
      this.scene.damageEnemy(enemy, skill.damage);
      this.applyBurn(enemy, skill);
    }, .34);
    this.scene.tweens.add({ targets: impact.object, scale: 1.3, duration: 150 });
  }

  applyBurn(enemy, skill) {
    this.scene.enemyStatusSystem?.apply(enemy, 'queimadura', {
      duration: skill.burnDuration, tick: skill.burnTick, damage: skill.burnDamage, color: 0xff9d61
    });
    this.statusedEnemies.add(enemy);
  }

  etherStep(skill, target) {
    const scene = this.scene, player = scene.player;
    const dx = target.x - player.x, dy = target.y - player.y;
    const length = Math.hypot(dx, dy) || 1;
    const direction = { x: dx / length, y: dy / length };
    const start = { x: player.x, y: player.y };
    let distance = skill.distance;
    for (let step = 20; step <= skill.distance; step += 20) {
      const x = start.x + direction.x * step, y = start.y + direction.y * step;
      const bounds = new Phaser.Geom.Rectangle(x - 13, y - 18, 26, 36);
      const blocked = scene.obstacles.getChildren().some(obstacle => obstacle.active && Phaser.Geom.Intersects.RectangleToRectangle(bounds, obstacle.getBounds()));
      if (blocked) { distance = step - 20; break; }
    }
    const end = { x: start.x + direction.x * distance, y: start.y + direction.y * distance };
    player.setPosition(end.x, end.y); player.setVelocity(0, 0);
    scene.invulnerableUntil = Math.max(scene.invulnerableUntil || 0, scene.time.now + skill.invulnerability);
    scene.burst(start.x, start.y, skill.color, 14, 105); scene.burst(end.x, end.y, skill.color, 18, 125);
    const hitTargets = new Set();
    const samples = Math.max(1, Math.ceil(distance / 24));
    for (let i = 0; i <= samples; i += 1) {
      const x = start.x + direction.x * distance * i / samples;
      const y = start.y + direction.y * distance * i / samples;
      const record = this.createZone(x, y, skill.trailWidth, skill.color, skill.trailDuration, enemy => {
        if (hitTargets.has(enemy)) return;
        hitTargets.add(enemy); scene.damageEnemy(enemy, skill.damage);
      }, .12);
      record.hitTargets = hitTargets;
    }
    scene.ring(end.x, end.y, skill.color, 70);
  }

  astralPulse(skill) {
    const scene = this.scene, x = scene.player.x, y = scene.player.y;
    scene.burst(x, y, skill.color, 28, 175); scene.cameraShake(170, .004);
    this.createZone(x, y, skill.radius, skill.color, 180, enemy => {
      scene.damageEnemy(enemy, skill.damage);
      const dx = enemy.x - x, dy = enemy.y - y, length = Math.hypot(dx, dy) || 1;
      enemy.setVelocity(dx / length * skill.knockback, dy / length * skill.knockback);
    }, .08);
  }

  update(now) {
    if (this.destroyed) return;
    if (this.scene.character.life <= 0) { this.clear(); return; }
    for (const record of [...this.effects]) {
      if (!record.object.active) { this.remove(record); continue; }
      if (now >= record.expiresAt) { this.remove(record); continue; }
      if (record.kind === 'fireRain' && now >= record.nextMeteorAt) {
        const angle = Math.random() * Math.PI * 2, radius = Math.sqrt(Math.random()) * record.skill.radius;
        this.spawnMeteor(record.skill, record.center.x + Math.cos(angle) * radius, record.center.y + Math.sin(angle) * radius);
        record.nextMeteorAt += record.skill.spawnInterval;
      } else if (record.kind === 'meteor' && now >= record.impactAt) this.impactMeteor(record);
      else if (record.kind === 'projectile') {
        const traveled = Phaser.Math.Distance.Between(record.startX, record.startY, record.object.x, record.object.y);
        if (traveled >= record.range) {
          if (record.projectileType === 'ice') this.createIceZone(record.skill, record.object.x, record.object.y);
          this.remove(record);
        }
      }
    }
  }

  remove(record) {
    if (!record || !this.effects.has(record)) return;
    this.effects.delete(record);
    for (const collider of (record.colliders || [record.collider, record.obstacleCollider])) {
      if (collider) this.scene.physics.world.removeCollider(collider);
    }
    this.scene.tweens.killTweensOf(record.object);
    if (record.warning?.active) { this.scene.tweens.killTweensOf(record.warning); record.warning.destroy(); }
    if (record.object.body) record.object.body.enable = false;
    record.object.destroy();
    record.hitTargets.clear();
  }

  clear() {
    for (const record of [...this.effects]) this.remove(record);
    for (const enemy of this.statusedEnemies) this.scene.enemyStatusSystem?.remove(enemy);
    this.statusedEnemies.clear();
  }

  destroy() { if (this.destroyed) return; this.destroyed = true; this.clear(); if (this.scene.mageSkillSystem === this) this.scene.mageSkillSystem = null; }
}

export function installMageSkillSystem(PlateauScene) {
  if (!PlateauScene?.prototype || PlateauScene.prototype.__mageSkillsInstalled) return;
  const prototype = PlateauScene.prototype;
  prototype.__mageSkillsInstalled = true;
  const originalCreate = prototype.create;
  prototype.create = function (...args) {
    originalCreate.apply(this, args);
    this.mageSkillSystem?.destroy();
    this.mageSkillSystem = new MageSkillSystem(this);
  };
  const originalUpdate = prototype.update;
  prototype.update = function (time, delta) {
    const result = originalUpdate.call(this, time, delta);
    this.mageSkillSystem?.update(time);
    return result;
  };
  const originalCastSkill = prototype.castSkill;
  prototype.castSkill = function (slot) {
    if (this.character?.classId === 'mago' && this.mageSkillSystem) return this.mageSkillSystem.cast(slot);
    return originalCastSkill.call(this, slot);
  };
  const originalDamagePlayer = prototype.damagePlayer;
  prototype.damagePlayer = function (amount, ...args) {
    const wouldFall = this.character?.life > 0 && this.character.life <= amount;
    const result = originalDamagePlayer.call(this, amount, ...args);
    if (wouldFall) this.mageSkillSystem?.clear();
    return result;
  };
}

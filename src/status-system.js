const CONTROL_STATUS = new Set(['imobilizacao', 'atordoamento']);

export class EnemyStatusSystem {
  constructor(scene) {
    this.scene = scene;
    this.statuses = new Map();
  }

  apply(enemy, type, options = {}) {
    if (!enemy?.active || !enemy.alive) return;
    const now = this.scene.time.now;
    let effects = this.statuses.get(enemy);
    if (!effects) { effects = new Map(); this.statuses.set(enemy, effects); }
    const duration = Math.max(0, Number(options.duration) || 0);
    const previous = effects.get(type);
    effects.set(type, {
      expiresAt: Math.max(previous?.expiresAt || 0, now + duration),
      nextTickAt: now + (Number(options.tick) || Infinity),
      tick: Number(options.tick) || 0,
      damage: Number(options.damage) || 0,
      slowFactor: Number(options.slowFactor) || .48,
      color: options.color || null
    });
    if (type === 'lento') enemy.slowUntil = now + duration;
    if (CONTROL_STATUS.has(type)) enemy.immobilizedUntil = Math.max(enemy.immobilizedUntil || 0, now + duration);
    if (type === 'silencio') enemy.silencedUntil = Math.max(enemy.silencedUntil || 0, now + duration);
    if (options.color) enemy.setTint(options.color);
  }

  update(now) {
    for (const [enemy, effects] of this.statuses) {
      if (!enemy.active || !enemy.alive) { this.statuses.delete(enemy); continue; }
      for (const [type, status] of effects) {
        if (now >= status.expiresAt) { effects.delete(type); continue; }
        if (status.damage > 0 && status.tick > 0 && now >= status.nextTickAt) {
          status.nextTickAt += status.tick;
          this.scene.damageEnemy(enemy, status.damage);
          if (!enemy.active || !enemy.alive) break;
        }
      }
      if (!effects.size) {
        this.statuses.delete(enemy);
        if (enemy.active && enemy.alive) enemy.clearTint();
      }
    }
  }

  remove(enemy) { this.statuses.delete(enemy); }
  clear() { this.statuses.clear(); }
}

export function installEnemyStatusSystem(PlateauScene) {
  if (!PlateauScene?.prototype || PlateauScene.prototype.__enemyStatusInstalled) return;
  const prototype = PlateauScene.prototype;
  prototype.__enemyStatusInstalled = true;
  const originalCreate = prototype.create;
  prototype.create = function (...args) {
    originalCreate.apply(this, args);
    this.enemyStatusSystem?.clear();
    this.enemyStatusSystem = new EnemyStatusSystem(this);
    this.events.once('shutdown', () => { this.enemyStatusSystem?.clear(); this.enemyStatusSystem = null; });
  };
  const originalUpdate = prototype.update;
  prototype.update = function (time, delta) {
    this.enemyStatusSystem?.update(time);
    return originalUpdate.call(this, time, delta);
  };
  const originalUpdateEnemies = prototype.updateEnemies;
  prototype.updateEnemies = function (time, delta) {
    const frozen = this.enemies?.getChildren().filter(enemy => enemy.active && enemy.alive && time < (enemy.immobilizedUntil || 0)) || [];
    for (const enemy of frozen) { enemy.body.enable = false; enemy.setActive(false); enemy.setVelocity(0, 0); }
    originalUpdateEnemies.call(this, time, delta);
    for (const enemy of frozen) { enemy.setActive(true); enemy.body.enable = true; enemy.setVelocity(0, 0); }
  };
  const originalDamageEnemy = prototype.damageEnemy;
  prototype.damageEnemy = function (enemy, amount, ...args) {
    const result = originalDamageEnemy.call(this, enemy, amount, ...args);
    if (enemy && !enemy.alive) this.enemyStatusSystem?.remove(enemy);
    return result;
  };
}

(() => {
  const PARTICLE_TEXTURE = 'godfall-vfx-pixel';

  /** Reusable, scene-owned visual effects for Phaser 3.90. */
  class VFXManager {
    constructor(scene) {
      this.scene = scene;
      this.effects = new Set();
      this.destroyed = false;
      this.createParticleTexture();
      scene.events.once('shutdown', this.destroy, this);
    }

    createParticleTexture() {
      if (this.scene.textures.exists(PARTICLE_TEXTURE)) return;
      const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(2, 0, 4, 8);
      graphics.fillRect(0, 2, 8, 4);
      graphics.fillRect(2, 2, 4, 4);
      graphics.generateTexture(PARTICLE_TEXTURE, 8, 8);
      graphics.destroy();
    }

    track(cleanup) {
      let active = true;
      const dispose = () => {
        if (!active) return;
        active = false;
        this.effects.delete(dispose);
        cleanup();
      };
      this.effects.add(dispose);
      return dispose;
    }

    createEmitter(x, y, config, lifetime) {
      const emitter = this.scene.add.particles(x, y, PARTICLE_TEXTURE, config);
      const timer = lifetime > 0 ? this.scene.time.delayedCall(lifetime, () => dispose()) : null;
      const dispose = this.track(() => {
        timer?.remove(false);
        emitter.stop();
        emitter.destroy();
      });
      return { emitter, destroy: dispose };
    }

    /** Attach a bright, configurable particle trail to a projectile sprite. */
    projectileTrail(projectile, options = {}) {
      const colors = options.colors || [0xff4de1, 0x9d4dff, 0x64eaff];
      const trail = this.createEmitter(projectile.x, projectile.y, {
        frequency: options.frequency ?? 24,
        quantity: options.quantity ?? 2,
        lifespan: options.lifespan ?? 360,
        speed: options.speed ?? { min: 8, max: 42 },
        angle: options.angle ?? { min: 0, max: 360 },
        scale: options.scale ?? { start: 0.85, end: 0.05 },
        alpha: options.alpha ?? { start: 0.95, end: 0 },
        rotate: { min: -180, max: 180 },
        tint: colors,
        blendMode: options.blendMode ?? Phaser.BlendModes.ADD
      }, 0);
      trail.emitter.startFollow(projectile, options.offsetX || 0, options.offsetY || 0);
      const stop = trail.destroy;
      trail.destroy = () => {
        trail.emitter.stopFollow();
        stop();
      };
      projectile.once('destroy', trail.destroy);
      return trail;
    }

    /** One-shot particle spray used by impacts and area explosions. */
    particleBurst(x, y, options = {}) {
      const lifespan = options.lifespan ?? 520;
      const burst = this.createEmitter(x, y, {
        frequency: -1,
        lifespan,
        speed: options.speed ?? { min: 70, max: 260 },
        angle: options.angle ?? { min: 0, max: 360 },
        scale: options.scale ?? { start: 1.1, end: 0.04 },
        alpha: options.alpha ?? { start: 1, end: 0 },
        rotate: { min: -180, max: 180 },
        tint: options.colors || [0xffd45e, 0xff5e42, 0xfff5cf],
        blendMode: options.blendMode ?? Phaser.BlendModes.ADD
      }, lifespan + 80);
      burst.emitter.explode(options.count ?? 24, x, y);
      return burst;
    }

    /** Area impact with expanding shock rings and an evaporating particle burst. */
    areaExplosion(x, y, options = {}) {
      const scene = this.scene;
      const color = options.color ?? 0xff6de8;
      const radius = options.radius ?? 110;
      const rings = [0, 1].map(index => {
        const ring = scene.add.circle(x, y, 18 + index * 7, color, 0)
          .setStrokeStyle(index ? 3 : 5, index ? 0xffffff : color, index ? 0.8 : 1)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setDepth((options.depth ?? y) + 30);
        const dispose = this.track(() => {
          scene.tweens.killTweensOf(ring);
          ring.destroy();
        });
        scene.tweens.add({
          targets: ring,
          scale: radius / ring.radius,
          alpha: 0,
          duration: (options.duration ?? 360) + index * 90,
          delay: index * 45,
          ease: 'Cubic.Out',
          onComplete: dispose
        });
        return { object: ring, destroy: dispose };
      });

      const particles = this.particleBurst(x, y, {
        count: options.count ?? 28,
        lifespan: options.lifespan ?? 560,
        speed: options.speed ?? { min: 80, max: 300 },
        colors: options.colors || [color, 0xffffff, 0xffb347]
      });
      if (options.shake !== false) scene.cameras.main.shake(90, 0.0025);
      return { rings, particles, destroy: () => { rings.forEach(ring => ring.destroy()); particles.destroy(); } };
    }

    /** Bright directional slash; angle is the center of the blade arc. */
    meleeSlash(x, y, angle, options = {}) {
      const scene = this.scene;
      const radius = options.radius ?? 78;
      const spread = Phaser.Math.DegToRad(options.arcDeg ?? 100);
      const color = options.color ?? 0xffc95c;
      const slash = scene.add.graphics().setPosition(x, y).setRotation(angle).setDepth((options.depth ?? y) + 40);
      slash.setBlendMode(Phaser.BlendModes.ADD);
      slash.lineStyle(options.width ?? 10, color, 0.95);
      slash.beginPath();
      slash.arc(0, 0, radius, -spread / 2, spread / 2, false);
      slash.strokePath();
      slash.lineStyle(3, 0xffffff, 0.92);
      slash.beginPath();
      slash.arc(0, 0, radius - 5, -spread / 2, spread / 2, false);
      slash.strokePath();
      const dispose = this.track(() => {
        scene.tweens.killTweensOf(slash);
        slash.destroy();
      });
      scene.tweens.add({
        targets: slash,
        alpha: 0,
        scaleX: 1.16,
        scaleY: 1.16,
        duration: options.duration ?? 170,
        ease: 'Cubic.Out',
        onComplete: dispose
      });
      const sparks = this.particleBurst(x + Math.cos(angle) * radius * 0.72, y + Math.sin(angle) * radius * 0.72, {
        count: options.sparkCount ?? 8,
        lifespan: 300,
        speed: { min: 45, max: 150 },
        colors: [color, 0xffffff, options.secondaryColor ?? 0xff785e]
      });
      return { object: slash, sparks, destroy: () => { dispose(); sparks.destroy(); } };
    }

    /** Circular aura that follows a game object until removed or the scene shuts down. */
    aura(target, options = {}) {
      const scene = this.scene;
      const radius = options.radius ?? 34;
      const color = options.color ?? 0x55eaff;
      const container = scene.add.container(target.x, target.y).setDepth((options.depth ?? target.depth) - 1);
      container.setBlendMode(Phaser.BlendModes.ADD);
      const glow = scene.add.circle(0, 0, radius * 0.78, color, 0.12);
      const ring = scene.add.circle(0, 0, radius, color, 0).setStrokeStyle(3, color, 0.95);
      const inner = scene.add.circle(0, 0, radius * 0.68, 0xffffff, 0).setStrokeStyle(1, 0xffffff, 0.55);
      container.add([glow, ring, inner]);
      scene.tweens.add({ targets: glow, alpha: 0.28, scale: 1.14, yoyo: true, repeat: -1, duration: 640, ease: 'Sine.InOut' });
      scene.tweens.add({ targets: ring, scale: 1.1, alpha: 0.48, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.InOut' });
      const motes = scene.add.particles(target.x, target.y, PARTICLE_TEXTURE, {
        frequency: options.frequency ?? 95,
        lifespan: 620,
        speed: { min: 8, max: 36 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.62, end: 0 },
        alpha: { start: 0.9, end: 0 },
        tint: options.colors || [color, 0xffffff],
        blendMode: Phaser.BlendModes.ADD
      });
      motes.startFollow(target);
      const follow = () => {
        if (!target.active) dispose();
        else container.setPosition(target.x, target.y).setDepth((options.depth ?? target.depth) - 1);
      };
      scene.events.on('update', follow);
      const timer = options.duration > 0 ? scene.time.delayedCall(options.duration, () => dispose()) : null;
      const dispose = this.track(() => {
        timer?.remove(false);
        scene.events.off('update', follow);
        scene.tweens.killTweensOf([glow, ring]);
        container.destroy(true);
        motes.stopFollow();
        motes.stop();
        motes.destroy();
      });
      return { object: container, particles: motes, destroy: dispose };
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.effects.forEach(dispose => dispose());
      this.effects.clear();
      this.scene?.events.off('shutdown', this.destroy, this);
      this.scene = null;
    }
  }

  window.VFXManager = VFXManager;
})();

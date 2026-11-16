(() => {
  const $ = (id) => document.getElementById(id);
  const necroSystemReady = import('./necro-system.js')
    .then(({ installNecromancerSystem }) => { installNecromancerSystem(window.PlateauScene); return true; })
    .catch((error) => { console.error('Falha ao carregar o sistema de invocações.', error); return false; });
  const mageSystemReady = Promise.all([import('./status-system.js'), import('./mage-system.js')])
    .then(([statusModule, mageModule]) => {
      statusModule.installEnemyStatusSystem(window.PlateauScene);
      mageModule.installMageSkillSystem(window.PlateauScene);
      return true;
    })
    .catch((error) => { console.error('Falha ao carregar as skills do Mago.', error); return false; });
  const DEFAULT_GAME_SETTINGS = {
    video: { fullscreen: false, resolution: '1280x800' },
    audio: { master: 80, effects: 80, music: 70 },
    mouseSensitivity: 100,
    controls: { moveUp: 'KeyW', moveDown: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD', dodge: 'ShiftLeft', attack: 'Space', skill1: 'Digit1', skill2: 'Digit2', skill3: 'Digit3', skill4: 'Digit4', skill5: 'Digit5', interact: 'KeyE' }
  };
  function loadGameSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem('rpg-coop-settings') || '{}');
      return {
        video: { ...DEFAULT_GAME_SETTINGS.video, ...(stored.video || {}) },
        audio: { ...DEFAULT_GAME_SETTINGS.audio, ...(stored.audio || {}) },
        mouseSensitivity: Number(stored.mouseSensitivity) || DEFAULT_GAME_SETTINGS.mouseSensitivity,
        controls: { ...DEFAULT_GAME_SETTINGS.controls, ...(stored.controls || {}) }
      };
    } catch { return structuredClone(DEFAULT_GAME_SETTINGS); }
  }
  window.gameSettings = loadGameSettings();
  function saveGameSettings() {
    try { localStorage.setItem('rpg-coop-settings', JSON.stringify(window.gameSettings)); } catch { /* local storage can be unavailable in browser previews */ }
  }
  const AUDIO_TONES = {
    attack: { frequency: 245, duration: 0.055, type: 'triangle' },
    skill: { frequency: 480, duration: 0.13, type: 'sine' },
    hit: { frequency: 128, duration: 0.085, type: 'sawtooth' },
    pickup: { frequency: 760, duration: 0.11, type: 'sine' }
  };
  let audioContext = null;
  let effectsBus = null;
  let desiredMusicTrack = 'menu';
  const musicPlayer = new Audio(new URL('./assets/godfall-theme.m4a', document.baseURI).href);
  musicPlayer.loop = true;
  musicPlayer.preload = 'metadata';
  musicPlayer.addEventListener('error', () => {
    console.error('Não foi possível carregar a faixa de música de Godfall.', musicPlayer.error);
  });
  function ensureAudio() {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (AudioContextType) {
      audioContext ||= new AudioContextType();
      if (!effectsBus) {
        effectsBus = audioContext.createGain(); effectsBus.connect(audioContext.destination);
      }
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    }
    updateAudioVolumes();
    if (desiredMusicTrack && musicPlayer.paused) musicPlayer.play().catch(() => {});
    return true;
  }
  function updateAudioVolumes() {
    const audio = window.gameSettings.audio;
    const musicVolume = Math.max(0, Math.min(1, (audio.master / 100) * (audio.music / 100)));
    musicPlayer.volume = musicVolume;
    if (audioContext && effectsBus) {
      effectsBus.gain.setTargetAtTime((audio.master / 100) * (audio.effects / 100), audioContext.currentTime, .04);
    }
  }
  function setMusic(track) {
    desiredMusicTrack = track;
    ensureAudio();
  }
  window.gameAudio = {
    setMusic,
    updateVolumes: updateAudioVolumes,
    resume: ensureAudio,
    play(name) {
      const tone = AUDIO_TONES[name];
      if (!tone || !ensureAudio()) return;
      if (!audioContext || !effectsBus) return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime;
      oscillator.type = tone.type; oscillator.frequency.setValueAtTime(tone.frequency, start);
      gain.gain.setValueAtTime(.12, start); gain.gain.exponentialRampToValueAtTime(0.001, start + tone.duration);
      oscillator.connect(gain); gain.connect(effectsBus);
      oscillator.start(start); oscillator.stop(start + tone.duration);
    }
  };
  document.addEventListener('pointerdown', () => window.gameAudio.resume(), { once: true });
  document.addEventListener('keydown', () => window.gameAudio.resume(), { once: true });
  window.gameAudio.setMusic('menu');
  const titleScreen = $('title-screen');
  const creation = $('creation-screen');
  const gameScreen = $('game-screen');
  const classGrid = $('class-grid');
  const nameInput = $('character-name');
  const startButton = $('start-button');
  const details = $('class-details');
  let selectedClass = null;
  let character = null;
  let worldGame = null;
  let previewGame = null;
  let previewScene = null;
  let previewSprite = null;
  let appearance = { ...APPEARANCE_DEFAULTS };

  function renderClassCards() {
    classGrid.replaceChildren();
    for (const cls of CLASS_DATA) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'class-card'; button.dataset.id = cls.id;
      button.innerHTML = `<strong>${escapeText(cls.name)}</strong><small>${escapeText(cls.role)}</small>`;
      button.addEventListener('click', () => selectClass(cls.id));
      classGrid.append(button);
    }
  }

  function selectClass(id) {
    selectedClass = CLASS_DATA.find((cls) => cls.id === id);
    for (const card of classGrid.children) {
      const selected = card.dataset.id === id;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    }
    details.innerHTML = `<div class="class-portrait ${id}"><span>${selectedClass.name.slice(0,2).toUpperCase()}</span></div><div><strong>${escapeText(selectedClass.description)}</strong><br>Principais: ${escapeText(selectedClass.main)}. Secundários: ${escapeText(selectedClass.secondary)}.<br>Arma inicial: ${escapeText(selectedClass.weapon)}.</div>`;
    startButton.disabled = !nameInput.value.trim();
    updateCharacterPreview();
  }

  function renderAppearanceOptions() {
    document.querySelectorAll('#gender-options .choice-button').forEach((button) => {
      button.addEventListener('click', () => {
        appearance.gender = button.dataset.value;
        document.querySelectorAll('#gender-options .choice-button').forEach((choice) => {
          const selected = choice === button;
          choice.classList.toggle('selected', selected);
          choice.setAttribute('aria-pressed', String(selected));
        });
        updateCharacterPreview();
      });
    });

    const renderSwatches = (containerId, choices, property) => {
      const container = $(containerId);
      for (const option of choices) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'color-swatch';
        button.title = option.name;
        button.setAttribute('aria-label', option.name);
        button.setAttribute('aria-pressed', String(appearance[property] === option.color));
        button.style.setProperty('--swatch-color', `#${option.color.toString(16).padStart(6, '0')}`);
        button.classList.toggle('selected', appearance[property] === option.color);
        button.addEventListener('click', () => {
          appearance[property] = option.color;
          container.querySelectorAll('.color-swatch').forEach((swatch) => {
            const selected = swatch === button;
            swatch.classList.toggle('selected', selected);
            swatch.setAttribute('aria-pressed', String(selected));
          });
          updateCharacterPreview();
        });
        container.append(button);
      }
    };

    renderSwatches('skin-options', APPEARANCE_CHOICES.skin, 'skinColor');
    renderSwatches('hair-options', APPEARANCE_CHOICES.hair, 'hairColor');
    $('beard-toggle').addEventListener('change', (event) => {
      appearance.beard = event.currentTarget.checked;
      $('beard-label').textContent = appearance.beard ? 'Com barba' : 'Sem barba';
      updateCharacterPreview();
    });
  }

  function updateCharacterPreview() {
    const title = $('character-preview-title');
    const subtitle = $('character-preview-subtitle');
    const empty = $('character-preview-empty');
    title.textContent = nameInput.value.trim() || (selectedClass ? 'Viajante' : 'Classe não selecionada');
    const skinName = APPEARANCE_CHOICES.skin.find((option) => option.color === appearance.skinColor)?.name || 'Pele';
    const hairName = APPEARANCE_CHOICES.hair.find((option) => option.color === appearance.hairColor)?.name || 'Cabelo';
    const details = `${appearance.gender === 'feminino' ? 'Feminino' : 'Masculino'} • ${skinName} • ${hairName} • ${appearance.beard ? 'Com barba' : 'Sem barba'}`;
    subtitle.textContent = selectedClass ? `${selectedClass.name} • ${details}` : details;
    if (!selectedClass || !previewScene) return;
    const texture = window.createHeroPreviewTexture(previewScene, selectedClass.id, appearance);
    if (!previewSprite) previewSprite = previewScene.add.image(66, 86, texture).setScale(1.28).setDepth(2);
    else previewSprite.setTexture(texture);
    empty.classList.add('hidden');
  }

  function createCharacterPreview() {
    class CharacterPreviewScene extends Phaser.Scene {
      constructor() { super('character-preview-scene'); }
      create() {
        previewScene = this;
        this.add.circle(66, 76, 49, 0x3f3022, 0.78).setStrokeStyle(1, 0x927e53, 0.8);
        this.add.circle(66, 76, 42, 0x261c15, 0.78).setStrokeStyle(1, 0x65513a, 0.55);
        this.add.ellipse(66, 138, 78, 15, 0x080b0a, 0.58);
        updateCharacterPreview();
      }
    }
    previewGame = new Phaser.Game({
      type: Phaser.CANVAS,
      width: 132,
      height: 154,
      parent: 'character-preview-canvas',
      transparent: true,
      input: { keyboard: false },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, pixelArt: false, roundPixels: false },
      scene: [CharacterPreviewScene]
    });
  }

  function preserveNameFocusAfterSelection() {
    const panel = $('creation-panel');
    let returnToName = false;
    panel.addEventListener('pointerdown', (event) => {
      returnToName = document.activeElement === nameInput && Boolean(event.target.closest('button, input, label'));
    }, true);
    panel.addEventListener('click', () => {
      if (!returnToName) return;
      returnToName = false;
      requestAnimationFrame(() => {
        if (!creation.classList.contains('hidden')) nameInput.focus({ preventScroll: true });
      });
    }, true);
  }

  function escapeText(value) {
    const node = document.createElement('span');
    node.textContent = String(value || '');
    return node.innerHTML;
  }

  function newCharacter(cls, name) {
    return {
      id: `${cls.id}-${crypto.randomUUID()}`,
      name: name.trim().slice(0, 20), classId: cls.id, className: cls.name,
      appearance: { ...appearance },
      level: 1, xp: 0, xpNext: 100,
      maxLife: cls.life, life: cls.life, maxMana: cls.mana, mana: cls.mana,
      maxStamina: cls.stamina, stamina: cls.stamina,
      weapon: cls.weapon, equipment: { helmet: null, chest: null, gloves: null, boots: null },
      inventory: [], x: 250, y: 450, kills: 0
    };
  }

  async function enterGame(nextCharacter) {
    const necroReady = await necroSystemReady;
    if (!necroReady && nextCharacter.classId === 'necromante') {
      $('form-message').textContent = 'O sistema de invocações não carregou. Reinicie o jogo e tente novamente.';
      return;
    }
    const mageReady = await mageSystemReady;
    if (!mageReady && nextCharacter.classId === 'mago') {
      $('form-message').textContent = 'O sistema de skills do Mago não carregou. Reinicie o jogo e tente novamente.';
      return;
    }
    character = nextCharacter;
    character.appearance = { ...APPEARANCE_DEFAULTS, ...(character.appearance || {}) };
    selectedClass = CLASS_DATA.find((cls) => cls.id === character.classId) || CLASS_DATA[0];
    window.pendingCharacter = character;
    creation.classList.add('hidden'); gameScreen.classList.remove('hidden');
    window.gameAudio.setMusic('game');
    window.scrollTo(0, 0);
    $('hud-name').textContent = character.name;
    $('character-title').textContent = character.name;
    $('character-class').textContent = `${selectedClass.name} • ${selectedClass.role}`;
    $('weapon-slot').textContent = character.weapon;
    renderSkillBar(character.classId);
    const equipment = character.equipment || {};
    for (const [slot,index] of [['helmet',0],['chest',1],['gloves',2],['boots',3]]) {
      document.querySelectorAll('.equipment-list li')[index].lastElementChild.textContent = equipment[slot] || '—';
    }
    updateHud();
    if (!worldGame) {
      worldGame = new Phaser.Game({
        type: Phaser.AUTO,
        width: 960, height: 600,
        parent: 'game-container',
        backgroundColor: '#30251b',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 0 } } },
        render: { antialias: true, pixelArt: false, roundPixels: false },
        scene: [PlateauScene]
      });
    } else {
      worldGame.scene.start('plateaus', { character });
    }
    await saveCharacter(false);
    await renderSavedCharacters();
  }

  async function saveCharacter(showMessage = true) {
    if (!character || !window.gameAPI) return;
    try {
      await window.gameAPI.saveCharacter(character);
      if (showMessage) setMessage('Personagem salvo neste computador.');
    } catch (error) {
      if (showMessage) setMessage(`Não foi possível salvar: ${error.message}`);
    }
  }

  async function renderSavedCharacters() {
    if (!window.gameAPI?.listCharacters) return;
    const saved = await window.gameAPI.listCharacters();
    const resumeButton = $('resume-button');
    resumeButton.disabled = saved.length === 0;
    $('resume-label').textContent = saved.length ? 'Escolher personagem' : 'Personagens salvos';
    $('resume-hint').textContent = saved.length ? `${saved.length} ${saved.length === 1 ? 'personagem disponível' : 'personagens disponíveis'}` : 'Nenhum personagem salvo';
    const section = $('saved-characters');
    const list = $('saved-character-list');
    list.replaceChildren(); section.classList.toggle('hidden', saved.length === 0);
    for (const item of saved) {
      const row = document.createElement('div');
      row.className = 'saved-character-entry';
      const loadButton = document.createElement('button');
      loadButton.type = 'button';
      loadButton.className = 'saved-character';
      loadButton.innerHTML = `<strong>${escapeText(item.name)}</strong><small>${escapeText(item.className)} • Nv. ${item.level}</small>`;
      loadButton.addEventListener('click', async () => {
        const loaded = await window.gameAPI.loadCharacter(item.id);
        if (loaded) await enterGame(loaded);
      });
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-character';
      deleteButton.textContent = 'Excluir';
      deleteButton.setAttribute('aria-label', `Excluir ${item.name}`);
      deleteButton.addEventListener('click', async () => {
        const confirmed = window.confirm(`Excluir o personagem “${item.name}”? Esta ação não pode ser desfeita.`);
        if (!confirmed) return;
        deleteButton.disabled = true;
        try {
          await window.gameAPI.deleteCharacter(item.id);
          await renderSavedCharacters();
        } catch (error) {
          deleteButton.disabled = false;
          $('form-message').textContent = `Não foi possível excluir: ${error.message}`;
        }
      });
      row.append(loadButton, deleteButton);
      list.append(row);
    }
  }

  function updateHud() {
    if (!character) return;
    setResource('health',character.life,character.maxLife);
    setResource('mana',character.mana,character.maxMana);
    setResource('stamina',character.stamina,character.maxStamina);
    $('level-value').textContent=character.level;
    $('xp-value').textContent=`${character.xp} / ${character.xpNext} XP`;
    $('xp-bar').style.width=`${Math.min(100,character.xp/character.xpNext*100)}%`;
    $('weapon-slot').textContent=character.weapon;
    const equipment=character.equipment||{};
    for(const [slot,index] of [['helmet',0],['chest',1],['gloves',2],['boots',3]])
      document.querySelectorAll('.equipment-list li')[index].lastElementChild.textContent=equipment[slot]||'—';
    updateSkillBar();
  }

  const SKILL_GLYPHS = {bolt:'ϟ',fire:'♨',frost:'❄',blink:'◎',star:'✦',bone:'⌁',skull:'☠',tomb:'♜',soul:'◈',army:'✹',arrow:'➶',volley:'≋',trap:'⌘',rain:'⇣',pierce:'➤',dagger:'†',knives:'⋔',blood:'♦',shadow:'☾',execute:'⚔',cleave:'╱',charge:'➳',quake:'⌖',guard:'⛨',spin:'✣',holy:'✚',aegis:'⬡',heal:'♡',smite:'☼',bastion:'✥',note:'♫',discord:'≈',hymn:'♬',requiem:'♩'};
  function skillIconData(skill) {
    const color = `#${(skill.color || 0xd1a35c).toString(16).padStart(6,'0')}`;
    const glyph = SKILL_GLYPHS[skill.icon] || '✦';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="g"><stop stop-color="#675036"/><stop offset="1" stop-color="#21170f"/></radialGradient></defs><path d="M32 2 57 16v32L32 62 7 48V16z" fill="url(#g)" stroke="#987548" stroke-width="2"/><path d="M32 7 52 18v27L32 56 12 45V18z" fill="none" stroke="${color}" stroke-opacity=".45"/><text x="32" y="43" text-anchor="middle" font-size="34" font-family="Georgia,Segoe UI Symbol,serif" fill="${color}">${glyph}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  function renderSkillBar(classId) {
    const container = $('skill-bar'); container.replaceChildren();
    const skills = window.CLASS_SKILLS[classId] || [];
    skills.forEach((skill,index) => {
      const button = document.createElement('div'); button.className = 'skill-slot'; button.dataset.skillSlot = String(index + 1);
      button.title = `${skill.name} — ${skill.description} Recarga: ${skill.cooldown}s`;
      button.setAttribute('aria-label', `Tecla ${index + 1}: ${skill.name}. ${skill.description} Recarga ${skill.cooldown} segundos.`);
      const icon = document.createElement('img'); icon.className = 'skill-icon'; icon.src = skillIconData(skill); icon.alt = '';
      const key = document.createElement('kbd'); key.textContent = String(index + 1);
      const name = document.createElement('strong'); name.textContent = skill.name;
      const cost = document.createElement('small'); cost.textContent = `${skill.cost} ${skill.costType === 'mana' ? 'MANA' : 'VIGOR'} · ${skill.cooldown}s`;
      const cooldown = document.createElement('span'); cooldown.className = 'skill-cooldown'; cooldown.setAttribute('aria-hidden','true');
      button.append(icon,key,name,cost,cooldown); container.append(button);
    });
  }
  function updateSkillBar() {
    if (!$('skill-bar') || !character) return;
    const scene = worldGame?.scene?.getScene('plateaus');
    for (const slot of $('skill-bar').children) {
      const until = scene?.skillCooldowns?.[slot.dataset.skillSlot] || 0;
      const remaining = Math.max(0,until - (scene?.time?.now || 0));
      slot.classList.toggle('cooling',remaining > 0);
      slot.querySelector('.skill-cooldown').textContent = remaining > 0 ? `${(remaining / 1000).toFixed(1)}` : '';
    }
  }

  function setResource(name,current,max) {
    $(`${name}-value`).textContent=`${Math.ceil(current)} / ${max}`;
    $(`${name}-bar`).style.width=`${Math.max(0,Math.min(100,current/max*100))}%`;
  }
  function setMessage(message) { $('combat-message').textContent=message; }

  const BINDING_ACTIONS = [
    ['moveUp','Mover para cima'],['moveDown','Mover para baixo'],['moveLeft','Mover à esquerda'],['moveRight','Mover à direita'],
    ['dodge','Esquivar'],['attack','Atacar'],['skill1','Habilidade 1'],['skill2','Habilidade 2'],['skill3','Habilidade 3'],
    ['skill4','Habilidade 4'],['skill5','Habilidade 5'],['interact','Interagir / pegar item']
  ];
  function displayKey(code) {
    const aliases = { Space:'Espaço', ShiftLeft:'Shift', ShiftRight:'Shift', ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→', Enter:'Enter' };
    if (aliases[code]) return aliases[code];
    if (code?.startsWith('Key')) return code.slice(3);
    if (code?.startsWith('Digit')) return code.slice(5);
    return code || '—';
  }

  function renderKeyBindings() {
    const container = $('key-bindings');
    container.replaceChildren();
    for (const [action,label] of BINDING_ACTIONS) {
      const row = document.createElement('div'); row.className = 'key-binding';
      const name = document.createElement('span'); name.className = 'key-binding-label'; name.textContent = label;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = displayKey(window.gameSettings.controls[action]);
      button.setAttribute('aria-label', `${label}: ${displayKey(window.gameSettings.controls[action])}. Alterar tecla`);
      button.addEventListener('click', () => captureKey(action, button));
      row.append(name,button); container.append(row);
    }
  }

  let keyCaptureHandler = null;
  function captureKey(action, button) {
    if (keyCaptureHandler) document.removeEventListener('keydown', keyCaptureHandler, true);
    button.classList.add('capturing'); button.textContent = 'Pressione…'; $('controls-message').textContent = '';
    keyCaptureHandler = (event) => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (event.code === 'Escape') {
        document.removeEventListener('keydown', keyCaptureHandler, true); keyCaptureHandler = null; renderKeyBindings();
        $('controls-message').textContent = 'Alteração cancelada.'; return;
      }
      const allowed = /^Key[A-Z]$|^Digit[0-9]$|^Arrow(Up|Down|Left|Right)$|^(Space|ShiftLeft|ShiftRight|Enter)$/;
      if (!allowed.test(event.code)) { $('controls-message').textContent = 'Use uma letra, número, seta, Espaço, Shift ou Enter.'; return; }
      const conflict = BINDING_ACTIONS.find(([otherAction]) => otherAction !== action && window.gameSettings.controls[otherAction] === event.code);
      if (conflict) { $('controls-message').textContent = `${displayKey(event.code)} já está atribuída a “${conflict[1]}”. Escolha outra tecla.`; return; }
      window.gameSettings.controls[action] = event.code; saveGameSettings();
      document.removeEventListener('keydown', keyCaptureHandler, true); keyCaptureHandler = null; renderKeyBindings();
      $('controls-message').textContent = 'Tecla salva. Ela será usada na próxima entrada no jogo.';
    };
    document.addEventListener('keydown', keyCaptureHandler, true);
  }

  function renderSettings() {
    const settings = window.gameSettings;
    $('display-mode').value = settings.video.fullscreen ? 'fullscreen' : 'windowed';
    $('window-resolution').value = settings.video.resolution;
    $('window-resolution').disabled = settings.video.fullscreen;
    for (const [key,id] of [['master','master-volume'],['effects','effects-volume'],['music','music-volume']]) {
      $(id).value = settings.audio[key]; $(`${id}-value`).value = `${settings.audio[key]}%`; $(`${id}-value`).textContent = `${settings.audio[key]}%`;
    }
    $('mouse-sensitivity').value = settings.mouseSensitivity;
    $('mouse-sensitivity-value').value = `${settings.mouseSensitivity}%`; $('mouse-sensitivity-value').textContent = `${settings.mouseSensitivity}%`;
    renderKeyBindings();
  }

  async function applyVideoOptions() {
    const options = window.gameSettings.video;
    if (!window.gameAPI?.applyWindowOptions) {
      $('settings-save-status').textContent = 'Salvo no navegador; vídeo da janela é configurado no Electron.';
      return;
    }
    try {
      await window.gameAPI.applyWindowOptions(options);
      $('settings-save-status').textContent = 'Opções de vídeo aplicadas e salvas.';
    } catch (error) { $('settings-save-status').textContent = `Não foi possível aplicar o vídeo: ${error.message}`; }
  }

  function openSettings() {
    renderSettings(); $('settings-overlay').classList.remove('hidden');
    $('settings-close').focus();
  }
  function closeSettings() {
    if (keyCaptureHandler) { document.removeEventListener('keydown', keyCaptureHandler, true); keyCaptureHandler = null; }
    $('settings-overlay').classList.add('hidden'); $('settings-button').focus();
  }

  document.querySelectorAll('.settings-tab').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.settings-tab').forEach((tab) => {
      const active = tab === button; tab.classList.toggle('active',active); tab.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('.settings-page').forEach((page) => {
      const active = page.dataset.settingsPage === button.dataset.settingsTab;
      page.classList.toggle('active',active); page.hidden = !active;
    });
  }));
  $('display-mode').addEventListener('change', () => {
    window.gameSettings.video.fullscreen = $('display-mode').value === 'fullscreen';
    $('window-resolution').disabled = window.gameSettings.video.fullscreen;
    saveGameSettings(); applyVideoOptions();
  });
  $('window-resolution').addEventListener('change', () => {
    window.gameSettings.video.resolution = $('window-resolution').value; saveGameSettings(); applyVideoOptions();
  });
  for (const [key,id] of [['master','master-volume'],['effects','effects-volume'],['music','music-volume']]) {
    $(id).addEventListener('input', () => {
      window.gameSettings.audio[key] = Number($(id).value); $(`${id}-value`).textContent = `${$(id).value}%`;
      saveGameSettings();
      window.gameAudio.updateVolumes();
      $('settings-save-status').textContent = 'Volume salvo.';
    });
  }
  $('mouse-sensitivity').addEventListener('input', () => {
    window.gameSettings.mouseSensitivity = Number($('mouse-sensitivity').value);
    $('mouse-sensitivity-value').textContent = `${window.gameSettings.mouseSensitivity}%`;
    saveGameSettings(); $('settings-save-status').textContent = 'Sensibilidade salva.';
  });
  $('reset-controls').addEventListener('click', () => {
    window.gameSettings.controls = { ...DEFAULT_GAME_SETTINGS.controls }; saveGameSettings(); renderKeyBindings();
    $('controls-message').textContent = 'Controles padrão restaurados.';
  });
  $('settings-button').addEventListener('click',openSettings);
  $('settings-close').addEventListener('click',closeSettings);
  $('settings-done').addEventListener('click',closeSettings);
  $('settings-overlay').addEventListener('click',(event) => { if (event.target === $('settings-overlay')) closeSettings(); });
  document.addEventListener('keydown',(event) => { if (event.key === 'Escape' && !$('settings-overlay').classList.contains('hidden') && !keyCaptureHandler) closeSettings(); });
  renderSettings();
  applyVideoOptions();

  async function startGame() {
    if(selectedClass&&nameInput.value.trim()) await enterGame(newCharacter(selectedClass,nameInput.value));
  }

  async function backToTitle() {
    await saveCharacter(false);
    worldGame?.scene.stop('plateaus');
    gameScreen.classList.add('hidden'); creation.classList.add('hidden'); titleScreen.classList.remove('hidden');
    window.gameAudio.setMusic('menu');
    window.scrollTo(0, 0);
    renderSavedCharacters();
  }

  function showCharacterCreation(showSaved = false) {
    titleScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    creation.classList.remove('hidden');
    renderSavedCharacters();
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      previewGame?.scale.refresh();
      if (showSaved) $('saved-characters').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      nameInput.focus({ preventScroll: true });
    });
  }

  nameInput.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedClass && nameInput.value.trim()) startGame();
    }
  });
  nameInput.addEventListener('keyup', (event) => event.stopPropagation());
  nameInput.addEventListener('input',()=>{startButton.disabled=!selectedClass||!nameInput.value.trim();updateCharacterPreview();});
  startButton.addEventListener('click',startGame);
  $('new-game-button').addEventListener('click',() => showCharacterCreation(false));
  $('resume-button').addEventListener('click',() => showCharacterCreation(true));
  $('creation-back-button').addEventListener('click',() => { creation.classList.add('hidden'); titleScreen.classList.remove('hidden'); window.scrollTo(0,0); renderSavedCharacters(); });
  $('back-button').addEventListener('click',backToTitle);
  $('save-button').addEventListener('click',()=>saveCharacter(true));
  window.addEventListener('plateau:message',(event)=>{if(event.detail==='hud')updateHud();else setMessage(event.detail);});

  renderClassCards();
  renderAppearanceOptions();
  preserveNameFocusAfterSelection();
  renderSavedCharacters();
  createCharacterPreview();
  updateCharacterPreview();
  requestAnimationFrame(() => {
    if (!creation.classList.contains('hidden')) nameInput.focus({ preventScroll: true });
  });
})();

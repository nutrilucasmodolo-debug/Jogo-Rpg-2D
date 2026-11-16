window.CLASS_DATA = [
  {id:'mago',name:'Mago',role:'Dano mágico',life:72,mana:120,stamina:82,weapon:'Cajado',main:'Inteligência e Mente',secondary:'Destreza e Vigor',description:'Feitiços de dano e controle à distância. Vida baixa e grande dependência de mana.'},
  {id:'necromante',name:'Necromante',role:'Invocação',life:88,mana:110,stamina:90,weapon:'Cetro funerário',main:'Inteligência e Arcano',secondary:'Mente e Vigor',description:'Todo o dano vem dos mortos-vivos invocados. Dano próprio muito baixo e vida média.'},
  {id:'arqueiro',name:'Arqueiro',role:'Dano à distância',life:96,mana:70,stamina:110,weapon:'Arco',main:'Destreza e Vigor',secondary:'Força e Tenacidade',description:'Ataca de longe com arco, flechas especiais e armadilhas.'},
  {id:'ladino',name:'Ladino',role:'Mobilidade',life:78,mana:72,stamina:118,weapon:'Adagas',main:'Destreza e Arcano',secondary:'Vigor e Tenacidade',description:'Ataca rápido, aproveita aberturas e causa sangramento.'},
  {id:'guerreiro',name:'Guerreiro',role:'Linha de frente',life:125,mana:55,stamina:108,weapon:'Espada e escudo',main:'Força e Vigor',secondary:'Tenacidade e Destreza',description:'Combate corpo a corpo resistente, com armas pesadas ou equilibradas.'},
  {id:'paladino',name:'Paladino',role:'Proteção',life:120,mana:82,stamina:105,weapon:'Maça e escudo',main:'Força, Fé e Vigor',secondary:'Tenacidade e Mente',description:'Segura a linha de frente e protege aliados com habilidades sagradas.'},
  {id:'clerigo',name:'Clérigo',role:'Cura e suporte',life:100,mana:112,stamina:88,weapon:'Maça e símbolo sagrado',main:'Fé e Mente',secondary:'Vigor e Inteligência',description:'Cura, remove efeitos negativos e usa magia sagrada.'},
  {id:'bardo',name:'Bardo',role:'Suporte versátil',life:96,mana:100,stamina:98,weapon:'Lâmina curta e alaúde',main:'Destreza, Mente e Arcano',secondary:'Fé e Vigor',description:'Fortalece aliados, enfraquece inimigos e luta com armas leves.'}
];

const skill = (name, description, effect, costType, cost, cooldown, damage, icon, options = {}) =>
  ({ name, description, effect, costType, cost, cooldown, damage, icon, ...options });

window.CLASS_SKILLS = {
  mago: [
    skill('Fagulha Arcana','Dispara uma fagulha rápida na direção do mouse.','mage','mana',6,.4,12,'bolt',{id:'arcane-spark',classId:'mago',slot:1,type:'projectile',color:0x72dce5,speed:760,projectileRadius:7,range:780}),
    skill('Chuva Ígnea','Meteoros caem por três segundos na posição do mouse.','mage','mana',28,10,18,'fire',{id:'fire-rain',classId:'mago',slot:2,type:'area',color:0xf08042,radius:120,duration:3000,spawnInterval:300,meteorRadius:25,burnDamage:4,burnDuration:3000,burnTick:600}),
    skill('Prisão Glacial','Projétil gélido que congela uma área ao atingir ou esgotar o alcance.','mage','mana',24,12,16,'frost',{id:'glacial-prison',classId:'mago',slot:3,type:'projectile',color:0x8dcad0,speed:320,projectileRadius:10,range:700,radius:100,freezeDuration:2000}),
    skill('Passo Etéreo','Teleporta na direção do mouse e deixa um rastro danoso.','mage','mana',26,8,20,'blink',{id:'ether-step',classId:'mago',slot:4,type:'dash',color:0x8da9c2,distance:200,invulnerability:300,trailDuration:900,trailWidth:28}),
    skill('Pulso Astral','Uma onda expansiva ao redor do mago causa dano e arremessa inimigos.','mage','mana',48,25,54,'star',{id:'astral-pulse',classId:'mago',slot:5,type:'area',color:0xd4b36d,radius:250,knockback:390})
  ],
  necromante: [
    skill('Levantar Caveiras','Ergue três caveiras guerreiras ao seu redor.','minion','mana',32,14,0,'skull',{mode:'aroundPlayer',minionType:'skeletonWarrior',count:3,duration:10000,damage:14,health:88,speed:118,attackRange:48,attackCooldown:1050,detectRange:440,attackWindow:240,color:0xc7b695}),
    skill('Mãos dos Mortos','Mãos esqueléticas prendem e ferem inimigos na área.','minion','mana',36,18,0,'tomb',{mode:'targetArea',minionType:'deadHands',count:3,duration:6000,damage:7,health:52,speed:0,attackRange:72,attackCooldown:800,attackWindow:260,hitboxWidth:104,hitboxHeight:72,status:'lento',statusDuration:1000,detectRange:105,color:0x8d788e}),
    skill('Legião Espectral','Lança quatro almas que atravessam e perseguem inimigos.','minion','mana',40,21,0,'soul',{mode:'line',minionType:'spectralSoul',count:4,duration:8000,damage:16,health:48,speed:230,attackRange:48,attackCooldown:1050,attackWindow:650,chargeDuration:650,detectRange:500,lineSpacing:46,color:0xb8a6d5}),
    skill('Portal do Além','Abre um portal que envia caveiras aliadas para a batalha.','minion','mana',48,30,0,'tomb',{mode:'portal',minionType:'skeletonWarrior',count:1,duration:8000,damage:12,health:58,speed:112,attackRange:46,attackCooldown:1150,attackWindow:240,detectRange:440,spawnInterval:1500,portalHealth:110,minionDuration:6500,color:0x9c80b8}),
    skill('Ressurreição','Ergue como caveiras os inimigos mortos há pouco.','minion','mana',54,34,0,'army',{mode:'fromCorpses',minionType:'skeletonWarrior',count:15,duration:12000,damage:16,health:72,speed:105,attackRange:48,attackCooldown:1100,attackWindow:240,detectRange:460,corpseWindow:5000,damageScale:.82,healthScale:.62,speedScale:.9,color:0xc2a6d6})
  ],
  arqueiro: [
    skill('Tiro Certeiro','Uma flecha rápida e precisa.','projectile','stamina',16,4,28,'arrow',{color:0xcda85f,speed:680}),
    skill('Rajada Tripla','Três flechas em sequência aberta.','volley','stamina',28,9,22,'volley',{color:0xcda85f,count:3,speed:650,spread:.1}),
    skill('Flecha Enredante','Atinge e desacelera o alvo.','projectile','stamina',24,11,20,'trap',{color:0x98a56b,status:'lento',duration:3800}),
    skill('Chuva de Flechas','Dispara uma salva contra vários inimigos.','multi','stamina',34,17,25,'rain',{color:0xd4b36d,count:4,speed:600}),
    skill('Flecha do Carrasco','Um disparo devastador de longo alcance.','projectile','stamina',42,24,74,'pierce',{color:0xe2c37d,speed:760,range:950})
  ],
  ladino: [
    skill('Corte Sombrio','Avança e causa sangramento.','dash','stamina',18,5,29,'dagger',{color:0xd9656a,status:'sangramento',dash:110,radius:82}),
    skill('Leque de Adagas','Lança três adagas em leque.','volley','stamina',27,9,18,'knives',{color:0xc77b68,count:3,spread:.14}),
    skill('Ruptura','Abre um ferimento profundo em um alvo.','melee','stamina',24,12,46,'blood',{color:0xd96062,status:'sangramento',arcDeg:82}),
    skill('Passo das Sombras','Desvia e corta os inimigos próximos.','dash','stamina',32,17,31,'shadow',{color:0x9b6374,status:'sangramento',dash:150,radius:120}),
    skill('Execução','Um golpe mortal contra um alvo próximo.','dash','stamina',45,26,82,'execute',{color:0xe47768,status:'sangramento',dash:95,radius:95})
  ],
  guerreiro: [
    skill('Corte Amplo','Um golpe horizontal pesado.','area','stamina',20,5,30,'cleave',{color:0xc6b38d,radius:105}),
    skill('Investida','Avança e derruba a guarda do alvo.','dash','stamina',26,9,38,'charge',{color:0xc68d5b,dash:130,radius:95}),
    skill('Abalo Sísmico','Esmaga o chão e fere ao redor.','area','stamina',32,14,44,'quake',{color:0xb99a69,radius:150}),
    skill('Postura de Ferro','Reduz o dano recebido por alguns segundos.','guard','stamina',30,18,0,'guard',{color:0xadb1a6,duration:4200}),
    skill('Redemoinho de Aço','Gira e atinge todos os inimigos próximos.','area','stamina',48,26,58,'spin',{color:0xd1c19d,radius:175})
  ],
  paladino: [
    skill('Golpe Consagrado','Um golpe sagrado contra um inimigo.','melee','mana',16,5,28,'holy',{color:0xe4ca78,arcDeg:86}),
    skill('Égide Dourada','Recebe proteção temporária.','guard','mana',25,12,0,'aegis',{color:0xe2c878,duration:4800}),
    skill('Luz Restauradora','Recupera parte da vida.','heal','mana',30,16,42,'heal',{color:0xf0dc9a}),
    skill('Martelo Celeste','Uma onda sagrada fere a área próxima.','area','mana',34,18,43,'smite',{color:0xe8ca75,radius:145}),
    skill('Juramento do Bastião','Grande explosão sagrada e proteção breve.','areaGuard','mana',52,30,64,'bastion',{color:0xf1dfa5,radius:185,duration:2200})
  ],
  clerigo: [
    skill('Toque de Âmbar','Restaura um pouco de vida.','heal','mana',18,5,24,'heal',{color:0xdcc27c}),
    skill('Raio de Julgamento','Dispara luz contra um inimigo.','projectile','mana',20,7,32,'holy',{color:0xf0df9a}),
    skill('Selo Protetor','Cria uma barreira contra dano.','guard','mana',28,14,0,'shield',{color:0xb9c8c0,duration:4200}),
    skill('Círculo de Expiação','Uma onda de luz fere inimigos próximos.','area','mana',36,18,39,'sun',{color:0xe7cf83,radius:150}),
    skill('Milagre da Aurora','Grande cura e proteção temporária.','healGuard','mana',52,30,72,'miracle',{color:0xf5e4ad,duration:2400})
  ],
  bardo: [
    skill('Acorde Revigorante','Recupera vigor.','stamina','mana',14,5,30,'note',{color:0xc8a866}),
    skill('Nota Cortante','Uma nota mágica atinge o inimigo.','projectile','mana',18,7,29,'note',{color:0x82c9b7}),
    skill('Dissonância','Uma onda sonora fere e desacelera.','area','mana',28,13,27,'discord',{color:0x84c4ad,radius:135,status:'lento',duration:2600}),
    skill('Balada de Guerra','Recupera vigor e concede proteção breve.','staminaGuard','mana',34,19,45,'hymn',{color:0xd8b96f,duration:1800}),
    skill('Réquiem dos Soberanos','Uma explosão sonora atinge a área inteira.','area','mana',48,28,55,'requiem',{color:0xd6a675,radius:180})
  ]
};

window.APPEARANCE_DEFAULTS = { gender: 'masculino', skinColor: 0xe1ba91, hairColor: 0x493126, beard: false };
window.APPEARANCE_CHOICES = {
  skin: [
    { name: 'Porcelana', color: 0xf2d6b8 }, { name: 'Clara', color: 0xe1ba91 },
    { name: 'Média', color: 0xc99168 }, { name: 'Morena', color: 0xa96c4c },
    { name: 'Escura', color: 0x774b37 }, { name: 'Retinta', color: 0x452d27 }
  ],
  hair: [
    { name: 'Preto', color: 0x211d1b }, { name: 'Castanho escuro', color: 0x493126 },
    { name: 'Castanho', color: 0x76452f }, { name: 'Ruivo', color: 0xa84032 },
    { name: 'Loiro', color: 0xd2ad62 }, { name: 'Grisalho', color: 0xaaa8a1 },
    { name: 'Branco', color: 0xe2dbca }
  ]
};

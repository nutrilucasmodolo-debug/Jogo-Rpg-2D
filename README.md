<table> <tr> <td width="33%"><img src="https://github.com/user-attachments/assets/8d1c9094-88a9-46e8-8c1b-db5f9ffc8232" alt="Captura 1" width="100%"></td> <td width="33%"><img src="https://github.com/user-attachments/assets/d2850f24-1ae4-4e4c-b823-1e34ee18f6a3" alt="Captura 2" width="100%"></td> <td width="33%"><img src="https://github.com/user-attachments/assets/68ffe741-ab35-4346-bb51-d5d7ec141ae1" alt="Captura 3" width="100%"></td> </tr> <tr> <td width="33%"><img src="https://github.com/user-attachments/assets/249d8f0f-441a-4408-9f79-5df585d65f9b" alt="Captura 4" width="100%"></td> <td width="33%"><img src="https://github.com/user-attachments/assets/f8ae3804-9334-4109-a8dd-565df88739e6" alt="Captura 5" width="100%"></td> <td width="33%"><img src="https://github.com/user-attachments/assets/a3f1457c-4924-46ef-82b2-8129e9e16c3b" alt="Captura 6" width="100%"></td> </tr> </table>

# Godfall

Godfall é um protótipo de RPG de ação 2D em estilo soulslike, pensado para desktop com JavaScript, Electron e Phaser. O projeto busca validar a proposta de combate, a criação de personagem, a exploração de mundo aberto e a jogabilidade cooperativa em um ambiente 2D com foco em leitura de padrões, posicionamento e sobrevivência.

## Visão geral

- Gênero: RPG de ação / soulslike cooperativo
- Plataforma: desktop (Windows, via Electron)
- Motor: Phaser 3
- Estilo visual: fantasia sombria, com elementos de magia, necromancia, fé, arqueirismo e combate intenso
- Status: protótipo de gameplay e validação de mecânicas

O jogo começa nos Planaltos e permite que o jogador explore regiões conectadas de forma não linear. A dificuldade aumenta conforme a região e os inimigos, com foco em sobrevivência, cooperação e domínio do combate em vez de níveis automáticos ou progressão linear forçada.

## Mundo

O mundo é dividido em regiões com identidade própria e desafios distintos:

- Planaltos: região inicial, com vales, pontes, fortalezas e caminhos para exploração
- Terras Nevadas: gelo, cavernas, ruínas soterradas e ambiente hostil
- Deserto: dunas, templos antigos, poços e emboscadas
- Savana: paisagens abertas, feras, armadilhas e caça em grande escala
- Terras das Trevas: área corrompida, sombria e extremamente perigosa

Essas áreas podem ser visitadas em ordem livre, com dificuldade crescente e encontros que exigem leitura e preparação. O mapa também prevê rotas alternativas, atalhos, dungeons e desafios opcionais com chefes.

## Sistema de combate

O combate foi desenhado para ser difícil e decisivo. A intenção é exigir:

- leitura dos ataques e padrões dos inimigos
- uso consciente de esquiva, recursos e posicionamento
- cooperação entre jogadores
- gestão de vida, mana e stamina
- resposta rápida aos golpes de elites e chefes

A proposta de balanceamento se baseia em encontros que pressionam em grupo, com dano alto para erros repetidos e pouca tolerância a decisões ruins.

## Classes e especializações

O protótipo inclui oito classes diferentes, cada uma com identidade, arma, foco de combate e habilidades específicas:

- Mago
- Necromante
- Arqueiro
- Ladino
- Guerreiro
- Paladino
- Clérigo
- Bardo

Cada classe possui:

- arma inicial e estilo de combate
- habilidades exclusivas
- recursos próprios, como mana ou stamina
- papel com foco em dano, suporte, proteção ou mobilidade

## Cooperação e exploração

O jogo foi pensado para multiplayer cooperativo, mas também funciona em solo. Os objetivos de exploração incluem:

- explorar regiões de forma não linear
- descobrir caminhos, atalhos e segredos
- enfrentar patrulhas, elites e chefes opcionais
- superar puzzles e desafios de coordenação
- progredir sem depender de uma linha rígida de missões

## Controles

- WASD ou setas: movimentação
- Shift: esquiva
- Espaço, J ou clique: ataque
- E: interagir / pegar item
- 1 a 5: habilidades da classe

## Executando o projeto

### Instalação

```powershell
npm install
```

### Execução em desenvolvimento

```powershell
npm start
```

### Geração de executável para Windows

```powershell
npm run dist:win
```

O pacote gerado fica na pasta `release/`.

## Estrutura do projeto

```text
src/
  assets/
  classes.js
  game.js
  mage-system.js
  necro-system.js
  status-system.js
  vfx-manager.js
  world-scene.js

electron/
  main.cjs
  preload.cjs

outputs/
  documentos de concepção e planejamento do jogo

release/
  build final gerado para Windows
```

## Nota de desenvolvimento

Este projeto está em fase de protótipo. A intenção atual é validar a direção de arte, a criação de personagem, o combate, a exploração e a estrutura do mundo antes de evoluir para a versão final, com conteúdo mais completo, maior variedade de inimigos, NPCs, chefes principais e expansão da campanha.

## Repositório

Este repositório reúne a base de desenvolvimento do jogo, incluindo a lógica principal, os sistemas de classes, as mecânicas de combate e os documentos de concepção do mundo.

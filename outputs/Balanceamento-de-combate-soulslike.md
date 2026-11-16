# Base de balanceamento de combate — estilo Soulslike

Rascunho para um RPG 2D cooperativo difícil. A intenção é exigir leitura dos ataques, controle de vigor, posicionamento e cooperação. Os números abaixo são alvos para protótipo; devem ser ajustados depois que as habilidades e os atributos das classes estiverem definidos.

## Padrões de dificuldade

- Inimigos comuns são perigosos em grupo. Dois ou três erros seguidos podem derrubar um personagem.
- Ataques fortes têm sinais visuais ou sonoros claros. O jogador pode aprender a responder a cada padrão.
- Ataques rápidos dão menos tempo de reação; ataques pesados causam mais dano e deixam uma abertura maior quando erram.
- Esquiva, corrida, bloqueio e ataques consomem vigor. Atacar até esgotá-lo deixa o personagem vulnerável.
- Cura tem uma animação que pode ser interrompida ou punida se for usada perto de um inimigo.
- Elites e chefes têm movimentos próprios, não apenas mais vida e dano.
- O nível recomendado informa a dificuldade esperada, mas não fecha a entrada da região. Inimigos não escalam para acompanhar o grupo.

## Alvos de combate por tipo

Considerar um jogador no nível recomendado para a região e um ataque básico sem habilidade especial.

| Tipo de inimigo | Golpes básicos para derrotar | Acertos que podem derrubar o jogador | Comportamento esperado |
|---|---:|---:|---|
| Combatente comum | 4–6 | 3–4 | Pressiona em grupo e pune descuido; golpes individuais são legíveis. |
| Atacante à distância | 3–5 | 2–3 | Causa pressão enquanto outros inimigos ocupam a linha de frente; precisa mudar de posição. |
| Inimigo resistente | 7–10 | 2–3 | Controla espaço e protege aliados; tem uma abertura após errar o golpe pesado. |
| Suporte | 3–4 | 2–3 | Tem pouca resistência, mas cura, fortalece ou alerta os demais; deve ser priorizado. |
| Elite | 10–15 | 2–3 | Usa sequência própria de ataques, variação de ritmo e punição para esquivas previsíveis. |
| Chefe opcional | 2–3 fases curtas | 2–4 ataques fortes | Exige aprender padrões, administrar recursos e aproveitar janelas limitadas. |
| Deus principal | 2–3 fases | 2–3 ataques fortes | Confronto longo com padrões que testam várias habilidades aprendidas na campanha. |

Essas faixas são médias: ataques especiais podem causar mais dano, e classes com pouca vida devem sobreviver menos golpes. O jogador deve entender por que foi atingido e ter uma oportunidade real de evitar o próximo golpe.

## Escalada entre regiões

As faixas de nível são referências de dificuldade, não requisitos. As regiões mantêm seus próprios valores e não se ajustam ao nível do personagem. A ordem sugerida acompanha a escalada dos deuses e deixa sobreposição para a exploração livre.

| Região | Nível recomendado | Pressão característica | XP inicial por inimigo comum* |
|---|---:|---|---:|
| Planaltos | 1–15 | Grupos coordenados, correntes, escudos e ataques de cerco. | 10 |
| Terras Nevadas | 12–25 | Gelo que muda o movimento, congelamento e combate com pouca visibilidade. | 13 |
| Savana | 20–35 | Emboscadas, armadilhas, feras velozes e ameaças por vários ângulos. | 16 |
| Deserto | 30–45 | Miragens, investidas, terreno aberto e disputas por posição em torno dos poços. | 20 |
| Subterrâneo | 40–55 | Corredores estreitos, inimigos no teto, explosivos e ataques que ricocheteiam. | 24 |
| Terras das Trevas | 50–65 | Luz limitada, marcas de vigilância e inimigos que atacam a partir da escuridão. | 29 |
| Altacoroa | 60+ | Formações de elite, inimigos aéreos e ataques combinados em plataformas. | 35 |

\*XP inicial ilustrativa. O custo para subir de nível deve crescer ao longo da campanha para que uma área de nível baixo não continue sendo o melhor método de evolução.

## Composição dos grupos

- **Patrulha comum:** 3–5 inimigos, normalmente com combatente de frente e um atacante à distância.
- **Posto guardado:** 4–7 inimigos; inclui suporte ou inimigo resistente, com espaço para abordar por mais de uma rota.
- **Patrulha de elite:** 2–4 inimigos, incluindo ao menos um elite. Deve ser possível observá-la ou contorná-la antes de lutar.
- **Encontro de risco alto:** 5–8 inimigos com papéis complementares e uma recompensa clara. Evitar ataques fora da tela sem aviso.
- Grupos não devem acumular ataques inevitáveis sobre um único jogador. O perigo vem de leitura ruim, posicionamento e recursos mal gastos.

## Experiência e farming

Valores iniciais por tipo de inimigo:

| Categoria | XP inicial |
|---|---:|
| Comum | 10 XP na referência dos Planaltos; aumenta por região conforme a tabela. |
| Atacante à distância ou suporte | 1,2× a XP do comum local. |
| Inimigo resistente | 1,5× a XP do comum local. |
| Elite | 4× a XP do comum local. |
| Patrulha completa | Bônus pequeno por eliminar o grupo inteiro, sem obrigar a derrotar inimigos que o jogador conseguiu evitar. |

Como opção de jogo, inimigos comuns reaparecem quando o grupo descansa ou retorna à região; chefes derrotados permanecem derrotados. Isso permite farm, enquanto a curva crescente de XP evita evolução instantânea em áreas iniciais.

## Chefes difíceis sem dificuldade injusta

- Cada chefe deve ensinar seus sinais antes de combinar golpes mais difíceis.
- Ter ataques rápidos, lentos e atrasados para que o jogador não resolva tudo esquivando no mesmo ritmo.
- Toda sequência forte deve terminar com uma abertura curta, mas reconhecível.
- A segunda fase pode mudar a arena ou acrescentar um padrão, preservando movimentos que o jogador já aprendeu.
- No coop, o chefe pode alternar alvos, cercar o grupo ou criar ameaças simultâneas. A vida não deve simplesmente dobrar por haver dois jogadores.
- Evitar golpes sem sinal, dano inevitável, combinações sem saída e ataques que cubram a arena inteira sem alternativa defensiva.

## A confirmar no protótipo

1. Vida inicial, mana, vigor e valores de dano de cada classe.
2. Custo de vigor, tempo de esquiva e velocidade das animações.
3. Curva de experiência e nível máximo.
4. Se descanso restaura recursos e faz inimigos reaparecerem.
5. Ajuste dos encontros para dois jogadores sem transformar os chefes em esponjas de vida.

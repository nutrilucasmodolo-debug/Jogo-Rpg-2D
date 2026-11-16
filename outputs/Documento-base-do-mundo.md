# Documento-base do mundo

## Conceito

RPG de ação 2D cooperativo com um mundo grande, difícil e explorável sem uma ordem obrigatória. O jogador pode tentar entrar em qualquer região acessível; o aumento acentuado da dificuldade, os inimigos e a habilidade necessária para sobreviver são os principais limites de progressão.

## Regiões e biomas

O mundo é dividido em cinco grandes regiões:

1. **Planaltos — região inicial.** Vales, elevações, pontes naturais e fortalezas antigas. A região funciona como ponto de partida e oferece caminhos para explorar o mundo.
2. **Terras Nevadas — neve.** Florestas congeladas, lagos sob o gelo, cavernas e ruínas soterradas.
3. **Deserto — deserto.** Dunas, cânions, templos antigos e cidades soterradas.
4. **Savana — savana.** Campos abertos, árvores espaçadas, rios e ruínas tomadas pela vegetação.
5. **Terras das Trevas — trevas.** Região corrompida, com pouca luz, construções arruinadas e caminhos difíceis de distinguir; é a mais ameaçadora.

Os nomes são provisórios. A campanha começa nos Planaltos. As demais regiões não têm uma ordem fixa de visita.

## Exploração e progressão

- O mundo deve permitir exploração não linear, com regiões conectadas por mais de uma rota sempre que possível.
- Regiões avançadas podem ser acessadas cedo. Seus inimigos e desafios serão muito mais difíceis; não haverá bloqueio obrigatório por nível.
- Puzzles abrem caminhos, atalhos, entradas secretas ou acessos especiais. Eles não devem impor uma sequência única para concluir a campanha.
- Rotas alternativas podem incluir uma passagem escondida, uma área perigosa ou um puzzle. Nem todo caminho precisa ser igualmente seguro.
- A dificuldade deve ser consistente: inimigos não escalam automaticamente para acompanhar o nível do jogador.

## Estrutura do mapa

- **Regiões em camadas:** incluir áreas altas, vales, cavernas, subterrâneos e estruturas elevadas conectadas por pontes, elevadores, escadas e passagens.
- **Marcos visuais:** cada região terá pontos reconhecíveis à distância, como torres, fortalezas, árvores gigantes ou formações rochosas.
- **Pontos de referência:** acampamentos, santuários ou outros marcos ajudam a orientação e podem servir como pontos de descanso/retorno, conforme o sistema de jogo for definido.
- **Atalhos desbloqueáveis:** portas, pontes, elevadores e passagens podem encurtar trajetos já explorados.
- **Mapa revelado pela exploração:** no início, mostrar contornos e marcos conhecidos; revelar caminhos e detalhes conforme os jogadores descobrem o território.
- **Mudanças no ambiente:** mecanismos podem abrir passagens, baixar pontes ou alterar áreas e rotas.
- **Sinalização natural:** usar silhuetas, luzes, trilhas, rios e construções para orientar sem depender de marcadores constantes de objetivo.

## Dungeons e castelos opcionais

- Dungeons e castelos são conteúdo opcional e não bloqueiam a conclusão da campanha principal.
- Cada dungeon e cada castelo termina com um chefe.
- A conclusão oferece recompensas grandes, como equipamentos raros, habilidades, materiais especiais, atalhos ou segredos da história.
- Cada local deve ter identidade própria, exploração, perigos e, quando fizer sentido, puzzles.
- A entrada pode ser visível de longe, escondida ou descoberta por pistas no mundo.

## Cooperativo

- Alguns puzzles podem pedir coordenação entre jogadores, como acionar mecanismos em lugares diferentes.
- Quando a campanha permitir jogo solo, puzzles cooperativos devem ter uma solução solo alternativa, possivelmente mais difícil.
- O mapa deve permitir que o grupo explore junto sem exigir que todos sigam uma única rota em todos os momentos.

## Princípios de implementação

1. Priorizar liberdade de rota e curiosidade do jogador.
2. Usar dificuldade, leitura dos inimigos e domínio do combate como desafio de progressão.
3. Recompensar desvios e exploração sem tornar o conteúdo opcional obrigatório.
4. Manter referências visuais claras para que um mundo grande continue fácil de aprender e navegar.
5. Construir primeiro os Planaltos como região inicial e testar nela as conexões, os atalhos, os marcos e a exploração em camadas.

## Ainda a definir

- Nome definitivo do mundo e das regiões.
- Quantas rotas conectam cada região e onde ficam suas entradas.
- Ponto central, mapa geral e distribuição dos grandes pontos de interesse.
- Regras de descanso/retorno e como o mapa registra descobertas no modo cooperativo.
- Conteúdo, puzzles, chefes e recompensas específicos de cada dungeon e castelo.

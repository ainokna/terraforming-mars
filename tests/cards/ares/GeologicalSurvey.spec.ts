import {expect} from 'chai';
import {Ants} from '../../../src/cards/base/Ants';
import {GeologicalSurvey} from '../../../src/cards/ares/GeologicalSurvey';
import {Pets} from '../../../src/cards/base/Pets';
import {Game} from '../../../src/Game';
import {Phase} from '../../../src/Phase';
import {Player} from '../../../src/Player';
import {SpaceBonus} from '../../../src/SpaceBonus';
import {SpaceType} from '../../../src/SpaceType';
import {TileType} from '../../../src/TileType';
import {AresTestHelper, ARES_OPTIONS_NO_HAZARDS} from '../../ares/AresTestHelper';
import {EmptyBoard} from '../../ares/EmptyBoard';
import {MarsFirst} from '../../../src/turmoil/parties/MarsFirst';
import * as Utils from '../../TestingUtils';

describe('GeologicalSurvey', function() {
  let card : GeologicalSurvey; let player : Player; let game : Game;

  beforeEach(function() {
    card = new GeologicalSurvey();
    player = Utils.TestPlayers.BLUE.newPlayer();
    const redPlayer = Utils.TestPlayers.RED.newPlayer();
    game = Game.newInstance('foobar', [player, redPlayer], player, ARES_OPTIONS_NO_HAZARDS);
    game.board = EmptyBoard.newInstance();
  });

  it('Can play', function() {
    AresTestHelper.addGreenery(player);
    expect(card.canPlay(player)).is.true;

    AresTestHelper.addGreenery(player);
    expect(card.canPlay(player)).is.true;

    AresTestHelper.addGreenery(player);
    expect(card.canPlay(player)).is.true;

    AresTestHelper.addGreenery(player);
    expect(card.canPlay(player)).is.true;

    AresTestHelper.addGreenery(player);
    expect(card.canPlay(player)).is.true;

    AresTestHelper.addGreenery(player);
    expect(card.canPlay(player)).is.false;
  });


  it('Bonus in the field', function() {
    // tile types in this test are irrelevant.
    // What's key is that this space has a weird behavior - it grants all the bonuses.
    // Only three of them will grant additional bonuses: steel, titanium, and heat.

    const firstSpace = game.board.getAvailableSpacesOnLand(player)[0];
    firstSpace.adjacency = {bonus: [
      SpaceBonus.TITANIUM,
      SpaceBonus.STEEL,
      SpaceBonus.PLANT,
      SpaceBonus.DRAW_CARD,
      SpaceBonus.HEAT,
      SpaceBonus.MEGACREDITS,
      SpaceBonus.ANIMAL,
      SpaceBonus.MICROBE,
      SpaceBonus.POWER,
    ],
    };
    game.addTile(player, SpaceType.LAND, firstSpace, {tileType: TileType.RESTRICTED_AREA});
    // firstSpace.player = player;

    const microbeCard = new Ants();
    const animalCard = new Pets();

    player.playedCards = [card, microbeCard, animalCard];

    // firstSpace tile might grant resources, so resetting all the resource values.
    player.megaCredits = 0;
    player.titanium = 0;
    player.steel = 0;
    player.heat = 0;
    player.energy = 0;
    player.plants = 0;
    player.cardsInHand = []; 0;
    microbeCard.resourceCount = 0;
    animalCard.resourceCount = 0;

    const adjacentSpace = game.board.getAdjacentSpaces(firstSpace)[0];
    game.addTile(player, adjacentSpace.spaceType, adjacentSpace, {tileType: TileType.GREENERY});
    Utils.runAllActions(game);

    expect(player.megaCredits).eq(2);
    expect(player.titanium).eq(2);
    expect(player.steel).eq(2);
    expect(player.heat).eq(2);
    expect(player.energy).eq(1);
    expect(player.plants).eq(1);
    expect(player.cardsInHand).is.length(1);
    expect(microbeCard.resourceCount).eq(1);
    expect(animalCard.resourceCount).eq(1);
  });

  it('Works with Mars First policy', function() {
    player = Utils.TestPlayers.BLUE.newPlayer();
    const gameOptions = Utils.setCustomGameOptions();
    game = Game.newInstance('foobar', [player], player, gameOptions);
    const turmoil = game.turmoil!;
    const marsFirst = new MarsFirst();

    player.playedCards.push(card);
    game.phase = Phase.ACTION; // Policies are only active in the ACTION phase

    Utils.TestingUtils.resetBoard(game);

    game.addGreenery(player, '11');
    Utils.runAllActions(game);
    expect(player.steel).eq(0);

    Utils.TestingUtils.resetBoard(game);

    Utils.setRulingPartyAndRulingPolicy(game, turmoil, marsFirst, marsFirst.policies[0].id);
    game.addGreenery(player, '11');
    Utils.runAllActions(game);
    expect(player.steel).eq(2);
  });
});

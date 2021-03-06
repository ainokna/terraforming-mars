import {CardName} from '../../CardName';
import {Player} from '../../Player';
import {CardType} from '../CardType';
import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardMetadata} from '../CardMetadata';
import {ResourceType} from '../../ResourceType';
import {IActionCard} from '../ICard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {MoonExpansion} from '../../moon/MoonExpansion';
import {CardRenderer} from '../render/CardRenderer';
import {CardRenderDynamicVictoryPoints} from '../render/CardRenderDynamicVictoryPoints';
import {Units} from '../../Units';

export class DarksideIncubationPlant implements IActionCard, IProjectCard {
  public cost = 11;
  public tags = [Tags.MICROBE, Tags.MOON];
  public cardType = CardType.ACTIVE;
  public name = CardName.DARKSIDE_INCUBATION_PLANT;
  public reserveUnits = Units.of({titanium: 1});
  public resourceType = ResourceType.MICROBE;
  public resourceCount = 0;

  public play(player: Player) {
    Units.deductUnits(this.reserveUnits, player);
    return undefined;
  }

  public canAct() {
    return true;
  }

  public action(player: Player) {
    const options: Array<SelectOption> = [];
    options.push(new SelectOption('Add 1 microbe to this card', 'Select', () => {
      this.resourceCount++;
      return undefined;
    }));
    MoonExpansion.ifMoon(player.game, (moonData) => {
      if (this.resourceCount >= 2 && moonData.colonyRate < 8) {
        options.push(new SelectOption('Spend 2 microbes to raise the Colony Rate 1 step.', 'Select', () => {
          this.resourceCount -= 2;
          MoonExpansion.raiseColonyRate(player);
          return undefined;
        }));
      } else {
      }
    });
    if (options.length === 1) {
      return options[0].cb();
    } else {
      return new OrOptions(...options);
    }
  }

  public getVictoryPoints() {
    return Math.floor(this.resourceCount / 2);
  }

  public readonly metadata: CardMetadata = {
    description: 'Spend 1 titanium. 1 VP per every 2 microbes here.',
    cardNumber: 'M45',
    renderData: CardRenderer.builder((b) => {
      b.action('Add 1 microbe here', (eb) => {
        eb.empty().startAction.microbes(1);
      }).br;
      b.or().br;
      b.action('Spend 2 microbes to raise Colony Rate 1 step.', (eb) => {
        eb.microbes(2).startAction.moonColonyRate(1);
      });

      b.br;
      b.minus().titanium(1);
    }),
    victoryPoints: CardRenderDynamicVictoryPoints.microbes(1, 2),
  };
}

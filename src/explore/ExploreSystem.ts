import { cardDatabase } from '../cards/CardDatabase';
import type { Card } from '../cards/Card';
import { GameState } from '../game/GameState';

export type ExploreIcon = 'chance' | 'pero' | 'exp' | 'gift' | 'miss';
export type ExploreResult = {
  icons: ExploreIcon[];
  outcome: ExploreIcon;
  staminaSpent: number;
  pero: number;
  exp: number;
  cardChoices: Card[];
};

/** Historical mechanic reconstruction: Exploration consumes stamina, rolls 3 icons,
 * and matching Chance/Pero/EXP/Gift icons creates special outcomes. The public
 * documentation does not publish the original server RNG coefficients, so those
 * remain configurable here rather than being presented as exact odds. */
export class ExploreSystem {
  private readonly game: GameState;
  constructor(game: GameState) { this.game = game; }

  run(cost = 1): ExploreResult | null {
    if (!this.game.spendStamina(cost)) return null;

    const icons = [this.rollIcon(), this.rollIcon(), this.rollIcon()];
    const outcome = this.detectOutcome(icons);
    let pero = 30 + Math.floor(Math.random() * 26);
    let exp = 18 + Math.floor(Math.random() * 13);

    if (outcome === 'pero') pero *= 10;
    if (outcome === 'exp') exp *= 2;
    if (outcome === 'chance') this.game.stats.chanceTimes++;

    this.game.inventory.addPero(pero);
    this.game.addExp(exp);
    this.game.stats.explorationRuns++;
    this.game.progress.explorationLocation++;
    if (this.game.progress.explorationLocation > 9) {
      this.game.progress.explorationLocation = 1;
      this.game.progress.explorationStage++;
    }
    this.game.save();

    const cardChoices = outcome === 'chance' ? this.dealChanceCards() : [];
    return { icons, outcome, staminaSpent: cost, pero, exp, cardChoices };
  }

  chooseChance(cardId: string): boolean {
    const card = cardDatabase.find(c => c.id === cardId);
    if (!card) return false;
    const wasLevel100 = card.level >= 100;
    if (wasLevel100) {
      this.game.inventory.addPero(card.rarity === 'N' ? 300 : card.rarity === 'R' ? 700 : 1500);
    } else {
      this.game.inventory.addDuplicate(card.id, 1);
      this.game.stats.cardsObtained++;
      if (card.level === 1) card.levelUp();
    }
    this.game.save();
    return true;
  }

  private dealChanceCards(): Card[] {
    const weighted = [...cardDatabase].sort(() => Math.random() - 0.5);
    const six: Card[] = [];
    for (let i = 0; i < 6; i++) six.push(weighted[i % weighted.length]);
    return six;
  }

  private detectOutcome(icons: ExploreIcon[]): ExploreIcon {
    const first = icons[0];
    if (icons.every(i => i === first) && first !== 'miss') return first;
    return 'miss';
  }

  private rollIcon(): ExploreIcon {
    const r = Math.random();
    if (r < 0.30) return 'chance';
    if (r < 0.48) return 'exp';
    if (r < 0.64) return 'pero';
    if (r < 0.80) return 'gift';
    return 'miss';
  }
}

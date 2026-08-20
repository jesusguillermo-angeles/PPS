import { cardDatabase } from '../cards/CardDatabase';
import { GameState } from '../game/GameState';
import type { Card } from '../cards/Card';

export type GachaRarity = 'N' | 'R' | 'SR';
export type GachaResult = { cards: Card[]; guaranteed?: GachaRarity };

/**
 * Historical-facing Gacha implementation.
 *
 * Public sources document Normal/Rare/SR machines, free N Gacha, tickets,
 * and the six-card reveal flow. The original server's exact hidden RNG table
 * is not public, so the pool selection stays configurable instead of being
 * presented as an exact server replica.
 */
export class GachaSystem {
  private readonly game: GameState;
  constructor(game: GameState) { this.game = game; }

  canDraw(rarity: GachaRarity): boolean {
    if (rarity === 'N') return this.game.canUseFreeNormalGacha() || this.game.inventory.gachaTickets.N > 0;
    return this.game.inventory.gachaTickets[rarity] > 0;
  }

  draw(rarity: GachaRarity, count = 1): GachaResult | null {
    if (count < 1) return null;
    if (rarity === 'N' && count === 1 && this.game.canUseFreeNormalGacha()) {
      this.game.consumeFreeNormalGacha();
    } else {
      if (this.game.inventory.gachaTickets[rarity] < count) return null;
      this.game.inventory.gachaTickets[rarity] -= count;
    }

    const cards = Array.from({ length: count }, () => this.pick(rarity));
    for (const card of cards) this.recordCard(card);
    this.game.save();
    return { cards, guaranteed: rarity };
  }

  /** Start a six-position reveal and consume exactly one draw resource.
   * The original client did not expose the hidden server RNG before selection;
   * this client therefore keeps the result hidden behind the six positions. */
  dealSix(rarity: GachaRarity): Card[] | null {
    if (!this.canDraw(rarity)) return null;
    if (rarity === 'N' && this.game.canUseFreeNormalGacha()) this.game.consumeFreeNormalGacha();
    else this.game.inventory.gachaTickets[rarity]--;

    const pool = cardDatabase.filter(c => c.rarity === rarity);
    const source = pool.length ? pool : cardDatabase;
    return Array.from({ length: 6 }, () => source[Math.floor(Math.random() * source.length)]);
  }

  resolveSelection(card: Card): Card | null {
    if (!card) return null;
    this.recordCard(card);
    this.game.save();
    return card;
  }

  reveal(cards: Card[]): Card[] { return cards; }

  private recordCard(card: Card): void {
    const wasAtCap = card.level >= card.maxLevel;
    if (wasAtCap) {
      // Gacha duplicate behaviour is not identical to Explore. We model the
      // documented distinction conservatively as a Pero conversion for the
      // reconstructed client until a server table is recovered.
      this.game.inventory.addPero(card.rarity === 'N' ? 300 : card.rarity === 'R' ? 700 : 1500);
      this.game.stats.duplicateCards++;
      return;
    }
    card.levelUp();
    this.game.inventory.addDuplicate(card.id, 1);
    this.game.stats.cardsObtained++;
  }

  private pick(rarity: GachaRarity): Card {
    const pool = cardDatabase.filter(c => c.rarity === rarity);
    return this.pickFrom(pool.length ? pool : cardDatabase);
  }

  private pickFrom(pool: Card[]): Card {
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

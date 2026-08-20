import { cardDatabase } from '../cards/CardDatabase';
import { Inventory, type WildCardRarity } from './Inventory';

export class FusionSystem {
  private readonly inventory: Inventory;
  constructor(inventory: Inventory) { this.inventory = inventory; }

  fuseDuplicate(cardId: string, levels = 1): boolean {
    const card = cardDatabase.find(c => c.id === cardId);
    if (!card || levels < 1 || card.level >= card.maxLevel) return false;
    if (!this.inventory.useDuplicate(cardId)) return false;
    card.levelUp();
    return true;
  }

  fuseWild(cardId: string, rarity: WildCardRarity): boolean {
    const card = cardDatabase.find(c => c.id === cardId);
    if (!card || card.level >= Math.min(100, card.maxLevel)) return false;

    const allowed =
      rarity === 'SR' ||
      (rarity === 'R' && (card.rarity === 'N' || card.rarity === 'R')) ||
      (rarity === 'N' && card.rarity === 'N');

    if (!allowed || !this.inventory.useWild(rarity)) return false;
    return card.levelUp();
  }

  fuseExWild(cardId: string): boolean {
    const card = cardDatabase.find(c => c.id === cardId);
    if (!card || card.level < 100 || card.level >= card.maxLevel) return false;
    if (!this.inventory.useExWild()) return false;
    return card.levelUp();
  }
}

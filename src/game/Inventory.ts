export type WildCardRarity = 'N' | 'R' | 'SR';
export type InventorySaveData = {
  duplicates: Record<string, number>;
  wildCards: Record<WildCardRarity, number>;
  exWildCards: number;
  pero: number;
  gachaTickets: { N: number; R: number; SR: number };
  items?: Record<string, number>;
};

export class Inventory {
  duplicates: Record<string, number> = {};
  wildCards: Record<WildCardRarity, number> = { N: 0, R: 0, SR: 0 };
  exWildCards = 0;
  pero = 0;
  gachaTickets = { N: 0, R: 0, SR: 0 };
  items: Record<string, number> = {};

  addDuplicate(id: string, amount = 1) { if (amount > 0) this.duplicates[id] = (this.duplicates[id] ?? 0) + Math.floor(amount); }
  getDuplicateCount(id: string) { return this.duplicates[id] ?? 0; }
  useDuplicate(id: string) { const n = this.getDuplicateCount(id); if (n <= 0) return false; this.duplicates[id] = n - 1; return true; }

  addWild(r: WildCardRarity, amount = 1) { if (amount > 0) this.wildCards[r] += Math.floor(amount); }
  getWildCount(r: WildCardRarity) { return this.wildCards[r] ?? 0; }
  useWild(r: WildCardRarity) { if (this.wildCards[r] <= 0) return false; this.wildCards[r]--; return true; }

  addExWild(amount = 1) { if (amount > 0) this.exWildCards += Math.floor(amount); }
  useExWild() { if (this.exWildCards <= 0) return false; this.exWildCards--; return true; }

  addPero(amount: number) { this.pero = Math.max(0, this.pero + Math.floor(amount)); }
  addTicket(r: 'N'|'R'|'SR', amount = 1) { if (amount > 0) this.gachaTickets[r] += Math.floor(amount); }
  addItem(id: string, amount = 1) { if (amount > 0) this.items[id] = (this.items[id] ?? 0) + Math.floor(amount); }
  getItemCount(id: string) { return this.items[id] ?? 0; }
  useItem(id: string, amount = 1) { const n = this.getItemCount(id); if (n < amount || amount <= 0) return false; this.items[id] = n - amount; return true; }

  getSaveData(): InventorySaveData {
    return { duplicates: {...this.duplicates}, wildCards: {...this.wildCards},
      exWildCards: this.exWildCards, pero: this.pero, gachaTickets: {...this.gachaTickets}, items: {...this.items} };
  }

  loadSaveData(data: Partial<InventorySaveData>) {
    this.duplicates = {...(data.duplicates ?? {})};
    this.wildCards = {N: data.wildCards?.N ?? 0, R: data.wildCards?.R ?? 0, SR: data.wildCards?.SR ?? 0};
    this.exWildCards = Math.max(0, data.exWildCards ?? 0);
    this.pero = Math.max(0, data.pero ?? 0);
    this.gachaTickets = {N: data.gachaTickets?.N ?? 0, R: data.gachaTickets?.R ?? 0, SR: data.gachaTickets?.SR ?? 0};
    this.items = {...(data.items ?? {})};
  }

  reset() {
    this.duplicates = {}; this.wildCards = {N:0,R:0,SR:0}; this.exWildCards = 0; this.pero = 0;
    this.gachaTickets = {N:0,R:0,SR:0}; this.items = {};
  }
}

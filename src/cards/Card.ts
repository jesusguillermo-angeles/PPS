export type CardRarity = 'N' | 'R' | 'SR';
export type CardType = 'Moe' | 'Babe' | 'Sexy';

export type CardStage = { level: number; image: string };
export type CardSaveData = { level: number; selectedStage: number };

export class Card {
  readonly id: string;
  readonly name: string;
  readonly rarity: CardRarity;
  readonly type: CardType;
  readonly maxBaseSed: number;
  readonly imageStages: CardStage[];

  level = 1;
  selectedStage = 1;

  constructor(data: {
    id: string; name: string; rarity: CardRarity; type: CardType;
    maxBaseSed: number; imageStages: CardStage[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.rarity = data.rarity;
    this.type = data.type;
    this.maxBaseSed = data.maxBaseSed;
    this.imageStages = data.imageStages;
  }

  /** Documented PeroPero behaviour: Moe grows early, Babe evenly,
   * Sexy late. The original game's exact hidden curve is server-side;
   * this normalized curve reproduces the documented breakpoints. */
  private growthAt(level: number): number {
    const l = Math.min(100, Math.max(1, level));
    const power = this.type === 'Moe' ? 0.62 : this.type === 'Babe' ? 0.78 : 1.18;
    const raw = Math.pow(l / 100, power);
    const at1 = Math.pow(0.01, power);
    return (raw - at1) / (1 - at1);
  }

  get sed(): number {
    const base = Math.max(0, Math.round(this.maxBaseSed * this.growthAt(this.level)));
    return base + this.exLevel * 3;
  }

  get exLevel(): number {
    return Math.max(0, this.level - 100);
  }

  get maxLevel(): number {
    // Permanent cap increases documented for player progression.
    let cap = 100;
    if (this.level >= 50) cap += 5;
    if (this.level >= 100) cap += 5;
    if (this.level >= 150) cap += 5;
    if (this.level >= 200) cap += 5;
    return cap;
  }

  get levelProgress(): number {
    return Math.min(100, (this.level / this.maxLevel) * 100);
  }

  get unlockedStage(): number {
    let unlocked = 1;
    for (let i = 0; i < this.imageStages.length; i++) {
      if (this.level >= this.imageStages[i].level) unlocked = i + 1;
    }
    return unlocked;
  }

  get currentImage(): string {
    const stage = this.imageStages[this.selectedStage - 1] ?? this.imageStages[0];
    return stage.image;
  }

  get nextStage(): CardStage | null {
    const i = this.unlockedStage;
    return i >= this.imageStages.length ? null : this.imageStages[i];
  }

  isStageUnlocked(stageNumber: number): boolean {
    return stageNumber >= 1 && stageNumber <= this.unlockedStage && stageNumber <= this.imageStages.length;
  }

  selectStage(stageNumber: number): boolean {
    if (!this.isStageUnlocked(stageNumber)) return false;
    this.selectedStage = stageNumber;
    return true;
  }

  levelUp(): boolean {
    if (this.level >= this.maxLevel) return false;
    this.level++;
    return true;
  }

  levelUpTo(target: number): number {
    const old = this.level;
    while (this.level < target && this.level < this.maxLevel) this.level++;
    return this.level - old;
  }

  getSaveData(): CardSaveData {
    return { level: this.level, selectedStage: this.selectedStage };
  }

  loadSaveData(data: Partial<CardSaveData>): void {
    const requestedLevel = Number.isFinite(data.level) ? Number(data.level) : 1;
    this.level = Math.max(1, Math.min(225, Math.floor(requestedLevel)));
    // Re-evaluate cap after loading progression.
    this.level = Math.min(this.level, this.maxLevel);
    const stage = Number.isFinite(data.selectedStage) ? Number(data.selectedStage) : 1;
    this.selectedStage = Math.min(Math.max(1, Math.floor(stage)), this.unlockedStage);
  }

  reset(): void {
    this.level = 1;
    this.selectedStage = 1;
  }
}

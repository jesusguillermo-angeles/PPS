import { cardDatabase } from '../cards/CardDatabase';
import { Inventory, type InventorySaveData } from './Inventory';
import { FusionSystem } from './FusionSystem';
import { ExploreSystem } from '../explore/ExploreSystem';
import { GachaSystem } from '../gacha/GachaSystem';
import { MissionSystem } from '../missions/MissionSystem';
import { AchievementSystem } from '../achievements/AchievementSystem';

const SAVE_KEY = 'peropero-rebuild-historical-v10';
const LEGACY_SAVE_KEYS = ['peropero-rebuild-historical-v9','peropero-rebuild-historical-v8', 'peropero-rebuild-historical-v7', 'peropero-rebuild-historical-v6', 'peropero-rebuild-v5', 'peropero-rebuild-v4', 'peropero-rebuild-save'];

export type GameMode = 'home' | 'collection' | 'explore' | 'gacha' | 'missions' | 'items' | 'kurito' | 'shop';
export type TutorialStep = 'intro' | 'collection' | 'explore' | 'chance' | 'mission' | 'complete';

export type PlayerData = {
  level: number;
  exp: number;
  expToNext: number;
  stamina: number;
  maxStamina: number;
  focus: number;
  maxFocus: number;
  peroFriends: number;
};

export type ModeUnlocks = {
  collection: boolean;
  explore: boolean;
  gacha: boolean;
  missions: boolean;
  kurito: boolean;
  shop: boolean;
};

export type GameStats = {
  explorationRuns: number;
  chanceTimes: number;
  cardsObtained: number;
  duplicateCards: number;
  cardsFused: number;
  seductionBattles: number;
  bossesDefeated: number;
};

type GameSave = {
  version: 10;
  firstRun: boolean;
  tutorial: { step: TutorialStep; completed: boolean };
  player: PlayerData;
  modes: ModeUnlocks;
  stats: GameStats;
  progress: { explorationStage: number; explorationLocation: number };
  rewards: { tutorialRGranted: boolean };
  cards: Record<string, { level: number; selectedStage: number }>;
  inventory: InventorySaveData;
  resources: { staminaUpdatedAt: number; focusUpdatedAt: number; dailyResetAt: number; freeNormalGachaAt: number };
  missions?: ReturnType<MissionSystem['getSaveData']>;
};

const defaultPlayer = (): PlayerData => ({
  level: 1, exp: 0, expToNext: 100,
  stamina: 20, maxStamina: 20,
  focus: 6, maxFocus: 6,
  peroFriends: 0,
});

const defaultModes = (): ModeUnlocks => ({
  collection: true,
  explore: true,
  gacha: true,
  missions: true,
  kurito: false,
  shop: true,
});

const defaultStats = (): GameStats => ({
  explorationRuns: 0,
  chanceTimes: 0,
  cardsObtained: 0,
  duplicateCards: 0,
  cardsFused: 0,
  seductionBattles: 0,
  bossesDefeated: 0,
});

export class GameState {
  inventory = new Inventory();
  fusion = new FusionSystem(this.inventory);
  explore = new ExploreSystem(this);
  gacha = new GachaSystem(this);
  missions = new MissionSystem(this);
  achievements = new AchievementSystem(this);
  firstRun = true;
  tutorial: { step: TutorialStep; completed: boolean } = { step: 'intro', completed: false };
  player: PlayerData = defaultPlayer();
  modes: ModeUnlocks = defaultModes();
  stats: GameStats = defaultStats();
  progress = { explorationStage: 1, explorationLocation: 1 };
  rewards = { tutorialRGranted: false };
  currentMode: GameMode = 'home';
  resources = { staminaUpdatedAt: Date.now(), focusUpdatedAt: Date.now(), dailyResetAt: 0, freeNormalGachaAt: 0 };

  save(): void {
    const cards: GameSave['cards'] = {};
    for (const card of cardDatabase) cards[card.id] = card.getSaveData();
    const data: GameSave = {
      version: 10,
      firstRun: this.firstRun,
      tutorial: { ...this.tutorial },
      player: { ...this.player },
      modes: { ...this.modes },
      stats: { ...this.stats },
      progress: { ...this.progress },
      rewards: { ...this.rewards },
      cards,
      inventory: this.inventory.getSaveData(),
      resources: { ...this.resources },
      missions: this.missions.getSaveData(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  load(): void {
    const raw = localStorage.getItem(SAVE_KEY) ?? LEGACY_SAVE_KEYS.map(k => localStorage.getItem(k)).find(Boolean) ?? null;
    if (!raw) {
      this.initializeNewGame();
      return;
    }

    try {
      const data = JSON.parse(raw) as Partial<GameSave> & { version?: number };
      this.player = { ...defaultPlayer(), ...(data.player ?? {}) };
      this.player.level = Math.max(1, Math.floor(this.player.level));
      this.player.exp = Math.max(0, Math.floor(this.player.exp));
      this.player.expToNext = Math.max(1, Math.floor(this.player.expToNext || this.getExpToNext()));
      this.player.maxStamina = Math.max(1, Math.floor(this.player.maxStamina));
      this.player.stamina = Math.max(0, Math.min(this.player.maxStamina, Math.floor(this.player.stamina)));
      this.player.maxFocus = Math.max(1, Math.floor(this.player.maxFocus));
      this.player.focus = Math.max(0, Math.min(this.player.maxFocus, Math.floor(this.player.focus)));
      this.player.peroFriends = Math.max(0, Math.floor(this.player.peroFriends));

      this.firstRun = data.firstRun ?? false;
      this.tutorial = {
        step: data.tutorial?.step ?? (this.firstRun ? 'intro' : 'complete'),
        completed: Boolean(data.tutorial?.completed),
      };
      this.modes = { ...defaultModes(), ...(data.modes ?? {}) };
      this.stats = { ...defaultStats(), ...(data.stats ?? {}) };
      this.progress = {
        explorationStage: Math.max(1, Math.floor(data.progress?.explorationStage ?? 1)),
        explorationLocation: Math.max(1, Math.floor(data.progress?.explorationLocation ?? 1)),
      };
      this.rewards = { tutorialRGranted: Boolean(data.rewards?.tutorialRGranted) };
      const loadedResources = (data.resources ?? {}) as Partial<GameSave['resources']>;
      this.resources = {
        staminaUpdatedAt: Number(loadedResources.staminaUpdatedAt) || Date.now(),
        focusUpdatedAt: Number(loadedResources.focusUpdatedAt) || Date.now(),
        dailyResetAt: Number(loadedResources.dailyResetAt) || this.getNextDailyReset(Date.now()),
        freeNormalGachaAt: Number(loadedResources.freeNormalGachaAt) || 0,
      };
      this.tickResources(Date.now(), false);

      for (const card of cardDatabase) {
        const saved = data.cards?.[card.id];
        if (saved) card.loadSaveData(saved);
      }
      if (data.inventory) this.inventory.loadSaveData(data.inventory);
      if (data.missions) this.missions.loadSaveData(data.missions);

      if ((data.version ?? 0) < 10) this.save();
    } catch (error) {
      console.error('Error cargando la partida:', error);
      this.initializeNewGame();
    }
  }

  initializeNewGame(): void {
    for (const card of cardDatabase) card.reset();
    this.inventory.reset();
    this.player = defaultPlayer();
    this.modes = defaultModes();
    this.stats = defaultStats();
    this.progress = { explorationStage: 1, explorationLocation: 1 };
    this.rewards = { tutorialRGranted: false };
    this.firstRun = true;
    this.tutorial = { step: 'intro', completed: false };
    this.currentMode = 'home';
    this.resources = { staminaUpdatedAt: Date.now(), focusUpdatedAt: Date.now(), dailyResetAt: this.getNextDailyReset(Date.now()), freeNormalGachaAt: 0 };
    this.save();
  }

  startNewGame(): void { this.initializeNewGame(); }

  reset(): void {
    for (const card of cardDatabase) card.reset();
    this.inventory.reset();
    this.player = defaultPlayer();
    this.modes = defaultModes();
    this.stats = defaultStats();
    this.progress = { explorationStage: 1, explorationLocation: 1 };
    this.rewards = { tutorialRGranted: false };
    this.firstRun = true;
    this.tutorial = { step: 'intro', completed: false };
    this.currentMode = 'home';
    this.resources = { staminaUpdatedAt: Date.now(), focusUpdatedAt: Date.now(), dailyResetAt: this.getNextDailyReset(Date.now()), freeNormalGachaAt: 0 };
    localStorage.removeItem(SAVE_KEY);
    for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
  }

  advanceTutorial(step: TutorialStep): void {
    this.tutorial.step = step;
    this.tutorial.completed = step === 'complete';
    this.firstRun = !this.tutorial.completed;
    this.save();
  }

  claimTutorialReward(): boolean {
    if (this.rewards.tutorialRGranted) return false;
    this.inventory.addTicket('R', 1);
    this.rewards.tutorialRGranted = true;
    const tutorialMission = this.missions.specialMissions.find(m => m.id === 'tutorial-airu');
    if (tutorialMission) tutorialMission.claimed = true;
    this.save();
    return true;
  }

  canUseFreeNormalGacha(now = Date.now()): boolean {
    return now >= this.resources.freeNormalGachaAt || this.resources.freeNormalGachaAt === 0;
  }

  consumeFreeNormalGacha(): boolean {
    if (!this.canUseFreeNormalGacha()) return false;
    this.resources.freeNormalGachaAt = this.getNextDailyReset(Date.now());
    return true;
  }

  get freeNormalGachaInMs(): number {
    if (this.canUseFreeNormalGacha()) return 0;
    return Math.max(0, this.resources.freeNormalGachaAt - Date.now());
  }

  addExp(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    let gainedLevels = 0;
    this.player.exp += Math.floor(amount);
    while (this.player.exp >= this.player.expToNext) {
      this.player.exp -= this.player.expToNext;
      this.player.level += 1;
      gainedLevels++;
      this.player.expToNext = this.getExpToNext();
      this.player.maxStamina = 20 + Math.floor((this.player.level - 1) / 5);
      this.player.stamina = this.player.maxStamina;
      this.player.maxFocus = 6 + Math.floor((this.player.level - 1) / 10);
      this.player.focus = this.player.maxFocus;
    }
    return gainedLevels;
  }

  getExpToNext(level = this.player.level): number {
    const safeLevel = Math.max(1, Math.floor(level));
    return 100 + (safeLevel - 1) * 35;
  }

  tickResources(now = Date.now(), persist = true): void {
    if (!Number.isFinite(now)) return;
    this.resetDailyMissionsIfNeeded(now);

    // Historical recovery: 1 Stamina every 60 seconds. Focus is 1 every 5 minutes.
    if (this.player.stamina < this.player.maxStamina) {
      const elapsed = Math.max(0, now - this.resources.staminaUpdatedAt);
      const gained = Math.min(this.player.maxStamina - this.player.stamina, Math.floor(elapsed / 60_000));
      if (gained > 0) {
        this.player.stamina += gained;
        this.resources.staminaUpdatedAt += gained * 60_000;
      }
    } else {
      this.resources.staminaUpdatedAt = now;
    }

    if (this.player.focus < this.player.maxFocus) {
      const elapsed = Math.max(0, now - this.resources.focusUpdatedAt);
      const gained = Math.min(this.player.maxFocus - this.player.focus, Math.floor(elapsed / 300_000));
      if (gained > 0) {
        this.player.focus += gained;
        this.resources.focusUpdatedAt += gained * 300_000;
      }
    } else {
      this.resources.focusUpdatedAt = now;
    }

    if (persist) this.save();
  }

  spendStamina(amount: number): boolean {
    this.tickResources(Date.now(), false);
    const cost = Math.max(0, Math.floor(amount));
    if (cost > this.player.stamina) return false;
    if (this.player.stamina === this.player.maxStamina) this.resources.staminaUpdatedAt = Date.now();
    this.player.stamina -= cost;
    this.missions.recordStamina(cost);
    return true;
  }

  restoreStamina(amount: number): void {
    this.tickResources(Date.now(), false);
    this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + Math.max(0, Math.floor(amount)));
    this.resources.staminaUpdatedAt = Date.now();
  }

  spendFocus(amount: number): boolean {
    this.tickResources(Date.now(), false);
    const cost = Math.max(0, Math.floor(amount));
    if (cost > this.player.focus) return false;
    if (this.player.focus === this.player.maxFocus) this.resources.focusUpdatedAt = Date.now();
    this.player.focus -= cost;
    return true;
  }

  restoreFocus(amount: number): void {
    this.tickResources(Date.now(), false);
    this.player.focus = Math.min(this.player.maxFocus, this.player.focus + Math.max(0, Math.floor(amount)));
    this.resources.focusUpdatedAt = Date.now();
  }

  get staminaNextInMs(): number {
    this.tickResources(Date.now(), false);
    if (this.player.stamina >= this.player.maxStamina) return 0;
    return Math.max(0, 60_000 - (Date.now() - this.resources.staminaUpdatedAt));
  }

  get staminaFullInMs(): number {
    this.tickResources(Date.now(), false);
    if (this.player.stamina >= this.player.maxStamina) return 0;
    return Math.max(0, (this.player.maxStamina - this.player.stamina) * 60_000 - (Date.now() - this.resources.staminaUpdatedAt));
  }

  get focusNextInMs(): number {
    this.tickResources(Date.now(), false);
    if (this.player.focus >= this.player.maxFocus) return 0;
    return Math.max(0, 300_000 - (Date.now() - this.resources.focusUpdatedAt));
  }

  get dailyResetInMs(): number {
    return Math.max(0, this.resources.dailyResetAt - Date.now());
  }

  private getNextDailyReset(from: number): number {
    // Historical reset is 4:00 PM Pacific Time. Compute it using the browser's
    // America/Los_Angeles timezone so DST is respected.
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date(from));
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
    const localNowMinutes = get('hour') * 60 + get('minute');
    const targetDate = new Date(Date.UTC(get('year'), get('month') - 1, get('day'), 16, 0, 0));
    if (localNowMinutes >= 16 * 60) targetDate.setUTCDate(targetDate.getUTCDate() + 1);

    // Iterate to find the epoch matching 16:00 in Pacific time.
    let guess = targetDate.getTime();
    for (let i = 0; i < 3; i++) {
      const check = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).formatToParts(new Date(guess));
      const value = (type: string) => Number(check.find(p => p.type === type)?.value ?? 0);
      const desired = Date.UTC(value('year'), value('month')-1, value('day'), value('hour'), value('minute'), value('second'));
      const wanted = targetDate.getTime();
      guess += wanted - desired;
    }
    return Math.max(from + 1000, guess);
  }

  private resetDailyMissionsIfNeeded(now: number): void {
    if (!this.resources.dailyResetAt) this.resources.dailyResetAt = this.getNextDailyReset(now);
    if (now >= this.resources.dailyResetAt) {
      this.missions.resetDaily();
      this.resources.dailyResetAt = this.getNextDailyReset(now);
    }
  }

  setMode(mode: GameMode): boolean {
    if (mode === 'home' || mode === 'collection') {
      this.currentMode = mode;
      return true;
    }
    if (!this.modes[mode]) return false;
    this.currentMode = mode;
    return true;
  }

  unlockMode(mode: Exclude<GameMode, 'home' | 'collection'>): void {
    this.modes[mode] = true;
    this.save();
  }

  recordExplorationRun(): void { this.stats.explorationRuns++; }
  recordChanceTime(): void { this.stats.chanceTimes++; }
  recordCardObtained(isDuplicate = false): void {
    this.stats.cardsObtained++;
    if (isDuplicate) this.stats.duplicateCards++;
  }
  recordFusion(): void { this.stats.cardsFused++; }
  recordSeductionBattle(won = false): void {
    this.stats.seductionBattles++;
    if (won) this.stats.bossesDefeated++;
  }

  get totalSed(): number {
    return cardDatabase.reduce((sum, card) => sum + card.sed, 0);
  }
}

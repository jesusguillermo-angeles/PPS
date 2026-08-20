import { GameState } from '../game/GameState';

export type SpecialMission = { id: string; title: string; requirement: string; target: number; reward: string; progress: number; claimed: boolean };

export const HISTORICAL_SPECIAL_MISSIONS: SpecialMission[] = [
  {id:'tutorial',title:"I'm Coming for You, Airu",requirement:'Complete the tutorial',target:1,reward:'R Gacha Ticket x1',progress:0,claimed:false},
  {id:'rescue4',title:'Rescue 4 girls from the naked king',requirement:'Clear all locations in Stage 1',target:4,reward:'Mission Challenge Window Extension x1',progress:0,claimed:false},
  {id:'level25',title:'Achieve Level 25',requirement:'Reach Level 25',target:25,reward:'R Gacha Ticket x1',progress:0,claimed:false},
  {id:'friends20',title:'Make 20 Pero Friends',requirement:'Have 20 Pero Friends',target:20,reward:'R Gacha Ticket x1',progress:0,claimed:false},
  {id:'sed40000',title:'Raise SED To 40,000',requirement:'Have over 40,000 Seduction',target:40000,reward:'R Gacha Ticket x2',progress:0,claimed:false},
  {id:'sr10',title:'Bed 10 Normies',requirement:'Have 10 SR cards',target:10,reward:'Wild Card 3 x4',progress:0,claimed:false},
];

export class AchievementSystem {
  readonly specials = HISTORICAL_SPECIAL_MISSIONS.map(m => ({...m}));
  private readonly game: GameState;
  constructor(game: GameState) { this.game = game; }

  sync(): void {
    const byId = new Map(this.specials.map(m => [m.id,m]));
    byId.get('tutorial')!.progress = this.game.tutorial.completed ? 1 : 0;
    byId.get('level25')!.progress = this.game.player.level;
    byId.get('friends20')!.progress = this.game.player.peroFriends;
    byId.get('sed40000')!.progress = this.game.totalSed;
    byId.get('rescue4')!.progress = Math.max(0, Math.min(4, (this.game.progress.explorationStage - 1) * 4 + this.game.progress.explorationLocation - 1));
  }
}

import { GameState } from '../game/GameState';

export type MissionReward = { kind: 'wild'|'ticket'|'pero'|'item'; amount: number; rarity?: 'N'|'R'|'SR'; item?: string };
export type DailyMission = {
  id: string; tier: number; category: string; name: string; objective: string; target: number; reward: MissionReward; progress: number; claimed: boolean;
};
export type SpecialMission = { id:string; category:string; name:string; objective:string; target:number; reward:MissionReward; claimed?:boolean; note?:string };

export const HISTORICAL_DAILY_MISSIONS: DailyMission[] = [
  ['chance-1',1,'Chance',"Three To Pick 'em Out",'Get 3 Triple Chance',3,{kind:'wild',rarity:'N',amount:1}],
  ['chance-2',2,'Chance','Five To Hit The Town','Get 5 Triple Chance',5,{kind:'ticket',rarity:'N',amount:1}],
  ['chance-3',3,'Chance','Ten To Bring ’em Home','Get 10 Triple Chance',10,{kind:'ticket',rarity:'R',amount:1}],
  ['pero-1',1,'Pero','Pocket Change','Get 3 Triple Pero',3,{kind:'wild',rarity:'N',amount:1}],
  ['pero-2',2,'Pero','The Big Bucks','Get 5 Triple Pero',5,{kind:'wild',rarity:'R',amount:1}],
  ['pero-3',3,'Pero','Stacking Bouillon','Get 10 Triple Pero',10,{kind:'wild',rarity:'SR',amount:1}],
  ['exp-1',1,'Experience','Temp Worker','Get 3 Triple Exp',3,{kind:'wild',rarity:'N',amount:1}],
  ['exp-2',2,'Experience','Salary Man','Get 5 Triple Exp',5,{kind:'wild',rarity:'R',amount:1}],
  ['exp-3',3,'Experience','Entrepreneur','Get 10 Triple Exp',10,{kind:'wild',rarity:'SR',amount:1}],
  ['gift-1',1,'Gift','A Ring For You','Get 3 Triple Gift',3,{kind:'pero',amount:1000}],
  ['gift-2',2,'Gift','Who Wants a Car?!','Get 5 Triple Gift',5,{kind:'pero',amount:3000}],
  ['gift-3',3,'Gift','Free Houses for Everyone!','Get 10 Triple Gift',10,{kind:'pero',amount:5000}],
  ['stamina-1',1,'Stamina','30 Push-ups!','Use 30 Stamina',30,{kind:'pero',amount:1000}],
  ['stamina-2',2,'Stamina','50 Sit-ups!','Use 50 Stamina',50,{kind:'pero',amount:3000}],
  ['stamina-3',3,'Stamina','100 Squats!','Use 100 Stamina',100,{kind:'wild',rarity:'R',amount:1}],
  ['cards-1',1,'Card Draws','Flirt with 3 Girls','Get 3 N Girls',3,{kind:'wild',rarity:'N',amount:1}],
  ['cards-2',2,'Card Draws','Flirt with 2 Beauties','Get 2 R Girls',2,{kind:'wild',rarity:'R',amount:1}],
  ['cards-3',3,'Card Draws','Flirt with 1 Actress','Get 1 SR Girls',1,{kind:'wild',rarity:'SR',amount:1}],
  ['cards-4',4,'Card Draws','Flirt with 3 Actress','Get 3 SR Girls',3,{kind:'item',item:'ex-wild',amount:1}],
  ['tease-1',1,'Teasing Friends','Pie to the Face','Tease 3 different people',3,{kind:'pero',amount:1000}],
  ['tease-2',2,'Teasing Friends','White Out','Tease 5 different people',5,{kind:'pero',amount:3000}],
  ['tease-3',3,'Teasing Friends','Bukkake Storm','Tease 10 different people',10,{kind:'pero',amount:5000}],
].map(([id,tier,category,name,objective,target,reward]) => ({id,tier,category,name,objective,target,reward,progress:0,claimed:false}) as DailyMission);


const VERIFIED_EX_LIMIT_MISSIONS: SpecialMission[] = [
  {id:'lvl-100-ex',category:'EX Levels',name:'Achieve Level 100',objective:'Reach Level 100',target:100,reward:{kind:'item',item:'ex-limit-5',amount:1},note:'Historical EX limit +5'},
  {id:'lvl-150-ex',category:'EX Levels',name:'Achieve Level 150',objective:'Reach Level 150',target:150,reward:{kind:'item',item:'ex-limit-5',amount:1},note:'Historical EX limit +5'},
  {id:'sed-2000000-ex',category:'Raise SED',name:'Raise SED to 2M',objective:'Reach 2,000,000 total SED',target:2000000,reward:{kind:'item',item:'ex-limit-5',amount:1},note:'Historical EX limit +5'},
  {id:'sed-3000000-ex',category:'Raise SED',name:'Raise SED to 3M',objective:'Reach 3,000,000 total SED',target:3000000,reward:{kind:'item',item:'ex-limit-5',amount:1},note:'Historical EX limit +5'},
];

export const HISTORICAL_SPECIAL_MISSIONS: SpecialMission[] = [
  {id:'tutorial-airu',category:'Tutorial',name:"I'm Coming For You, Airu",objective:'Complete the opening tutorial',target:1,reward:{kind:'ticket',rarity:'R',amount:1}},
  {id:'lvl-5',category:'Levels',name:'Achieve Level 5',objective:'Reach player level 5',target:5,reward:{kind:'ticket',rarity:'R',amount:1}},
  {id:'lvl-10',category:'Levels',name:'Achieve Level 10',objective:'Reach player level 10',target:10,reward:{kind:'ticket',rarity:'R',amount:1}},
  {id:'lvl-15',category:'Levels',name:'Achieve Level 15',objective:'Reach player level 15',target:15,reward:{kind:'ticket',rarity:'SR',amount:1}},
  {id:'lvl-25',category:'Levels',name:'Achieve Level 25',objective:'Reach player level 25',target:25,reward:{kind:'ticket',rarity:'R',amount:1}},
  {id:'lvl-30',category:'Levels',name:'Achieve Level 30',objective:'Reach player level 30',target:30,reward:{kind:'item',item:'card-reveal',amount:1},note:'Card Reveal x1'},
  {id:'lvl-50',category:'Levels',name:'Achieve Level 50',objective:'Reach player level 50',target:50,reward:{kind:'item',item:'card-reveal',amount:1},note:'Card Reveal x1; EX levels unlocked'},
  {id:'sed-1000',category:'Raise SED',name:'Raise SED to 1,000',objective:'Reach 1,000 total SED',target:1000,reward:{kind:'ticket',rarity:'R',amount:1}},
  {id:'sed-5000',category:'Raise SED',name:'Raise SED to 5,000',objective:'Reach 5,000 total SED',target:5000,reward:{kind:'ticket',rarity:'R',amount:1}},
  {id:'sed-10000',category:'Raise SED',name:'Raise SED to 10,000',objective:'Reach 10,000 total SED',target:10000,reward:{kind:'ticket',rarity:'SR',amount:1}},
  {id:'sed-500000',category:'Raise SED',name:'Raise SED to 500,000',objective:'Reach 500,000 total SED',target:500000,reward:{kind:'ticket',rarity:'R',amount:4}},
  {id:'sed-1000000',category:'Raise SED',name:'Raise SED to 1,000,000',objective:'Reach 1,000,000 total SED',target:1000000,reward:{kind:'item',item:'card-reveal',amount:3},note:'Card Reveal x3; EX levels unlocked'},
  {id:'rescue-2',category:'Rescue Girls',name:'Rescue 2 Girls from the Naked King',objective:'Rescue 2 girls during the rescue story',target:2,reward:{kind:'wild',rarity:'SR',amount:10}},
  {id:'rescue-6',category:'Rescue Girls',name:'Rescue 6 Girls from the Naked King',objective:'Rescue 6 girls during the rescue story',target:6,reward:{kind:'wild',rarity:'SR',amount:5},note:'Historical reward: SR Wild Card 3 x5'},
  {id:'rescue-10',category:'Rescue Girls',name:'Rescue 10 Girls from the Naked King',objective:'Rescue 10 girls during the rescue story',target:10,reward:{kind:'wild',rarity:'SR',amount:4},note:'Historical reward: SR Wild Card 5 x4'},
  {id:'rescue-16',category:'Rescue Girls',name:'Rescue 16 Girls from the Naked King',objective:'Rescue 16 girls during the rescue story',target:16,reward:{kind:'item',item:'ex-wild',amount:1},note:'EX Wild Card x1; EX level ability'},
  {id:'rescue-20',category:'Rescue Girls',name:'Rescue 20 Girls from the Naked King',objective:'Rescue 20 girls during the rescue story',target:20,reward:{kind:'item',item:'card-reveal',amount:1},note:'Card Reveal x1; historical EX limit +5'},
  ...VERIFIED_EX_LIMIT_MISSIONS,
];

export class MissionSystem {
  missions: DailyMission[] = HISTORICAL_DAILY_MISSIONS.map(m => ({...m,reward:{...m.reward}}));
  specialMissions: SpecialMission[] = HISTORICAL_SPECIAL_MISSIONS.map(m => ({...m,reward:{...m.reward}}));
  private readonly game: GameState;
  constructor(game: GameState) { this.game = game; }

  recordTriple(category: 'Chance'|'Pero'|'Experience'|'Gift'): void {
    const targets = this.missions.filter(m => m.category === category);
    for (const m of targets) if (!m.claimed) m.progress = Math.min(m.target, m.progress + 1);
  }

  recordStamina(amount: number): void {
    for (const m of this.missions.filter(m => m.category === 'Stamina' && !m.claimed)) m.progress = Math.min(m.target, m.progress + amount);
  }

  canClaim(mission: DailyMission): boolean { return mission.progress >= mission.target && !mission.claimed; }

  getSpecialProgress(m: SpecialMission): number {
    if (m.id === 'tutorial-airu') return this.game.tutorial.completed ? 1 : 0;
    if (m.category === 'Levels') return Math.min(m.target, this.game.player.level);
    if (m.category === 'Raise SED') return Math.min(m.target, this.game.totalSed);
    return 0;
  }

  canClaimSpecial(m: SpecialMission): boolean { return !m.claimed && this.getSpecialProgress(m) >= m.target; }

  claimSpecial(id: string): boolean {
    const mission = this.specialMissions.find(m => m.id === id);
    if (!mission || !this.canClaimSpecial(mission)) return false;
    const r = mission.reward;
    if (r.kind === 'pero') this.game.inventory.addPero(r.amount);
    if (r.kind === 'ticket' && r.rarity && r.amount > 0) this.game.inventory.addTicket(r.rarity, r.amount);
    if (r.kind === 'wild' && r.rarity && r.amount > 0) this.game.inventory.addWild(r.rarity, r.amount);
    mission.claimed = true;
    this.game.save();
    return true;
  }

  getSaveData() { return { missions: this.missions.map(m => ({id:m.id, progress:m.progress, claimed:m.claimed})), specialClaims: Object.fromEntries(this.specialMissions.filter(m=>m.claimed).map(m=>[m.id,true])) }; }

  loadSaveData(data: any): void {
    const claims = data?.specialClaims ?? {};
    for (const m of this.specialMissions) m.claimed = Boolean(claims[m.id]);
    const daily = data?.missions ?? [];
    for (const d of daily) {
      const m = this.missions.find(x=>x.id===d.id); if (m) { m.progress = Math.max(0, Math.min(m.target, Number(d.progress)||0)); m.claimed = Boolean(d.claimed); }
    }
  }

  resetDaily(): void {
    this.missions = HISTORICAL_DAILY_MISSIONS.map(m => ({...m, reward: {...m.reward}}));
  }

  claim(id: string): boolean {
    const mission = this.missions.find(m => m.id === id);
    if (!mission || !this.canClaim(mission)) return false;
    const r = mission.reward;
    if (r.kind === 'pero') this.game.inventory.addPero(r.amount);
    if (r.kind === 'ticket' && r.rarity) this.game.inventory.addTicket(r.rarity, r.amount);
    if (r.kind === 'wild' && r.rarity) this.game.inventory.addWild(r.rarity, r.amount);
    if (r.kind === 'item' && r.item) this.game.inventory.addItem(r.item, r.amount);
    mission.claimed = true;
    this.game.save();
    return true;
  }
}

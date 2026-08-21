export type ScreenName='home'|'collection'|'events'|'missions'|'gacha'|'explore'|'card-detail';
export interface CardData {id:string;name:string;rarity:'N'|'R'|'SR'|'SSR';attribute:'Moe'|'Babe'|'Sexy';maxSed:number;image?:string;owned?:boolean;level?:number;ex?:number}
export interface EventData {id:string;name:string;date:string;kind:'Faction Wars'|'Gambit'|'Elite Guard'|'Shards'|'Automata'|'Coliseum'}

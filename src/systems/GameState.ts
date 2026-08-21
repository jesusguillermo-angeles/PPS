import type {ScreenName} from '../types';
export class GameState {screen:ScreenName='home';stamina=523;focus=100;pero=419006;exp=5628;xp=7090;selectedEvent='fw20';private lastTick=Date.now();
 tick(now=Date.now()){const ms=now-this.lastTick;if(ms<=0)return;this.stamina=Math.min(523,this.stamina+Math.floor(ms/60000));this.focus=Math.min(100,this.focus+Math.floor(ms/300000));this.lastTick+=Math.floor(ms/60000)*60000;}
 setScreen(s:ScreenName){this.screen=s;}}
export const gameState=new GameState();

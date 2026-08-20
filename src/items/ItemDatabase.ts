export type ItemCategory = 'Leveling' | 'Replenishing' | 'Limited' | 'Other';
export type ItemDef = { id:string; name:string; category:ItemCategory; description:string; source:string };

const EX_LIMIT_ITEM: ItemDef = {id:'ex-limit-5', name:'EX Limit +5', category:'Other', description:'Raises the historical EX Level Limit by 5 when the corresponding milestone mission is cleared.', source:'Fandom Cards' };

export const HISTORICAL_ITEMS: ItemDef[] = [EX_LIMIT_ITEM,
  {id:'n-wild-1',name:'N Wild Card 1',category:'Leveling',description:'Raises a Normal rarity card by 1 level, up to level 100.',source:'Fandom Items'},
  {id:'r-wild-1',name:'R Wild Card 1',category:'Leveling',description:'Raises a Rare or Normal card by 1 level, up to level 100.',source:'Fandom Items'},
  {id:'sr-wild-1',name:'SR Wild Card 1',category:'Leveling',description:'Raises any card by 1 level, up to level 100.',source:'Fandom Items'},
  {id:'sr-wild-3',name:'SR Wild Card 3',category:'Leveling',description:'Raises any card by 3 levels, up to level 100.',source:'Fandom Items'},
  {id:'sr-wild-5',name:'SR Wild Card 5',category:'Leveling',description:'Raises any card by 5 levels, up to level 100.',source:'Fandom Items'},
  {id:'ex-wild',name:'EX Wild Card',category:'Leveling',description:'Adds one level to a level 100+ card within the current EX cap.',source:'Fandom Items'},
  {id:'peronamin',name:'Peronamin',category:'Replenishing',description:'Fully restores Stamina.',source:'Fandom Items'},
  {id:'peronamin-half',name:'Peronamin Half',category:'Replenishing',description:'Restores half of Stamina.',source:'Fandom Items'},
  {id:'pero-pudding',name:'Pero Pudding',category:'Replenishing',description:'Restores 6 Focus.',source:'Fandom Items'},
  {id:'pero-pudding-half',name:'Pero Pudding Half',category:'Replenishing',description:'Restores 3 Focus.',source:'Fandom Items'},
  {id:'pero-shake',name:'Pero Shake',category:'Limited',description:'Limited-time full Stamina recovery item; expires at the next event start.',source:'Fandom Items'},
  {id:'pero-shake-half',name:'Pero Shake Half',category:'Limited',description:'Limited-time half Stamina recovery item.',source:'Fandom Items'},
  {id:'pero-burger',name:'Pero Burger',category:'Limited',description:'Limited-time item that restores 6 Focus.',source:'Fandom Items'},
  {id:'pero-burger-half',name:'Pero Burger Half',category:'Limited',description:'Limited-time item that restores 3 Focus.',source:'Fandom Items'},
  {id:'sexual-energy-drink',name:'Sexual Energy Drink',category:'Limited',description:'Halves an Elite Guard\'s inhibition/HP at the start of an encounter.',source:'Fandom Items'},
  {id:'elixir',name:'Elixir',category:'Limited',description:'Makes an Elite Guard run away during an Elite Guard event.',source:'Kurito / Items'},
  {id:'pero-radar',name:'PeroPero Radar',category:'Limited',description:'Event/Kurito utility item.',source:'Fandom Items'},
  {id:'pero-glasses',name:'PeroPero Glasses',category:'Other',description:'Kurito/event utility item.',source:'Fandom Items'},
  {id:'card-reveal',name:'Card Reveal',category:'Other',description:'Reveals all card positions during Chance Time or Gacha.',source:'Fandom Items'},
  {id:'chestnut-liqueur',name:'Chestnut Liqueur',category:'Other',description:'Eliminates waiting time in Kurito\'s Nest.',source:'Fandom Items'},
  {id:'candy',name:'Candy',category:'Other',description:'Fed to Kurito and used in Pero Collection to unlock scenes.',source:'Fandom Items'},
  {id:'n-gacha-ticket',name:'N Gacha Ticket',category:'Other',description:'Ticket for Normal Gacha.',source:'Fandom Items'},
  {id:'r-gacha-ticket',name:'R Gacha Ticket',category:'Other',description:'Ticket for Rare Gacha.',source:'Fandom Items'},
  {id:'sr-gacha-ticket',name:'SR Gacha Ticket',category:'Other',description:'Ticket for SR Gacha.',source:'Fandom Items'},
];

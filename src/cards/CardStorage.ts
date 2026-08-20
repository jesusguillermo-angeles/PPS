import {
  cardDatabase
} from './CardDatabase';

import type {
  CardSaveData
} from './Card';


const STORAGE_KEY =
  'peropero-rebuild-save';


type GameSaveData = {

  cards: Record<
    string,
    CardSaveData
  >;

};


/*
 * ========================================
 * GUARDAR PARTIDA
 * ========================================
 */

export function saveGame(): void {

  const save: GameSaveData = {

    cards: {}

  };


  for (
    const card of cardDatabase
  ) {

    save.cards[
      card.id
    ] =
      card.getSaveData();

  }


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(save)
  );

}


/*
 * ========================================
 * CARGAR PARTIDA
 * ========================================
 */

export function loadGame(): void {

  const raw =
    localStorage.getItem(
      STORAGE_KEY
    );


  /*
   * No existe partida todavía.
   */

  if (!raw) {
    return;
  }


  try {

    const save:
      GameSaveData =
      JSON.parse(raw);


    if (
      !save ||
      !save.cards
    ) {
      return;
    }


    for (
      const card of cardDatabase
    ) {

      const savedCard =
        save.cards[
          card.id
        ];


      if (!savedCard) {
        continue;
      }


      card.loadSaveData(
        savedCard
      );

    }

  } catch (error) {

    console.error(
      'Error cargando la partida:',
      error
    );

  }

}


/*
 * ========================================
 * RESET
 * ========================================
 */

export function resetGame(): void {

  localStorage.removeItem(
    STORAGE_KEY
  );


  for (
    const card of cardDatabase
  ) {

    card.reset();

  }

}

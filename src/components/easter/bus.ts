/**
 * Tiny event bus between the terminal and the easter eggs, so the terminal
 * never has to import the (lazily loaded) egg code.
 */
export const RAIN_EVENT = "pim:letter-rain";

export function startLetterRain() {
  window.dispatchEvent(new Event(RAIN_EVENT));
}

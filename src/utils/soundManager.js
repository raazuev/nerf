import * as PIXI from "pixi.js";

export class SoundManager {
  static play(name) {
    const res = PIXI.Loader.shared.resources[name];
    if (!res) {
      console.warn(`SoundManager: Resource "${name}" not found.`);
      return;
    }

    const url = res.url;
    if (!url) {
      console.warn(
        `SoundManager: Resource "${name}" does not have a valid URL.`
      );
      return;
    }

    try {
      const audio = new Audio(url);
      audio.play().catch((error) => {
        console.error(`SoundManager: Error playing sound "${name}":`, error);
      });
    } catch (error) {
      console.error(`SoundManager: Error creating audio for "${name}":`, error);
    }
  }
}

import * as PIXI from "pixi.js";
import { SceneManager } from "./core/sceneManager";
import { Loader } from "./core/loader";
import "./main.css";

window.onload = () => {
  document.fonts.ready
    .then(() => {
      initPixiApp();
    })
    .catch((err) => {
      console.error("fonts error", err);
      initPixiApp();
    });
};

function initPixiApp() {
  const canvas = document.getElementById("nerf");

  const app = new PIXI.Application({
    view: canvas,
    resizeTo: window,
    backgroundColor: 0x99999,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // общий лоадер
  Loader.init()
    .addAssets([
      { name: "main_bg", url: "/assets/images/homeScreen/main_bg.png" },
      {
        name: "weapon_bg",
        url: "/assets/images/weaponScreen/weapon_bg.png",
      },
      {
        name: "game_weapon_bg",
        url: "/assets/images/gameScreen/game_weapon_bg.png",
      },
      {
        name: "logo_primary",
        url: "/assets/images/homeScreen/logo_primary.png",
      },
      {
        name: "Volt",
        url: "/assets/images/weapons/Elite20_Volt.png",
      },
      {
        name: "Shockwave",
        url: "/assets/images/weapons/Elite20_Shockwave.png",
      },
      {
        name: "Echo",
        url: "/assets/images/weapons/Elite20_Echo.png",
      },
      {
        name: "Commander",
        url: "/assets/images/weapons/Elite20_Commander.png",
      },
      {
        name: "left",
        url: "/assets/images/arrows/left.png",
      },
      {
        name: "right",
        url: "/assets/images/arrows/right.png",
      },
      {
        name: "target",
        url: "/assets/images/gameScreen/target.png",
      },
    ])
    .load(() => {
      const manager = new SceneManager(app);
      manager.changeScene("intro");
      app.ticker.add((delta) => manager.update(delta));
    });
}

import * as PIXI from "pixi.js";
import { SceneManager } from "./core/sceneManager";
import { Loader } from "./core/loader";

window.onload = () => {
  const canvas = document.getElementById("nerf");

  const app = new PIXI.Application({
    view: canvas,
    resizeTo: window,
    backgroundColor: 0x99999,
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
    ])
    .load(() => {
      const manager = new SceneManager(app);
      manager.changeScene("intro");
      app.ticker.add((delta) => manager.update(delta));
    });
};

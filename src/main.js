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

  Loader.init()
    .addAssets([
      { name: "main_bg", url: "/assets/images/homeScreen/main_bg.png" },
    ])
    .load(() => {
      const manager = new SceneManager(app);
      manager.changeScene("intro");
      app.ticker.add((delta) => manager.update(delta));
    });
};

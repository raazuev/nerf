import * as PIXI from "pixi.js";

let app;

window.onload = function () {
  app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x33333,
  });
  document.body.appendChild(app.view);
};

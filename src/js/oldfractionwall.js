import * as PIXI from "pixi.js";
import blueGradient from "../assets/blue-gradient.png";
import * as CONST from "./const.js";
import plusButton from "../assets/Plus.png";
import minusButton from "../assets/Minus.png";
import QuestionMark from '../assets/QuestionMark.png'
import { fontWeight } from "@material-ui/system";
let createjs = window.createjs

export const init = (app, setup) => {
 

let WINDOW_WIDTH = setup.width    
let WINDOW_HEIGHT = setup.height
let wallWidth = 0.8*setup.width
let wallX = 50
let height = WINDOW_HEIGHT/15
let backGround = new PIXI.Sprite.from(CONST.ASSETS.BLUE_GRADIENT);
backGround.width = WINDOW_WIDTH;
backGround.height = WINDOW_HEIGHT;
backGround.x = 0;
backGround.y = 0;
backGround.alpha = 0;
app.stage.addChild(backGround);
createjs.Tween.get(backGround).to(
  { alpha: 1 },
  500,
  createjs.Ease.getPowInOut(4)
);


let resetButton = new PIXI.Sprite.from(CONST.ASSETS.RESET)
resetButton.interactive = true
resetButton.x = height/2
resetButton.y = height/2
resetButton.width = height
resetButton.height = height
resetButton.on('pointerdown',reset)
app.stage.addChild(resetButton)
// Denominator of the row that's currently place on the number line.
let activeRow = 12;

// Numerator of Active Row (this is the fraction that will be shaded)
let activeNum = 0;

// Is the program currently swapping rows?
let swapping = false;

var graphics = new PIXI.Graphics();
graphics.lineStyle(4, 0xc0ffee, 1);
graphics.beginFill(0xfe6f61);
graphics.drawRect(0, 0, 50, 100);
graphics.endFill();

var activeTexture = app.renderer.generateTexture(graphics);

const labels = {
  1: "One Whole",
  2: "One Half",
  3: "One Third",
  4: "Fourth",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
  10: "10th",
  11: "11th",
  12: "12th"
};

// Constructors

function distance(a, b) {
  let x1 = a[0];
  let y1 = a[1];
  let x2 = b[0];
  let y2 = b[1];
  let dX = x2 - x1;
  let dY = y2 - y1;
  return Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
}

const wallObj = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: []
};

for (var i = 1; i <= 12; i++) {
  let w = wallWidth / i;
  for (var j = 0; j < i; j++) {
    let h = height;
    let x = j * w + w / 2 + (WINDOW_WIDTH-wallWidth) / 2;
    let y = i * h;
    let tile = createTile(x, y, w, h, i);
    wallObj[i].push(tile);
    app.stage.addChild(tile);
  }
}

function newTexture(self, color) {
  var graphics = new PIXI.Graphics();
  graphics.lineStyle(3, 0xb7b7b7, 1);
  graphics.beginFill(color);
  graphics.drawRoundedRect(0, 0, self.width - 3, self.height - 3, 3);
  graphics.endFill();
  return app.renderer.generateTexture(graphics);
}

function swapCompleted() {
  swapping = false;
}

function reset(){
    let keys = Object.keys(wallObj)
    keys.forEach(k=>{
        let r = wallObj[k]
        r.forEach(e=>{
            e.tile.texture = newTexture(e, 0xffffff)
            e.active = false
        })
    })
}

function moveRowUp(row) {
  row.forEach(t =>
    createjs.Tween.get(t).to(
      { y: t.y - height },
      1000,
      createjs.Ease.getPowInOut(4)
    )
  );
}

function moveRowDown(row) {
  row.forEach(t =>
    createjs.Tween.get(t).to(
      { y: t.y + height },
      1000,
      createjs.Ease.getPowInOut(4)
    )
  );
}

function sendRowToBottom(row1, row2, start) {
  let y1 = row1[0].y;
  let y2 = row2[0].y;
  swapping = true;
  for (var row in wallObj) {
    if (wallObj[row][0].y > start) {
      moveRowUp(wallObj[row]);
    }
  }
  row1.forEach(t =>
    createjs.Tween.get(t)
      .to({ y: 12 * height }, 1000, createjs.Ease.getPowInOut(4))
      .call(swapCompleted)
  );
}

let tickArray = [];

function initTickArray(d) {
  for (var i = 0; i <= 12; i++) {
    let tick = new PIXI.Graphics();
    tick.lineStyle(4, 0xb7b7b7, 1);
    tick.moveTo(wallX, 12.5 * height);
    tick.lineTo(wallX, 13.5 * height);
    app.stage.addChild(tick);
    tickArray.push(tick);
    createjs.Tween.get(tick).to(
      { x: (wallWidth / d) * i },
      1000,
      createjs.Ease.getPowInOut(4)
    );
  }
}

function drawNumberLine(den) {
  let line = new PIXI.Graphics();
  line.lineStyle(4, 0xb7b7b7, 1);
  line.moveTo(wallX, 13 * height);
  line.lineTo(wallX + wallWidth, 13 * height);
  app.stage.addChild(line);
}

function animateTicks(den) {
  tickArray.forEach((t, i) => {
    if (i > den) {
      createjs.Tween.get(t).to(
        { x: wallWidth },
        1000,
        createjs.Ease.getPowInOut(4)
      );
    } else {
      createjs.Tween.get(t).to(
        { x: (wallWidth / den) * i },
        1000,
        createjs.Ease.getPowInOut(4)
      );
    }
  });
}

function swapRow(row, start, end) {
  if (Math.abs(start - end) < 30) {
    row.forEach(t =>
      createjs.Tween.get(t)
        .to({ y: start }, 1000, createjs.Ease.getPowInOut(4))
        .call(swapCompleted)
    );
  }
  // Moved up
  else if (start > end) {
    for (var r in wallObj) {
      if (wallObj[r][0].y < start && wallObj[r][0].y > end) {
        moveRowDown(wallObj[r]);
      }
    }
    let roundedEnd = Math.ceil(end / height) * height;
    row.forEach(t =>
      createjs.Tween.get(t)
        .to({ y: roundedEnd }, 1000, createjs.Ease.getPowInOut(4))
        .call(swapCompleted)
    );
  }
  // Moved down
  else if (start < end) {
    for (var r in wallObj) {
      if (wallObj[r][0].y > start && wallObj[r][0].y < end) {
        moveRowUp(wallObj[r]);
      }
    }
    let roundedEnd = Math.floor(end / height) * height;
    row.forEach(t =>
      createjs.Tween.get(t)
        .to({ y: roundedEnd }, 1000, createjs.Ease.getPowInOut(4))
        .call(swapCompleted)
    );
  }
}

function createTile(x, y, w, h, d) {
  var graphics = new PIXI.Graphics();
  graphics.lineStyle(3, 0xb7b7b7, 1);
  graphics.beginFill(0xffffff);
  graphics.drawRoundedRect(0, 0, w, h, 3);
  graphics.endFill();

  var texture = app.renderer.generateTexture(graphics);
  let tile = new PIXI.Sprite(texture);
  tile.anchor.set(0.5);

  let den = new PIXI.Text(labels[d], {
    fontFamily: "Arial",
    fontSize: h / 2,
    fill: 0xffffff,
    align: "center"
  });
  den.anchor.set(0.5);

  let tileContainer = new PIXI.Container();

  tile.on("pointerdown", onDragStart);

  tileContainer.addChild(tile);
  tileContainer.addChild(den);

  tileContainer.active = false;
  tileContainer.interactive = true;
  tileContainer.den = d;
  tileContainer.buttonMode = true;
  //tileContainer.anchor.set(0.5);

  tileContainer
    .on("pointerdown", onDragStart)
    .on("pointerup", onDragEnd)
    .on("pointerupoutside", onDragEnd)
    .on("pointermove", onDragMove);

  // move the sprite to its designated position
  tileContainer.x = x;
  tileContainer.y = y;

  tileContainer.tile = tile;
  return tileContainer;
}

function onDragStart(event) {
  if (!swapping) {
    console.log("setting dragging to true");
    this.dragging = true;
    this.dragStartedAt = this.y;
    this.data = event.data;
    this.alpha = 0.5;
  }
}

function onDragEnd() {
  if (this.wasDragged) {
    this.wasDragged = false;
    let row = wallObj[this.den];
    activeRow = this.den;
    swapRow(row, this.dragStartedAt, this.y);
    if (this.y > 12 * height) {
      animateTicks(activeRow);
    }
  } else {
    this.active = !this.active;
    this.tile.texture = this.active
      ? newTexture(this, 0xfe6f61)
      : newTexture(this, 0xffffff);
  }
  this.alpha = 1;
  this.dragging = false;
  this.data = null;
}

function onDragMove() {
  if (this.dragging) {
    this.wasDragged = true;
    var newPosition = this.data.getLocalPosition(this.parent);
    wallObj[this.den].forEach(t => {
      t.parent.addChild(t);
      t.y = newPosition.y;
    });
  }
}
}

import * as PIXI from "pixi.js";
import * as CONST from "./const.js";
const createjs = window.createjs


export const init = (app, setup) => {

const WINDOW_HEIGHT = setup.height
const WINDOW_WIDTH = setup.width
const DIM = WINDOW_WIDTH / 12;
const JIJI_CONT_LEFT = 3 * DIM;
const JIJI_CONT_TOP = DIM;
const WINDOW_CENTER_X = WINDOW_WIDTH / 2;
const WINDOW_CENTER_Y = WINDOW_HEIGHT / 2;
const CONTAINER_WIDTH = DIM;
const CONTAINER_HEIGHT = DIM;
const CONTAINER_CENTER_X = DIM;
const CONTAINER_CENTER_Y = 2.5 * DIM;
const CONTAINER_TOP = CONTAINER_CENTER_Y - CONTAINER_WIDTH / 2;
const CONTAINER_BOTTOM = CONTAINER_CENTER_Y + CONTAINER_WIDTH / 2;
const CONTAINER_LEFT = CONTAINER_CENTER_X - CONTAINER_WIDTH / 2;
const CONTAINER_RIGHT = CONTAINER_CENTER_X + CONTAINER_WIDTH / 2;

let backGround = new PIXI.Sprite.from(CONST.ASSETS.BLUE_GRADIENT);
backGround.width = WINDOW_WIDTH;
backGround.height = WINDOW_HEIGHT;
backGround.x = 0;
backGround.y = 0;
backGround.alpha = 0;
app.stage.addChild(backGround);
createjs.Tween.get(backGround).to(
  {
    alpha: 1
  },
  500,
  createjs.Ease.getPowInOut(4)
);

let constructorBlock;
let jijis = [];
let plusJiji;
let minusJiji;
let jijiDIM;
let cuttingTool;
let deleteTool;
let resetTool;
let blocks = [];
let jijiIcon;
let activeBlock;
let cutterContainer = new PIXI.Container();
let fractions = [];
let horizontalLines = [];
let verticalLines = [];
let vPartitions = 1;
let hPartitions = 1;
let colorIndex = 0;

let vPlus;
let vMinus;
let hPlus;
let hMinus;
let cont;
let cutting = false;
let blockBeingCut;
let cutOperators = [];

// ENUM
const OBJ_TYPE = {
  BLOCK: 0,
  CUT: 1,
  DELETE: 2
};

const jiji_width = () => {
  return jijis.length < 7 ? DIM : (DIM * 7) / jijis.length;
};

const v_part_dim = () => {
  return CONTAINER_HEIGHT / hPartitions;
};

const h_part_dim = () => {
  return CONTAINER_WIDTH / vPartitions;
};

const jiji_left = () => {
  let w = jiji_width();
  return WINDOW_WIDTH / 2 - (1.2 * w * jijis.length) / 2;
};

// Init
//createMenuButtons()
//layoutMenu()
//initVerticalLines(1)
constructorBlock = createBlockConstructor();
app.stage.addChild(constructorBlock);
constructorBlock.x = DIM / 2;
constructorBlock.y = DIM / 2;
initHorizontalLines(1);
animateVerticalLines(0);
animateHorizontalLines(1);
createBlockConstructor();
drawPlusMinusButtons();
vPlus = createCircleButton("Ok", 0xffffff);
hPlus = createCircleButton("+", 0xffffff);
hMinus = createCircleButton("-", 0xffffff);
cont = createContainer(CONTAINER_WIDTH);
createCutterContainer();
cutOperators = [vPlus, hPlus, hMinus];
animateOperatorAlpha(0);
vPlus.alpha = 0;
hPlus.alpha = 0;
hMinus.alpha = 0;
initJijis(2);

// Rouge Init

resetTool = createReset();
resetTool.interactive = true;
resetTool.on("pointerdown", reset);
app.stage.addChild(resetTool);
resetTool.x = WINDOW_WIDTH - DIM / 2;
resetTool.y = DIM / 2;

deleteTool = createTrashCan();
app.stage.addChild(deleteTool);
deleteTool.x = DIM;
deleteTool.y = 4.5 * DIM;

cont.x = CONTAINER_CENTER_X;
cont.y = CONTAINER_CENTER_Y;

vPlus.y = CONTAINER_TOP - DIM / 4;
vPlus.x = CONTAINER_CENTER_X;

hPlus.x = CONTAINER_RIGHT + DIM / 4;
hPlus.y = CONTAINER_CENTER_Y;

hMinus.x = CONTAINER_LEFT - DIM / 4;
hMinus.y = CONTAINER_CENTER_Y;

hPlus.on("pointerdown", () => animateHorizontalLines(1));
hMinus.on("pointerdown", () => animateHorizontalLines(-1));
vPlus.on("pointerdown", () => cutBlock(blockBeingCut, hPartitions));

// Factory Functions

function createReset() {
  let reset = new PIXI.Sprite.from(CONST.ASSETS.RESET);
  reset.width = DIM / 2;
  reset.height = DIM / 2;
  reset.anchor.set(0.5);
  return reset;
}

function createTrashCan() {
  let trashCan = new PIXI.Sprite.from(CONST.ASSETS.TRASH);
  trashCan.width = DIM / 2;
  trashCan.height = DIM / 2;
  trashCan.anchor.set(0.5);
  return trashCan;
}

function createJijiAsset() {
  let blockSprite = new PIXI.Sprite.from(CONST.ASSETS.JIJI);
  let w = jiji_width();
  blockSprite.width = w;
  blockSprite.height = w;
  blockSprite.anchor.set(0.5);
  return blockSprite;
}

function initJijis(n) {
  let startX = JIJI_CONT_LEFT;
  for (let i = 0; i < n; i++) {
    let jiji = createJijiAsset();
    jijis.push(jiji);
    app.stage.addChild(jiji);
    jiji.x = startX + i * jiji.width;
    jiji.y = JIJI_CONT_TOP;
  }
}

function incJiji(n) {
  console.log("INCING JIJI");
  console.log("n", n);
  if (n == 1) {
    if (jijis.length < 8) {
      let jiji = createJijiAsset();
      jiji.alpha = 0;
      jiji.y = DIM;
      jiji.x = WINDOW_WIDTH / 2;
      createjs.Tween.get(jiji).to(
        {
          alpha: 1
        },
        1000,
        createjs.Ease.getPowInOut(4)
      );
      jijis.push(jiji);
      app.stage.addChild(jiji);
    }
  } else if (n == -1) {
    if (jijis.length > 2) {
      let toRemove = jijis.pop();
      createjs.Tween.get(toRemove)
        .to(
          {
            alpha: 0
          },
          1000,
          createjs.Ease.getPowInOut(4)
        )
        .call(() => {
          app.stage.removeChild(toRemove);
        });
    }
  }
  layoutJijis();
}

function layoutJijis() {
  console.log("hello!!!");
  console.log("jiji's length", jijis.length);
  let w = jiji_width();
  let left = WINDOW_WIDTH / 2 - (1.2 * w * jijis.length) / 2;
  console.log("left");
  jijis.forEach((e, i) => {
    createjs.Tween.get(e).to(
      {
        x: left + 1.2 * w * i + w / 2
      },
      1000,
      createjs.Ease.getPowInOut(4)
    );
    createjs.Tween.get(e).to(
      {
        width: w,
        height: w
      },
      1000,
      createjs.Ease.getPowInOut(4)
    );
  });
}

function newJiji() {
  let newJiji = createJijiAsset();
  app.stage.addChild(newJiji);
  jijis.push(newJiji);
}

function reset() {
  for (let b of blocks) {
    app.stage.removeChild(b);
  }
  for (let f of fractions) {
    app.stage.removeChild(f);
  }
  blocks = [];
  fractions = [];
}

function nearestJiji(xVal) {
  let delta = 100000;
  let nearestX;
  console.log("xVal", xVal);
  jijis.forEach(e => {
    console.log("e.x,nearestX", e.x);
    if (Math.abs(e.x - xVal) < delta) {
      console.log("nearest x!!!!");
      delta = Math.abs(e.x - xVal);
      nearestX = e.x;
    }
  });
  return nearestX;
}

//
function drawPlusMinusButtons() {
  plusJiji = createCircleButton("+", 0xffffff);
  minusJiji = createCircleButton("-", 0xffffff);
  jijiIcon = createJijiAsset();
  jijiIcon.width = DIM / 3;
  jijiIcon.height = DIM / 3;
  plusJiji.interactive = true;
  minusJiji.interactive = true;
  plusJiji.on("pointerdown", () => {
    incJiji(1);
  });
  minusJiji.on("pointerdown", () => {
    incJiji(-1);
  });
  app.stage.addChild(plusJiji);
  app.stage.addChild(minusJiji);
  app.stage.addChild(jijiIcon);
  plusJiji.x = (3 * DIM) / 2;
  plusJiji.y = 3.5 * DIM;
  jijiIcon.y = 3.5 * DIM;
  jijiIcon.x = DIM;
  minusJiji.x = DIM / 2;
  minusJiji.y = 3.5 * DIM;
}

function createCutterContainer() {
  cutterContainer.interactive = true;
  cutterContainer.TYPE = OBJ_TYPE.CUT;
  for (let l of horizontalLines) {
    console.log("adding child");
    cutterContainer.addChild(l);
    console.log(l.y);
  }
  hPlus.alpha = 0;
  vPlus.alpha = 0;
  hMinus.alpha = 0;
  cutterContainer.addChild(hPlus);
  cutterContainer.addChild(vPlus);
  cutterContainer.addChild(hMinus);
  cutterContainer.addChild(cont);
  cutterContainer.on("pointerdown", onPolyTouched);
  cutterContainer.on("pointerup", onPolyMoveEnd);
  cutterContainer.on("pointermove", onPolyTouchMoved);
  cutterContainer.x = CONTAINER_LEFT;
  cutterContainer.y = CONTAINER_TOP;
  cutterContainer.pivot.x = cutterContainer.x;
  cutterContainer.pivot.y = cutterContainer.y;
  cutterContainer.start = [cutterContainer.x, cutterContainer.y];
  app.stage.addChild(cutterContainer);
  return cutterContainer;
}

function cutBlock(block, pieces) {
  let h = block.height / pieces;
  let w = block.width;
  console.log("w,y,x,y", h, w, block.x, block.y);
  for (let i = 0; i < pieces; i++) {
    let newBlock = createBlock(w, h);
    newBlock.isFrac = true;
    newBlock.type = OBJ_TYPE.BLOCK;
    newBlock.x = block.x;
    newBlock.y = block.y - block.height / 2 + h / 2 + h * i;
    newBlock.on("pointerdown", onPolyTouched);
    newBlock.on("pointerup", onPolyMoveEnd);
    newBlock.on("pointermove", onPolyTouchMoved);
    fractions.push(newBlock);
    app.stage.addChild(newBlock);
  }

  let i = blocks.indexOf(block);
  blocks.splice(i, 1);
  app.stage.removeChild(block);
  animateOperatorAlpha(0);
  hPartitions = 2;
  animateHorizontalLines(0);
  createjs.Tween.get(cutterContainer)
    .to(
      {
        x: cutterContainer.start[0],
        y: cutterContainer.start[1]
      },
      500,
      createjs.Ease.getPowInOut(4)
    )
    .call(() => {
      cutting = false;
    });
}

// Helpers

function bringLinesToFront() {
  let lines = [...verticalLines, ...horizontalLines];
  //lines.forEach(l =>  app.stage.addChild(l))
}

// Constructors

function createTextBox(text) {
  let h = DIM / 4;
  let w = DIM / 4;

  var circle = new PIXI.Graphics();
  circle.drawRoundedRect(0, 0, 4 * h, h, 1);
  circle.endFill();

  let circleTexture = app.renderer.generateTexture(circle);
  let circleSprite = new PIXI.Sprite(circleTexture);
  circleSprite.alpha = 0.5;
  circleSprite.anchor.set(0.5);

  let pinContainer = new PIXI.Container();
  pinContainer.addChild(circleSprite);

  let operator = new PIXI.Text(text, {
    fontFamily: "Chalkboard SE",
    fontSize: DIM / 2,
    fill: 0x000000,
    align: "center"
  });
  operator.anchor.set(0.5);
  operator.x = 0;
  operator.y = 0;
  pinContainer.addChild(operator);
  pinContainer.interactive = true;

  return pinContainer;
}

function createCircleButton(text, color) {
  let h = DIM / 4;
  let w = DIM / 4;

  var circle = new PIXI.Graphics();
  circle.beginFill(color);
  circle.drawCircle(DIM / 5, DIM / 5, DIM / 5);
  circle.endFill();

  let circleTexture = app.renderer.generateTexture(circle);
  let circleSprite = new PIXI.Sprite(circleTexture);
  circleSprite.alpha = 0.5;
  circleSprite.anchor.set(0.5);

  let pinContainer = new PIXI.Container();
  pinContainer.addChild(circleSprite);

  let operator = new PIXI.Text(text, {
    fontFamily: "Chalkboard SE",
    fontSize: DIM / 4,
    fill: 0x000000,
    align: "center"
  });
  operator.anchor.set(0.5);
  operator.x = 0;
  operator.y = 0;
  pinContainer.addChild(operator);
  pinContainer.interactive = true;

  return pinContainer;
}

function createContainer(width) {
  let containerGraphic = new PIXI.Graphics();
  containerGraphic.lineStyle(2, 0x000000);
  containerGraphic.moveTo(0, 0);
  containerGraphic.lineTo(0, width);
  containerGraphic.lineTo(width, width);
  containerGraphic.lineTo(width, 0);
  containerGraphic.lineTo(0, 0);
  containerGraphic.interactive = true;
  containerGraphic.x = 1;
  containerGraphic.y = 1;

  let containerTexture = app.renderer.generateTexture(containerGraphic);
  let containerSprite = new PIXI.Sprite(containerTexture);
  containerSprite.anchor.set(0.5);
  containerSprite.width = containerGraphic.width;
  containerSprite.height = containerGraphic.height;
  return containerSprite;
}

function initVerticalLines(partition) {
  for (let i = 0; i < 11; i++) {
    let g = new PIXI.Graphics();
    g.lineStyle(2, 0x000000);
    g.lineTo(0, CONTAINER_WIDTH);
    g.y = CONTAINER_TOP;
    g.x = CONTAINER_LEFT;
    verticalLines.push(g);
    app.stage.addChild(g);
  }
}

function initHorizontalLines(partition) {
  for (let i = 0; i < 11; i++) {
    let g = new PIXI.Graphics();
    g.lineStyle(2, 0x000000);
    g.lineTo(CONTAINER_WIDTH, 0);
    g.y = CONTAINER_BOTTOM;
    g.x = CONTAINER_LEFT;
    horizontalLines.push(g);
  }
}

function animateVerticalLines(inc) {
  console.log("animating verticalLines");
  vPartitions += inc;
  if (vPartitions != 0 && vPartitions != 11) {
    colorIndex += 1;

    console.log("color Index", colorIndex);

    let spacing = CONTAINER_WIDTH / vPartitions;

    verticalLines.forEach((l, i) => {
      app.stage.addChild(l);
      if (i > vPartitions) {
        createjs.Tween.get(l).to(
          {
            x: CONTAINER_RIGHT
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
      } else {
        createjs.Tween.get(l).to(
          {
            x: i * spacing + CONTAINER_LEFT
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
      }
    });
  } else {
    vPartitions -= inc;
  }
}

function animateHorizontalLines(inc) {
  hPartitions += inc;
  if (hPartitions != 0 && hPartitions != 11) {
    colorIndex += 1;

    let spacing = CONTAINER_WIDTH / hPartitions;

    horizontalLines.forEach((l, i) => {
      if (i > hPartitions) {
        console.log("containerbottom", CONTAINER_BOTTOM);
        console.log("cutterContainerxy", cutterContainer.x, cutterContainer.y);
        createjs.Tween.get(l).to(
          {
            y: CONTAINER_BOTTOM
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
      } else {
        createjs.Tween.get(l).to(
          {
            y: i * spacing + CONTAINER_TOP
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
      }
    });
  } else {
    hPartitions -= inc;
  }
}

function onFracStart(event) {
  bringLinesToFront();
  let touchedAtX = event.data.global.x;
  let touchedAtY = event.data.global.y;
  this.deltaTouch = [this.x - touchedAtX, this.y - touchedAtY];
  app.stage.addChild(this);
  this.data = event.data;
  this.dragging = true;
}

// Pass it the level and it will layout the buttons for that new level.
function createBlockConstructor() {
  var graphics = new PIXI.Graphics();
  graphics.beginFill(CONST.COLORS.BLUE);
  graphics.drawRoundedRect(0, 0, DIM, DIM, 2);
  graphics.endFill();
  graphics.color = CONST.COLORS.BLUE;
  //graphics.alpha = 0.8
  graphics.interactive = true;
  console.log("graphics dims", graphics.width, graphics.height);
  graphics.on("pointerdown", () => {
    newBlock(
      graphics.width,
      graphics.height,
      constructorBlock.x + constructorBlock.width / 2,
      constructorBlock.y + constructorBlock.height / 2
    );
  });
  return graphics;
}

function newBlock(w, h, x, y) {
  let newBlock = createBlock(w, h);
  app.stage.addChild(newBlock);
  newBlock.x = x;
  newBlock.y = y;
  createjs.Tween.get(newBlock)
    .to(
      {
        x: WINDOW_CENTER_X + blocks.length * 10,
        y: CONTAINER_CENTER_Y + blocks.length * 10
      },
      1000,
      createjs.Ease.getPowInOut(4)
    )
    .call(() => {
      newBlock.on("pointerdown", onPolyTouched);
      newBlock.on("pointerup", onPolyMoveEnd);
      newBlock.on("pointermove", onPolyTouchMoved);
    });
  blocks.push(newBlock);
}

function createBlock(w, h) {
  let graphics = new PIXI.Graphics();
  graphics.lineStyle(1, 0xffffff);
  graphics.beginFill(CONST.COLORS.BLUE);
  graphics.drawRoundedRect(0, 0, w, h, 3);
  graphics.endFill();
  graphics.x = 0.5;
  graphics.y = 0.5;
  graphics.alpha = 0.8
  let texture = app.renderer.generateTexture(graphics);
  let sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.interactive = true;
  sprite.TYPE = OBJ_TYPE.BLOCK;
  return sprite;
}

function animateOperatorAlpha(a) {
  for (let o of cutOperators) {
    if (a == 0) {
      o.interactive = false;
    } else {
      o.interactive = true;
    }
    createjs.Tween.get(o).to(
      {
        alpha: a
      },
      500,
      createjs.Ease.getPowInOut(4)
    );
  }
}

function onPolyTouched(event) {
  if (this.TYPE == OBJ_TYPE.CUT) {
    cutting = true;
  }

  let touchedAtX = event.data.global.x;
  let touchedAtY = event.data.global.y;

  app.stage.addChild(this);
  this.dragging = true;
  this.wasDragged = false;
  this.deltaTouch = [this.x - touchedAtX, this.y - touchedAtY];
  this.dragStartedAt = this.y;
  this.data = event.data;
}

function onPolyMoveEnd() {
  this.dragging = false;
  this.data = null;
  this.deltaTouch = [];

  switch (this.TYPE) {
    case OBJ_TYPE.DELETE:
      createjs.Tween.get(this).to(
        {
          x: this.start[0],
          y: this.start[1]
        },
        500,
        createjs.Ease.getPowInOut(4)
      );
      console.log("blocks", blocks);
      let blocksInThis = blocks.filter(e => {
        console.log("c.center?", e.center);
        let p = new PIXI.Point(this.x, this.y);
        console.log("isitinrect?", pointInRect(p, e));
        return pointInRect(p, e);
      });
      console.log("blocksInthis", blocksInThis);
    case OBJ_TYPE.CUT:
      let blocksInCutter = blocks.filter(e => {
        console.log("c.center?", e.center);
        let p = new PIXI.Point(
          this.x + CONTAINER_HEIGHT / 2,
          this.y + CONTAINER_HEIGHT / 2
        );
        console.log("isitinrect?", pointInRect(p, e));
        return pointInRect(p, e) && !e.isFrac;
      });
      if (blocksInCutter.length == 0) {
        animateOperatorAlpha(0);
        createjs.Tween.get(this)
          .to(
            {
              x: this.start[0],
              y: this.start[1]
            },
            500,
            createjs.Ease.getPowInOut(4)
          )
          .call(() => {
            cutting = false;
          });
      } else {
        blockBeingCut = blocksInCutter[0];
        animateOperatorAlpha(1);
        createjs.Tween.get(this).to(
          {
            x: blocksInCutter[0].x - CONTAINER_WIDTH / 2,
            y: blocksInCutter[0].y - CONTAINER_HEIGHT / 2
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
      }
    case OBJ_TYPE.BLOCK:
      if (!cutting) {
        console.log("this is a block");
        let testPoint = new PIXI.Point(this.x, this.y);
        let inDelete = pointInRect(testPoint, deleteTool);
        if (inDelete) {
          console.log("in delete?");
          let i = blocks.indexOf(this);
          blocks.splice(i, 1);
          app.stage.removeChild(this);
        } else {
          let newX = nearestJiji(this.x);
          console.log("newX", newX);
          createjs.Tween.get(this).to(
            {
              x: newX
            },
            300,
            createjs.Ease.getPowInOut(4)
          );
        }
      }
  }
}

function onPolyTouchMoved() {
  if (this.dragging) {
    this.wasDragged = true;
    var newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x + this.deltaTouch[0];
    this.y = newPosition.y + this.deltaTouch[1];
  }
}

// Helpers
function pointInRect(p, rect) {
  // This is for a rect with anchor in center
  let top = rect.y - rect.height / 2;
  let bottom = rect.y + rect.height / 2;
  let left = rect.x - rect.width / 2;
  let right = rect.x + rect.width / 2;

  let c1 = p.x < right;
  let c2 = p.x > left;
  let c3 = p.y < bottom;
  let c4 = p.y > top;

  return c1 && c2 && c3 && c4;
}

layoutJijis();


};

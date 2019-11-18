import * as PIXI from "pixi.js";
import blueGradient from "../assets/blue-gradient.png";
import * as CONST from "./const.js";
import QuestionMark from '../assets/QuestionMark.png'
const createjs = window.createjs

export const init = (app, setup) => {

const WINDOW_WIDTH = setup.width
const WINDOW_HEIGHT = setup.height

let backGround = new PIXI.Sprite.from(blueGradient);
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

const BUILDER_STATES = {
  SINGLE_BUILDER: 1,
  DOUBLE_BUILDER: 2,
  TRIPLE_BUILDER: 3,
  QUADRUPLE_BUILDER: 4,
  ORDERER: 5
};

const DIM = WINDOW_WIDTH / 12;
const dx = DIM/2
const LEFT_X = (3 / 4) * WINDOW_WIDTH;
const RIGHT_X = (1 / 4) * WINDOW_WIDTH;
const WINDOW_CENTER_X = WINDOW_WIDTH / 2;
const WINDOW_CENTER_Y = WINDOW_HEIGHT / 2;
const CONTAINER_WIDTH = WINDOW_WIDTH * 0.15;
const CONTAINER_HEIGHT = CONTAINER_WIDTH * 2;
const CONTAINER_TOP = 0;
const CONTAINER_BOTTOM = CONTAINER_HEIGHT;
const CONTAINER_LEFT = 0;
const CONTAINER_RIGHT = CONTAINER_WIDTH;
const TWELFTH_WIDTH = CONTAINER_WIDTH / 12;

const containers = [];

let toggleButton;


function layoutGridTools(numberOfTools) {
  console.log("number of grid tools", numberOfTools);
  for (let i = 0; i < numberOfTools; i++) {
    let x =
      WINDOW_WIDTH / 2 -
      (CONTAINER_WIDTH * numberOfTools * 1.1) / 2 +
      CONTAINER_WIDTH * 1.1 * i;
    let gridToolRight = createGridTool();
    gridToolRight.interactive = true;
    app.stage.addChild(gridToolRight);
    gridToolRight.x = x;
    gridToolRight.y = WINDOW_CENTER_Y - CONTAINER_HEIGHT / 3;
    gridToolRight
      .on("pointerdown", onToolStart)
      .on("pointermove", onToolMove)
      .on("pointerup", onToolEnd);
    gridToolRight.originalLocation = [gridToolRight.x, gridToolRight.y];
    containers.push(gridToolRight);
  }
}

layoutGridTools(BUILDER_STATES.ORDERER);


function createGridTool() {
  let grid = new PIXI.Container();

  let currBlock = {};
  currBlock.k = -1;

  let vPlus = createCircleButton(CONST.ASSETS.PLUS);
  grid.addChild(vPlus);
  vPlus.y = CONTAINER_BOTTOM + DIM / 4;
  vPlus.x = (3 * CONTAINER_WIDTH) / 4;

  let vMinus = createCircleButton(CONST.ASSETS.MINUS);
  vMinus.y = CONTAINER_BOTTOM + DIM / 4;
  vMinus.x = CONTAINER_WIDTH / 4;
  grid.addChild(vMinus);

  let hPlus = createCircleButton(CONST.ASSETS.PLUS);
  hPlus.x = CONTAINER_RIGHT + DIM / 4;
  hPlus.y = CONTAINER_HEIGHT / 2;
  //grid.addChild(hPlus)

  let hMinus = createCircleButton(CONST.ASSETS.MINUS);
  hMinus.x = CONTAINER_LEFT - DIM / 4;
  hMinus.y = CONTAINER_HEIGHT / 2;
  //grid.addChild(hMinus)

  let frac = createFraction(0, 1);
  frac.x = (CONTAINER_RIGHT - CONTAINER_LEFT) / 2;
  frac.y = CONTAINER_TOP - DIM / 8;
  frac.interactive = true;
  frac.on("pointerdown", () => (grid.validHit = true));
  frac.on("pointerup", () => (grid.validHit = false));
  grid.addChild(frac);

  let cont = createContainer(CONTAINER_WIDTH, CONTAINER_HEIGHT);
  grid.addChild(cont);
  cont.x = CONTAINER_WIDTH / 2;
  cont.y = CONTAINER_HEIGHT / 2;
  cont.interactive = true;
  cont.on("pointerdown", createStack);

  let fractions = [];
  let horizontalLines = [];
  let verticalLines = [];
  let vPartitions = 0;
  let hPartitions = 1;
  let colorIndex = 0;
  let colors = [
    CONST.COLORS.BLUE,
    CONST.COLORS.RED,
    CONST.COLORS.GREEN,
    CONST.COLORS.ORANGE,
    CONST.COLORS.PURPLE
  ];
  let colorLength = colors.length;
  let currentColor = () => {
    return colors[colorIndex % colorLength];
  };
  let currFrac = [0, 1];

  const v_part_dim = () => {
    return CONTAINER_HEIGHT / hPartitions;
  };

  const h_part_dim = () => {
    return CONTAINER_WIDTH / vPartitions;
  };

  /*
  const total_parts = () => {
    hPartitions * vPartitions;
  };
  */

  //initVerticalLines(1)
  initHorizontalLines(1);
  animateVerticalLines(1);
  animateHorizontalLines(1);

  vPlus.on("pointerdown", () => animateHorizontalLines(1));
  vMinus.on("pointerdown", () => animateHorizontalLines(-1));
  hPlus.on("pointerdown", () => animateVerticalLines(1));
  hMinus.on("pointerdown", () => animateVerticalLines(-1));

  //grid.addChild()

  // Helpers

  function hideGrid() {
    let toHide = [...verticalLines, ...horizontalLines];
    toHide.forEach(h => (h.alpha = 0));
  }

  function bringLinesToFront() {
    let lines = [...verticalLines, ...horizontalLines];
    lines.forEach(l => grid.addChild(l));
  }

  // Constructors
  function createCircleButton(asset) {
    let h = DIM / 2;
    let w = DIM / 2;

    let circleSprite = new PIXI.Sprite.from(asset);
    circleSprite.alpha = 0.8;
    circleSprite.anchor.set(0.5);
    circleSprite.height = h 
    circleSprite.width = w
    circleSprite.interactive = true
    return circleSprite;
  }

  function createStack(event) {
    bringLinesToFront();

    let hdim = h_part_dim();
    let vdim = v_part_dim();
    let pos = event.data.getLocalPosition(this.parent);
    let i = Math.floor((pos.x - CONTAINER_LEFT) / hdim);
    let j = Math.floor((pos.y - CONTAINER_TOP) / vdim);
    let k = hPartitions - j;
    console.log("vPartitions", vPartitions);
    console.log("hPartitions", hPartitions);
    console.log("k", k);
    if (false) {
      // do nothing
    } else {
      var block = new PIXI.Graphics();
      block.beginFill(CONST.COLORS.BLUE);
      block.drawRoundedRect(
        0,
        0,
        hdim,
        (CONTAINER_HEIGHT * k) / hPartitions,
        5
      );
      currFrac = [k, hPartitions];
      block.endFill();
      block.x = 1;
      block.y = 1;

      let blockTexture = app.renderer.generateTexture(block);
      let blockSprite = new PIXI.Sprite(blockTexture);
      blockSprite.alpha = 0.5;

      blockSprite.x = CONTAINER_WIDTH;
      blockSprite.y = CONTAINER_HEIGHT;
      blockSprite.anchor.set(1);
      grid.removeChild(currBlock);

      if (k == 1 && currBlock.k == 1) {
        currBlock.k = 0;
        currFrac[0] = 0;
      } else {
        grid.addChild(blockSprite);
        blockSprite.k = k;
        currBlock = blockSprite;
      }
      frac.write(currFrac[0], currFrac[1]);
    }
  }

  function createContainer(width, height) {
    let containerGraphic = new PIXI.Graphics();
    containerGraphic.lineStyle(3, 0x000000);
    containerGraphic.moveTo(0, 0);
    containerGraphic.lineTo(0, height);
    containerGraphic.lineTo(width, height);
    containerGraphic.lineTo(width, 0);
    containerGraphic.lineTo(0, 0);
    containerGraphic.interactive = true;
    containerGraphic.x = 1.5;
    containerGraphic.y = 1.5;

    let containerTexture = app.renderer.generateTexture(containerGraphic);
    let containerSprite = new PIXI.Sprite(containerTexture);
    containerSprite.anchor.set(0.5);
    containerSprite.width = containerGraphic.width + 1.5;
    containerSprite.height = containerGraphic.height + 1.5;
    return containerSprite;
  }

  function initVerticalLines(partition) {
    for (let i = 0; i < 13; i++) {
      let g = new PIXI.Graphics();
      g.lineStyle(3, 0x000000);
      g.lineTo(0, CONTAINER_HEIGHT);
      g.y = CONTAINER_TOP;
      g.x = CONTAINER_LEFT;
      verticalLines.push(g);
      grid.addChild(g);
    }
  }

  function initHorizontalLines(partition) {
    for (let i = 0; i < 13; i++) {
      let g = new PIXI.Graphics();
      g.lineStyle(3, 0x000000);
      g.lineTo(CONTAINER_WIDTH, 0);
      g.y = CONTAINER_TOP;
      g.x = CONTAINER_LEFT;
      horizontalLines.push(g);
      grid.addChild(g);
    }
  }

  function animateVerticalLines(inc) {
    vPartitions += inc;
    if (vPartitions != 0 && vPartitions != 13) {
      colorIndex += 1;

      let spacing = CONTAINER_WIDTH / vPartitions;

      verticalLines.forEach((l, i) => {
        grid.addChild(l);
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
    console.log("ANIMATING horizontalLines");
    hPartitions += inc;
    if (hPartitions != 0 && hPartitions != 13) {
      currFrac[1] = hPartitions;
      if (currFrac[0] > hPartitions) {
        currFrac[0] = hPartitions;
      }

      let dim = h_part_dim();
      createjs.Tween.get(currBlock).to(
        {
          height: (CONTAINER_HEIGHT * currFrac[0]) / currFrac[1]
        },
        500,
        createjs.Ease.getPowInOut(4)
      );

      colorIndex += 1;

      let spacing = CONTAINER_HEIGHT / hPartitions;

      horizontalLines.forEach((l, i) => {
        grid.addChild(l);
        if (i > hPartitions) {
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

    frac.write(currFrac[0], currFrac[1]);
  }

  function onFracStart(event) {
    bringLinesToFront();
    let touchedAtX = event.data.getLocalPosition(this.parent).x;
    let touchedAtY = event.data.getLocalPosition(this.parent).y;
    this.deltaTouch = [this.x - touchedAtX, this.y - touchedAtY];
    grid.addChild(this);
    this.data = event.data;
    this.dragging = true;
  }

  function round(val, origin) {
    let i = Math.round(Math.abs(val - origin) / (CONTAINER_WIDTH / 12));
    return origin + (i * CONTAINER_WIDTH) / 12;
  }

  function onFracEnd() {
    this.data = null;
    this.dragging = false;
    if (this.y + this.height > WINDOW_HEIGHT) {
      let i = fractions.indexOf(this);
      fractions.splice(i, 1);
      app.stage.removeChild(this);
    }

    let x = round(this.x, grid.x);
    let y = round(this.y, grid.y);
  }

  function onFracMove() {
    if (this.dragging) {
      let pointerPosition = this.data.getLocalPosition(this.parent);
      this.y = pointerPosition.y + this.deltaTouch[1];
      this.x = pointerPosition.x + this.deltaTouch[0];
    }
  }

  return grid;
}

function createFraction(n, d) {
  let sf = 0.4;

  let tileContainer = new PIXI.Container();

  let whole = d == 1 ? true : false;

  let h = 2 * DIM;
  let w = DIM;
  h = h * sf;
  w = w * sf;

  var block = new PIXI.Graphics();
  //block.lineStyle(3, 0x000000, 2);
  block.beginFill(0xffffff);
  block.drawRoundedRect(0, 0, 1.2 * w, 1.2 * h, 5);
  block.endFill();
  block.x = 1;
  block.y = 1;

  var blockTexture = app.renderer.generateTexture(block);
  let tile = new PIXI.Sprite(blockTexture);
  tile.anchor.set(0.5);

  // All or only some of these may exist depending on if we're using a "whole" or not.
  let mid;
  let num;
  let den;

  if (true) {
    mid = new PIXI.Graphics();
    mid.lineStyle(4, 0x000000, 2);
    mid.moveTo(-w / 2, 0);
    mid.lineTo(w / 2, 0);
    num = new PIXI.Text(n, {
      fontFamily: "Chalkboard SE",
      fontSize: w,
      fill: 0x000000,
      align: "center"
    });
    num.anchor.set(0.5);
    num.y = -w / 2;
    den = new PIXI.Text(d, {
      fontFamily: "Chalkboard SE",
      fontSize: w,
      fill: 0x000000,
      align: "center"
    });
    den.anchor.set(0.5);
    den.y = w / 2;
  } else {
    num = new PIXI.Text(n, {
      fontFamily: "Chalkboard SE",
      fontSize: 12,
      fill: 0x000000,
      align: "center"
    });
    num.anchor.set(0.5);
    num.y = 0;
  }

  tileContainer.addChild(tile);
  tileContainer.addChild(num);
  tileContainer.border = tile;

  // Line style appears grey unless we add this after the prefious if block - not sure why.
  if (mid) {
    tileContainer.addChild(mid);
    tileContainer.addChild(den);
  }

  tileContainer.active = false;
  tileContainer.interactive = true;

  tileContainer.x = DIM;
  tileContainer.y = 0;
  // Objects
  tileContainer.d = den;
  tileContainer.n = num;
  // Values
  tileContainer._d = d;
  tileContainer._n = n;
  tileContainer.isSet = false;
  tileContainer.pivot.x = 0;
  tileContainer.pivot.y = DIM / 2;
  tileContainer.onLine = false;
  tileContainer.alpha = 0.9;

  tileContainer.write = (n, d) => {
    num.text = n;
    den.text = d;
  };
  return tileContainer;
}

function toggleMode() {}

// Helpers
function pointInRect(p, rect) {
  // This is for a rect with anchor in center

  let top = rect.y - rect.height * rect.anchor;
  let bottom = rect.y + rect.height * rect.anchor;
  let left = rect.x - rect.width * rect.anchor;
  let right = rect.x + rect.width * rect.anchor;

  let c1 = p.x < right;
  let c2 = p.x > left;
  let c3 = p.y < bottom;
  let c4 = p.y > top;

  return c1 && c2 && c3 && c4;
}

function onToolStart(event) {
  app.stage.addChild(this);
  if (this.validHit) {
    let touchedAtX = event.data.getLocalPosition(this.parent).x;
    let touchedAtY = event.data.getLocalPosition(this.parent).y;
    this.deltaTouch = [this.x - touchedAtX, this.y - touchedAtY];
    this.data = event.data;
    this.dragging = true;
  }
}

function round(val, origin) {
  let i = Math.round(Math.abs(val - origin) / (CONTAINER_WIDTH / 12));
  return origin + (i * CONTAINER_WIDTH) / 12;
}

function onToolEnd() {
  console.log("FRAC ENDED");
  this.data = null;
  this.dragging = false;

  for (let c of containers) {
    if (c != this) {
      if (inRect(this, c)) {
        let newThis = c.originalLocation;
        let newC = this.originalLocation;
        this.originalLocation = newThis;
        c.originalLocation = newC;
        console.log("IN RECT!!!!!!!!");
        createjs.Tween.get(c).to(
          {
            x: newC[0]
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
        createjs.Tween.get(this).to(
          {
            x: newThis[0]
          },
          500,
          createjs.Ease.getPowInOut(4)
        );
      }
    }
  }
}

function inRect(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < CONTAINER_WIDTH / 2) {
    return true;
  } else {
    return false;
  }
}

function onToolMove() {
  if (this.dragging) {
    let pointerPosition = this.data.getLocalPosition(this.parent);
    //this.y = pointerPosition.y + this.deltaTouch[1];
    this.x = pointerPosition.x + this.deltaTouch[0];
  }
}


};

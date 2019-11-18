import * as PIXI from "pixi.js";
import blueGradient from "../assets/blue-gradient.png";
import plusButton from "../assets/Plus.png";
import resetButton from "../assets/Reset.png"
import trashButton from "../assets/Trash.png"
import * as CONST from "./const.js";

export const init = (app, setup) => {
  // console.log("Setup",setup)
  const WINDOW_WIDTH = setup.width;
  const WINDOW_HEIGHT = setup.height;
  let dx = setup.width/ 15;


  let backGround = new PIXI.Sprite.from(blueGradient);
  backGround.width = WINDOW_WIDTH;
  backGround.height = WINDOW_HEIGHT;
  backGround.x = 0;
  backGround.y = 0;
  backGround.alpha = 0;
  app.stage.addChild(backGround);
  window.createjs.Tween.get(backGround).to(
    {
      alpha: 1
    },
    500,
    window.createjs.Ease.getPowInOut(4)
  );

  const DIM = WINDOW_WIDTH / 12;
  const WINDOW_CENTER_X = WINDOW_WIDTH / 2;
  const WINDOW_CENTER_Y = WINDOW_HEIGHT / 2;
  const CONTAINER_WIDTH = WINDOW_WIDTH * 0.4;
  const CONTAINER_HEIGHT = CONTAINER_WIDTH;
  const CONTAINER_TOP = 0;
  const CONTAINER_BOTTOM = CONTAINER_HEIGHT;
  const CONTAINER_LEFT = 0;
  const CONTAINER_RIGHT = CONTAINER_WIDTH;
  const TWELFTH_WIDTH = CONTAINER_WIDTH / 12;

  const containers = [];
  let fractions = [];

  let gridToolLeft = createGridTool();
  app.stage.addChild(gridToolLeft);
  gridToolLeft.x = (3 / 4) * WINDOW_WIDTH - CONTAINER_WIDTH / 2;
  gridToolLeft.y = WINDOW_CENTER_Y - CONTAINER_HEIGHT / 2;
  containers.push(gridToolLeft);

  let gridToolRight = createGridTool();
  app.stage.addChild(gridToolRight);
  gridToolRight.x = WINDOW_WIDTH / 4 - CONTAINER_WIDTH / 2;
  gridToolRight.y = WINDOW_CENTER_Y - CONTAINER_HEIGHT / 2;
  containers.push(gridToolRight);

  function createTrashCan() {
    let trashCan = new PIXI.Sprite.from(trashButton);
    trashCan.width = DIM / 2;
    trashCan.height = DIM / 2;
    trashCan.anchor.set(0.5);
    return trashCan;
  }

  //grid.addChild()

  function createReset() {
    let reset = new PIXI.Sprite.from(resetButton);
    reset.width = DIM / 2;
    reset.height = DIM / 2;
    reset.anchor.set(0.5);
    return reset;
  }

  let reset = createReset();
  app.stage.addChild(reset);
  reset.x = WINDOW_WIDTH - reset.width;
  reset.y = reset.height;
  reset.interactive = true;
  reset.on("pointerdown", resetFractions);

  function resetFractions() {
    for (let i = 0; i < fractions.length; i++) {
      app.stage.removeChild(fractions[i]);
    }
    fractions = [];
  }

  let trashCan = createTrashCan();
  app.stage.addChild(trashCan);
  trashCan.x = WINDOW_CENTER_X;
  trashCan.y = WINDOW_CENTER_Y + 3/4*CONTAINER_HEIGHT

  function createGridTool() {
    let grid = new PIXI.Container();

    let vPlus = createCircleButton(CONST.ASSETS.PLUS);
    grid.addChild(vPlus);
    vPlus.y = CONTAINER_TOP - DIM / 4;
    vPlus.x = CONTAINER_WIDTH / 2;

    let vMinus = createCircleButton(CONST.ASSETS.MINUS);
    vMinus.y = CONTAINER_BOTTOM + DIM / 4;
    vMinus.x = CONTAINER_WIDTH / 2;
    grid.addChild(vMinus);

    let hPlus = createCircleButton(CONST.ASSETS.PLUS);
    hPlus.x = CONTAINER_RIGHT + DIM / 4;
    hPlus.y = CONTAINER_HEIGHT / 2;
    grid.addChild(hPlus);

    let hMinus = createCircleButton(CONST.ASSETS.MINUS);
    hMinus.x = CONTAINER_LEFT - DIM / 4;
    hMinus.y = CONTAINER_HEIGHT / 2;
    grid.addChild(hMinus);

    let frac = createFraction(0, 1);
    frac.x = CONTAINER_LEFT;
    frac.y = CONTAINER_TOP - DIM / 4;
    //grid.addChild(frac)

    vPlus.on("pointerdown", () => animateHorizontalLines(1));
    vMinus.on("pointerdown", () => animateHorizontalLines(-1));
    hPlus.on("pointerdown", () => animateVerticalLines(1));
    hMinus.on("pointerdown", () => animateVerticalLines(-1));

    let cont = createContainer(CONTAINER_WIDTH);
    grid.addChild(cont);
    cont.x = CONTAINER_WIDTH / 2;
    cont.y = CONTAINER_HEIGHT / 2;
    cont.interactive = true;
    cont.on("pointerdown", createSquare);

    let horizontalLines = [];
    let verticalLines = [];
    let vPartitions = 1;
    let hPartitions = 1;
    let colorIndex = 0;
    let colors = [
      CONST.COLORS.BLUE,
      CONST.COLORS.RED,
      CONST.COLORS.GREEN,
      CONST.COLORS.ORANGE,
      CONST.COLORS.PURPLE
    ];
    //let colors = [COLORS.DARK_GRAY];
    let colorLength = colors.length;
    let currentColor = () => {
      return colors[colorIndex % colorLength];
    };

    initVerticalLines(1);
    initHorizontalLines(1);
    animateVerticalLines(1);
    animateHorizontalLines(1);

    const v_part_dim = () => {
      return CONTAINER_HEIGHT / hPartitions;
    };

    const h_part_dim = () => {
      return CONTAINER_WIDTH / vPartitions;
    };

    const total_parts = () => {
      return hPartitions * vPartitions;
    };

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
      circleSprite.anchor.set(0.5);
      circleSprite.height = h 
      circleSprite.width = w
      circleSprite.interactive = true
      return circleSprite;
    }
    function createSquare(event) {
      bringLinesToFront();
      let hdim = h_part_dim();
      let vdim = v_part_dim();
      var block = new PIXI.Graphics();
      block.lineStyle(2, 0xffffff);
      block.beginFill(currentColor());
      block.drawRoundedRect(0, 0, hdim, vdim, 5);
      block.endFill();
      block.x = 1;
      block.y = 1;

      let blockTexture = app.renderer.generateTexture(block);
      let blockSprite = new PIXI.Sprite(blockTexture);
      blockSprite.alpha = 0.5;

      let pos = event.data.getLocalPosition(this.parent);

      let i = Math.floor(pos.x / hdim);
      let j = Math.floor(pos.y / vdim);

      app.stage.addChild(blockSprite);
      blockSprite.x = i * hdim + grid.x;
      blockSprite.y = j * vdim + grid.y;
      blockSprite.interactive = true;
      blockSprite.on("pointerdown", onFracStart);
      blockSprite.on("pointerup", onFracEnd);
      blockSprite.on("pointermove", onFracMove);
      fractions.push(blockSprite);
      //app.stage.addChild(blockSprite)
    }

    function createContainer(width) {
      let containerGraphic = new PIXI.Graphics();
      containerGraphic.lineStyle(3, 0x000000);
      containerGraphic.moveTo(0, 0);
      containerGraphic.lineTo(0, width);
      containerGraphic.lineTo(width, width);
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
      for (let i = 0; i < 11; i++) {
        let g = new PIXI.Graphics();
        g.lineStyle(3, 0x000000);
        g.lineTo(0, CONTAINER_WIDTH);
        g.y = CONTAINER_TOP;
        g.x = CONTAINER_LEFT;
        verticalLines.push(g);
        grid.addChild(g);
      }
    }

    function initHorizontalLines(partition) {
      for (let i = 0; i < 11; i++) {
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
      if (vPartitions != 0 && vPartitions != 11) {
        colorIndex += 1;

        let spacing = CONTAINER_WIDTH / vPartitions;

        verticalLines.forEach((l, i) => {
          grid.addChild(l);
          if (i > vPartitions) {
            window.createjs.Tween.get(l).to(
              {
                x: CONTAINER_RIGHT
              },
              500,
              window.createjs.Ease.getPowInOut(4)
            );
          } else {
            window.createjs.Tween.get(l).to(
              {
                x: i * spacing + CONTAINER_LEFT
              },
              500,
              window.createjs.Ease.getPowInOut(4)
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
          grid.addChild(l);
          if (i > hPartitions) {
            window.createjs.Tween.get(l).to(
              {
                y: CONTAINER_BOTTOM
              },
              500,
              window.createjs.Ease.getPowInOut(4)
            );
          } else {
            window.createjs.Tween.get(l).to(
              {
                y: i * spacing + CONTAINER_TOP
              },
              500,
              window.createjs.Ease.getPowInOut(4)
            );
          }
        });
      } else {
        hPartitions -= inc;
      }
    }

    function onFracStart(event) {
      bringLinesToFront();
      let touchedAtX = event.data.getLocalPosition(this.parent).x;
      let touchedAtY = event.data.getLocalPosition(this.parent).y;
      this.deltaTouch = [this.x - touchedAtX, this.y - touchedAtY];
      app.stage.addChild(this);
      this.data = event.data;
      this.dragging = true;
    }

    function round(val, origin) {
      let i = Math.round(Math.abs(val - origin) / (CONTAINER_WIDTH / 12));
      return origin + (i * CONTAINER_WIDTH) / 12;
    }

    function onFracEnd() {
      // console.log("FRAC ENDED");
      this.data = null;
      this.dragging = false;
      if (
        this.y + this.height + DIM / 2 > WINDOW_HEIGHT &&
        Math.abs(WINDOW_CENTER_X - this.x - this.width / 2) < 2 * DIM
      ) {
        // console.log("DELETING");
        let i = fractions.indexOf(this);
        // console.log("index", i);
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
    let sf = 0.3;

    let tileContainer = new PIXI.Container();

    let whole = d == 1 ? true : false;

    let h = 2 * DIM;
    let w = DIM;
    h = h * sf;
    w = w * sf;

    var block = new PIXI.Graphics();
    block.lineStyle(3, 0x000000, 2);
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
};

// Problem que setup
import * as PIXI from "pixi.js";
import blueGradient from "../assets/blue-gradient.png";
import * as CONST from "./const.js";
import plusButton from "../assets/Plus.png";
import minusButton from "../assets/Minus.png";
import QuestionMark from '../assets/QuestionMark.png'


export const init = (app, setup) => {
 

  // Parameters (Only changes on resize)
  let heightToWidthRatio = setup.height/setup.width
  let LANDSCAPE = heightToWidthRatio < 3/4
  let ARENA_WIDTH = LANDSCAPE ? 4/3*setup.height : setup.width
  let ARENA_HEIGHT = LANDSCAPE ? setup.height : 3/4*setup.width


  let dx = setup.width/20;

  let backGround = new PIXI.Sprite.from(blueGradient);
  backGround.width = setup.width;
  backGround.height = setup.height;
  backGround.interactive = true;
  backGround.static = false;
  if (true) {
    app.stage.addChild(backGround);
  }
  window.createjs.Tween.get(backGround).to(
    {
      alpha: 1
    },
    500,
    window.createjs.Ease.getPowInOut(4)
  );

  // CONSTANTS

  const dim = setup.width / 12;
  const centerLine = setup.height / 2;
  const lineWidth = 10 * dim;
  const topMargin = (3 / 4) * dim;

  const pinkCircle = new PIXI.Graphics();
  pinkCircle.lineStyle(2, 0x000000, 2);
  pinkCircle.beginFill(CONST.COLORS.GRAY);
  pinkCircle.drawCircle(dim / 5 + 1, dim / 5 + 1, dim / 5);
  pinkCircle.endFill();

  const blueCircle = new PIXI.Graphics();
  blueCircle.lineStyle(2, 0x000000, 2);
  blueCircle.beginFill(CONST.COLORS.BLUE);
  blueCircle.drawCircle(dim / 5 + 1, dim / 5 + 1, dim / 5);
  blueCircle.endFill();

  // CONSTANTS
  const DIM = setup.width / 12;
  const NUMBERLINE_CENTER_Y = 3 * DIM;
  const LINE_WIDTH = 10 * DIM;
  const LEFT_X = (3 / 4) * setup.width;
  const RIGHT_X = (1 / 4) * setup.width;
  const WINDOW_CENTER_X = setup.width / 2;
  const WINDOW_CENTER_Y = setup.width / 2;
  const CONTAINER_WIDTH = LINE_WIDTH;
  const CONTAINER_HEIGHT = CONTAINER_WIDTH / 12;
  const CONTAINER_TOP = 0;
  const CONTAINER_BOTTOM = CONTAINER_HEIGHT;
  const CONTAINER_LEFT = 0;
  const CONTAINER_RIGHT = CONTAINER_WIDTH;
  const TWELFTH_WIDTH = CONTAINER_WIDTH / 12;

  // NUMBERLINE STATE
  let ticksPerWhole = 1;
  let maxValue = 10;
  let ticksOnLine = [];
  let labelsOnLine = [];
  let pauseClick = false;

  let expectedPins = 0;

  // STATE VARIABLES
  let blocksOnLine = [];

  // Temp storage for feedback logic
  let pinsCurrentlySet = [];
  let feedBlocks;

  let pinsOffLineCount = 0;

  let presetPins = [];
  let presetLabels = [];
  let pinsInPlay = [];
  let problemIndex = 0;
  let feedBackLabels = [];

  let blocksInWidget = [];

  let firstTry = true;
  let pinWidget = {};

  let activeEntity = new PIXI.Sprite();


  let lineMax; // Max value of the line
  let wholeWidth; // physical width of "one whole" on the number line
  let minStep; // Minmum block width for measuring or placing pins/labels
  let originalMinStep;
  let currentProblem;
  let dT;

  // So i don't lose a reference to this shit when I'm resetting the game
  let globalPinRef = [];
  let globalLabelRef = [];

  let activityQue;

  let gridTool = createGridTool();
  app.stage.addChild(gridTool);
  gridTool.x = DIM;
  gridTool.y = NUMBERLINE_CENTER_Y - CONTAINER_HEIGHT;

  function drawLabels(n) {
    for (let i = 0; i < n; i++) {
      let lbl = createPureLbl([i, 1]);
      labelsOnLine.push(lbl);
      app.stage.addChild(lbl);
      flipLbl(lbl);
      lbl.x = DIM + (LINE_WIDTH / (n - 1)) * i;
      lbl.y = NUMBERLINE_CENTER_Y;
    }
  }

  drawLabels(11);

  function initTicks(numberOfTicks) {
    let ticks = [];
    let tickSpace = lineWidth / (numberOfTicks - 1);
    for (let i = 0; i < numberOfTicks; i++) {
      let t = createTick(i, 0);
      ticks.push(t);
      app.stage.addChild(t);
    }
    ticksOnLine = ticks;
  }

  //initTicks(31)

  function animateTicks(n) {
    let dx = LINE_WIDTH / n;
    for (let i = 0; i < ticksOnLine.length; i++) {
      if (i <= n) {
        ticksOnLine[i].alpha = 1;
        window.createjs.Tween.get(ticksOnLine[i]).to(
          {
            x: DIM + i * dx
          },
          1000,
          window.createjs.Ease.getPowInOut(4)
        );
      } else if (i > n) {
        window.createjs.Tween.get(ticksOnLine[i]).to(
          {
            alpha: 0,
            x: DIM + LINE_WIDTH
          },
          1000,
          window.createjs.Ease.getPowInOut(4)
        );
      }
    }
  }

  animateTicks(10);

  function animateLabels(max) {
    pauseClick = true;
    let lblsToAdd = [];
    let n = Math.max(max, labelsOnLine.length);
    // console.log("n", n);
    for (let i = 0; i <= n; i++) {
      // console.log("i", i);
      if (i < labelsOnLine.length) {
        window.createjs.Tween.get(labelsOnLine[i])
          .to(
            {
              x: DIM + (i * LINE_WIDTH) / max
            },
            300,
            window.createjs.Ease.getPowInOut(4)
          )
          .call(() => {
            pauseClick = false;
          });
      }

      if (i >= labelsOnLine.length && i <= max) {
        // console.log("APPENDING LABEL");
        let lbl = createPureLbl([i, 1]);
        lblsToAdd.push(lbl);
        app.stage.addChild(lbl);
        lbl.x = LINE_WIDTH + DIM;
        flipLbl(lbl);
        lbl.y = NUMBERLINE_CENTER_Y;
        window.createjs.Tween.get(lbl)
          .to(
            {
              x: DIM + (i * LINE_WIDTH) / max
            },
            300,
            window.createjs.Ease.getPowInOut(4)
          )
          .call(() => {
            labelsOnLine.push(...lblsToAdd);
          });
      }

      if (i > max && i < labelsOnLine.length) {
        window.createjs.Tween.get(labelsOnLine[i])
          .to(
            {
              alpha: 0
            },
            300,
            window.createjs.Ease.getPowInOut(4)
          )
          .call(() => {
            app.stage.removeChild(labelsOnLine[i]);
            removeElement(labelsOnLine[i], labelsOnLine);
          });
      }
    }

    // console.log("labelsOnLine.length", labelsOnLine.length);
  }

  let lblsPlusButton = createActionButton("+", () => {
    if (!pauseClick) {
      animateLabels(labelsOnLine.length);
    }
  });
  app.stage.addChild(lblsPlusButton);
  lblsPlusButton.x = DIM + LINE_WIDTH;
  lblsPlusButton.y = NUMBERLINE_CENTER_Y + DIM;

  let lblsMinusButton = createActionButton("-", () => {
    if (!pauseClick) {
      animateLabels(labelsOnLine.length - 2);
    }
  });
  app.stage.addChild(lblsMinusButton);
  lblsMinusButton.x = DIM;
  lblsMinusButton.y = NUMBERLINE_CENTER_Y + DIM;

  function areAllPinsSet(pins) {
    let set = true;
    for (let p of pinsInPlay) {
      if (p.onLine == false) {
        set = false;
      }
    }
    return set;
  }

  function removeElement(e, arr) {
    if (arr.length != 0) {
      let i = arr.indexOf(e);
      arr.splice(i, 1);
    }
  }

  function createFeedBackLbl(labels) {
    return labels.map(l => {
      let t = new PIXI.Text(l._n + "/" + l._d, {
        fontFamily: "Chalkboard SE",
        fontSize: dx / 2,
        fill: 0x000000,
        align: "center"
      });
      t.anchor.set(0.5);
      app.stage.addChild(t);
      t.x = dim + ((l.expectedLocation - dim) * minStep) / originalMinStep;
      l.expectedLocation = t.x;
      t.y = 3.2 * dim;
      return t;
    });
  }

  function createPinFromWidget() {
    pinsOffLineCount += 1;
    let p = createPin();
    p.on("pointerdown", onPinDragStart)
      .on("pointermove", onPinDragMove)
      .on("pointerup", onPinDragEnd);
    p.x = 11 * dim;
    p.y = 4 * dim;
    window.createjs.Tween.get(p).to(
      {
        x: 11 * dim - 1.1 * p.width * pinsOffLineCount,
        y: 4 * dim
      },
      500,
      window.createjs.Ease.getPowInOut(4)
    );
    p.onLine = false;
    p.isSet = false;
    p.mutable = true;
    pinsInPlay.push(p);
    globalPinRef.push(p);
    app.stage.addChild(p);
    app.stage.addChild(pinWidget);
  }

  function createTick(nodeIndex, width) {
    let tick = new PIXI.Graphics();
    tick.lineStyle(3, 0x000000, 1);
    tick.moveTo(0, 0);
    tick.lineTo(0, dim / 4);
    tick.x = dim + width * nodeIndex;
    tick.y = 2.875 * dim;
    return tick;
  }

  function createActionButton(text, action) {
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(0, 0xb7b7b7, 1);
    graphics.beginFill(CONST.COLORS.CORAL);
    graphics.drawRoundedRect(0, 0, 0.5 * dim, 0.5 * dim, 5);
    graphics.endFill();

    var texture = app.renderer.generateTexture(graphics);
    let tile = new PIXI.Sprite(texture);
    tile.anchor.set(0.5);

    let den = new PIXI.Text(text, {
      fontFamily: "Chalkboard SE",
      fontSize: dim / 4,
      fill: 0xffffff,
      align: "center"
    });
    den.anchor.set(0.5);

    let tileContainer = new PIXI.Container();

    tileContainer.addChild(tile);
    tileContainer.addChild(den);

    tileContainer.active = false;
    tileContainer.interactive = true;
    tileContainer.buttonMode = true;

    tileContainer.on("pointerdown", action);

    // move the sprite to its designated position
    tileContainer.x = 10 * dim;
    tileContainer.y = topMargin + tileContainer.height / 2;
    tileContainer.checkAnswer = true;
    tileContainer.text = den;

    tileContainer.tile = tile;
    return tileContainer;
  }

  function freezeView() {
    for (let c of [
      ...pinsInPlay,
      ...blocksOnLine,
      ...labelsOnLine,
      pinWidget,
      ...blocksInWidget
    ]) {
      c.interactive = false;
    }
    goButton.interactive = false;
  }

  function unfreezeView() {
    for (let c of [
      ...pinsInPlay,
      ...blocksOnLine,
      ...labelsOnLine,
      pinWidget,
      ...blocksInWidget,
      goButton
    ]) {
      if (c.isSet == false) {
        c.interactive = true;
      }
    }
    goButton.interactive = true;
  }

  function refreshGame() {
    for (let e of [...pinsInPlay, ...labelsOnLine]) {
      e.onLine = false;
    }
    firstTry = false;
  }

  function getMaxLabelX(lbls) {
    let maxLabel;
    let val = 0;
    for (let i = 0; i < lbls.length; i++) {
      let curr = lbls[i];
      let currVal = curr._n / curr._d;
      if (currVal > val) {
        val = currVal;
        maxLabel = curr;
      }
    }
    return maxLabel.x;
  }

  let goButton;
  //xfgoButton.static = false;

  //app.stage.addChild(goButton)

  let t = createTick(20);
  app.stage.addChild(t);

  //app.renderer.interactive = true
  backGround.on("pointerup", globalPointerUp);

  function globalPointerUp() {
    activeEntity.dragging = false;
    activeEntity.alpha = 1;
    // console.log("PointerUP!!!!!")

    // WHAT THE FUCK IS THIS DOING!!!
    if (
      activeEntity.x + activeEntity.width / 2 < dim &&
      activeEntity.mutable == true
    ) {
      if (activeEntity.isFeedBlock) {
        let i = blocksOnLine.indexOf(activeEntity);
        blocksOnLine.splice(i, 1);
      }
      if (activeEntity.isPin) {
        let i = pinsInPlay.indexOf(activeEntity);
        pinsInPlay.splice(i, 1);
      }
      app.stage.removeChild(activeEntity);
    }
  }

  function getNearestObject(pins, location) {
    let closestPin = null;

    if (pins.length != 0) {
      closestPin = pins[0];

      let deltaClosestPin = Math.abs(closestPin.x - location[0]);

      for (let i = 1; i < pins.length; i++) {
        let currentPin = pins[i];
        let deltaCurrentPin = Math.abs(currentPin.x - location[0]);

        if (deltaCurrentPin < deltaClosestPin) {
          deltaClosestPin = deltaCurrentPin;
          closestPin = currentPin;
        }
      }
    }

    return closestPin;
  }

  function itemsLessThan(x, items) {
    let itemsLess = [];
    if (items.length != 0) {
      for (let l of items) {
        // console.log("in loop");
        if (l.x < x && l.onLine == true) {
          // console.log("pushing");
          itemsLess.push(l);
        }
      }
    }
    return itemsLess;
  }

  function animateFeedBack(blocks, start, pins, labels, i) {
    // Loop end criteria is based on the feedBlocks
    if (blocks.length == 0) {
      // Check answer criteria is going to change.
      // Make sure all necessary pins are set:
      let allPinsSet = true;
      for (let b of pinsCurrentlySet) {
        if (!b) {
          allPinsSet = false;
        }
      }

      if (currentProblem.pinWidget) {
        allPinsSet = true;
      }

      // No leftover pins, no leftover labels, all required pins are set
      if (
        (pins.length == 0 ||
          currentProblem.dontScorePins ||
          currentProblem.pinWidget) &&
        labels.length == 0 &&
        allPinsSet
      ) {
       
        goButton.interactive = true;
        goButton.text.text = "Next Problem";
        //dropGameOverModal(loadNextGame)
        return;
      } else {
        for (let p of pins) {
          if (!currentProblem.pinWidget) {
            window.createjs.Tween.get(p).to(
              {
                x: p.originalLocation[0],
                y: p.originalLocation[1]
              },
              500,
              window.createjs.Ease.getPowInOut(4)
            );
          }
        }

        labelsOnLine = labels;
        pinsInPlay = pins;
        goButton.text.text = "Try Again";
        goButton.interactive = true;
        refreshGame();
        return;
      }
    } else {
      let b = blocks.pop();
      let newStart = [start[0] + b.width, start[1]];
      //
      let animateTo = i == 0 ? [b.x, b.y] : [(i - 1) * minStep + dim, start[1]];
      window.createjs.Tween.get(b)
        .to(
          {
            x: animateTo[0],
            y: animateTo[1]
          },
          500,
          window.createjs.Ease.getPowInOut(4)
        )
        .call(() => {
          // HELLO! The nearest pin needs to also be on the line - maybe have boolean "on the line" property

          let nearestPin = getNearestObject(pins, start);

          // Label Logic
          let setLabel = false;
          let nearestLabel = null;

          for (let l of labels) {
            let expectedLocation =
              (l._n / l._d) * minStep * currentProblem.partitionsPerWhole + dim;
            if (
              Math.abs(start[0] - expectedLocation) < dT * minStep &&
              Math.abs(l.x - expectedLocation) < dT * minStep
            ) {
              setLabel = true;
              nearestLabel = l;
              l.isSet = true;
              l.interactive = false;
              removeElement(l, labels);
            }
          }

          let leftoverLabels = itemsLessThan(start[0], labels);
          let setPin =
            nearestPin &&
            Math.abs(nearestPin.x - start[0]) < dT * minStep &&
            pinsCurrentlySet[i] == false
              ? true
              : false;

          if (setPin) {
            pinsCurrentlySet[i] = true;
            nearestPin.circleSprite.texture = app.renderer.generateTexture(
              blueCircle
            );
            nearestPin.draggable = false;
            removeElement(nearestPin, pins);
          }

          if (setPin && setLabel) {
            // console.log("HOLY SHIT SETTING LABEL AND PIN WTF WTF WTF");

            window.createjs.Tween.get(nearestPin)
              .to(
                {
                  x: animateTo[0] + minStep,
                  y: 2.5 * dim
                },
                500,
                window.createjs.Ease.getPowInOut(4)
              )
              .call(() => {
                window.createjs.Tween.get(nearestLabel)
                  .to(
                    {
                      x: animateTo[0] + minStep,
                      y: 3 * dim
                    },
                    500,
                    window.createjs.Ease.getPowInOut(4)
                  )
                  .call(() => {
                    i += 1;
                    nearestPin.isSet = true;

                    if (leftoverLabels.length != 0) {
                      eatLeftovers(leftoverLabels, () => {
                        animateFeedBack(blocks, newStart, pins, labels, i);
                      });
                    } else {
                      animateFeedBack(blocks, newStart, pins, labels, i);
                    }
                  });
              });
          } else if (setPin) {
            window.createjs.Tween.get(nearestPin)
              .to(
                {
                  x: animateTo[0] + minStep,
                  y: 2.5 * dim
                },
                500,
                window.createjs.Ease.getPowInOut(4)
              )
              .call(() => {
                // console.log("JUST SETTING PIN");
                nearestPin.isSet = true;
                i += 1;
                if (leftoverLabels.length != 0) {
                  eatLeftovers(leftoverLabels, () => {
                    animateFeedBack(blocks, newStart, pins, labels, i);
                  });
                } else {
                  animateFeedBack(blocks, newStart, pins, labels, i);
                }
              });
          } else if (setLabel) {
            window.createjs.Tween.get(nearestLabel)
              .to(
                {
                  x: animateTo[0] + minStep,
                  y: 3 * dim
                },
                500,
                window.createjs.Ease.getPowInOut(4)
              )
              .call(() => {
                i += 1;
                if (leftoverLabels.length != 0) {
                  eatLeftovers(leftoverLabels, () => {
                    animateFeedBack(blocks, newStart, pins, labels, i);
                  });
                } else {
                  animateFeedBack(blocks, newStart, pins, labels, i);
                }
              });
          } else {
            i += 1;
            if (leftoverLabels.length != 0) {
              eatLeftovers(leftoverLabels, () => {
                animateFeedBack(blocks, newStart, pins, labels, i);
              });
            } else {
              animateFeedBack(blocks, newStart, pins, labels, i);
            }
          }
        });
    }
  }

  function eatLeftovers(leftovers, dessert) {
    if (leftovers.length == 0) {
      dessert();
      return;
    } else {
      let curr = leftovers.pop();
      let customFeedBlockWidth = curr.expectedLocation - dim;

      let customFeedBlock = createFeedBlock(
        customFeedBlockWidth,
        curr._n,
        curr._d,
        true,
        true
      );

      customFeedBlock.x = dim;
      customFeedBlock.y = 2.7 * dim;
      customFeedBlock.alpha = 0;

      app.stage.addChild(customFeedBlock);

      window.createjs.Tween.get(curr)
        .to(
          {
            x: curr.originalLocation[0],
            y: curr.originalLocation[1]
          },
          1000,
          window.createjs.Ease.getPowInOut(4)
        )
        .call(() => {
          curr.onLine = false;
          app.stage.removeChild(customFeedBlock);
          eatLeftovers(leftovers, dessert);
        });
    }
  }

  function createBlockWidget(blocks, wholeWidth) {
    for (let i = 0; i < blocks.length; i++) {
      let block = new PIXI.Graphics();
      block.beginFill(CONST.COLORS.BLUE);
      block.drawRoundedRect(
        dim,
        topMargin + (i * 3 * dim) / 8,
        (wholeWidth / blocks[i].den) * blocks[i].num,
        dim / 4,
        5
      );
      block.endFill();
      block.num = blocks[i].num;
      block.den = blocks[i].den;
      block.interactive = true;
      block.isSet = false;
      block.on("pointerdown", onBlockWidgetSelected);
      blocksInWidget.push(block);
      app.stage.addChild(block);
    }
  }

  // Do I need to pass this the Numberline max so I can calculate the block
  // width based on the fraction is supposed to represent.

  function createMeasureBlock(width, num, den, label) {
    let blockContainer = new PIXI.Container();
    var block = new PIXI.Graphics();
    block.beginFill(CONST.COLORS.BLUE);
    block.drawRoundedRect(0, 0, width, dim / 4, 5);
    block.endFill();
    let blockTexture = app.renderer.generateTexture(block);
    let blockSprite = new PIXI.Sprite(blockTexture);
    blockSprite.alpha = 0.7;
    blockContainer.addChild(blockSprite);
    blockContainer.hitSpot = blockSprite;

    let text = new PIXI.Text(num + "/" + den, {
      fontFamily: "Chalkboard SE",
      fontSize: 12,
      fill: 0x000000,
      align: "center"
    });
    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = dim / 8;
    text.style.fill = 0xffffff;

    if (label) {
      blockContainer.addChild(text);
    }

    blockContainer.text = text;
    blockContainer.mutable = true;
    blockContainer.interactive = true;
    blockContainer
      .on("pointerdown", onBlockDragStart)
      .on("pointermove", onBlockDragMove)
      .on("pointerup", onBlockDragEnd);

    blocksOnLine.push(blockContainer);

    return blockContainer;
  }

  function createFeedBlock(width, num, den, label, custom) {
    let blockContainer = new PIXI.Container();
    var block = new PIXI.Graphics();
    let blockFill = custom ? 0xffffff : CONST.COLORS.BLUE;
    block.beginFill(blockFill);
    let lineWidth = custom ? 1 : 0;
    block.lineStyle(lineWidth, 0x000000, 1);
    block.drawRoundedRect(0, 0, width + 0.5, dim / 4, 5);
    block.endFill();
    let blockTexture = app.renderer.generateTexture(block);
    let blockSprite = new PIXI.Sprite(blockTexture);
    let alpha = custom ? 1 : 0.7;
    blockSprite.alpha = alpha;
    blockContainer.addChild(blockSprite);
    blockContainer.hitSpot = blockSprite;

    let textFill = custom ? 0x000000 : 0xffffff;
    let text = new PIXI.Text(num + "/" + den, {
      fontFamily: "Chalkboard SE",
      fontSize: 12,
      fill: textFill,
      align: "center"
    });
    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = dim / 8;

    if (label) {
      blockContainer.addChild(text);
    }

    blockContainer.text = text;
    blockContainer.static = false;
    blockContainer.isFeedBlock = true;

    return blockContainer;
  }

  function createStaticPin() {
    let h = (1 / 2) * dim;
    let w = dim / 4;

    var circleTexture = app.renderer.generateTexture(blueCircle);
    let circleSprite = new PIXI.Sprite(circleTexture);
    circleSprite.alpha = 0.5;
    circleSprite.anchor.set(0.5);

    var stem = new PIXI.Graphics();
    stem.lineStyle(2, 0x000000, 10);
    stem.moveTo(0, dim / 5);
    stem.lineTo(0, dim / 2);

    let pinContainer = new PIXI.Container();
    pinContainer.addChild(circleSprite);
    pinContainer.addChild(stem);

    pinContainer.active = false;
    pinContainer.interactive = false;
    pinContainer.mutable = false;

    pinContainer.x = 0;
    pinContainer.y = 0;
    pinContainer.draggable = true;
    pinContainer.onLine = true;
    pinContainer.isPin = true;
    pinContainer.static = true;
    pinContainer.circleSprite = circleSprite;

    return pinContainer;
  }

  function createPin() {
    let h = (1 / 2) * dim;
    let w = dim / 4;

    var circle = new PIXI.Graphics();
    circle.lineStyle(2, 0x000000);
    circle.beginFill(0xffffff);
    // why dim/5? - cause that's what I decided.
    circle.drawCircle(dim / 5, dim / 5, dim / 5);
    circle.endFill();
    circle.x = 0.5;
    circle.y = 0.5;

    let circleTexture = app.renderer.generateTexture(circle);
    let circleSprite = new PIXI.Sprite(circleTexture);
    circleSprite.alpha = 0.5;
    circleSprite.anchor.set(0.5);
    //circleSprite.texture = pinkCircleTexture

    var stem = new PIXI.Graphics();
    stem.lineStyle(2, 0x000000, 10);
    stem.moveTo(0, dim / 5);
    stem.lineTo(0, dim / 2);

    let pinContainer = new PIXI.Container();
    pinContainer.addChild(circleSprite);
    pinContainer.addChild(stem);

    pinContainer.active = false;
    pinContainer.interactive = true;

    pinContainer.x = 0;
    pinContainer.y = 0;
    pinContainer.draggable = true;
    pinContainer.onLine = false;
    pinContainer.isPin = true;
    pinContainer.mutable = true;
    pinContainer.circleSprite = circleSprite;

    return pinContainer;
  }

  function createPureLbl(frac) {
    let tileContainer = new PIXI.Container();

    let n = frac[0];
    let d = frac[1];
    let whole = d == 1 ? true : false;

    let h = d == 1 ? dim / 4 : (1 / 2) * dim;
    let w = dim / 4;
    let textSize = 0.7 * w;

    var block = new PIXI.Graphics();
    block.drawRoundedRect(0, 0, w, h, 3);
    block.x = 1;
    block.y = 1;

    var blockTexture = app.renderer.generateTexture(block);
    let tile = new PIXI.Sprite(blockTexture);
    tile.anchor.set(0.5);

    // All or only some of these may exist depending on if we're using a "whole" or not.
    let mid;
    let num;
    let den;
    let l;

    if (!whole) {
      l = new PIXI.Graphics();
      l.lineStyle(2, 0x000000, 2);
      l.moveTo(0, dim / 4);
      l.lineTo(0, dim / 2);
      mid = new PIXI.Graphics();
      mid.lineStyle(2, 0x000000, 2);
      mid.moveTo(-dim / 10, 0);
      mid.lineTo(dim / 10, 0);
      num = new PIXI.Text(n, {
        fontFamily: "Chalkboard SE",
        fontSize: textSize,
        fill: 0x000000,
        align: "center"
      });
      num.anchor.set(0.5);
      num.y = -h / 5;
      den = new PIXI.Text(d, {
        fontFamily: "Chalkboard SE",
        fontSize: textSize,
        fill: 0x000000,
        align: "center"
      });
      den.anchor.set(0.5);
      den.y = h / 5;
    } else {
      l = new PIXI.Graphics();
      l.lineStyle(3, 0x000000);
      l.moveTo(0, dim / 4);
      l.lineTo(0, dim / 2);
      num = new PIXI.Text(n, {
        fontFamily: "Chalkboard SE",
        fontSize: textSize,
        fill: 0x000000,
        align: "center"
      });
      num.anchor.set(0.5);
      num.y = dim / 8;
    }

    tileContainer.addChild(tile);
    tileContainer.addChild(num);
    tileContainer.addChild(l);
    tileContainer.hitSpot = tile;

    // Line style appears grey unless we add this after the prefious if block - not sure why.
    if (mid) {
      tileContainer.addChild(mid);
      tileContainer.addChild(den);
    }

    tileContainer.active = false;
    tileContainer.interactive = true;

    tileContainer.x = dim;
    tileContainer.y = 0;
    tileContainer.d = den;
    tileContainer.n = num;
    tileContainer._d = d;
    tileContainer._n = n;
    tileContainer.isSet = false;
    tileContainer.pivot.x = 0;
    tileContainer.pivot.y = dim / 2;
    tileContainer.onLine = false;

    return tileContainer;
  }

  function createFractionLbl(frac) {
    let tileContainer = new PIXI.Container();

    let n = frac[0];
    let d = frac[1];
    let whole = d == 1 ? true : false;

    let h = d == 1 ? dim / 4 : (1 / 2) * dim;
    let w = dim / 4;
    let textSize = 0.7 * w;

    var block = new PIXI.Graphics();
    block.lineStyle(2, 0x000000);
    block.beginFill(0xffffff);
    block.drawRoundedRect(0, 0, w, h, 3);
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
    let l;

    if (!whole) {
      l = new PIXI.Graphics();
      l.lineStyle(2, 0x000000, 2);
      l.moveTo(0, dim / 4);
      l.lineTo(0, dim / 2);
      mid = new PIXI.Graphics();
      mid.lineStyle(2, 0x000000, 2);
      mid.moveTo(-dim / 10, 0);
      mid.lineTo(dim / 10, 0);
      num = new PIXI.Text(n, {
        fontFamily: "Chalkboard SE",
        fontSize: textSize,
        fill: 0x000000,
        align: "center"
      });
      num.anchor.set(0.5);
      num.y = -h / 5;
      den = new PIXI.Text(d, {
        fontFamily: "Chalkboard SE",
        fontSize: textSize,
        fill: 0x000000,
        align: "center"
      });
      den.anchor.set(0.5);
      den.y = h / 5;
    } else {
      l = new PIXI.Graphics();
      l.lineStyle(2, 0x000000, 2);
      l.moveTo(0, dim / 8);
      l.lineTo(0, dim / 2);
      num = new PIXI.Text(n, {
        fontFamily: "Chalkboard SE",
        fontSize: textSize,
        fill: 0x000000,
        align: "center"
      });
      num.anchor.set(0.5);
      num.y = 0;
    }

    tileContainer.addChild(tile);
    tileContainer.addChild(num);
    tileContainer.addChild(l);
    tileContainer.hitSpot = tile;

    // Line style appears grey unless we add this after the prefious if block - not sure why.
    if (mid) {
      tileContainer.addChild(mid);
      tileContainer.addChild(den);
    }

    tileContainer.active = false;
    tileContainer.interactive = true;

    tileContainer.x = dim;
    tileContainer.y = 0;
    tileContainer.d = den;
    tileContainer.n = num;
    tileContainer._d = d;
    tileContainer._n = n;
    tileContainer.isSet = false;
    tileContainer.pivot.x = 0;
    tileContainer.pivot.y = dim / 2;
    tileContainer.onLine = false;

    return tileContainer;
  }

  let line = createNumberLine();
  app.stage.addChild(line);

  function createNumberLine(den) {
    let line = new PIXI.Graphics();
    line.lineStyle(4, 0x000000, 1);
    line.moveTo(dim, 3 * dim);
    line.lineTo(dim + 10 * dim, 3 * dim);
    return line;
  }

  function onBlockWidgetSelected() {
    let b = createMeasureBlock(this.width, this.num, this.den);
    app.stage.addChild(b);
    b.x = dim;
    b.y = 3 * dim - b.height;
  }

  // Label Actions

  // Block Actions

  // Label Actions

  function onBlockDragStart(event) {
    let touchedAtX = event.data.global.x;
    let touchedAtY = event.data.global.y;
    this.deltaTouch = [this.x - touchedAtX, this.y - touchedAtY];
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
    activeEntity = this;
    this.parent.addChild(this);
  }

  function onBlockDragEnd() {
    this.alpha = 1;
    if (this.x + this.width / 2 < dim) {
      let i = blocksOnLine.indexOf(this);
      blocksOnLine.splice(i, 1);
      app.stage.removeChild(this);
    }

    this.dragging = false;
    // set the interaction data to null
    this.data = null;
  }

  function onBlockDragMove() {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x + this.deltaTouch[0];
    }
  }

  // Pin Actions

  function onPinDragStart(event) {
    // Store a reference to the data
    if (this.draggable) {
      this.data = event.data;
      this.alpha = 0.5;
      this.dragging = true;
      activeEntity = this;
      this.onLine = true;
      this.parent.addChild(this);
    }
    if (areAllPinsSet(pinsInPlay)) {
      pinsOffLineCount = 0;
    }
  }

  function onPinDragEnd() {
    this.alpha = 1;

    if (this.x + this.width / 2 < dim && this.mutable == true) {
      let i = pinsInPlay.indexOf(this);
      pinsInPlay.splice(i, 1);
      app.stage.removeChild(this);
    }

    this.dragging = false;
    // set the interaction data to null
    this.data = null;
    this.onLine = true;
  }

  function onPinDragMove() {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      if (false) {
        this.dragging = false;
        this.alpha = 1;
      }
      this.position.x = newPosition.x;
      this.position.y = 2.5 * dim;
    }
  }

  function flipLbl(lbl) {
    if (lbl.d) {
      lbl.scale.y = lbl.scale.y * -1;
      lbl.d.scale.y = lbl.d.scale.y * -1;
      lbl.n.scale.y = lbl.n.scale.y * -1;
      let numY = lbl.n.y;
      lbl.n.y = lbl.d.y;
      lbl.d.y = numY;
    } else {
      lbl.scale.y = lbl.scale.y * -1;
      lbl.n.scale.y = lbl.n.scale.y * -1;
    }
  }

  function createGridTool() {
    let grid = new PIXI.Container();

    let currBlock = { k: 0 };
    currBlock.k = -1;

    //let vPlus = createCircleButton("+");
    let vPlus = new PIXI.Sprite.from(plusButton);
    vPlus.interactive = true;
    vPlus.anchor.set(0.5);
    vPlus.height = DIM / 2;
    vPlus.width = DIM / 2;
    vPlus.y = CONTAINER_TOP - DIM / 4;
    vPlus.x = (3 * CONTAINER_WIDTH) / 4;
    grid.addChild(vPlus);

    let vMinus = new PIXI.Sprite.from(minusButton);
    vMinus.interactive = true;
    vMinus.anchor.set(0.5);
    vMinus.height = DIM / 2;
    vMinus.width = DIM / 2;
    vMinus.y = CONTAINER_TOP - DIM / 4;
    vMinus.x = CONTAINER_WIDTH / 4;
    grid.addChild(vMinus);

    let hPlus = createCircleButton("+");
    hPlus.x = CONTAINER_RIGHT + DIM / 4;
    hPlus.y = CONTAINER_HEIGHT / 2;
    //grid.addChild(hPlus)

    let hMinus = createCircleButton("-");
    hMinus.x = CONTAINER_LEFT - DIM / 4;
    hMinus.y = CONTAINER_HEIGHT / 2;
    //grid.addChild(hMinus)

    let frac = createFraction(0, 1);
    frac.x = (CONTAINER_RIGHT - CONTAINER_LEFT) / 2;
    frac.y = CONTAINER_TOP - DIM / 8;
    //  grid.addChild(frac);

    let cont = createContainer(CONTAINER_WIDTH, CONTAINER_HEIGHT);
    grid.addChild(cont);
    cont.x = CONTAINER_WIDTH / 2;
    cont.y = CONTAINER_HEIGHT / 2;
    cont.interactive = true;
    cont.on("pointerdown", createStack);

    let fractions = [];
    let horizontalLines = [];
    let verticalLines = [];
    let vPartitions = 3;
    let hPartitions = 0;
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

    const total_parts = () => {
      return hPartitions * vPartitions;
    };

    initVerticalLines(1);
    //initHorizontalLines(1)
    animateVerticalLines(1);

    vPlus.on("pointerdown", () => animateVerticalLines(1));
    vMinus.on("pointerdown", () => animateVerticalLines(-1));
    //hPlus.on("pointerdown", () => animateVerticalLines(1));
    //hMinus.on("pointerdown", () => animateVerticalLines(-1));

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
    function createCircleButton(text) {
      let h = DIM / 4;
      let w = DIM / 4;

      var circle = new PIXI.Graphics();
      circle.lineStyle(2, 0xb7b7b7);
      circle.beginFill(0xffffff);
      circle.drawCircle(DIM / 5, DIM / 5, DIM / 5);
      circle.endFill();
      circle.x = 1;
      circle.y = 1;

      let circleTexture = app.renderer.generateTexture(circle);
      let circleSprite = new PIXI.Sprite(circleTexture);
      circleSprite.alpha = 0.8;
      circleSprite.anchor.set(0.5);

      let pinContainer = new PIXI.Container();
      pinContainer.addChild(circleSprite);

      let operator = new PIXI.Text(text, {
        fontFamily: "Chalkboard SE",
        fontSize: dx / 2,
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

    function createStack(event) {
      bringLinesToFront();

      let hdim = h_part_dim();
      let vdim = v_part_dim();
      let pos = event.data.getLocalPosition(this.parent);
      let i = Math.floor((pos.x - CONTAINER_LEFT) / hdim);
      let j = Math.floor((pos.y - CONTAINER_TOP) / vdim);
  
      let k = i + 1
  
      if (false) {
        // do nothing
      } else {
        var block = new PIXI.Graphics();
        block.beginFill(CONST.COLORS.BLUE);
        block.drawRoundedRect(
          0,
          0,
          (CONTAINER_WIDTH * k) / vPartitions,
          CONTAINER_HEIGHT,
          5
        );
        currFrac = [k, vPartitions];
        block.endFill();
        block.x = 1;
        block.y = 1;

        let blockTexture = app.renderer.generateTexture(block);
        let blockSprite = new PIXI.Sprite(blockTexture);
        blockSprite.alpha = 0.5;

        blockSprite.x = 0;
        blockSprite.y = 0;
        blockSprite.anchor.set(0);
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
      // console.log("ANIMATING horizontalLines");
      vPartitions += inc;
      if (vPartitions != 0 && vPartitions != 13) {
        currFrac[1] = vPartitions;
        if (currFrac[0] > vPartitions) {
          currFrac[0] = vPartitions;
        }

        let dim = v_part_dim();
        window.createjs.Tween.get(currBlock).to(
          {
            width: (CONTAINER_WIDTH * currFrac[0]) / currFrac[1]
          },
          500,
          window.createjs.Ease.getPowInOut(4)
        );

        colorIndex += 1;

        let spacing = CONTAINER_WIDTH / vPartitions;

        verticalLines.forEach((l, i) => {
          //// console.log("VERTICAL LINES WHATS UP!!");
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

      // console.log("currFrac", currFrac);
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
      if (this.y + this.height > setup.width) {
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

  app.destroyAll = ()=> {
    // console.log("in destroyAll")
    gridTool.destroy(true)
    backGround.destroy(true)
    pinkCircle.destroy(true)
    blueCircle.destroy(true)
    for (let l of labelsOnLine){
      l.destroy(true)
    }
    for (let t of ticksOnLine){
      t.destroy(true)
    }


  }

  let questionButton = new PIXI.Sprite.from(QuestionMark)
    questionButton.x = setup.width - 1.5*dx
    questionButton.y = dx/4
    questionButton.width = dx
    questionButton.height = dx
    questionButton.interactive = true
    questionButton.on('pointerdown',()=> {app.help()})
    app.stage.addChild(questionButton)


    function resize(newFrame){
    
      heightToWidthRatio = newFrame.height/newFrame.width
      LANDSCAPE = heightToWidthRatio < 3/4
      ARENA_WIDTH = LANDSCAPE ? 4/3*newFrame.height : newFrame.width
      ARENA_HEIGHT = LANDSCAPE ? newFrame.height : 3/4*newFrame.width
      /*
      backGround.width = ARENA_WIDTH
      backGround.height = ARENA_HEIGHT
      app.renderer.resize(ARENA_WIDTH,ARENA_HEIGHT)
      //TweenLite.to(backGround,5,{x: ARENA_WIDTH/2,y: ARENA_HEIGHT/2})
      gridNodes.draw()
      */
     app.stage.width = ARENA_WIDTH
     app.stage.height = ARENA_HEIGHT
    }
  
    app.resize = (frame) => resize(frame)

};

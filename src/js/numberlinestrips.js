import * as PIXI from "pixi.js";
import * as CONST from "./const.js";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from "constants";
import { number } from "prop-types";
const ASSETS = CONST.ASSETS

export const init = (app, setup) => {


  let features = {'strips': true,labels: true,open: false}
  if (setup.props.features){
    features = setup.props.features
  }

  // Constants
  const BLUE_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.BLUE_CIRCLE)
  const LINE_PERCENTAGE = 0.8
  const PIN_TEXTURE = new PIXI.Texture.from(ASSETS.SHARP_PIN)


 // Initial State
  let state = {
    valA: 1,
    valB: 2,
    lineMax: 20,
  }

  // Layout Parameters
  let WINDOW_WIDTH = setup.width
  let WINDOW_HEIGHT = setup.height
  let H_W_RATIO = setup.height/setup.width
  let LANDSCAPE = H_W_RATIO < 3/4
  let ARENA_WIDTH = LANDSCAPE ? 4/3*setup.height : setup.width
  let ARENA_HEIGHT = LANDSCAPE ? setup.height : 3/4*setup.width
  let LINE_WIDTH = LINE_PERCENTAGE*WINDOW_WIDTH
  let LINE_THICKNESS = LINE_WIDTH/200
  let TICK_THICKNESS = 2*LINE_THICKNESS/3
  let MAJOR_TICK_HEIGHT = LINE_WIDTH/20
  let MINOR_TICK_HEIGHT = MAJOR_TICK_HEIGHT/2
  let DX = LINE_WIDTH/state.lineMax
  let LINE_START = WINDOW_WIDTH/2 - LINE_WIDTH/2
  let STRIP_HEIGHT = LINE_WIDTH/12

  // Reference to entities.
  let backGround;
  let numberLine;
  let pinA;
  let pinB;
  let stripA;
  let stripB;
  let stripBLabel;
  let stripALabel;
  let incButton;
  let decButton;
  let activePin;

 
  // Constructors (should not be called on re-draw)
  function makeNumberLine(){
     this.tickSpan = 1
     this.labelSpan = 1
     this.max = state.lineMax
     this.ticks = [] // size 120
     this.labels = []
     this.line = new PIXI.Graphics()

     this.init = (n) => {
        this.line.lineStyle(LINE_THICKNESS,0x000000)
        this.line.x = ARENA_WIDTH/2-LINE_WIDTH/2
        this.line.y = ARENA_HEIGHT/2
        this.line.lineTo(LINE_WIDTH,0)
        this.draw()
        app.stage.addChild(this.line)

        for (let i = 0;i<120;i++){
            let newTick = new PIXI.Graphics()
            newTick.lineStyle(LINE_THICKNESS,0x000000)
            newTick.x = this.line.x 
            newTick.y = this.line.y - LINE_THICKNESS/2
            newTick.lineTo(0,MINOR_TICK_HEIGHT)
            app.stage.addChild(newTick)
            this.ticks.push(newTick)

            // Setup Labels Here
            let newLabel = new PIXI.Text(i,{
              fontFamily: "Arial",
              fontSize: DX/2,
              fill: "0x000000",
              align: "center"
            })
            newLabel.anchor.x = 0.5
            this.labels.push(newLabel)
            newLabel.x = this.line.x + DX*i
            newLabel.y = this.line.y + MINOR_TICK_HEIGHT
            app.stage.addChild(newLabel)
        }
        this.increment(0)
     }

     this.getSetup = ()=> {
         // update tickspan etc. based on line max.
     }

     // Could be more efficient by sending object with key value pairs for easy checking. (object.assign?)
     this.keep = (values)=>{
       let obj = {0: "I am here"};
       values.forEach(v=>{obj[v] = 'I am here.'})
       for (let i = 0;i<this.ticks.length;i++){
        let a = obj[i] ? 1 : 0
        console.log("a",a)
        this.ticks[i].alpha = a
        this.labels[i].alpha = a
       }
     }

     this.increment = (inc) => {
         // Animation go here
         this.max += inc

         // Update State - (Context Specific)
         state.lineMax = this.max
         updateLayoutParams()

         this.ticks.forEach((e,i)=> {
            if (i > this.max){
                TweenLite.to(e,0.5,{x: LINE_WIDTH + this.line.x })
            } else {
                TweenLite.to(e,0.5,{x: LINE_WIDTH/this.max*i + this.line.x})
            }
         })

         this.labels.forEach((e,i)=> {
          if (i > this.max){
              TweenLite.to(e,0.5,{x: LINE_WIDTH + this.line.x })
              TweenLite.to(e,0.5,{alpha: 0})
          } else {
              TweenLite.to(e,0.5,{x: LINE_WIDTH/this.max*i + this.line.x})
              TweenLite.to(e,0.5,{alpha: 1})
          }
       })
     }

     this.draw = () => {
        this.line.width = LINE_WIDTH
        this.line.height = LINE_THICKNESS
        this.line.x = WINDOW_WIDTH/2 - LINE_WIDTH/2
        this.line.y = WINDOW_HEIGHT/2
        this.ticks.forEach((e,i)=> {
            e.width = TICK_THICKNESS
            e.height = MINOR_TICK_HEIGHT
            e.y = this.line.y - LINE_THICKNESS/2
            if (i > this.max){
                e.x = LINE_WIDTH + this.line.x 
            } else {
                e.x =  LINE_WIDTH/this.max*i + this.line.x
            }
         })
         this.labels.forEach((e,i)=> {
          e.y = this.line.y + MINOR_TICK_HEIGHT
          e.style.fontSize = DX/2
          if (i > this.max){
              e.x = LINE_WIDTH + this.line.x 
          } else {
              e.x =  LINE_WIDTH/this.max*i + this.line.x
          }
       })
     }
     this.init()
  }

  function makeBackground(){
    // Setup Background
    this.sprite = new PIXI.Sprite.from(CONST.ASSETS.BLUE_GRADIENT);
    this.sprite.width = WINDOW_WIDTH
    this.sprite.height = WINDOW_HEIGHT
    this.sprite.x = 0;
    this.sprite.y = 0;
    this.sprite.on('pointerup',globalPointerUp)
    this.sprite.interactive = true

    app.stage.addChild(this.sprite)

    this.draw = () => {
        this.sprite.width = WINDOW_WIDTH
        this.sprite.height = WINDOW_HEIGHT
    }
  }

  function makeStripLabel(n){
    let label = new PIXI.Text(n,{
      fontFamily: "Arial",
      fontSize: DX,
      fill: "0x000000",
      align: "center"
    })

    label.id = n
    label.anchor.set(0.5)

    label.draw = () => {
      let {valA,valB} = state
      if (label.id == 0){
         label.x = LINE_START + (pinA.sprite.x - LINE_START)/2
         label.style.fill = 0xffffff
         let txt = Math.round((pinA.sprite.x - LINE_START)/DX)
         label.text = txt
         // Hide if "subtracting"
         if (pinA.sprite.x > pinB.sprite.x){
           label.x = LINE_START + (pinB.sprite.x - LINE_START)/2
           label.text = Math.round((pinB.sprite.x - LINE_START)/DX)
          }
         if (stripA.graphic.width <= DX){
           label.y = WINDOW_HEIGHT/2 - 1.5*STRIP_HEIGHT
         } else {
           label.y = WINDOW_HEIGHT/2 - STRIP_HEIGHT/2
         }
         // Hide for testing purposes
         //label.alpha = 0
      } else if (label.id == 1) {
         label.x = (pinA.sprite.x + pinB.sprite.x)/2
         label.y = label.y = WINDOW_HEIGHT/2 - STRIP_HEIGHT/2
         let txt = Math.round(Math.abs(pinA.sprite.x - pinB.sprite.x)/DX)
         label.text = txt
         if (stripB.graphic.width <= DX ){
          label.y = WINDOW_HEIGHT/2 - 1.5*STRIP_HEIGHT
        } else {
           label.y = WINDOW_HEIGHT/2 - STRIP_HEIGHT/2
        }
      }
      label.style.fontSize = STRIP_HEIGHT/2
    }
    app.stage.addChild(label)
    return label
  }

  function makePin(id){
    this.sprite = new PIXI.Sprite()
    this.sprite.id = id
    this.sprite.texture = PIN_TEXTURE
    this.sprite.interactive = true
    this.sprite.anchor.x = 0.5
    this.sprite.on('pointerdown',onDragStart)
    this.sprite.on('pointermove',onDragMove)
    this.sprite.on('pointerup',onDragEnd)
    this.sprite.x = WINDOW_WIDTH/2 - LINE_WIDTH/2
    this.sprite.val = id == 0 ? state.valA : state.valB
    app.stage.addChild(this.sprite)

    this.sprite.round = () => {

      // Pre Computation
      let rawLineX = this.sprite.x - numberLine.line.x
      let n = Math.round(rawLineX/DX)

      // Setting
      this.sprite.x = numberLine.line.x + n*DX
      this.sprite.val = n

      // There's gotta be a better pattern than this
      if (this.sprite.id == 0){
        state.valA = this.sprite.val
      } else if (this.sprite.id == 1){
        state.valB = this.sprite.val
      }

      // CHECKPOINT!
      if (features.open){
        numberLine.keep([state.valA,state.valB])
      }
    }



    this.draw = () => { 
      this.sprite.width = STRIP_HEIGHT
      this.sprite.height = STRIP_HEIGHT
      this.sprite.y = WINDOW_HEIGHT/2 + MINOR_TICK_HEIGHT + DX/2
      this.sprite.x = WINDOW_WIDTH/2 - LINE_WIDTH/2 + this.sprite.val*DX
    }
    this.draw()
   }

  // Dragging...

  function onDragStart(event) {
      app.stage.addChild(this)
      this.deltaTouch = {
        x: this.x - event.data.global.x,
        y: this.y - event.data.global.y
      }
      this.dragging = true;
      this.data = event.data;
  }

  function onDragEnd(event) {
    this.dragging = false;
    this.data = null;
    this.round()
    stripA.draw()
    stripB.draw()
    stripALabel.draw()
    stripBLabel.draw()
  }

  function onDragMove(event) {
    if (this.dragging) {
      let newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x + this.deltaTouch.x;
      //this.y = newPosition.y + this.deltaTouch.y;
        state.valA = Math.round((pinA.sprite.x - LINE_START)/DX)
        state.valB = Math.round((pinB.sprite.x - LINE_START)/DX)

        //numberLine.keep([state.valA,state.valB])
        stripA.draw()
        stripB.draw()
        stripALabel.draw()
        stripBLabel.draw()

      // Keep within number line bounds
      if (this.x < WINDOW_WIDTH/2-LINE_WIDTH/2){
        this.dragging = false
        this.x = WINDOW_WIDTH/2-LINE_WIDTH/2
      } else if (this.x > WINDOW_WIDTH/2+LINE_WIDTH/2) {
        this.dragging = false
        this.x = WINDOW_WIDTH/2+LINE_WIDTH/2
      }
    }
  }

  function makeArrowButton(inc){
    let button = new PIXI.Sprite.from(CONST.ASSETS.ARROW)
    button.inc = inc
    button.interactive = true
    button.anchor.set(0.5)
    button.on('pointerdown',()=>{
      numberLine.increment(inc)
      resize(null,false)
    })
    //app.stage.addChild(button)

    button.draw = () => {
      if (button.inc == -5){
        button.width = STRIP_HEIGHT/2
        button.height = STRIP_HEIGHT/2
        button.x = WINDOW_WIDTH - 1.1*button.width
        button.y = WINDOW_HEIGHT/2 + 1/2*button.width
        button.rotation = Math.PI
      } else if (button.inc == 5){
        button.width = STRIP_HEIGHT/2
        button.height = STRIP_HEIGHT/2
        button.x = WINDOW_WIDTH - 1.1*button.width
        button.y = WINDOW_HEIGHT/2  - 1/2*button.width
      }
    }
    return button
  }
 
  function makeStrip(id){
    this.graphic = new PIXI.Graphics()
    app.stage.addChild(this.graphic)
    this.graphic.y = WINDOW_HEIGHT/2 - STRIP_HEIGHT
    this.id = id


    this.draw = (flex) => { 
      let t = LINE_THICKNESS/2
      let {valA,valB} = state
      if (this.id == 0){
          let _x = LINE_START
          let _y = WINDOW_HEIGHT/2 - STRIP_HEIGHT
          let _h = STRIP_HEIGHT-1.5*t
          let _w = Math.min(pinA.sprite.x,pinB.sprite.x) - LINE_START
          if (flex){
            TweenLite.to(this.graphic,1,{x: _x,y: _y,width: _w,height: _h+t})
          } else {
            this.graphic.clear()
            this.graphic.lineStyle(t,CONST.COLORS.BLUE)
            this.graphic.beginFill(CONST.COLORS.BLUE)
            this.graphic.drawRoundedRect(0,0,_w,_h,_h/10)
            this.graphic.width = _w 
            this.graphic.height = _h + t
            this.graphic.x = _x
            this.graphic.y = _y
          }
      } else if (this.id == 1) {
          let w = Math.abs(pinA.sprite.x - pinB.sprite.x)
          this.graphic.clear()
          if (false) {
            this.graphic.lineStyle(t,CONST.COLORS.BLUE)
            this.graphic.y = WINDOW_HEIGHT/2 - STRIP_HEIGHT
            this.graphic.drawRect(0,0,w,STRIP_HEIGHT-1.5*t)
          } else {
            this.graphic.lineStyle(2,CONST.COLORS.ORANGE)
            this.graphic.beginFill(CONST.COLORS.ORANGE)
            this.graphic.y = WINDOW_HEIGHT/2 - STRIP_HEIGHT - t/4
            this.graphic.drawRoundedRect(0,0,w,STRIP_HEIGHT-t,STRIP_HEIGHT/10)
            if(w == 0){
              this.graphic.alpha = 0
            } else {
              this.graphic.alpha = 1
            }
          }
          this.graphic.x = Math.min(pinA.sprite.x,pinB.sprite.x)
      }
      
    }
    this.draw(0,8*DX)
  }

  function globalPointerUp(){
    // Ughhh...
    pinA.sprite.dragging = false
    pinB.sprite.dragging = false
    pinA.sprite.round()
    pinB.sprite.round()
    stripA.draw()
    stripB.draw()
    stripALabel.draw()
    stripBLabel.draw()
  }
  
  // Called on resize
  function resize(newFrame,flex){
    // Make sure all layout parameters are up to date.
    updateLayoutParams(newFrame)
    app.renderer.resize(WINDOW_WIDTH,WINDOW_HEIGHT)
    numberLine.draw()
    backGround.draw()
    pinA.draw()
    pinB.draw()
    stripA.draw(flex)
    stripB.draw()
    stripALabel.draw()
    stripBLabel.draw()
    incButton.draw()
    decButton.draw()
  }

  function updateLayoutParams(newFrame){
    let frame;
    if (newFrame){
      frame = newFrame
    } else {
      frame = {width: WINDOW_WIDTH,height: WINDOW_HEIGHT}
    }
    WINDOW_WIDTH = frame.width
    WINDOW_HEIGHT = frame.height
    H_W_RATIO = frame.height/frame.width
    LANDSCAPE = H_W_RATIO < 3/4
    ARENA_WIDTH = LANDSCAPE ? 4/3*frame.height : frame.width
    ARENA_HEIGHT = LANDSCAPE ? frame.height : 3/4*frame.width
    LINE_WIDTH = LINE_PERCENTAGE*WINDOW_WIDTH
    LINE_THICKNESS = LINE_WIDTH/200
    TICK_THICKNESS = LINE_THICKNESS/2
    MAJOR_TICK_HEIGHT = LINE_WIDTH/20
    MINOR_TICK_HEIGHT = MAJOR_TICK_HEIGHT/2
    DX = LINE_WIDTH/state.lineMax
    LINE_START = WINDOW_WIDTH/2 - LINE_WIDTH/2
    STRIP_HEIGHT = LINE_WIDTH/12
  }

  // Loading Script
  function load(){
    backGround = new makeBackground()
    numberLine = new makeNumberLine()
    pinA = new makePin(0)
    pinB = new makePin(1)
    stripA = new makeStrip(0)
    stripB = new makeStrip(1)
    stripALabel = makeStripLabel(0)
    stripBLabel = makeStripLabel(1)


    incButton = makeArrowButton(5)
    decButton = makeArrowButton(-5)
    stripALabel.draw()
    stripBLabel.draw()
    incButton.draw()
    decButton.draw()

    // HELLO!
    if (features.open){
      console.log("state",state)
      stripALabel.alpha = 0
      stripBLabel.alpha = 0
      numberLine.keep([state.valA,state.valB])
    }
  }

  // Call load script
  load()
  // Not sure where else to put this.
  app.resize = (frame) => resize(frame)
  app.resizable = true
};

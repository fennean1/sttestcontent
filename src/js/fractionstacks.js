import * as PIXI from "pixi.js";
import * as CONST from "./const.js";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import {Fraction} from "./api.js"
const ASSETS = CONST.ASSETS

export const init = (app, setup) => {

  // Constants
  const BLUE_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.BLUE_CIRCLE)
  const LINE_PERCENTAGE = 0.8
  const PIN_TEXTURE = new PIXI.Texture.from(ASSETS.SHARP_PIN)
  const MEASURE_PIN_TEXTURE = new PIXI.Texture.from(ASSETS.MEASURE_PIN)


 // Initial State
  let state = {
    valA: 16,
    valB: 16,
    lineMax: 30,
  }

  console.log("setupwidth",setup.width)
  console.log("windowheight",window.innerHeight)

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
  let TOP_LINE_Y = WINDOW_HEIGHT/4
  let BOTTOM_LINE_Y = WINDOW_HEIGHT*3/4
  let BAR_HEIGHT = (BOTTOM_LINE_Y - TOP_LINE_Y)/5
  let BAR_STEP = (BOTTOM_LINE_Y - TOP_LINE_Y)/4
  let INC_BUTTONS_HEIGHT = BAR_HEIGHT*0.7
  let DY = (BOTTOM_LINE_Y - TOP_LINE_Y - 4*BAR_HEIGHT)/3
  let Y1 =  BOTTOM_LINE_Y - BAR_HEIGHT
  let Y2 = BOTTOM_LINE_Y - 2*BAR_HEIGHT - DY
  let Y3 = BOTTOM_LINE_Y - 3*BAR_HEIGHT - 2*DY
  let Y4 = TOP_LINE_Y
  let ANCHORS = [Y1,Y2,Y3,Y4]   





  // RELEVENT
  let ActiveRow;
  let ActiveIndex = 0
  let FirstRow
  let SecondRow
  let ThirdRow;
  let FourthRow;
  var Rows;


  let PlusButton = new PIXI.Sprite.from(ASSETS.PLUS_SQUARE)
  
  PlusButton.interactive = true
  PlusButton.anchor.set(0.5)
  PlusButton.on('pointerdown',()=>{
    PlusButton.interactive = false
    incActiveFrac(1)
    setTimeout(()=>{PlusButton.interactive = true},300)
  })
  PlusButton.width = INC_BUTTONS_HEIGHT
  PlusButton.height = INC_BUTTONS_HEIGHT


  let MinusButton = new PIXI.Sprite.from(ASSETS.MINUS_SQUARE)
  MinusButton.interactive = true
  MinusButton.anchor.set(0.5)
  MinusButton.on('pointerdown',()=>{
    MinusButton.interactive = false
    incActiveFrac(-1)
    setTimeout(()=>{MinusButton.interactive = true},300)
  })
  MinusButton.width = BAR_HEIGHT/2.5
  MinusButton.height = BAR_HEIGHT/2.5


  function placeButtons(){

    let w = ActiveRow.container.width
    let h = ActiveRow.container.height 
    let x = ActiveRow.container.x + w 
    let y = ActiveRow.container.y

    PlusButton.width = INC_BUTTONS_HEIGHT
    PlusButton.height = INC_BUTTONS_HEIGHT
    MinusButton.width = INC_BUTTONS_HEIGHT
    MinusButton.height = INC_BUTTONS_HEIGHT
  
    PlusButton.x = x +  BAR_HEIGHT/2
    PlusButton.y = y + BAR_HEIGHT/2
    MinusButton.x = x - w - BAR_HEIGHT/2
    MinusButton.y = y + BAR_HEIGHT/2

  }


  let LeftWhisker  = new PIXI.Graphics()
  let RightWhisker = new PIXI.Graphics()
  let MiddleWhisker = new PIXI.Graphics()

  let A;
  let B;

  // Reference to entities. - deprecated.
  let backGround;
  let numberLine;
  let topNumberLine;
  let pinA;
  let pinB;
  let stripA;
  let stripB;
  let stripBLabel;
  let stripALabel;
  let incButton;
  let decButton;
  let activePin;


  function incActiveFrac(inc){
    ActiveRow.incDenonimator(inc)
  }

 
  // Constructors (should not be called on re-draw)
  function makeNumberLine(flip){
     this.tickSpan = 1
     this.labelSpan = 1
     this.max = state.lineMax
     this.ticks = [] // size 120
     this.labels = []
     this.line = new PIXI.Graphics()

     this.init = (n) => {
        this.line.lineStyle(LINE_THICKNESS,0x000000)
        this.line.x = LINE_START
        this.line.y = ARENA_HEIGHT/2
        this.line.lineTo(LINE_WIDTH,0)
        app.stage.addChild(this.line)

        for (let i = 0;i<120;i++){
            let newTick = new PIXI.Graphics()
            newTick.lineStyle(LINE_THICKNESS,0x000000)
            newTick.x = this.line.x 
            if(flip){
              newTick.y = this.line.y + LINE_THICKNESS/2
              newTick.lineTo(0,-MINOR_TICK_HEIGHT)
            } else {
              newTick.y = this.line.y - LINE_THICKNESS/2
              newTick.lineTo(0,MINOR_TICK_HEIGHT)
            }
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
            if (flip){
              newLabel.y = this.line.y - 2*MINOR_TICK_HEIGHT
              newLabel.anchor.y = 1
              newLabel.text.anchor.y = 0.5
            }
            app.stage.addChild(newLabel)
        }
        this.increment(0)
     }

     this.getSetup = ()=> {
         // update tickspan etc. based on line max.
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
       let _y;
       if (flip){
        _y = TOP_LINE_Y
       } else {
         _y = BOTTOM_LINE_Y
       }
        this.line.width = LINE_WIDTH
        this.line.height = LINE_THICKNESS
        this.line.x = LINE_START
        this.line.y = _y
        this.ticks.forEach((e,i)=> {
            e.width = TICK_THICKNESS
            e.height = MINOR_TICK_HEIGHT
            e.y = this.line.y - LINE_THICKNESS/2
            if (flip){
              e.y = this.line.y + LINE_THICKNESS/2
            }
            if (i > this.max){
                e.x = LINE_WIDTH + this.line.x 
            } else {
                e.x =  LINE_WIDTH/this.max*i + this.line.x
            }
         })
         this.labels.forEach((e,i)=> {
          e.y = this.line.y + MINOR_TICK_HEIGHT
          if (flip){
            e.y = this.line.y - MINOR_TICK_HEIGHT
          }
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


  function makePin(id){
    this.sprite = new PIXI.Sprite()
    this.sprite.id = id
    this.sprite.texture = PIN_TEXTURE
    this.sprite.interactive = true
    this.sprite.anchor.x = 0.5
    this.sprite.scale.y = id == 0 ?  1 : -1
    if (id == 0){
      this.sprite.on('pointerdown',onDragStart)
      this.sprite.on('pointermove',onDragMove)
      this.sprite.on('pointerup',onDragEnd)
    } else if (id == 1){
      this.sprite.on('pointerdown',onBDragStart)
      this.sprite.on('pointermove',onBDragMove)
      this.sprite.on('pointerup',onBDragEnd)
    }

    this.sprite.x = WINDOW_WIDTH/2 - LINE_WIDTH/2
    this.sprite.val = 16
    // Removing pin B for now
    if (id == 0){
      app.stage.addChild(this.sprite)
    }


    this.sprite.round = () => {

      // Pre Computation
      let rawLineX = this.sprite.x - numberLine.line.x
      let n = Math.round(rawLineX/DX)

      // Setting
      this.sprite.x = numberLine.line.x + n*DX
      this.sprite.val = n

      drawWhiskers()
      // There's gotta be a better pattern than this
      if (this.sprite.id == 0){
        state.valA = this.sprite.val
      } else if (this.sprite.id == 1){
        state.valB = this.sprite.val
      }
    }

    this.draw = () => { 
      this.sprite.width = STRIP_HEIGHT
      this.sprite.height = STRIP_HEIGHT
      this.sprite.y = BOTTOM_LINE_Y + MINOR_TICK_HEIGHT + DX/2
      this.sprite.x = WINDOW_WIDTH/2 - LINE_WIDTH/2 + this.sprite.val*DX
    }
    this.draw()
   }

   function onBDragStart(event) {
    app.stage.addChild(this)
    app.stage.addChild(MiddleWhisker)
    this.deltaTouch = {
      x: this.x - event.data.global.x,
      y: this.y - event.data.global.y
    }
    this.dragging = true;
    this.data = event.data;
}

function onBDragEnd(event) {
  this.dragging = false;
  this.data = null;
  drawWhiskers()
  placeButtons()
}

function onBDragMove(event) {
  if (this.dragging) {
    drawWhiskers()
    let newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x + this.deltaTouch.x;
    // Keep within number line bounds.
    if (this.x < WINDOW_WIDTH/2-LINE_WIDTH/2){
      this.dragging = false
      this.x = WINDOW_WIDTH/2-LINE_WIDTH/2
    } else if (this.x > WINDOW_WIDTH/2+LINE_WIDTH/2) {
      this.dragging = false
      this.x = WINDOW_WIDTH/2+LINE_WIDTH/2
    }
  }
}


  // Pin Drag Functions
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
    ActiveRow.setValue()
    ActiveRow.draw(this.x - LINE_START)
    drawWhiskers()
    placeButtons()
  }

  function onDragMove(event) {
    if (this.dragging) {
      let width = this.x - LINE_START
      ActiveRow.draw(width)
      drawWhiskers()
      placeButtons()
      let newPosition = this.data.getLocalPosition(this.parent);
      this.x = newPosition.x + this.deltaTouch.x;

      // Keep within number line bounds.
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
      topNumberLine.increment(inc)
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

  app.stage.on('pointerdown',resizeLine)
  app.stage.interactive = true

  function resizeLine(event){
 
  }




 
  function Row(num,den,width,ID){

    // Internal Params
    let touching = true   
    let activated = true
    this.value = 0
    
    // Default values
    this.numerator = num
    this.denominator = den
    this.width = width
    this.id = ID
  
    this.container = new PIXI.Container()
    this.container.id = ID
    this.container.width = width
    this.container.interactive = true
    this.container.y = BOTTOM_LINE_Y - BAR_HEIGHT
    this.container.x = LINE_START 
    this.sprites = []
  

    this.blockWidth = width / this.denominator

    this.blockA = new PIXI.Graphics()
    this.blockA.lineStyle(3,0x000000) 
    this.blockA.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
    let myA = app.renderer.generateTexture(this.blockA)

    this.blockB = new PIXI.Graphics()
    this.blockB.beginFill(0xff4772)
    this.blockB.lineStyle(3,0x000000) 
    this.blockB.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
    let myB = app.renderer.generateTexture(this.blockB)

    let g = new PIXI.Graphics()    


    this.incDenonimator = (inc) => {
      console.log("this denomonicator - inc",this.denominator-inc)
    if (this.denominator + inc >= 1) {
      console.log("shouldn't exectuve if this.denominator is equal to 1",this.denominator)
      g.clear()
      g.lineStyle(3,0x000000) 
      g.drawRoundedRect(0,0,this.width,BAR_HEIGHT,1)
      let R = app.renderer.generateTexture(g)
      let s = new PIXI.Sprite()
      this.container.addChild(s)
      s.texture = R
      s.x  = 0

      if (inc > 0){
        const onComplete = ()=>{
          s.on('pointerdown',spritePointerDown)
          s.on('pointerup',spritePointerUp)
          s.on('pointermove',spritePointerMoved)
          s.interactive = true
          s.active = false
          this.sprites.push(s)
          this.draw()
        }
        TweenMax.to(this, 0.25, {denominator: this.denominator+1,onUpdate: this.draw,onComplete: onComplete})
      } else if (inc < 0) {
        let removeme  = this.sprites.pop()
        this.container.removeChild(removeme)
        const onComplete = ()=>{
          this.draw()
          this.container.removeChild(s)
        }
        TweenMax.to(this, 0.25, {denominator: this.denominator-1,onUpdate: this.draw,onComplete: onComplete})
      }
     }
    }

    this.setValue = ()=> {
      this.value = Math.round(this.width/LINE_WIDTH*state.lineMax)
      console.log("this.value",this.value)
    }

    this.draw = (width) => {

      if (width) {
        this.width = width
      }
      this.blockWidth = this.width/this.denominator

      this.blockA.clear()
      this.blockA.lineStyle(3,0x000000) 
      this.blockA.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
      myA = app.renderer.generateTexture(this.blockA)

      this.blockB.clear()
      this.blockB.beginFill(0xff4772)
      this.blockB.lineStyle(3,0x000000) 
      this.blockB.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
      myB = app.renderer.generateTexture(this.blockB)

      for (let i = 0;i<this.sprites.length;i++){
        if (this.sprites[i].active){
          this.sprites[i].texture = myB
        } else {
          this.sprites[i].texture = myA
        }

        this.sprites[i].x = this.blockWidth*i
        this.sprites[i].y = 0
      }

      //.this.container.y = ANCHORS[this.id]

    }

    for (let i = 0;i<this.denominator;i++) {
      console.log("balls")
      let s = new PIXI.Sprite.from(myA)
      s.on('pointerdown',spritePointerDown)
      s.on('pointerup',spritePointerUp)
      s.on('pointermove',spritePointerMoved)
      s.interactive = true
      s.active = false
      s.x = i*LINE_WIDTH/this.denominator
      s.y = WINDOW_HEIGHT/2 - BAR_HEIGHT
      this.sprites.push(s)
      this.container.addChild(s)
    }
      

    //  Attached methods
    this.container.on('pointerdown',containerPointerDown)
    this.container.on('pointerup',containerPointerUp)
    this.container.on('pointermove',containerPointerMove)

    // Add children
    app.stage.addChild(this.container)
    this.width = this.container.width
  

    function spritePointerDown(event){
      this.touched = true
      this.dragged = false
    }

    function spritePointerMoved(event) {

      if (this.touched){
        console.log("pointermove")
        this.dragged = true
      }
    }

    function spritePointerUp(event){
         this.touched = false
         console.log('this.draggeed',this.dragged)
     if (!this.dragged && activated) {
        this.dragged = false
        this.active = !this.active
        this.alpha = 0.2
        this.texture = this.active ? myB : myA
        TweenLite.to(this,0.4,{alpha: 1})
       }
    }

 
   function containerPointerDown(event) {
     app.stage.addChild(this)
      activated = this.id == ActiveIndex
      ActiveIndex = this.id
      ActiveRow = Rows[ActiveIndex]
      disableAllRowsExceptActive()
      drawWhiskers()
      placeButtons()
      pinA.sprite.x = this.width + LINE_START
      pinA.sprite.round()
      this.data = event.data
      this.startWidth = this.width
      this.dragStartY = event.data.global.y
      this.touching = true
      touching = true
      this.deltaTouch = {
        x: this.x - event.data.global.x,
        y: this.y - event.data.global.y
      }
    }
 
   function containerPointerUp(event) {
      globalPointerUp()
      this.touching = false
      touching = false
    }

    function containerPointerMove(event) {

      if (this.touching){
        const newPosition = this.data.getLocalPosition(this.parent);
        this.y = event.data.global.y + this.deltaTouch.y
      // Keep within number line bounds.
      if (this.y < TOP_LINE_Y){
        this.dragging = false
        this.y = TOP_LINE_Y
      } else if (this.y > BOTTOM_LINE_Y-BAR_HEIGHT) {
        this.dragging = false
        this.y = BOTTOM_LINE_Y  - BAR_HEIGHT
      }
        //this.x = event.data.global.x + this.deltaTouch.x
        //pinA.sprite.x = this.x + this.width
        this.dragged = true
        drawWhiskers()
        placeButtons()
      }
    }


    this.draw(width)
    this.setValue()

  }


  function disableAllRowsExceptActive(){
    Rows.forEach((r,i)=> {
      if (i  != ActiveIndex){
        r.container.interactive = false
        r.sprites.forEach(s=>{s.interactive = false})
      }
    })
  }

  function reEnableAllRows(){
    console.log("reinableing all rows")
    Rows.forEach((r,i)=> {
        r.container.interactive = true
        r.sprites.forEach(s=>{
          s.interactive = true
          s.dragged = false 
          s.touched = false
          s.dragging = false
        })
    })
  }

  function swapRows() {
    
    let index;
    ANCHORS.forEach((a,i)=> {
      let d = Math.abs(a-ActiveRow.container.y)
      if (d < BAR_STEP/2) {
        index = i
      }
    })
    // swap 

    if (ActiveIndex != index){
      console.log("swapping",Rows)
      let e = ActiveRow
      Rows.splice(ActiveIndex,1)
      Rows.splice(index,0,e)
      console.log("swapped",Rows)
      ActiveIndex = index
    }
    Rows.forEach((r,i)=> {
      r.container.touching = false
      r.container.dragged = false
      r.container.dragging = false
      r.id = i
      r.container.id = i
      
      TweenMax.to(r.container, 0.2, {y: ANCHORS[i],onComplete: reEnableAllRows})})

      const onComplete = ()=> {
        RightWhisker.clear()
        RightWhisker.lineStyle(LINE_THICKNESS/2,0x000000)
        RightWhisker.moveTo(pinA.sprite.x,ActiveRow.container.y)
        RightWhisker.lineTo(pinA.sprite.x,numberLine.line.y)
      }
      TweenMax.to(PlusButton,0.2,{y: ANCHORS[ActiveIndex]+BAR_HEIGHT/2,alpha: 1,onUpdate: drawWhiskers})
      TweenMax.to(MinusButton,0.2,{y: ANCHORS[ActiveIndex]+1/2*BAR_HEIGHT,alpha: 1})
      //drawWhiskers()
  }


  class Rowwow extends PIXI.Sprite {
     constructor(){
       super()
       console.log("this",this)
       let graphics = new PIXI.Graphics()
       this.addChild(graphics)
       console.log("Graphbics parent",graphics.parent.balls())
     }

     balls(input) {
       console.log("balls called")
        if (input) {
          return this.balls(false)
        }
     }
  }

  let ROWWOW = new Rowwow()


  function drawWhiskers(){
      let WHISKER_THICKNESS = LINE_THICKNESS/2

      LeftWhisker.clear()
      LeftWhisker.lineStyle(WHISKER_THICKNESS,0x000000)
      LeftWhisker.moveTo(ActiveRow.container.x,ActiveRow.container.y)
      LeftWhisker.lineTo(ActiveRow.container.x,numberLine.line.y)

      RightWhisker.clear()
      RightWhisker.lineStyle(WHISKER_THICKNESS,0x000000)
      RightWhisker.moveTo(pinA.sprite.x,ActiveRow.container.y)
      RightWhisker.lineTo(pinA.sprite.x,numberLine.line.y)

      MiddleWhisker.clear()
      MiddleWhisker.lineStyle(WHISKER_THICKNESS,0x000000)
      MiddleWhisker.moveTo(pinB.sprite.x,topNumberLine.line.y)
      MiddleWhisker.lineTo(pinB.sprite.x,numberLine.line.y)
  }

  function globalPointerUp(){
    // Ughhh...
    ActiveRow.container.touching = false
    pinA.sprite.dragging = false
    pinA.sprite.round()
    pinB.sprite.dragging = false
    ActiveRow.draw(pinA.sprite.x - LINE_START)
    drawWhiskers()
    placeButtons()
    swapRows()
    //pinB.sprite.round()
    //stripA.draw()
    //stripB.draw()
    //stripALabel.draw()
    //stripBLabel.draw()
  }
  
  // Called on resize
  function resize(newFrame,flex){
    // Make sure all layout parameters are up to date.
    updateLayoutParams(newFrame)
    app.renderer.resize(WINDOW_WIDTH,WINDOW_HEIGHT)
    numberLine.draw()
    topNumberLine.draw()
    backGround.draw()
    pinA.draw()
    pinB.sprite.x = LINE_START
    incButton.draw()
    decButton.draw()
    Rows.forEach((r,i)=>{
      r.draw(r.value/state.lineMax*LINE_WIDTH)
      r.container.x = LINE_START
      r.container.y = ANCHORS[i]
    })
    drawWhiskers()
    placeButtons()
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
    BAR_HEIGHT = (BOTTOM_LINE_Y - TOP_LINE_Y)/5
    BAR_STEP = (BOTTOM_LINE_Y - TOP_LINE_Y)/4
    DY = (BOTTOM_LINE_Y - TOP_LINE_Y - 4*BAR_HEIGHT)/3
    Y1 = BOTTOM_LINE_Y - BAR_HEIGHT
    Y2 = BOTTOM_LINE_Y - 2*BAR_HEIGHT - DY
    Y3 = BOTTOM_LINE_Y - 3*BAR_HEIGHT - 2*DY
    Y4 = TOP_LINE_Y
    ANCHORS = [Y1,Y2,Y3,Y4]   
    
  }

  // Loading Script
  function load(){
    let features = {'strips': true}
    if (setup.props.features){
      features = setup.props.features
    }


    backGround = new makeBackground()

    // Number Lines
    numberLine = new makeNumberLine()
    numberLine.draw()
    topNumberLine = new makeNumberLine(true)
    topNumberLine.draw()

    pinA = new makePin(0)
    pinA.sprite.y = BOTTOM_LINE_Y + 2*MINOR_TICK_HEIGHT
    pinA.sprite.x = LINE_START + LINE_WIDTH/2
    pinB = new makePin(1)
    pinB.sprite.y = TOP_LINE_Y - 1.65*MINOR_TICK_HEIGHT
    pinB.sprite.x = LINE_START
    pinA.draw()
    incButton = makeArrowButton(5)
    decButton = makeArrowButton(-5)
    incButton.draw()
    decButton.draw()
    FirstRow = new Row(0,5,pinA.sprite.x - LINE_START,0)
    SecondRow = new Row(0,4,pinA.sprite.x - LINE_START,1)
    ThirdRow = new Row(0,3,pinA.sprite.x - LINE_START,2)
    FourthRow = new Row(0,2,pinA.sprite.x - LINE_START,3)
  
    FirstRow.container.y = BOTTOM_LINE_Y - BAR_HEIGHT
    SecondRow.container.y = BOTTOM_LINE_Y - 2*BAR_HEIGHT - DY
    ThirdRow.container.y = BOTTOM_LINE_Y - 3*BAR_HEIGHT - 2*DY
    FourthRow.container.y = TOP_LINE_Y
    Rows = [FirstRow,SecondRow,ThirdRow,FourthRow]
    ActiveRow = Rows[ActiveIndex]


    app.stage.addChild(LeftWhisker)
    app.stage.addChild(RightWhisker)
    app.stage.addChild(MiddleWhisker)
    app.stage.addChild(PlusButton)
    app.stage.addChild(MinusButton)
    drawWhiskers()
    placeButtons()
  }

  // Call load script
  load()
  // Not sure where else to put this.
  app.resize = (frame) => resize(frame)
  app.resizable = true
};

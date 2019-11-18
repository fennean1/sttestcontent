import * as PIXI from "pixi.js";
import * as CONST from "./const.js";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
const ASSETS = CONST.ASSETS

export const init = (app, setup) => {

  // Constants
  const BLUE_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.BLUE_CIRCLE)
  const LINE_PERCENTAGE = 0.8
  const PIN_TEXTURE = new PIXI.Texture.from(ASSETS.SHARP_PIN)
  const MEASURE_PIN_TEXTURE = new PIXI.Texture.from(ASSETS.MEASURE_PIN)

// Global Vars 
  let Features = setup.props.features ? setup.props.features : null
  let FirstRow;
  let Background;
  let ActiveID;
  let Dragging;
  let ActiveRow;

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
    12: "12th",
    13: "13th",
    14: "14th",
    15: "15th",
    16: "16th",
    17: "17th",
    18: "18th",
    19: "19th",
    20: "20th",
  };


  // Layout Parameters
  let WINDOW_WIDTH = setup.width
  let WINDOW_HEIGHT = setup.height
  let BAR_HEIGHT = WINDOW_HEIGHT/15
  let BAR_WIDTH = WINDOW_WIDTH*0.8
  let WALL_START_X = WINDOW_WIDTH/2 - BAR_WIDTH/2
  let WALL_START_Y = 2*BAR_HEIGHT 
  let INC_BUTTONS_HEIGHT = BAR_HEIGHT*0.7
  let ANCHORS = []
  let ROWS = []

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

  let PlusButton = new PIXI.Sprite.from(ASSETS.PLUS_SQUARE)
  
  PlusButton.interactive = true
  PlusButton.anchor.set(0.5)
  PlusButton.on('pointerdown',()=>{
    PlusButton.interactive = false
    ActiveRow.incDenonimator(1)
    setTimeout(()=>{PlusButton.interactive = true},300)
  })
  PlusButton.width = INC_BUTTONS_HEIGHT
  PlusButton.height = INC_BUTTONS_HEIGHT

  let MinusButton = new PIXI.Sprite.from(ASSETS.MINUS_SQUARE)
  MinusButton.interactive = true
  MinusButton.anchor.set(0.5)
  MinusButton.on('pointerdown',()=>{
    MinusButton.interactive = false
    ActiveRow.incDenonimator(-1)
    setTimeout(()=>{MinusButton.interactive = true},300)
  })
  MinusButton.width = BAR_HEIGHT/2.5
  MinusButton.height = BAR_HEIGHT/2.5


  let resetButton = new PIXI.Sprite.from(CONST.ASSETS.RESET)
  resetButton.interactive = true
  resetButton.x = BAR_HEIGHT/2
  resetButton.y = BAR_HEIGHT/2
  resetButton.width = BAR_HEIGHT
  resetButton.height = BAR_HEIGHT
  resetButton.on('pointerdown',reset)


  function reset(){
    Dragging = false
    ROWS.forEach((r,i)=>{
      r.y = ANCHORS[i] + WALL_START_Y
      r.sprites.forEach(e=>{
        e.active = false
        e.touched = false 
        e.dragged = false
      })
      r.draw()
    })
  }

  function placeButtons(){

    let w = ActiveRow.width
    let h = ActiveRow.height 
    let x = ActiveRow.x + w 
    let y = ActiveRow.y
    console.log("x,y,w,h",x,y,w,h)

    PlusButton.width = INC_BUTTONS_HEIGHT
    PlusButton.height = INC_BUTTONS_HEIGHT
    MinusButton.width = INC_BUTTONS_HEIGHT
    MinusButton.height = INC_BUTTONS_HEIGHT
  
    PlusButton.x = x +  BAR_HEIGHT/2
    PlusButton.y = y + BAR_HEIGHT/2
    MinusButton.x = x - w - BAR_HEIGHT/2
    MinusButton.y = y + BAR_HEIGHT/2

  }

  class Row extends PIXI.Container {

    constructor(num,den,width,ID) {
      super()

      // This
      this.interactive = true

        // Default values
      this.numerator = num
      this.denominator = den
      this.trueWidth = width
      this.id = ID
      this.sprites = []
      this.blockWidth = width / this.denominator


      // Init Graphics A
      this.graphicsA = new PIXI.Graphics()
      this.graphicsA.beginFill(0xffffff)
      this.graphicsA.lineStyle(3,0x000000) 
      this.graphicsA.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
      this.textureA = app.renderer.generateTexture(this.graphicsA)

      // Init Graphics B
      this.graphicsB  = new PIXI.Graphics()
      this.graphicsB.beginFill(0xff4772)
      this.graphicsB.lineStyle(3,0x000000) 
      this.graphicsB.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
      this.textureB = app.renderer.generateTexture(this.graphicsB)

      // Dummy frame for when animating between different fractional parts.
      this.frameGraphics = new PIXI.Graphics()    
  
      // Generate Row
      for (let i = 0;i<this.denominator;i++) {
        let label = new PIXI.Text()
        label.text = labels[this.denominator]
        label.alpha = 0
        label.anchor.set(0.5)
        label.x = this.blockWidth/2
        label.y = BAR_HEIGHT/2
        let s = new PIXI.Sprite.from(this.textureA)
        s.on('pointerdown',this.spritePointerDown)
        s.on('pointerup',this.spritePointerUp)
        s.on('pointermove',this.spritePointerMoved)
        s.interactive = true
        s.active = false
        s.x = i*BAR_WIDTH/this.denominator
        s.y = 0
        s.addChild(label)
        s.label = label
        this.sprites.push(s)
        this.addChild(s)
      }
            //  Attached methods
      this.on('pointerdown',this.pointerDown)
      this.on('pointerup',this.pointerUp)
      this.on('pointermove',this.pointerMove)
      this.on('pointerupoutside',this.pointerUp)

    }

    reset() {
      this.sprites.forEach(s=>{s.touched = false})
    }

  

    incDenonimator = (inc) => {
      
      this.blockWidth = BAR_WIDTH/(this.denominator+inc)
      this.frameGraphics.clear()
      this.frameGraphics.lineStyle(3,0x000000) 
      this.frameGraphics.beginFill(0xffffff)
      this.frameGraphics.drawRoundedRect(0,0,BAR_WIDTH,BAR_HEIGHT,1)

      const frameTexture = app.renderer.generateTexture(this.frameGraphics)
      
      // New sprite starts as frame and then gets animated.
      let s = new PIXI.Sprite(frameTexture)
      let label = new PIXI.Text()
      label.text = labels[this.denominator+inc]
      label.alpha = 0
      label.anchor.set(0.5)
      label.x = this.blockWidth/2
      label.y = BAR_HEIGHT/2
      s.label = label
      s.active = false
      s.dragged = false 
      s.touched = false
      s.interactive = true
      s.addChild(label)
      this.addChild(s)
      this.sprites.forEach(s=>{
        this.addChild(s)
      })
      s.x  = 0
      const onUpdate = ()=>{this.draw()}
      if (inc > 0){
        const onComplete = ()=>{
          s.on('pointerdown',this.spritePointerDown)
          s.on('pointerup',this.spritePointerUp)
          s.on('pointermove',this.spritePointerMoved)
          this.sprites.push(s)
          this.draw()
        }
        TweenMax.to(this, 0.25, {denominator: this.denominator+1,onUpdate: onUpdate,onComplete: onComplete})
      } else if (inc < 0) {
        let removeme  = this.sprites.pop()
        this.removeChild(removeme)
        const onComplete = ()=>{
          this.removeChild(s)
          this.sprites.forEach(s=>{
            s.label.x = this.blockWidth/2
            s.label.text = labels[this.denominator]})
        }
        TweenMax.to(this, 0.25, {denominator: this.denominator-1,onUpdate: onUpdate,onComplete: onComplete})
      }
    }

    draw(width) {

      if (width) {
        this.trueWidth = width
      }

      this.blockWidth = (this.trueWidth)/this.denominator

      this.graphicsA.clear()
      this.graphicsA.beginFill(0xffffff)
      this.graphicsA.lineStyle(3,0x000000) 
      this.graphicsA.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
      this.textureA = app.renderer.generateTexture(this.graphicsA)

      this.graphicsB.clear()
      this.graphicsB.beginFill(0xff4772)
      this.graphicsB.lineStyle(3,0x000000) 
      this.graphicsB.drawRoundedRect(0,0,this.blockWidth,BAR_HEIGHT,1)
      this.textureB = app.renderer.generateTexture(this.graphicsB)

      for (let i = 0;i<this.sprites.length;i++){
        this.sprites[i].label.text = labels[this.denominator]
        this.sprites[i].label.x = this.blockWidth/2
        console.log("sprites[i].active",this.sprites[i].active)
        if (this.sprites[i].active){
          this.sprites[i].texture = this.textureB
          this.sprites[i].label.alpha = 1
        } else {
          this.sprites[i].texture = this.textureA
          this.sprites[i].label.alpha = 0
        }
        if (BAR_HEIGHT > this.blockWidth){
          this.sprites[i].label.style.fontSize = this.blockWidth/2.2
        }
        this.sprites[i].x = this.blockWidth*i
        this.sprites[i].y = 0
      }
    }

    spritePointerDown(event){
      this.touched = true
      this.dragged = false
    }

    spritePointerMoved(event) {
      if (this.touched){
        console.log("pointermove")
        this.dragged = true
      }
    }

    spritePointerUp(event){
      console.log("spritepointerup")
         this.touched = false
         console.log('this.draggeed',this.dragged)
     if (!this.parent.dragged && !Dragging) {
        this.dragged = false
        this.active = !this.active
        this.alpha = 0.2
        this.texture = this.active ? this.parent.textureB : this.parent.textureA
        this.label.alpha = this.active ? 1 : 0
        TweenLite.to(this,0.4,{alpha: 1})
       }
    }

 
   pointerDown(event) {
     ActiveRow = this
     placeButtons()
      app.stage.addChild(this)
      ActiveRow = this
      ActiveID = this.id
      this.data = event.data
      this.startIndex = Math.round((this.y-WALL_START_Y)/BAR_HEIGHT)
      this.startWidth = this.width
      this.dragStartY = event.data.global.y
      this.touching = true
      this.deltaTouch = {
        x: this.x - event.data.global.x,
        y: this.y - event.data.global.y
      }
    }

 
   pointerUp(event) {
     console.log("pointerup")
    if (this.dragged){
      let j = this.startIndex
      let i = Math.round((this.y-WALL_START_Y)/BAR_HEIGHT)
      ROWS.splice(j,1)
      ROWS.splice(i,0,this)
      TweenLite.to([PlusButton,MinusButton],0.2,{y: ANCHORS[i]+WALL_START_Y+BAR_HEIGHT/2})
      ROWS.forEach((r,k)=> {
        TweenLite.to(r,0.2,{y: ANCHORS[k]+WALL_START_Y})
      })
      console.log("ANCHORS",ANCHORS)
      console.log("ROWS",ROWS)
    } 
      this.reset()
      this.dragged = false
      Dragging = false
      this.touching = false
    }

    pointerMove(event) {
      if (this.touching){
        placeButtons()
        Dragging = true
        this.y = event.data.global.y + this.deltaTouch.y
        this.dragged = true
      }
    }
  }



  function globalPointerUp(){
    /*
    console.log("global pointer up")
    if (Dragging){
      console.log("dragging")
      ActiveRow.pointerUp()
      Dragging = false
      ROWS.forEach(r=>{
        r.dragged = false
        r.touched = false
        r.sprites.map(s=>{
          s.dragged = false
          s.touched = false})
      })
    }
    */
  }
  
  // Called on resize
  function resize(newFrame,flex){
    // Make sure all layout parameters are up to date.
    updateLayoutParams(newFrame)
    //Row.draw()
  }

  function updateLayoutParams(newFrame){
    let frame;
    if (newFrame){
      frame = newFrame
    } else {
      frame = {width: WINDOW_WIDTH,height: WINDOW_HEIGHT}
    }
  }


  // Loading Script
  function load(){
    let rows = [1,2,3,4,5,6,7,8,9,10,11,12]
    let adjustable
    if (Features){
        rows = Features.values 
        adjustable = Features.adjustable
    } 


    Background = new makeBackground()
    for (let i = 0;i<rows.length;i++){
      let newRow = new Row(0,rows[i],BAR_WIDTH,0)
      newRow.y = i*BAR_HEIGHT + WALL_START_Y
      newRow.x = WALL_START_X
      ANCHORS.push(i*BAR_HEIGHT)
      ROWS.push(newRow)
      app.stage.addChild(newRow)
    }
    ActiveRow = ROWS[0]
    if (adjustable){
      placeButtons()
      app.stage.addChild(MinusButton)
      app.stage.addChild(PlusButton)
    }
    app.stage.addChild(resetButton)
  }

  // Functions attached to app: (need to be destroyed)
  app.resize = (frame) => resize(frame)
  app.resizable = true

  load()
};

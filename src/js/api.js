import * as PIXI from "pixi.js";
import * as CONST from "./const.js";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import { thisExpression } from "@babel/types";
const ASSETS = CONST.ASSETS


export class Draggable extends PIXI.Sprite {
  constructor(texture){
    super()
    this.dragged = false
    this.touching = false
    this.interactive = true
    this.lockX = false 
    this.lockY = false
    this.texture = texture
    this.on('pointerdown',this.pointerDown)
    this.on('pointermove',this.pointerMove)
    this.on('pointerup',this.pointerUp)
    this.on('pointerupoutside',this.pointerUpOutside)
  }

  pointerDown(event){
    this.touching = true
    this.deltaTouch = {
      x: this.x - event.data.global.x,
      y: this.y - event.data.global.y
    }
  }
  
  pointerMove(event){
    if (this.touching){
      if (!this.lockX){
        this.x = event.data.global.x + this.deltaTouch.x
      } 
      if (!this.lockY){
        this.y = event.data.global.y + this.deltaTouch.y
      }
      this.dragged = true
    }
  }

  pointerUp(event){
    this.touching = false
  }
  
  pointerUpOutside(event){
    this.touching = false
  }
}



export class Fraction extends PIXI.Container {
  constructor(n,d,w){
    super()
    console.log("w",w)
    this._width = w
    this.numerator = n+""
    this.denominator = d+""
    this.numDigits = this.numerator.length
    this.denDigits = this.denominator.length 
    this.maxDigits = Math.max(this.numDigits,this.denDigits)
    this.fontSize = w/(this.maxDigits)
    this.compression = 0.9
    this.lineCompression = 20

    if (this.maxDigits == 3){
      this.compression = 0.8
      this.lineCompression = 30
    } else if (this.maxDigits == 2){
      this.compression = 0.7
      this.lineCompression = 25
    }

    // Numerator
    this.N = new PIXI.Text()
    this.N.anchor.x = 0.5
    this.N.x = this._width/2
    this.N.y = 0
    this.N.text = n
    this.N.style.fontSize = this.fontSize
    this.addChild(this.N)

    // Denominator
    this.D = new PIXI.Text()
    this.D.anchor.x = 0.5
    this.D.x = this._width/2
    this.D.y = this.height
    this.D.text = d
    this.D.style.fontSize = this.fontSize
    this.addChild(this.D)

    // Mid Line
    this.L = new PIXI.Graphics()
    this.L.lineStyle(this._width/this.lineCompression,0x000000)
    this.L.lineTo(this._width,0)
    this.L.y = this.height/2
    this.addChild(this.L)

    this.draw(n,d,w)

  }

  draw(n,d,w){
    console.log("n,d")
    this.numerator = n+""
    this.denominator = d+""
    this.numDigits = this.numerator.length
    this.denDigits = this.denominator.length 
    this.maxDigits = Math.max(this.numDigits,this.denDigits)
    this.fontSize = this.width/(this.maxDigits)

    if (this.maxDigits == 3){
      this.compression = 1.5
      this.lineCompression = 30
    } else if (this.maxDigits == 2){
      this.compression = 1.3
      this.lineCompression = 25
    }

    console.log("d",d)
    if (d == 1){
      this.L.alpha = 0
      this.D.alpha = 0
    } else {
      this.L.alpha = 1
      this.D.alpha = 1
    }
    
    // Numerator
    this.N.x = this._width/2
    this.N.y = 0
    this.N.style.fontSize = this.fontSize*this.compression
    this.N.text = n

    // Denominator
    this.D.x = this._width/2
    this.D.y = this.N.height
    this.D.style.fontSize = this.fontSize*this.compression
    this.D.text = d

    // Line
    this.L.lineStyle(this._width/this.lineCompression,0x000000)
    this.L.lineTo(this._width,0)
    this.L.y = this.N.height

    //this.pivot.set(this.width/2,this.height/2)
  }

  set(n,d){
    let nDigits = n.toString().length
    let dDigits = d.toString().length 
    this.numerator = n 
    this.denominator = d
    this.N.text = n
    this.D.text = d
    this.draw(n,d)
  }
}



// TODO: Change this to extended class.
/*
export class NumberLine extends PIXI.Container {
  constructor(width,height,max){
    super()
    this.max = max 
    this.height = height
    this.width = width

    this.ticks = []
    this.labels = []
    this.line = new PIXI.Graphics()

  }


  init = (n) => {
     this.line.lineStyle(LINE_THICKNESS,0x000000)
     this.line.x = LINE_START
     this.line.y = ARENA_HEIGHT/2
     this.line.lineTo(LINE_WIDTH,0)
     app.stage.addChild(this.line)

     for (let i = 0;i<this.max;i++){
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

*/
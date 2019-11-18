import * as PIXI from "pixi.js";
import blueGradient from "../assets/blue-gradient.png";
import * as CONST from "./const.js";
import QuestionMark from '../assets/QuestionMark.png'
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import {Fraction, Draggable} from "./api.js"
import { isObject } from "util";
const ASSETS = CONST.ASSETS


export const init = (app, setup) => {

  // Layout Parameters
  const LINE_PERCENTAGE = 0.8
  let WINDOW_WIDTH = setup.width
  let BAR_HEIGHT = setup.height/15
  let WINDOW_HEIGHT = setup.height
  let H_W_RATIO = setup.height/setup.width
  let LANDSCAPE = H_W_RATIO < 3/4
  let ARENA_WIDTH = LANDSCAPE ? 4/3*setup.height : setup.width
  let ARENA_HEIGHT = LANDSCAPE ? setup.height : 3/4*setup.width
  let SQUARE_DIM = ARENA_HEIGHT*0.6
  let SQUARE_AREA = SQUARE_DIM*SQUARE_DIM
  
  let stencil;
  let Nodes = []
  let CurrentPolygon = []
  let fraction;

    // Constants
  const BLUE_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.GLASS_CIRCLE)
  const DOT_TEXTURE = new PIXI.Texture.from(ASSETS.GLASS_CIRCLE)

  function makeBackground(){
    // Setup Background
    this.sprite = new PIXI.Sprite.from(CONST.ASSETS.BLUE_GRADIENT);
    this.sprite.width = WINDOW_WIDTH
    this.sprite.height = WINDOW_HEIGHT
    this.sprite.x = 0;
    this.sprite.y = 0;
    this.sprite.interactive = true

    app.stage.addChild(this.sprite)

    this.draw = () => {
        this.sprite.width = WINDOW_WIDTH
        this.sprite.height = WINDOW_HEIGHT
    }
  }

  class Stencil extends PIXI.Graphics {
    constructor(){
      super()
    }

    draw(nodes){
      console.log("draw called")

      console.log("nodes",nodes)
      this.clear()
      this.lineStyle(4,0xff3b55)
      this.moveTo(nodes[0][0],nodes[0][1])
      for (let n of nodes){
        let x = n[0]
        let y = n[1]
        this.lineTo(x,y)
      }
    }
  }

  function linesIntersect(l1,l2){
    let m1 = l1.m
    let m2 = l2.m 
    let b1 = l1.b
    let b2 = l2.b

    let xIntersect = (m1 - m2)/(b2-b1)
    let yIntersect = l1.yOf(xIntersect)
    
    let inYRange1 = (yIntersect > l1.yMin) && (yIntersect < l1.yMax)
    let inXRange1 = (xIntersect > l1.xMin) && (yIntersect < l1.xMax)
    let inYRange2 = (yIntersect > l2.yMin) && (yIntersect < l2.yMax)
    let inXRange2 = (xIntersect > l2.xMin) && (xIntersect < l2.xMax)
    
    return (inXRange1 && inXRange2 && inYRange1 && inYRange2)
  }



  /*
  function intersects(lineOnePointPair,lineTwoPointPair){
    let x11 = lineOnePointPair[0][0]
    let y11 = lineOnePointPair[0][1]
    let x21 = lineOnePointPair[1][0]
    let y21 = lineOnePointPair[1][1]
    let x12 = lineTwoPointPair[0][0]
    let y12 = lineTwoPointPair[0][1]
    let x22 = lineTwoPointPair[1][0]
    let y22 = lineTwoPointPair[1][1]

    let yMax1 = Math.max(y11,y21)
    let yMin1 = Math.min(y11,y21)
    let xMax1 = Math.max(x11,x21)
    let xMin1 = Math.min(x11,x21)

    let yMax2 = Math.max(y12,y22)
    let yMin2 = Math.min(y12,y22)
    let xMax2 = Math.max(x12,x22)
    let xMin2 = Math.min(x12,x22)


    let m1 = (y21 - y11)/(x21-x11)
    let m2 = (y22 - y12)/(x22-x12)
    let b1 = y11 - m1*x11
    let b2 = y12 - m2*x12
    
    const y1 = x=>m1*x+b1
    const y2 = x=>m2*x+b2

    let xIntersect = (m1 - m2)/(b2-b1)
    let yIntersect = y1(xIntersect)
    
    let inYRange1 = (yIntersect > yMin1) && (yIntersect < yMax1)
    let inXRange1 = (xIntersect > xMin1) && (yIntersect < xMax1)
    let inYRange2 = (yIntersect > yMin2) && (yIntersect < yMax2)
    let inXRange2 = (xIntersect > xMin2) && (xIntersect < xMax2)
    
    return (inXRange1 && inXRange2 && inYRange1 && inYRange2)

  }
  */

  class Line {
    constructor(p1,p2){
      this.x1  = p1[0]
      this.y1 = p1[1]
      this.x2  = p2[0]
      this.y2 = p2[1]
  
      this.yMax = Math.max(this.y1,this.y2)
      this.yMin = Math.min(this.y1,this.y2)
      this.xMax = Math.max(this.x1,this.x2)
      this.xMin = Math.min(this.x1,this.x2)

      this.p1 = p1
      this.p2 = p2

      this.m = (this.y2-this.y1)/(this.x2-this.x1)
      this.b = this.y1 - this.m*this.x1
    }

    yOf(x){
      return this.m*x+this.b
    }

    xOf(y){
      return (y-this.b)/this.m
    }

  }

  function polyToLines(poly){
      let n = poly.length
      let lines = poly.map((p,i)=>{
        return  new Line(p,poly[(i+1)%n])
      })
  }

  function doesNewLineCrossCurrentLines(lines,newLine){
    let contains = false
    lines.forEach(l => {
      if (linesIntersect(l,newLine)){
        return true
      }
    })
    return contains
  }


  class Node extends PIXI.Sprite {
    constructor(){
      super()
      this.on('pointerdown',this.pointerDown)
      this.on('pointerup',this.pointerUp)
      this.on('pointerupoutside',this.pointerUpOutside)
      this.anchor.set(0.5)
      this.activated = false
      this.interactive = true
      this.texture = DOT_TEXTURE
    }

    pointerDown(){
      if (this.first){
        this.first = false
        stencil.clear()
        this.generatePolygon()
      } else {
        if (CurrentPolygon.length == 0){
          this.first = true
        }
        CurrentPolygon.push([this.x,this.y])
        this.activated = true
        this.scale.x = this.scale.x*1.2
        this.scale.y = this.scale.y*1.2
        stencil.draw(CurrentPolygon)
        app.stage.addChild(this)
      }
    }

    pointerUpOutside(){

    }

    pointerUp(){
      
    }

    generatePolygon(){
      Nodes.forEach(n=>{
        if (n.activated){
          n.scale.x = n.scale.x/1.2
          n.scale.y = n.scale.y/1.2
          n.activated = false
        }
      })

      let xS = CurrentPolygon.map(p=> p[0])
      let yS = CurrentPolygon.map(p=> p[1])
      let minX = Math.min(...xS)
      let minY = Math.min(...yS)

      let flatPolygon = []
      CurrentPolygon.forEach(p=>{
        flatPolygon.push(p[0]-minX)
        flatPolygon.push(p[1]-minY)
      })

      let a = polygonArea(CurrentPolygon)/SQUARE_AREA
      let f = decimalToFrac(a)
      console.log("polyarea",a)
      console.log("areatofrac",decimalToFrac(a))

      fraction.set(f[0],f[1])
      

      var graphics = new PIXI.Graphics();
      graphics.beginFill(0xff3b55);
      graphics.lineStyle(2,0xffffff)
      graphics.drawPolygon(flatPolygon);
      graphics.endFill();

      let d = new Draggable()
      d.hitArea = new PIXI.Polygon(flatPolygon)
      let t = app.renderer.generateTexture(graphics)
      d.texture = t
      d.x = minX
      d.y = minY
      app.stage.addChild(d)   
    }
  }

  function set(a,b){
    let dx = SQUARE_DIM/(a-1)
    let dy = SQUARE_DIM/(b-1)
    let dim = SQUARE_DIM/15
    for (let i=0;i<a;i++){
      for (let j=0;j<a;j++){
        let n = new Node()
        Nodes.push(n)
        n.x = WINDOW_WIDTH/2 - SQUARE_DIM/2 + i*dx 
        n.y = WINDOW_HEIGHT/2 - SQUARE_DIM/2+j*dy
        n.w = dx/10
        n.height = dim
        n.width = dim
        app.stage.addChild(n)
      }
    }
  }


  function decimalToFrac(dec){
    for (let i=1;i<100;i++){
      for (let j=0;j<=i;j++){
        if (Math.abs(j/i - dec) < 0.001) {
          return [j,i]
        }
      }
    }
  }

  // Called on resize
  function resize(newFrame,flex){
    // Make sure all layout parameters are up to date.
    updateLayoutParams(newFrame)
    app.renderer.resize(WINDOW_WIDTH,WINDOW_HEIGHT)
  }


  function polygonArea(poly) {
     let area = 0
     let xS = poly.map(p=> p[0])
     let yS = poly.map(p=> p[1])
 
      // Calculate value of shoelace formula 
      let n = poly.length
      let j = n - 1 
      for (let i = 0; i < n; i++) { 
          area = area + (xS[j] + xS[i]) * (yS[j] - yS[i]);
          j = i;  // j is previous vertex to i 
      } 
    
      // Return absolute value 
      return Math.abs(area / 2)
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
  }

  // Loading Script
  function load(){
    console.log('load called')
    let features = {}
    if (setup.props.features){
      features = setup.props.features
    }

    let backGround = new makeBackground()

    set(4,4)


    fraction = new Fraction(0,1,100)
    fraction.x = SQUARE_DIM/10
    fraction.y = SQUARE_DIM/10
    app.stage.addChild(fraction)

    stencil = new Stencil()
    stencil.lineStyle(4,0xff3b55)
    stencil.x = 0 
    stencil.y = 0
    app.stage.addChild(stencil)

    let l1 = new Line([0,0],[100,100])
    let l2 = new Line([0,100],[100,0])
    console.log("do these intersect?",linesIntersect(l1,l2))

    stencil.lineTo(100,100)
    stencil.moveTo(0,100)
    stencil.lineTo(100,0)

  }

  // Call load script
  load()
  // Not sure where else to put this.
  app.resize = (frame) => resize(frame)
  app.resizable = true
};

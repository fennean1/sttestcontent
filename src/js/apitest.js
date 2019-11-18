import * as PIXI from "pixi.js";
import blueGradient from "../assets/blue-gradient.png";
import * as CONST from "./const.js";
import QuestionMark from '../assets/QuestionMark.png'
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import {Fraction, Draggable} from "./api.js"
const ASSETS = CONST.ASSETS


export const init = (app, setup) => {
 

  // Constants
  const BLUE_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.BLUE_CIRCLE)
  const PIN_TEXTURE = new PIXI.Texture.from(ASSETS.SHARP_PIN)
  const LINE_PERCENTAGE = 0.8

  // Layout Parameters
  let WINDOW_WIDTH = setup.width
  let BAR_HEIGHT = setup.height/15
  let WINDOW_HEIGHT = setup.height
  let H_W_RATIO = setup.height/setup.width
  let LANDSCAPE = H_W_RATIO < 3/4
  let ARENA_WIDTH = LANDSCAPE ? 4/3*setup.height : setup.width
  let ARENA_HEIGHT = LANDSCAPE ? setup.height : 3/4*setup.width
  
  // Called on resize
  function resize(newFrame,flex){
    // Make sure all layout parameters are up to date.
    updateLayoutParams(newFrame)
    app.renderer.resize(WINDOW_WIDTH,WINDOW_HEIGHT)
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
    let features = {}
    if (setup.props.features){
      features = setup.props.features
    }



    let f = new Fraction(3,400,100)
    f.x = 100 
    f.y = 100
    app.stage.addChild(f)
    let f2 = new Fraction(3,4,100)
    f2.x = 350 
    f2.y = 100
    app.stage.addChild(f2)
    let f3 = new Fraction(3,40,100)
    f3.x = 600 
    f3.y = 100
    app.stage.addChild(f3)

    let d = new Draggable(PIN_TEXTURE)
    app.stage.addChild(d)
    d.lockX = true
    d.on('pointerdown',()=>{console.log("poop")})


  }

  // Call load script
  load()
  // Not sure where else to put this.
  app.resize = (frame) => resize(frame)
  app.resizable = true
};

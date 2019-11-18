import * as PIXI from "pixi.js";
import * as CONST from "./const.js";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import { BottomNavigation } from "@material-ui/core";

export const init = (app, setup) => {

  // Constants
  const BLUE_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.BLUE_CIRCLE)
  const RED_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.RED_CIRCLE)
  const EMPTY_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.EMPTY_CIRCLE)
  const LOCK_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.LOCKED_LOCK)
  const UNLOCK_TEXTURE = new PIXI.Texture.from(CONST.ASSETS.UNLOCKED_LOCK)

 // State - can be used to reconstruct the app at any point in time.
  let state = {
    pivot: null,
    val: 0,
  }

  // default setting for features
  let features = {'lock': true,'regroup':false}

  // Parameters (Only changes on resize)
  let H_W_RATIO = setup.height/setup.width
  let WINDOW_WIDTH = setup.width
  let WINDOW_HEIGHT = setup.height
  let LANDSCAPE = H_W_RATIO < 3/4
  let ARENA_WIDTH = LANDSCAPE ? 4/3*setup.height : setup.width
  let ARENA_HEIGHT = LANDSCAPE ? setup.height : 3/4*setup.width
  let GRID_HEIGHT = 0.75*WINDOW_HEIGHT
  let GRID_WIDTH = GRID_HEIGHT

  // Entities - objects that appear on screen
  let lockButton;
  let backGround;
  let plusOneButton;
  let plusTenButton;
  let minusTenButton;
  let minusOneButton;
  let gridCounters;  // Circles that represent numbers
  let gridNodes;  // Placeholders / small dots
  let zeroButton;
  let TEXTURES = [RED_TEXTURE,BLUE_TEXTURE]
  let alternator = false
  let sum = 0 

  let operationSequence = []
 
  // Constructors (should not be called on re-draw)
  // START HERE: Let's try ot make this grid a container object and give it a redraw property.


  function makeGridNodes(dim){
      this.grid = []
      // State: Texture: {Hollow,Blue,Red,None} , Hidden: {True,False}
      for (let i = 0;i<dim;i++){
        let row = []
        for (let j = 0;j<dim;j++) {
          let newNode = new PIXI.Graphics()
          app.stage.addChild(newNode)
          row.push(newNode)
        }
        this.grid.push(row)
     }
     // Draw function
      this.draw = () => {
        let dx = GRID_WIDTH/dim
        let dy = dx
        let w = dx/5
        let h = w
        this.grid.map((r,i)=>{
          r.map(((e,j)=>{
            let x = WINDOW_WIDTH/2 - GRID_WIDTH/2 + dx*j + dx/4
            let y = WINDOW_HEIGHT/2 + dim/2*dy - dy*i
            e.clear()
            e.beginFill(0x000000)
            e.drawCircle(x,y,w/2)
          }))
        })
      }
      this.draw()
  }

  function makeGridCounters(dim){
    this.grid = []
    // State: Texture: {Hollow,Blue,Red,None} , Hidden: {True,False}
    for (let i = 0;i<dim;i++){
      let row = []
      for (let j = 0;j<dim;j++) {
        let newCounter = new PIXI.Sprite()
        newCounter.texture = null
        newCounter.anchor.set(0.5)
        app.stage.addChild(newCounter)
        row.push(newCounter)
      }
      this.grid.push(row)
   }
   // Draw function
    this.draw = () => {
      let dx = GRID_WIDTH/dim
      let dy = dx
      let w = dx
      let h = w
      this.grid.map((r,i)=>{
        r.map(((e,j)=>{
          let x = WINDOW_WIDTH/2 - GRID_WIDTH/2 + dx*j + dx/4
          let y = WINDOW_HEIGHT/2 + dim/2*dy - dy*i
          e.x = x 
          e.y = y
          e.width = w
          e.height = h
        }))
      })
    }
    this.draw()
}

  function getLockButton(){
    let btn  = new PIXI.Sprite.from(CONST.ASSETS.UNLOCKED_LOCK)

    btn.draw = () => {
      let w = GRID_WIDTH/8
      let h = w*0.8
      btn.x = WINDOW_WIDTH/2 - 1.10*GRID_WIDTH/2 + -w
      btn.y = 0
      btn.width = w
      btn.height = h
    } 

    btn.interactive = true
    btn.on('pointerdown',()=>{
      setPivot()
    })
    btn.draw()
    return btn;
  }

  function getZeroButton(){
    let btn  = new PIXI.Sprite.from(CONST.ASSETS.ZERO_OUT)

    btn.draw = () => {
      let w = GRID_WIDTH/8
      let h = w*0.8
      btn.x = WINDOW_WIDTH/2 + 1.10*GRID_WIDTH/2 
      btn.y = 0
      btn.width = w
      btn.height = h
    } 

    btn.interactive = true
    btn.on('pointerdown',()=>{
      state.val = 0
      state.pivot = null
      sum = 0
      operationSequence = []
      updateGrid(0)
      gridCounters.grid.forEach(r => {
        r.forEach(e=>e.texture = null)
      });
    })
    btn.draw()
    return btn;
  }



  function getPlusTenButton(){
    let btn  = new PIXI.Sprite.from(CONST.ASSETS.PLUS_FIVE)

    btn.draw = () => {
      let w = GRID_WIDTH/4
      let h = w/2
      btn.x = WINDOW_WIDTH/2 - 1.10*GRID_WIDTH/2 + 3*w
      btn.y = 0
      btn.width = w
      btn.height = h
    } 

    btn.interactive = true
    btn.on('pointerdown',()=>
    {
      btn.interactive = false
      setTimeout(()=>{
        btn.interactive = true
      },100)
    updateGrid(5)
    })
    btn.draw()
    return btn;
  }

  function getPlusOneButton(){
    let btn  = new PIXI.Sprite.from(CONST.ASSETS.PLUS_THREE)

    btn.draw = () => {
      let w = GRID_WIDTH/4
      let h = w/2
      btn.x = WINDOW_WIDTH/2 - 1.10*GRID_WIDTH/2 + 2*w
      btn.y = 0
      btn.width = w
      btn.height = h
    } 

    btn.interactive = true
    btn.on('pointerdown',() => {
      btn.interactive = false
      setTimeout(()=>{
        btn.interactive = true
      },100)
      updateGrid(3)})
    btn.draw()
    return btn;
  }

  function getMinusTenButton(){
    let btn  = new PIXI.Sprite.from(CONST.ASSETS.MINUS_FIVE)

    btn.draw = () => {
      let w = GRID_WIDTH/4
      let h = w/2
      btn.x = WINDOW_WIDTH/2 - 1.10*GRID_WIDTH/2
      btn.y = 0
      btn.width = w
      btn.height = h
    } 

    btn.interactive = true
    btn.on('pointerdown',()=>{
      btn.interactive = false
      setTimeout(()=>{
        btn.interactive = true
      },100)
      updateGrid(-5)})
    btn.draw()
    return btn;
  }

  function getMinusOneButton(){
    let btn  = new PIXI.Sprite.from(CONST.ASSETS.MINUS_THREE)

    btn.draw = () => {
      let w = GRID_WIDTH/4
      let h = w/2
      btn.x = WINDOW_WIDTH/2 - 1.10*GRID_WIDTH/2 + w
      btn.y = 0
      btn.width = w
      btn.height = h
    } 

    btn.interactive = true
    btn.on('pointerdown',()=>{
      btn.interactive = false
      setTimeout(()=>{
        btn.interactive = true
      },100)
      updateGrid(-3)})
    btn.draw()
    return btn;
  }

  // Called on resize
  function resize(newFrame){
    
    let frame;
    if (newFrame){
      frame = newFrame
    } else {
      frame = {width: WINDOW_WIDTH,height: WINDOW_HEIGHT}
    }
    WINDOW_WIDTH = frame.width
    WINDOW_HEIGHT = frame.height
    // Recompute
    H_W_RATIO= newFrame.height/newFrame.width
    LANDSCAPE = H_W_RATIO < 3/4
    ARENA_WIDTH = LANDSCAPE ? 4/3*newFrame.height : newFrame.width
    ARENA_HEIGHT = LANDSCAPE ? newFrame.height : 3/4*newFrame.width
    GRID_HEIGHT = 0.75*WINDOW_HEIGHT
    GRID_WIDTH = GRID_HEIGHT

    // Set
    backGround.width = WINDOW_WIDTH
    backGround.height = WINDOW_HEIGHT
    app.renderer.resize(WINDOW_WIDTH,WINDOW_HEIGHT)
    gridNodes.draw()
    gridCounters.draw()
    lockButton.draw()
    plusOneButton.draw()
    minusOneButton.draw()
    minusTenButton.draw()
    plusTenButton.draw()
    zeroButton.draw()


  }

  // Actions
  function setPivot(){
    console.log("state.pivot",state.pivot)
    if (state.pivot != null){
      console.log("unlocking")
      state.pivot = null
      lockButton.texture = UNLOCK_TEXTURE
      updateGrid(0)
    } else {
      console.log("locking")
      state.pivot = state.val
      lockButton.texture = LOCK_TEXTURE
    }
  }


function updateGrid(inc){
  if (features['regroup']==true){
    updateGridTwo(inc)
  } else {
    updateGridOne(inc)
  }
}

  function updateGridOne(inc){
    let newVal = state.val + inc 
    if (newVal >= 0 && newVal <= 25) {
      state.val = newVal
      let {pivot,val} = state
      let count = 0
      gridCounters.grid.map((row,i)=>{
        row.map((e,j)=>{
          count += 1
        if (count <= val && !pivot) {
            e.texture = BLUE_TEXTURE
        } else if (count <= val && count <= pivot){
            e.texture = BLUE_TEXTURE
        } else if (count <= val && count >= pivot) {
            e.texture = RED_TEXTURE
        } else if (count >= val && count <= pivot){
          e.texture = EMPTY_TEXTURE
        } else {
          e.texture = null
        }
        })
      })
    }
  }

  function updateGridTwo(inc){
    let newVal = state.val + inc

    if (newVal < state.pivot && state.val >= state.pivot){
      const w = lockButton.width
      const h = lockButton.height
      let timeline = new TimelineLite()
        timeline.to(lockButton,0.06,{width: 1.3*w,height:1.3*h})
                .to(lockButton,0.06,{width: w,height: h})
    } else {
      if (newVal >= 0 && newVal <= 100) {
        // Switch only when it crosses

        state.val = newVal
        let onesInNewVal = state.val%10
        let tensInNewVal = state.val-onesInNewVal
        let onesInPivot = state.pivot%10
        let tensInPivot = state.pivot-onesInPivot
        let difference = Math.abs(state.pivot - state.val)
        let onesInDifference = difference%10
        let tensInDifference = difference - onesInDifference
        let count = 0
        let {pivot,val} = state
        gridCounters.grid.map((row,i)=>{
          row.map((e,j)=>{
            count += 1
          if (count <= val && pivot == null) {
              e.texture = BLUE_TEXTURE
              console.log("first")
          } else if (count <= tensInPivot){
              e.texture = BLUE_TEXTURE
          } else if (count <= tensInDifference+tensInPivot){
            e.texture = RED_TEXTURE
          } else if (count <= tensInDifference+tensInPivot+onesInPivot){
            e.texture = BLUE_TEXTURE
          } else if (count <= newVal){
            e.texture = RED_TEXTURE
          }
          else {
            e.texture = null
          }
          })
        })
      }
    }
}


function updateGridThree(inc){
  let newVal = state.val + inc 
  if (inc > 0 && state.val == sum){
    operationSequence.push(inc)
    sum = operationSequence.reduce((a,b)=>{return a+b})
  } 
  console.log('Stateval',state.val)
  console.log('sum',sum)
  if (newVal >= 0 && newVal <= 25) {
    state.val = newVal
    let {pivot,val} = state
    let count = 0
    let benchmark = 0
    let k = 0
    console.log("operation sequence",operationSequence)
    gridCounters.grid.map((row,i)=>{
      row.map((e,j)=>{
        count += 1
        let val = operationSequence[k]
        // Switch color logic
        if (count > benchmark && count <= val+benchmark){
          benchmark = benchmark + val 
          k = k+1
          console.log("k",k)
        }
        // 
        if (count <= sum){
          e.texture = TEXTURES[k%2]
          if (count <= sum && count > state.val ){
            e.alpha = 0.3
          } else {
            e.alpha = 1
          }
        }
      })
    })
  }
}


  // Loading Script
  function load(){
    if (setup.props.features){
      features = setup.props.features
    }

    // Setup Background
    backGround = new PIXI.Sprite.from(CONST.ASSETS.BLUE_GRADIENT);
    backGround.width = WINDOW_WIDTH
    backGround.height = WINDOW_HEIGHT
    backGround.x = 0;
    backGround.y = 0;
    backGround.interactive = true
    backGround.on('pointerdown',updateGrid)
    app.stage.addChild(backGround)

    // Initialize counters
    gridNodes = new makeGridNodes(5)
    gridCounters = new makeGridCounters(5)

    zeroButton = getZeroButton()
    app.stage.addChild(zeroButton)

    plusTenButton = getPlusTenButton()
    app.stage.addChild(plusTenButton)

    plusOneButton = getPlusOneButton()
    app.stage.addChild(plusOneButton)

    minusTenButton = getMinusTenButton()
    app.stage.addChild(minusTenButton)

    minusOneButton = getMinusOneButton()
    app.stage.addChild(minusOneButton)

    lockButton = getLockButton()
    if (features['lock']){
      app.stage.addChild(lockButton)
    }
    
  }
  // Call load script
  load()
  // Resize assignment
  app.resize = (frame) => resize(frame)
  app.resizable = true
};

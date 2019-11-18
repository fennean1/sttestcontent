function rotate(cords){
  return cords.map(e => [-e[1],e[0]])
}

function offset(cords,delta) {
  return cords.map(e => {
    return [e[0]-delta[0],e[1]-delta[1]]
  })
}

function drawDots() {
  let c = new PIXI.Graphics()
  c.beginFill(0x4d5259);
  c.drawCircle(3, 3, 3);
  c.endFill();
  let cT = tiler.renderer.generateTexture(c)
  let cS = new PIXI.Sprite(cT)
  cS.on('pointerdown',onNodeClicked)
  cS.x = dx*i
  cS.y = dx*j
}

let countOutside = 0

function isTiled(container,polygons) {

  let isTiled = true
  let dx = container.width/12
  let dy = container.height/12

  console.log("dx,dy",dx,dy)
  console.log("polygoncords1",polygons[0].polyCords)
  console.log("polygons.count",polygons.length)
  console.log("container top left",[container.x-container.width,container.y-container.height])

  // CAREFUL! this assumes that the container is anchored at the center
  let oX = container.x - container.width/2
  let oY = container.y - container.height/2

  console.log("oX,oY",container.width,container.height)

  let testPoints =[]

  for (let i = 0;i<12;i++) {
    for (let j = 0;j<12;j++) {
      let testPoint = [oX+dx/2+i*dx,oY+dy/2+j*dy]
        testPoints.push(testPoint)
        let c = new PIXI.Graphics()
        c.beginFill(0x4d5259);
        c.drawCircle(3, 3, 3);
        c.endFill();
        let cT = tiler.renderer.generateTexture(c)
        let cS = new PIXI.Sprite(cT)
        cS.on('pointerdown',onNodeClicked)
        cS.x = oX+dx/2+i*dx-3
        cS.y = oY+dy/2+j*dy-3
        tiler.stage.addChild(cS)
    }
  }
  let recentered = []
  testPoints.forEach(e => {
    let inAPoly = false
    for (let p of polygons){
      recentered = [e[0]-p.x,e[1]-p.y]
      if (isPointInPoly(recentered,p.polyCords)) {
        console.log("In a poly set to true")
        inAPoly = true
      }
    }

   if (!inAPoly){
     countOutside += 1
    isTiled = false
   }
})
  console.log("isTiled",isTiled)
  console.log("countOutside",countOutside)
  countOutside = 0
  return isTiled
}

function flipX(cords,x){

}

function flipY(cords,y) {

}

function maxX(cords){

}

function maxY(cords){

}

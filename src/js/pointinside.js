// point = [xi,yi]

function yi(m,b,yMin,yMax,p1,p2) {
   this.p1 = p1
   this.p2 = p2
   this.yMin = yMin
   this.yMax = yMax
   this.yVal = x => m*x+b
   this.isVertical = isNaN(m) ? true : false
   this.isHorizontal = m == 0 ? true : false
}

function isPointInPoly(point,poly)  {

let Y = []
let count = poly.length

for (var i=0;i<count;i++) {

    let p1 = poly[i%count]
    let p2 = poly[(i+1)%count]

    let x1 = p1[0]
    let y1 = p1[1]

    let x2 = p2[0]
    let y2 = p2[1]

    let m = (y2-y1)/(x2-x1)
    let b = y1-m*x1

    let yMin = Math.min(y1,y2)
    let yMax = Math.max(y1,y2)

    let y = new yi(m,b,yMin,yMax,p1,p2)

     Y.push(y)
}

let numberOfIntersectionPoints = 0

for (var j=0;j<Y.length;j++) {
    let yi = Y[j]
    let yVal = yi.yVal(point[0])
    let xMax = Math.max(yi.p1[0],yi.p2[0])
    let xMin = Math.min(yi.p1[0],yi.p2[0])

if (yi.isHorizontal) {
  if (yi.yMin >= point[1])  {
    if (xMin < point[0] && point[0] < xMax) {
      numberOfIntersectionPoints += 1
    }
  }
} else if (yi.isVertical) {
  if (xMin <= point[0] && point[0] <= xMax) {
    if (point[1] < yi.yMax) {
      numberOfIntersectionPoints += 1
    }
  }
} else if (yVal >= point[1]) {
  if (yi.yMin <= yVal && yVal <= yi.yMax) {
    numberOfIntersectionPoints += 1
  }
  else if (yVal == point[1]){
    console.log("ON THE LINE!")
    return true
  }
}

}
return numberOfIntersectionPoints%2 == 0 ? false : true
}

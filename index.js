var dsxTween = new Tween(5, 105, 2000, 'quintInOut', 'loop')
var dsyTween = new Tween(5, -4.5, 2000, 'quintInOut', 'loop')
var rotateTween = new Tween(0, 2 * 3.14159265, 50000, 'linear', 'repeat')

var CAPTURE_MAX_SECONDS = 8
var canvas
var capturer

// Create a capturer that exports a WebM video
if (CCapture) {
  capturer = new CCapture({
    format: 'webm',
    framerate: 60,
    verbose: true,
    timeLimit: CAPTURE_MAX_SECONDS
  })
}

function setup() { 
  createCanvas(window.innerWidth, window.innerHeight)
  spiral = new Spiral();
  var gui = new dat.GUI();
  gui.add(spiral, 'points', 0, 2000)
  gui.add(spiral, 'angle', 0, 20)
  gui.add(spiral, 'skipEvery', 0, 30).step(1) 
  gui.add(spiral, 'offset', 0, 200)
  gui.add(spiral, 'zoom', 0, 20)
  gui.add(spiral, 'dotSizeChangeRate', 0, 0.5)
  gui.add(spiral, 'distChangeRate', 0, 1)
  gui.add(spiral, 'dotSizeX', 0, 20)
  gui.add(spiral, 'dotSizeY', 0, 20)
  gui.add(spiral, 'rotate')
  gui.add(spiral, 'fadeIn')
  gui.add(spiral, 'fadeOut')
  
  // gui.onChange = function (f) {
  //   var i, j;
  //   for (i in this.__controllers) this.__controllers[i].onChange (f);
  //   for (i in this.__folders) for (j in this.__folders[i].__controllers) this.__folders[i].__controllers[j].onChange (f);
  // }
  // // only redraw on change
  // noLoop()
  // gui.onChange(draw)

  canvas = document.getElementById("defaultCanvas0")
} 

function draw() { 
  background(0)
  spiral.render()
  if (capturer) capturer.capture(canvas)
}

function Spiral() {
  this.points = 260
  this.dotSizeX = 3
  this.dotSizeY = 3
  this.dotSizeChangeRate = 0
  this.radius = 8
  this.angle = 1.1
  this.distChangeRate = 0.42
  this.zoom = 15
  this.offset = 0
  this.skipEvery = 0
  this.rotate = false
  this.fadeIn = true
  this.fadeOut = true
  
  this.render = function() {
    push()
    translate(width/2, height/2)
    if (this.rotate) rotate(rotateTween.getValue())
    for (var i=0; i<this.points; i++){
      if (i < this.offset) continue
      if (this.skipEvery && i % this.skipEvery === 0) continue
      push();
      noStroke()
      let opacity = 1
      if (this.fadeIn) opacity = opacity - (i < (100+this.offset) ? 1 - i/(100+this.offset) : 0)
      if (this.fadeOut) opacity = opacity - ((i / this.points)) 

      // fill(`rgba(100, 100, 200, ${opacity})`)
      fill(`rgba(255, 255, 255, ${opacity})`)
      rotate(i * this.angle);
      const dist = Math.pow(i, this.distChangeRate) * this.zoom;
      const dotSizeX = dsxTween.getValue() * Math.pow(i, this.dotSizeChangeRate) * this.dotSizeX
      const dotSizeY = dsyTween.getValue() * Math.pow(i, this.dotSizeChangeRate) * this.dotSizeY
      ellipse(0, dist, dotSizeX, dotSizeY);
      pop();
    }
  	pop()
  }
}


var CAPTURE_MAX_SECONDS = 8
var canvas
var capturer
var mic

const tweens = {
  linear_1s: new Tween(0, 1, 1000, 'linear', 'loop'),
  linear_2s: new Tween(0, 1, 2000, 'linear', 'loop'),
  linear_3s: new Tween(0, 1, 3000, 'linear', 'loop'),
  quintInOut_1s: new Tween(0, 1, 1000, 'quintInOut', 'loop'),
  quintInOut_2s: new Tween(0, 1, 2000, 'quintInOut', 'loop'),
  quintIn_1s: new Tween(0, 1, 1000, 'quintIn', 'loop')
}

// TODO: remove/refactor to use the above tweens
var dsxTween = new Tween(1, 100, 2000, 'quintInOut', 'loop')
var dsyTween = new Tween(1, 10, 3000, 'quintInOut', 'loop')
var rotateTween = new Tween(0, 2 * 3.14159265, 50000, 'linear', 'repeat')

const controllers = [
  null,
  'mic',
  ...Object.keys(tweens)
]

const getValue = (controller, min, max) => {
  if (controller === 'mic') {
    return min + (mic.getLevel() * (max - min))
  } else if (Object.keys(tweens).includes(controller)){
    const tween = tweens[controller]
    return min + (tween.getValue() * (max - min))
  } else {
    return (max + min) / 2 
  }
}

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
  var gui = new dat.GUI()

  mic = new p5.AudioIn()
  mic.start()

  // points
  gui.add(spiral, 'points', 0, 2000)
  // angle
  gui.add(spiral, 'angleMin', 0, 90)
  gui.add(spiral, 'angleMax', 0, 90)
  gui.add(spiral, 'angleController', controllers)
  // offset 
  gui.add(spiral, 'offsetMin', 0, 300)
  gui.add(spiral, 'offsetMax', 0, 300)
  gui.add(spiral, 'offsetController', controllers)

  gui.add(spiral, 'zoom', 0, 50)
  gui.add(spiral, 'dotSizeChangeRate', -0.5, 0.5).step(0.01)
  gui.add(spiral, 'distChangeRate', 0, 1)

  gui.add(spiral, 'dotWidthMin', 0, 120)
  gui.add(spiral, 'dotWidthMax', 0, 120)
  gui.add(spiral, 'dotWidthController', controllers)

  gui.add(spiral, 'dotHeightMin', 0, 120)
  gui.add(spiral, 'dotHeightMax', 0, 120)
  gui.add(spiral, 'dotHeightController', controllers)

  gui.add(spiral, 'rotate')
  gui.add(spiral, 'fadeIn')
  gui.add(spiral, 'fadeOut')
  gui.add(spiral, 'energy', 0, 2)
  gui.addColor(spiral, 'colour')
  // gui.add(spiral, 'skipEvery', 0, 30).step(1)

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

  this.dotWidthMin = 3
  this.dotWidthMax = 3
  this.dotWidthController = null

  this.dotHeightMin = 3
  this.dotHeightMax = 3
  this.dotHeightController = null

  this.dotSizeChangeRate = 0
  this.radius = 8

  this.angleMin = 40
  this.angleMax = 40
  this.angleController = null

  this.offsetMin = 0
  this.offsetMax = 0
  this.offsetController = null

  this.distChangeRate = 0.42
  this.zoom = 15
  this.rotate = false
  this.fadeIn = true
  this.fadeOut = true
  this.energy = 0
  this.colour = [0, 0, 255]
  
  this.render = function() {
    const angle = getValue(this.angleController, this.angleMin, this.angleMax) 
    const offset = getValue(this.offsetController, this.offsetMin, this.offsetMax)
    const dotWidth = getValue(this.dotWidthController, this.dotWidthMin, this.dotWidthMax)
    const dotHeight = getValue(this.dotHeightController, this.dotHeightMin, this.dotHeightMax)
    
    push()
    translate(width/2, height/2)
    if (this.rotate) rotate(rotateTween.getValue())
    for (var i=0; i<this.points; i++){
      const [angleNoise, distNoise] = [
        1 + 0.001 * this.energy * (Math.random() - 0.5),
        1 + 0.1 * this.energy * (Math.random() - 0.5)
      ]
      if (i < offset) continue
      // if (this.skipEvery && i % this.skipEvery === 0) continue
      push();
      noStroke()
      let opacity = 1
      if (this.fadeIn) opacity = opacity - (i < (100+offset) ? 1 - i/(100+offset) : 0)
      if (this.fadeOut) opacity = opacity - ((i / this.points)) 

      // fill(`rgba(100, 100, 200, ${opacity})`)
      const [r, g, b] = this.colour
      const str = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${opacity})`

      fill(color(str))

      rotate(i * angle * angleNoise)

      const dist = (Math.pow(i, this.distChangeRate) - 1) * this.zoom;
      ellipse(
        0,
        dist * distNoise,
        dotWidth * Math.pow(i, this.dotSizeChangeRate),
        dotHeight * Math.pow(i, this.dotSizeChangeRate)
      )
      pop();
    }
  	pop()
  }
}


// Makes animations.

//import {CanvasRecorder} from './CanvasRecorder.js';

class SpriteMap {
  constructor(img, w, h, c, r, x0, y0) {
    this.img = img;
    this.c = c;
    this.r = r;
    this.w = w;
    this.h = h;
    this.x0 = x0;
    this.y0 = y0;
  }
}

class Sprite {
  x = 0;
  y = 0;
  r = 0;
  c = 0;

  constructor(map) {
    this.map = map;
  }

  draw(ctx, frame) {
    const {map} = this;
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    ctx.drawImage(map.img, this.c * map.w + map.x0, this.r * map.h + map.y0,
                  map.w, map.h, x, y, map.w, map.h);
  }
}

class FrameSprite extends Sprite {
  frame = 0;
  frames = 8;

  moveTo(x, y, f = this.frame) {
    this.x = x;
    this.y = y;
    this.frame = f;
  }

  move(dx, dy, df = 1) {
    this.x += dx;
    this.y += dy;
    this.frame += df;
    if (!(this.frame % this.frames)) {
      this.r = (this.r + 1) % this.map.r;
    }
  }
}

class AkahanaBoat extends FrameSprite {
  constructor(img) {
    super(new SpriteMap(img, 32, 22, 4, 2, 750, 0));
  }
}

class AkahanaDolphin extends FrameSprite {
  constructor(img) {
    super(new SpriteMap(img, 31, 30, 1, 2, 750, 44));
  }
}

class Background extends Sprite {
  frames = 8;
  frameMap = [0, 1, 2, 1];

  constructor(img) {
    super(new SpriteMap(img, 750, 150, 1, 3, 0, 0));
  }

  draw(ctx, frame) {
    this.r = this.frameMap[Math.floor(frame / this.frames) % this.frameMap.length];
    super.draw(ctx, frame);
  }
}

class Animation {
  frame = 0;

  constructor(img, ctx) {
    this.ctx = ctx;
    this.bg = new Background(img);
    this.boat = new AkahanaBoat(img);
    this.dolphin = new AkahanaDolphin(img);
  }

  static create(ctx) {
    return new Promise((resolve) => {
      const img = new Image();
      img.addEventListener('load', () => {
        resolve(new Animation(img, ctx));
      }, false);
      img.src = 'sprites.png';
    });
  }

  async draw() {
    this.bg.draw(this.ctx, this.frame);
    this.boat.draw(this.ctx, this.frame);
    this.dolphin.draw(this.ctx, this.frame);
    this.frame++;
    return new Promise(requestAnimationFrame);
  }
}

async function run() {
  const c = document.querySelector('#canvas');
  const a = await Animation.create(c.getContext('2d'));
  const {boat, dolphin} = a;
  const draw = () => a.draw();

  //const recorder = new CanvasRecorder(c, 4500000);
  //recorder.start();

  dolphin.moveTo(755, 150);
  boat.moveTo(750, 70);
  // Make the animation
  while (true) {
    await draw();
    for (let i = 0; i < 835; i++) {
      boat.move(-1, 0);
      if (Math.random() < 0.015) boat.c = Math.floor(Math.random() * 4);
      await draw();
    }
    dolphin.moveTo(80, -32);
    await draw();
    // Take a somewhat quadratic path down the waterfall
    for (let i = 32; i > -10; i--) {
      dolphin.move(i < 0 ? 1.5 : i < 15 ? 1 : 0.5, i / 5);
      await draw();
    }
    // Note: use 380 to save webm
    for (let i = -10; i < 400; i++) {
      dolphin.move(1.75, i < 0 ? i / 10 : -Math.cos(i / 40) / 3);
      await draw();
    }
    boat.moveTo(755, 70);
  }

  while (a.frame % 32 != 1) { await a.draw(); }
  recorder.stop();
  //recorder.save('akahanaboat.webm');
}

setTimeout(run, 1000);

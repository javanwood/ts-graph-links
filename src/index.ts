import seedrandom from 'seedrandom';
import * as _ from 'lodash';

class Vec {
  static zero: Vec = new Vec(0, 0);

  static mean(vecs: Vec[]): Vec {
    return vecs.reduce((prev, v) =>
      prev.addVec(v), Vec.zero).multiply(1.0 / vecs.length);
  }

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(value: number): Vec {
    return new Vec(this.x + value, this.y + value);
  }

  addVec(vec: Vec): Vec {
    return new Vec(this.x + vec.x, this.y + vec.y);
  }

  subtractVec(vec: Vec): Vec {
    return new Vec(this.x - vec.x, this.y - vec.y);
  }

  len(): number {
    return Math.pow(Math.pow(this.x, 2) + Math.pow(this.y, 2), 0.5);
  }

  toUnit(): UnitVec {
    const len = this.len();
    return new UnitVec(this.x / len, this.y / len);
  }

  multiply(value: number): Vec {
    return new Vec(this.x * value, this.y * value);
  }

  multiplyVec(vec: Vec): Vec {
    return new Vec(this.x * vec.x, this.y * vec.y);
  }

  divideVec(vec: Vec): Vec {
    return new Vec(this.x / vec.x, this.y / vec.y);
  }

  dotProduct(vec: Vec): number {
    return this.x * vec.x + this.y + vec.y;
  }

  equals(vec: Vec): bool {
    return Math.abs(vec.x - vec.y) < 10e-9 && Math.abs()
  }
}

class UnitVec extends Vec {
  static averageDirection(points: Vec[]): UnitVec {
    const directionVectors = points.map((p) => 
      UnitVec.fromAngle(2 * Math.atan2(p.y, p.x)));
    const meanDirection = Vec.mean(directionVectors);
    const angle = 0.5 * Math.atan2(meanDirection.y, meanDirection.x);
    return UnitVec.fromAngle(angle);
  }

  static fromAngle(angle: number) {
    return new UnitVec(Math.cos(angle), Math.sin(angle));
  }

  snapDirection(): UnitVec {
    const scaled = this.multiply(1.3);
    return new Vec(Math.round(scaled.x), Math.round(scaled.y)).toUnit();
  }
}

class Rect {
  static bounds(points: [Vec]) {
    const xVals = points.map((p) => p.x);
    xVals.sort();
    const yVals = points.map((p) => p.y);
    yVals.sort();
    const bottomLeft = new Vec(_.first(xVals), _.first(yVals));
    const size = new Vec(_.last(xVals) - bottomLeft.x,
                         _.last(yVals) - bottomLeft.y);
    return new Rect(bottomLeft, size);
  }

  bottomLeft: Vec;
  size: Vec;

  constructor(bottomLeft: Vec, size: Vec) {
    this.bottomLeft = bottomLeft;
    this.size = size;
  }

  center(): Vec {
    return new Vec(this.bottomLeft.x + 0.5 * this.size.x,
      this.bottomLeft.y + 0.5 * this.size.y);
  }

  inset(value: number): Rect {
    return new Rect(this.bottomLeft.add(value), this.size.add(-2 * value));
  }
}

class Line {
  startPoint: Vec;
  direction: Vec;
  constructor(startPoint: Vec, direction: Vec) {
    this.startPoint = startPoint;
    this.direction = direction;
  }

  // intersectionFactors(other: Line): [number, number] | undefined {
    
  // }
}

class Canvas2d {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bounds: Rect;
  scale: Vec;
  preOffset: Vec;
  postOffset: Vec;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  setBounds(bounds: Rect) {
    this.bounds = bounds;
    const canvasBounds = new Rect(Vec.zero, new Vec(this.canvas.width, this.canvas.height));
    this.scale = canvasBounds.size.divideVec(bounds.size).multiplyVec(new Vec(1, -1));
    this.preOffset = bounds.center().multiply(-1);
    this.postOffset = canvasBounds.center();
  }

  localCoords(point: Vec): Vec {
    return point.addVec(this.preOffset).multiplyVec(this.scale).addVec(this.postOffset);
  }

  addLine(points: Vec[], color: string) {
    const lp = points.map((p) => this.localCoords(p));
    this.ctx.beginPath();
    this.ctx.moveTo(lp[0].x, lp[0].y);
    lp.slice(1).forEach((p) => this.ctx.lineTo(p.x, p.y));
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  addMarker(loc: Vec, color: string) {
    this.ctx.beginPath();
    const radius = 10;
    const lloc = this.localCoords(loc);
    this.ctx.arc(lloc.x, lloc.y, radius, 0, 2 * Math.PI);
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }
}

class RNG {
  rng: () => number;
  constructor (seed: number) {
    this.rng = seedrandom(seed);
  }

  randPoint(bounds: Rect) {
    return new Vec(
      this.rng() * bounds.size.x + bounds.bottomLeft.x,
      this.rng() * bounds.size.y + bounds.bottomLeft.y);
  }
}

class RandomNetwork {
  center: Vec;
  nodes: Vec[];

  constructor (seed: number, bounds: Rect, nNodes: number) {
    const rng = new RNG(seed);
    this.center = rng.randPoint(bounds.inset(0.25 * bounds.size.x));
    this.nodes = Array.from({length:nNodes}, i => rng.randPoint(bounds));
  }
}

function fancify(line: Vec[], startDirection: Vec): Vec[] {
  return line;
}

function fixupLines(lines: Vec[][]): Vec[][] {
  // Get average rotation
  const relPoints = lines.map((l) => l[1].subtractVec(l[0]));

  const averageDirection = UnitVec.averageDirection(relPoints);
  const baseDirection = averageDirection.snapDirection();

  relPoints.forEach((p) => console.log(baseDirection.dotProduct(p)));
  
  return [
    fancify(lines[0], new Vec(-1, 0).toUnit()),
    [averageDirection.multiply(-1), averageDirection],
    [baseDirection.multiply(-2), baseDirection.multiply(2)]
    ];
}

function mapBlock(seed: number): HTMLCanvasElement {
  const htmlCanvas = document.createElement('canvas') as HTMLCanvasElement;
  htmlCanvas.width = 500;
  htmlCanvas.height = 500;
  const canvas = new Canvas2d(htmlCanvas);
  
  const bounds = new Rect(new Vec(-10, -10), new Vec(20, 20));
  canvas.setBounds(bounds);

  const grey = '#666666';
  const lightGrey = '#aaaaaa';
  const red = '#ff0000';
  const green = '#00b542';

  const network = new RandomNetwork(6, bounds, 5);

  // Map the lines.
  const lines:Vec[][] = network.nodes.map((v) => [v, network.center]);
  const newLines: Vec[][] = fixupLines(lines);

  // Plot all the things.
  lines.forEach((l) => canvas.addLine(l, lightGrey));
  newLines.forEach((l) => canvas.addLine(l, grey));
  network.nodes.forEach((n) => canvas.addMarker(n, green));
  canvas.addMarker(network.center, red);

  return htmlCanvas;
}

document.body.appendChild(mapBlock(1));
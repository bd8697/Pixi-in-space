import { ObservablePoint } from "pixi.js";
import { Planet } from "../planet/Planet";

export const planetSize = 150;
export const imgPaths: any = {
    sunPath: '././assets/imgs/planets/red_planet.png',
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export function randomDirection() {
    return random(0, 1) === 0 ? -1 : 1;
}

// handle scope if needed
export function saneScale(scale: number) {
    return new ObservablePoint<any>(() => {}, null, scale, scale);
}

export function getDirection2Poitns(p1: myPoint, p2: myPoint) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  export function rad2Deg(rad: number) {
    return rad * 180/Math.PI;
  }

export function getDistance2Points(p1: myPoint, p2: myPoint) {
    const cat1 = p2.x - p1.x;
    const cat2 = p2.y - p1.y;
    return Math.sqrt(cat1 * cat1 + cat2 * cat2);
  }

  export function getPointRelativeToCenter(point: myPoint, canvas: any) {
    point.x -= canvas.width / 2;
    point.y -= canvas.height / 2;
    return point;
  }

//window resize will break this
  export function getOppositeCoord(coord: myPoint, canvas: any) {
    return new myPoint(canvas.width - coord.x, canvas.height - coord.y);
  }

   export function getOppositeX(x: number, canvas: any) {
    return canvas.width - x;
  }

  export function getOppositeY(y: number, canvas: any) {
    return canvas.height - y;
  }

  export function getExtendedTargetCoord(planet: Planet) {
    return new myPoint(planet.target.x , planet.target.y);
  }

export class myPoint {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
import * as PIXI from 'pixi.js'; 
import { ObservablePoint } from 'pixi.js';
import { myPoint, random, randomDirection } from '../Utility/utility';

export class Planet extends PIXI.Sprite {
    public acc = 0;
    public target = new myPoint(0, 0);
    public rotDirection: number;
    public angularAcc: number;
    public type: number;
    public steerDir = new myPoint(randomDirection(), randomDirection());

    constructor(tex: PIXI.Texture<PIXI.Resource>, type: number, x = 0, y = 0, scale= new ObservablePoint<any>(() => {}, 1), targetCoord = new myPoint(0, 0), rot = 0, acc = 0, angularAcc = 0) {
        super(tex);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.target = targetCoord;
        this.angle = rot;
        this.angularAcc = angularAcc;
        this.rotDirection = randomDirection();
        this.acc = acc;
        this.type = type;
    }

    move() {
        const distX = this.target.x - this.x
        this.x += Math.sqrt(Math.abs(distX)) * Math.sign(distX) * this.acc
        const distY = this.target.y - this.y
        this.y += (Math.sqrt(Math.abs(distY))) * Math.sign(distY) * this.acc
    }

    //why the fuck does this automatically retrigger every frame??
    reTarget(coords: myPoint) {
        this.target = coords;
    }

    decayangularAcc() {
        this.angularAcc *= 0.99;
    }
    rotate(deg: number) {
        this.angle += deg * this.angularAcc * this.rotDirection;
    }

    accelerateAcceleration(acc: number) {
        this.acc *= acc;
    }

    checkOutOfBounds(canvas: any) {
        if(this.x < 0 - this.width / 2.5 || this.x > canvas.width + this.width / 2.5 ||
           this.y < 0 - this.width / 2 || this.y > canvas.height + this.width / 2) {
                this.destroy();
           }
    }

    fadeIn(fade: number) {
        this.alpha *= fade;
    }

    fadeOut(fade: number) {
        this.alpha *= fade;
        if(this.alpha < 0.01) {
            this.destroy();
        }
    }

    steer() {
        this.target.x += 5 * this.steerDir.x;
        this.target.y += 5 * this.steerDir.y;
    }

    changeSteerDir() {
        if(random(0, 100) === 37) {
            this.steerDir.x *= -1;
        }
        else if(random(0, 100) === 86) {
            this.steerDir.y *= -1;
        }
    }
}
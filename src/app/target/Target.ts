import * as PIXI from 'pixi.js'; 
import { ObservablePoint } from 'pixi.js';
import { Planet } from '../planet/Planet';
import { getDirection2Poitns, getDistance2Points, getOppositeX, getOppositeY, myPoint, rad2Deg } from '../Utility/utility';

export class Target extends PIXI.Sprite {

    constructor(tex: PIXI.Texture<PIXI.Resource>, x = 0, y = 0, scale= new ObservablePoint<any>(() => {}, 1), rot = 0) {
        super(tex);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.angle = rot;
        this.alpha = 0.01;
    }

    move(target: myPoint, planet: Planet, dist2Planet: number, canvas: any) { // †
        if(planet.type === 3) {
            this.x += -Math.sign(planet.target.x - this.x) * (250000 / Math.pow(dist2Planet, 3));
            this.y += -Math.sign(planet.y - this.y) * (2500000 / Math.pow(dist2Planet, 3));
        } 
        else if(planet.type === 2) {
            this.x += -Math.sign(planet.target.x - this.x) * (2500000 / Math.pow(dist2Planet, 3));
            this.y += Math.sign(canvas.height/2 - target.y) * (250000 / Math.pow(dist2Planet, 3));
        }
        else if(planet.type === 1){
            this.x += Math.sign(canvas.width/2 - target.x) * (250000 / Math.pow(dist2Planet, 3));
            this.y += -Math.sign(planet.target.y - this.y) * (2500000 / Math.pow(dist2Planet, 3));
        }
    }

    dodge(planets: Planet[], canvas: any) {
        let collided = false;
        planets.map(planet => {
            const planetCoord = new myPoint(planet.x, planet.y);
            const targetCoord = new myPoint(this.x, this.y);
            const targetTargetCoord = new myPoint(
                planet.target.x < 0 || planet.target.x > canvas.width ? planet.target.x : getOppositeX(planet.target.x, canvas),
                planet.target.y < 0 || planet.target.y > canvas.height ? planet.target.y : getOppositeY(planet.target.y, canvas));
            const dist2Planet = getDistance2Points(targetCoord, planetCoord);
            this.move(targetTargetCoord, planet, dist2Planet, canvas);
            if(this.checkCollision(planet, dist2Planet)) {
                collided = true;
            }
            const deg2Planet = rad2Deg(getDirection2Poitns(targetCoord, planetCoord));
        });
        return collided;
    }

    stayInBounds(canvas: any) {
        this.x += (canvas.width / this.x) / 1;
        this.x -= (canvas.width / (canvas.width - this.x)) / 1;
        this.y += (canvas.height / this.y) / 1;
        this.y -= (canvas.height / (canvas.height - this.y)) / 1;
    }

    checkCollision(planet: Planet, dist2Planet: number) {
        if(dist2Planet * 1.5 < this.width * this.scale.x + planet.width * planet.scale.x) {
            console.log('coll!');
            return true;
        }
        return false;
    }

    fadeOut(fade: number) {
        this.alpha *= fade;
        if(this.alpha < 0.01) {
            this.destroy();
        }
    }

    fadeIn(fade: number) {
        this.alpha *= fade;
    }
    rotate(deg: number) {
        this.angle += deg;
    }
}
import { Component, OnInit } from '@angular/core';
import * as PIXI from 'pixi.js';
import {sound} from '@pixi/sound'
import FontFaceObserver from 'fontfaceobserver'
import { Planet } from '../planet/Planet';
import { Target } from '../target/Target';
import { getOppositeCoord, getOppositeX, getOppositeY, imgPaths, myPoint, planetSize, random, saneScale } from '../Utility/utility';

export abstract class Actor extends PIXI.Graphics {
  update(delta: number) {

  }

  onKeydown(e: KeyboardEvent) {

  }

  onKeyup(e: KeyboardEvent) {

  }

  lerp(start: number, end: number, amt: number) {
    return (1 - amt) * start + amt * end
  }
}

@Component({
  selector: 'app-pixi',
  templateUrl: './pixi.component.html',
  styleUrls: ['./pixi.component.css']
})

export class PixiComponent implements OnInit {
  private canvas = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  private app: PIXI.Application = new PIXI.Application({
    width: this.canvas.width,
    height: this.canvas.height
  });

  private startScene = new PIXI.Container();
  private gameScene = new PIXI.Container();
  private endScene = new PIXI.Container();

  private collided = false;
  private cooldownAttackCapacity = 1;
  private heat = 0;
  private cooldown = 0;
  private target: any;
  private planets: Planet[] = [];
  private cursorPos: any;
  private gameOverText: any;
  private playAgainText: any;
  private playText: any;
  private bg: any;
  private stars1: any;
  private stars2: any;

  div: any;
    static Sprite: any;

  constructor() { 
    this.cursorPos = {x: 0, y: 0}
  }

  ngOnInit(): void {
    document.body.appendChild(this.app.view);

    var font = new FontFaceObserver('Kaushan');

    font.load().then(() => {
      this.app.stage.addChild(this.startScene);
      this.app.stage.addChild(this.gameScene);
      this.app.stage.addChild(this.endScene);
      this.changeScene(2);
    });

    //text

    this.playText = new PIXI.Text('Play',{fontFamily : 'Kaushan', fontSize: 300, fill : 0xffff7f, align : 'center'});
    this.playText.anchor.set(0.5);
    this.playText.position.set(this.canvas.width / 2, this.canvas.height / 2);
    this.playText.interactive = true;
    this.playText.buttonMode = true;
    this.playText.on('pointerdown', () => {
      this.changeScene(2);
    });
    this.startScene.addChild(this.playText);

    this.gameOverText = new PIXI.Text(':(',{fontFamily : 'Kaushan', fontSize: 300, fill : 0xffff7f, align : 'center'});
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.position.set(this.canvas.width / 2, this.canvas.height / 2);
   
    this.endScene.addChild(this.gameOverText);

    this.playAgainText = new PIXI.Text('Again!',{fontFamily : 'Kaushan', fontSize: 300, fill : 0xffff7f, align : 'center'});
    this.playAgainText.anchor.set(0.5);
    this.playAgainText.position.set(this.canvas.width / 2, this.canvas.height * 2/3);
    this.playAgainText.interactive = true;
    this.playAgainText.buttonMode = true;
    this.playAgainText.on('pointerdown', () => {
      if(this.target.destroyed) {
        this.collided = false;
        this.target = null;
        this.cooldownAttackCapacity = 1;
        this.initTarget();
        this.resetTexts();
        this.changeScene(2);
      }
    });
    this.endScene.addChild(this.playAgainText);

    this.resetTexts();
    //preload assets

    this.app.loader.baseUrl = "./assets/imgs";
    this.app.loader.add("bg", "./bg.png")
    this.app.loader.add("stars1", "./spr_stars01.png")
    this.app.loader.add("stars2", "./spr_stars02.png")

    this.app.loader.baseUrl += "/planets";
    this.app.loader
    .add("blue_planet", "blue_planet.png")
    .add("brown_planet", "brown_planet.png")
    .add("cyan_planet", "cyan_planet.png")
    .add("green_planet", "green_planet.png")
    .add("grey_planet", "grey_planet.png")
    .add("red_planet", "red_planet.png")
    .add("yellow_planet", "yellow_planet.png")

    let baseUrl = "./assets/audios";
    sound.add('audio1', baseUrl + '/1.wav')
    sound.add('audio2', baseUrl + '/2.wav')
    sound.add('audio3', baseUrl + '/3.wav')
    baseUrl = "./assets/audios/effects";
    sound.add('space', baseUrl + '/space.mp3')
    sound.add('whoosh', baseUrl + '/whoosh.wav')

    this.app.loader.onProgress.add(this.showProgress);
    this.app.loader.onComplete.add(this.onComplete);
    this.app.loader.onError.add(this.onError);
    
    this.app.loader.load();

    //mouse

    this.app.stage.interactive = true;
    this.app.stage.on('pointermove', this.setCursorPos);

    //keyboard

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.app.ticker.add(this.gameLoop);

    this.div = document.querySelector("#keys");
  }

  setCursorPos = (e: any) => {
    const pos = e.data.global;

    this.cursorPos.x = pos.x;
    this.cursorPos.y = pos.y;
  }

  private onKeyDown = (e: any) => {
    let planet;
    let xPos;
    let yPos;
    if(this.heat < this.cooldownAttackCapacity && this.gameScene.visible && !this.endScene.visible)
    switch(e.keyCode) {
      case 49: // 1
      this.cursorPos = getOppositeCoord(this.cursorPos, this.canvas);
      xPos = this.cursorPos.x < this.canvas.width / 2 ? -planetSize/2 : this.canvas.width + planetSize/2;
      planet = new Planet(this.app.loader.resources.brown_planet.texture ?? imgPaths.sunPath, 1, xPos, this.cursorPos.y, saneScale(0.33), getOppositeCoord(new myPoint(xPos, this.cursorPos.y), this.canvas), random(0, 360), 0.25, 25);
      this.planets.push(planet);
      this.gameScene.addChild(planet);
      this.triggerAttack(1);
      // atk 1
        break;
      case 50: // 2
      yPos = this.cursorPos.y < this.canvas.height / 2 ? -planetSize/2 : this.canvas.height + planetSize/2;
      planet = new Planet(this.app.loader.resources.yellow_planet.texture ?? imgPaths.sunPath, 2, this.cursorPos.x, yPos, saneScale(0.33), new myPoint(this.cursorPos.x, yPos < 0 ? this.canvas.height + planetSize : -planetSize), random(0, 360), 0.25, 25);
      this.planets.push(planet);
      this.gameScene.addChild(planet);
      this.triggerAttack(2);
      // atk 2
        break;
      case 51: // 3
      xPos = this.cursorPos.x < this.canvas.width / 2 ? -planetSize/2.5 : this.canvas.width + planetSize/2.5;
      planet = new Planet(this.app.loader.resources.red_planet.texture ?? imgPaths.sunPath, 3, xPos, this.cursorPos.y, saneScale(0.33), new myPoint(this.canvas.width / 2, this.canvas.height / 2), random(0, 360), 0.25, 15);
      planet.reTarget(new myPoint(this.target.x, this.target.y));
      this.planets.push(planet);
      this.gameScene.addChild(planet);
      this.triggerAttack(3);
     // atk 3
        break;

    }
  }

  private onKeyUp = (e: any) => {

  }

  private gameLoop = () => {
    sound.volume('space', Math.min(0.25, this.heat / this.cooldownAttackCapacity / 4));
    this.updateBg();
    this.planets.map(planet => {
      if(planet.texture === this.app.loader.resources.red_planet.texture) {
        console.log(planet.target)
        planet.changeSteerDir();
        planet.steer();
      } else {
        planet.decayangularAcc();
      }
      planet.move();
      planet.rotate(1);
      planet.checkOutOfBounds(this.canvas);
      if(this.collided) {
        planet.fadeOut(0.95);
      }
    })
    this.planets = this.planets.filter(planet => {
      return !planet.destroyed;
    });

    if(!this.endScene.visible && this.gameScene.visible) {
      const collided = this.target?.dodge(this.planets, this.canvas);
    if(collided) {

      this.collided = collided;
      this.endScene.visible= true;
    }
    this.target?.stayInBounds(this.canvas);
    this.target?.rotate(0.5);
    }

    if(this.collided && !this.target.destroyed) {
      this.target.fadeOut(0.95);
    } 
    else if(this.target?.alpha < 1 && this.gameScene.visible) {
      this.target.fadeIn(1.05);
    }

    //todo: no cooldown, jsut prevent spam (and allow spam over time); prevent 2 consec same atk
    this.cooldown += 0.0025;
    if(this.heat > 0) {
      this.heat -= this.cooldown;
    }
      this.cooldownAttackCapacity += 0.005;

      if(this.playText.scale.x < 0.5 && this.startScene.visible) {
        this.playText.scale.x *= 1.075;
        this.playText.scale.y *= 1.075;
        this.playText.alpha *= 1.1;
      }

    if(this.gameOverText.scale.x < 0.5 && this.endScene.visible) {
      this.gameOverText.scale.x *= 1.075;
      this.gameOverText.scale.y *= 1.075;
      this.gameOverText.alpha *= 1.1;
    }
    if(this.playAgainText.scale.x > 0.25 && this.endScene.visible) {
      this.playAgainText.scale.x *= 0.95;
      this.playAgainText.scale.y *= 0.95;
      this.playAgainText.alpha *= 1.1;
    }
  }

  private triggerAttack(attack: number) {
    switch(attack) {
      case 1:
        sound.volume('audio1', Math.min(1, this.heat / this.cooldownAttackCapacity / 10));
        //sound.play('audio1');
        break;
      case 2:
        sound.volume('audio2', Math.min(1, this.heat / this.cooldownAttackCapacity / 10));
        //sound.play('audio2');
        break;
      case 3:
        sound.volume('audio3', Math.min(1, this.heat / this.cooldownAttackCapacity / 10));
        //sound.play('audio3');
        break;
    }
    this.cooldown = 0;
    this.heat++;
  }

  private showProgress = (e: any) => {
    console.log(e.progress);
  }
  private onComplete = (e: any) => {
    console.log("done!");
    this.initTarget();
    this.initBg();
    // sound.volume('space', 0.25);
    sound.play('space', {loop: true});
  }
  private onError = (e: any) => {
    console.log(e.message);
  }

  private updateBg() {
    if(this.bg) {
      this.bg.tilePosition.y += 0.37;
      this.stars1.tilePosition.y += 0.69;
      this.stars2.tilePosition.y += 0.86;
    }
  }

  private initTarget() {
    this.target = new Target(this.app.loader.resources.cyan_planet.texture ?? imgPaths.sunPath, this.canvas.width / 2, this.canvas.height / 2, saneScale(0.1), random(0, 360));
    this.target.anchor.set(0.5);

    this.gameScene.addChild(this.target);
  }

  private initBg() {
    this.stars1 = this.createBg(this.app.loader.resources.stars1.texture!);
    this.stars2 = this.createBg(this.app.loader.resources.stars2.texture!);
    this.bg = this.createBg(this.app.loader.resources.bg.texture!);
  }

  private resetTexts() {
    this.playText.scale.x = 0.01;
    this.playText.scale.y = 0.01;
    this.playText.alpha = 0.01;

    this.gameOverText.scale.x = 0.01;
    this.gameOverText.scale.y = 0.01;
    this.gameOverText.alpha = 0.01;

    this.playAgainText.scale.x = 5;
    this.playAgainText.scale.y = 5;
    this.playAgainText.alpha = 0.01;
  }

  private changeScene = (sceneNo: number) => {
    switch(sceneNo) {
      case 1:
        this.startScene.visible = true;
        this.gameScene.visible = false;
        this.endScene.visible = false;
        break;
        case 2:
          this.startScene.visible = false;
          this.gameScene.visible = true;
          this.endScene.visible = false;
          break;
          case 3:
            this.startScene.visible = false;
            this.gameScene.visible = false;
            this.endScene.visible = true;
            break; 
    }
  }

  private createBg(tex: PIXI.Texture<PIXI.Resource>) {
    let para = new PIXI.TilingSprite(tex)
    para.position.set(0, 0);
    para.width = this.canvas.width;
    para.height = this.canvas.height;
    this.app.stage.addChildAt(para, 0);

    return para;
  }


}

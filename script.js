/// @ts-check
/// <reference path=".gitpod/p5.global-mode.d.ts" />
"use strict";

/* Game opdracht
   Informatica - Emmauscollege Rotterdam
   Template voor een game in JavaScript met de p5 library

   Begin met dit template voor je game opdracht,
   voeg er je eigen code aan toe.
 */




/* ********************************************* */
/* globale variabelen die je gebruikt in je game */
/* ********************************************* */

const UITLEG = 0;
const SPELEN = 1;
const GAMEOVER = 2;

const canvasHoogte = 1280;
const canvasBreedte = 720;
const buisInterval = 2; // interval voordat er weer een nieuwe buis spawnt

var snelheid = 2;
var spelStatus = SPELEN;
var score = 0; // aantal behaalde punten


/* ********************************************* */
/*      functies die je gebruikt in je game      */
/* ********************************************* */


/**
 * Tekent het speelveld
 */
var tekenVeld = function () {
  fill("purple");
  rect(0, 0, width, height);
};


class Speler {
  constructor(xStart, yStart) {
    this.x = xStart;
    this.y = yStart;
    this.snelheidY = 0;
  }
  teken() {
    fill("white");
    ellipse(this.x, this.y, 50, 50);
  }
  update() {
    this.snelheidY += 1;
    this.y += this.snelheidY;
  }
  springen() {
    this.snelheidY = -20;
  }
  botsingMetGrond() {
    return this.y > 1200;
  }
};

class Buis {
  constructor() {
    this.x = canvasBreedte;
    this.yOffset = random(-200, 200);
    this.gap = 200;
  }
  teken() {
    fill("white");
    rect(this.x, canvasHoogte / 2 - this.yOffset + this.gap, 50, 1000);
    rect(this.x, canvasHoogte / 2 - this.yOffset - this.gap, 50, -1000);
  }
  update() {
    this.x -= snelheid;
    if(this.x == 200) {
      score++;
    }
  }
  uitHetVeld() {
    return this.x < -50;
  }
}

/**
 * Zoekt uit of de vijand is geraakt
 * @returns {boolean} true als vijand is geraakt
 */
var checkBuisDoorheen = function() {

  return false;
};


/**
 * Zoekt uit of het spel is afgelopen
 * @returns {boolean} true als het spel is afgelopen
 */
var checkGameOver = function() {

  return false;
};


/**
 * setup
 * de code in deze functie wordt één keer uitgevoerd door
 * de p5 library, zodra het spel geladen is in de browser
 */
function setup() {
  // Maak een canvas (rechthoek) waarin je je speelveld kunt tekenen
  createCanvas(canvasBreedte, canvasHoogte);
}


/**
 * draw
 * de code in deze functie wordt meerdere keren per seconde
 * uitgevoerd door de p5 library, nadat de setup functie klaar is
 */

// nieuwe speler aanmaken
var speler = new Speler(200,canvasHoogte / 2);
var buizen = [];

function draw() {
  switch (spelStatus) {
    case SPELEN:
      if (checkBuisDoorheen()) {
        // punt erbij
      }

      tekenVeld();

      speler.teken();
      if(speler.botsingMetGrond()) {
        spelStatus = GAMEOVER;
      } else {
        speler.update();
      }

      buizen.forEach(function(buis, i) {
        buis.teken();
        if(buis.uitHetVeld()) {
          buizen.splice(i, 1);
        } else {
          buis.update();
        }
      })

      fill("green");
      textSize(32);
      text(score, canvasBreedte / 2, 100);

      if (checkGameOver()) {
        spelStatus = GAMEOVER;
      }
      break;
    case GAMEOVER:
      tekenVeld();
      buizen.forEach(function(buis, i) {
        buis.teken();
      })
      speler.teken();
      text("GAME OVER", canvasBreedte / 2, 100);
      break;
  }
}

setInterval(function() {
  buizen.push(new Buis());
}, buisInterval * 1000);

function keyPressed() {
  if(keyCode == UP_ARROW || keyCode == 32) {
    speler.springen();
  }
}
function mousePressed() {
  speler.springen();
}

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
  rect(20, 20, width - 2 * 20, height - 2 * 20);
};


class Speler {
  constructor(xStart, yStart) {
    this.x = xStart;
    this.y = yStart;
    this.snelheidY = 0;
  }
  update() {
    this.snelheidY += 1;
    this.y += this.snelheidY;
    fill("white");
    ellipse(this.x, this.y, 50, 50);
  }
  springen() {
    this.snelheidY -= 50;
  }
};

/**
 * Updatet globale variabelen met positie van kogel of bal
 */
var beweegBuizen = function() {

};


/**
 * Kijkt wat de toetsen/muis etc zijn.
 * Updatet globale variabele spelerX en spelerY
 */
var beweegSpeler = function() {

};


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
  createCanvas(720, canvasHoogte);

  // Kleur de achtergrond blauw, zodat je het kunt zien
  background('blue');
}


/**
 * draw
 * de code in deze functie wordt meerdere keren per seconde
 * uitgevoerd door de p5 library, nadat de setup functie klaar is
 */

// nieuwe speler aanmaken
var speler = new Speler(200,150);

function draw() {
  switch (spelStatus) {
    case SPELEN:
      beweegBuizen();

      if (checkBuisDoorheen()) {
        // punt erbij
      }

      tekenVeld();
      speler.update();
      // tekenSpeler(spelerY);

      if (checkGameOver()) {
        spelStatus = GAMEOVER;
      }
      break;
  }
}

function keyPressed() {
  if(keyCode == UP_ARROW) {
    speler.springen();
  }
}

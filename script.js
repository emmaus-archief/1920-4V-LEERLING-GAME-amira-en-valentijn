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

// speler variables
const spelerX = 200; // dit is een constant omdat de X van de speler nooit verandert
var spelerY = canvasHoogte / 2; // de speler begint in het midden van het canvas
var spelerSnelheidY = 0;
var toetsAlIngedrukt = false;

// buizen
var buizen = [];
["xPos", "yOffset", "scoreAdded"]
var hoogteTussenBuizen = 200;

// overig
var snelheid = 2;
var spelStatus = SPELEN;
var score = 0; // aantal behaalde punten



/* ********************************************* */
/*      functies die je gebruikt in je game      */
/* ********************************************* */


/**
 * Tekent het speelveld
 */
var tekenVeld = function() {
  fill("purple");
  rect(0, 0, width, height);
};

var tekenSpeler = function() {
  fill("white");
  ellipse(spelerX, spelerY, 50, 50);
}

var updateSpeler = function() {
  spelerSnelheidY += 1;
  spelerY += spelerSnelheidY;
  var toetsNuIngedrukt = keyIsPressed && (keyCode == UP_ARROW || keyCode == 32);
  if(!toetsAlIngedrukt && toetsNuIngedrukt) {
    toetsAlIngedrukt = true;
    spelerSnelheidY = -20;
  } else if(toetsAlIngedrukt && !toetsNuIngedrukt) {
    toetsAlIngedrukt = false;
  }
}

var tekenBuis = function(x, yOffset) {
  fill("white");
  rect(x, canvasHoogte / 2 - yOffset + hoogteTussenBuizen, 50, 1000);
  rect(x, canvasHoogte / 2 - yOffset - hoogteTussenBuizen, 50, -1000);
}

var updateBuis = function(i) {
  buizen[i][0] -= snelheid;
}


/**
 * Zoekt uit of het spel is afgelopen
 * @returns {boolean} true als het spel is afgelopen
 */
var checkGameOver = function() {
  var gameOver = false;
  if(spelerY > 1200) {
    gameOver = true;
  }
  return gameOver;
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

function draw() {
  switch (spelStatus) {
    case SPELEN:
      tekenVeld();

      tekenSpeler();
      updateSpeler();

      var teVerwijderen;
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
        updateBuis(i);
        if(buis[0] < -50) {
          teVerwijderen = i;
        }
        if(buis[2] == false && buis[0] < 200) {
          score++;
          buis[2] = true;
        }
      })
      if(teVerwijderen) {
        buizen.splice(teVerwijderen, 1);
      }

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
        tekenBuis(buis[0], buis[1]);
      })
      tekenSpeler();
      text("GAME OVER", canvasBreedte / 2, 100);
      break;
  }
}

setInterval(function() {
  buizen.push([canvasBreedte, random(-200, 200), false]);
}, buisInterval * 1000);


function mousePressed() {
  // speler.springen();
}

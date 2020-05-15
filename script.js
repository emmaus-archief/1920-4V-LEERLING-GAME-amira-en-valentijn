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

const STARTMENU = 0;
const SPELEN = 1;
const GAMEOVER = 2;

const canvasHoogte = 900;
const canvasBreedte = 720;
const buisInterval = 2; // interval voordat er weer een nieuwe buis spawnt
const grondHoogte = 270;

// speler variables
const spelerX = 100; // dit is een constant omdat de X van de speler nooit verandert
var spelerY = canvasHoogte / 2; // de speler begint in het midden van het canvas
var spelerSnelheidY = 0;
var toetsAlIngedrukt = false;

// buizen
var buizen = [];
["xPos", "yOffset", "scoreAdded"]
var hoogteTussenBuizen = 150;

// overig
var snelheid = 2;
var spelStatus = SPELEN;
var score = 0; // aantal behaalde punten



/* ********************************************* */
/*      functies die je gebruikt in je game      */
/* ********************************************* */


function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, img_angle){
  push();
  imageMode(CENTER);
  translate(img_x+img_width/2, img_y+img_width/2);
  rotate(img_angle);
  image(img, 0, 0, img_width, img_height);
  pop()
}


/**
 * Tekent het speelveld
 */
var tekenVeld = function() {
  var groundHeight = groundSprite.height / groundSprite.width * canvasBreedte;
  var backgroundHeight = canvasHoogte - groundHeight;
  var backgroundWidth = background.width / backgroundHeight * canvasBreedte;
  image(background, 0, 0, backgroundWidth, backgroundHeight);
  image(groundSprite, 0, canvasHoogte - groundHeight, canvasBreedte, groundHeight);
};

var tekenSpeler = function() {
  var sprite = birdUpflap;
  if(currentFlap === 1) {
    sprite = birdMidflap;
  } else if(currentFlap === 2) {
    sprite = birdDownflap;
  }
  rotate_and_draw_image(sprite, spelerX, spelerY, 83, 50, spelerSnelheidY);
}

var spelerValt = function() {
  if(spelerY < canvasHoogte - grondHoogte) {
    spelerSnelheidY += 0.5;
    spelerY += spelerSnelheidY;
  }
  rotate_and_draw_image(birdMidflap, spelerX, spelerY, 83, 50, 80);
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
  // pijp boven
  var y = canvasHoogte / 2 - yOffset - hoogteTussenBuizen - 640;
  image(pipeOnderstebovenSprite, x, y, 104, 640);
  // pijp onder
  var y2 = canvasHoogte / 2 - yOffset + hoogteTussenBuizen;
  image(pipeSprite, x, y2, 104, 640);
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
  if(spelerY > canvasHoogte - grondHoogte) {
    gameOver = true;
  }
  buizen.forEach(function(buis) {
    var raaktBuisX = buis[0] > spelerX - 100 && buis[0] < spelerX + 55;
    var raaktBuisBoven = spelerY < canvasHoogte / 2 - buis[1] - hoogteTussenBuizen - 10; // lager = sneller botsing boven buis
    var raaktBuisOnder = spelerY > canvasHoogte / 2 - buis[1] + hoogteTussenBuizen - 55; // hoger = sneller botsing onder buis

    if(raaktBuisX && (raaktBuisBoven || raaktBuisOnder)) {
      gameOver = true;
    }
  })
  return gameOver;
};


// load images

/**
 * setup
 * de code in deze functie wordt één keer uitgevoerd door
 * de p5 library, zodra het spel geladen is in de browser
 */
let birdUpflap;
let birdMidflap;
let birdDownflap;
let pipeSprite;
let pipeOnderstebovenSprite;
let groundSprite;
let background;
var currentFlap = 0;
function setup() {
  // angle mode zetten (om in graden te kunnen rekenen)
  angleMode(DEGREES);
  // Plaatjes laden
  birdUpflap = loadImage('images/bird-upflap.png');
  birdMidflap = loadImage('images/bird-midflap.png');
  birdDownflap = loadImage('images/bird-downflap.png');
  setInterval(function() {
    if(spelStatus === SPELEN || spelStatus === STARTMENU) {
      if(currentFlap < 2) {
        currentFlap++;
      } else {
        currentFlap = 0;
      }
    }
  }, 150)

  pipeSprite = loadImage('images/pipe.png');
  pipeOnderstebovenSprite = loadImage('images/pipe-ondersteboven.jpg');
  groundSprite = loadImage('images/ground.png');
  background = loadImage('images/background.png');
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
    case STARTMENU:
      tekenVeld();
      tekenSpeler();
      break;
    case SPELEN:
      tekenVeld();

      tekenSpeler();
      updateSpeler();

      var teVerwijderen;
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
        updateBuis(i);
        if(buis[0] < -100) {
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
        spelerSnelheidY = 1;
      }
      break;
    case GAMEOVER:
      tekenVeld();
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
      })
      spelerValt();
      text("GAME OVER", canvasBreedte / 2, 100);
      break;
  }
}

setInterval(function() {
  buizen.push([canvasBreedte, random(-180, 180), false]);
}, buisInterval * 1000);

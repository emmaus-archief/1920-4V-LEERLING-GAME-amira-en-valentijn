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

const canvasHoogte = 950;
const canvasBreedte = 600;
const buisInterval = 2; // interval voordat er weer een nieuwe buis spawnt
const grondHoogte = 200;

// speler variables
var spelerX = 120;
var spelerYStart = 360;
var spelerY = spelerYStart;
var spelerSnelheidY = 0;
var toetsAlIngedrukt = false;

// buizen
var buizen = []; // nested array, formaat = ["xPos", "yOffset", "scoreAdded"];
const hoogteTussenBuizen = 150;
const buisBreedte = 100;

// overig
var snelheid = 4;
var spelStatus = STARTMENU;
var score = 0; // aantal behaalde punten
var highScore = 0;
var newHighScore = false;
var frame = 0;

// richting uitleg:
// -2 = reverse (naar links vliegen)
// -1 = naar links vliegen overgaan
// 1 = naar rechts vliegen overgaan
// 2 = normaal (naar rechts vliegen)
var richting = 2;
// const reverseSnelheid = 4;


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

function resetSpel() {
  spelStatus = STARTMENU;
  spelerY = spelerYStart;
  spelerSnelheidY = 0;
  buizen = [];
  score = 0;
  spelerX = 120;
  richting = 2;
}


/**
 * Tekent het speelveld
 */

var tekenVeld = function() {
  var groundHeight = groundSprite.height / groundSprite.width * canvasBreedte;
  var backgroundHeight = canvasHoogte - groundHeight;
  var backgroundWidth = background.width / backgroundHeight * canvasBreedte;
  image(background, 0, 0, canvasBreedte, backgroundHeight);
};

var statePx = 0;
var tekenGrond = function() {
  var groundHeight = groundSprite.height / groundSprite.width * canvasBreedte;
  if(spelStatus === SPELEN || spelStatus === STARTMENU) {
    statePx += snelheid;
  }

  if(statePx > canvasBreedte) {
    statePx = 0;
  }


  if(richting === -1 || richting === -2) {
    image(groundSprite, statePx, canvasHoogte - groundHeight, canvasBreedte, groundHeight);
    image(groundSprite, statePx - canvasBreedte, canvasHoogte - groundHeight, canvasBreedte, groundHeight);
  } else {
    image(groundSprite, -statePx, canvasHoogte - groundHeight, canvasBreedte, groundHeight);
    image(groundSprite, -statePx + canvasBreedte, canvasHoogte - groundHeight, canvasBreedte, groundHeight);
  }
}

var tekenScore = function() {
  fill("green");
  textSize(50);
  text(score, canvasBreedte / 2, 100);
}

var tekenSpeler = function() {
  var sprite = birdUpflap;
  if(currentFlap === 1) {
    sprite = birdMidflap;
  } else if(currentFlap === 2) {
    sprite = birdDownflap;
  }
  rotate_and_draw_image(sprite, spelerX - 35, spelerY - 35, sprite.width * 2, sprite.height * 2, spelerSnelheidY);
  if(spelStatus === STARTMENU) {
    spelerY = sin(frame * 4) * 10 + spelerYStart;
  }
}

var spelerValt = function() {
  if(spelerY < canvasHoogte - grondHoogte) {
    spelerSnelheidY += 0.5;
    spelerY += spelerSnelheidY;
  }
  rotate_and_draw_image(birdMidflap, spelerX - 40, spelerY - 40, birdMidflap.width * 2, birdMidflap.height * 2, 70);
}

var updateSpeler = function() {
  spelerSnelheidY += 1;
  spelerY += spelerSnelheidY;
}

var tekenBuis = function(x, yOffset) {
  var imgHoogte = pipeSprite.height / pipeSprite.width * buisBreedte
  // pijp boven
  var y = canvasHoogte / 2 - yOffset - hoogteTussenBuizen;
  rotate_and_draw_image(pipeSprite, x, y - 355, buisBreedte, imgHoogte, 180, 0);
  // pijp onder
  var y2 = canvasHoogte / 2 - yOffset + hoogteTussenBuizen;
  rotate_and_draw_image(pipeSprite, x, y2 + 255, buisBreedte, imgHoogte);
}

var updateBuis = function(buis) {
  if(richting === -2) {
    buis[0] += snelheid;
  } else if(richting === -1) {
    buis[0] += snelheid;
  } else if(richting === 1) {
    buis[0] -= snelheid;
  } else if(richting === 2) {
    buis[0] -= snelheid;
  }
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
    var raaktBuisX = spelerX + 20 > buis[0] && spelerX - 20 < buis[0] + buisBreedte;
    var raaktBuisBoven = spelerY < canvasHoogte / 2 - buis[1] - hoogteTussenBuizen + 20; // lager = minder snel botsing
    var raaktBuisOnder = spelerY > canvasHoogte / 2 - buis[1] + hoogteTussenBuizen - 15; // lager = minder snel botsing
    if(raaktBuisX && (raaktBuisBoven || raaktBuisOnder)) {
      gameOver = true;
    }
  })
  return gameOver;
};

var tekenGameoverMenu = function() {
  if(newHighScore) {
    fill("red");
    textSize(40);
    text("NEW HS: " + highScore, 40, 40);
  }
  text("GAME OVER", canvasBreedte / 2, 100);
}


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
function preload() {
  birdUpflap = loadImage('images/bird-upflap.png');
  birdMidflap = loadImage('images/bird-midflap.png');
  birdDownflap = loadImage('images/bird-downflap.png');
  pipeSprite = loadImage('images/pipe.png');
  pipeOnderstebovenSprite = loadImage('images/pipe-ondersteboven.jpg');
  groundSprite = loadImage('images/ground.png');
  background = loadImage('images/background.png');
}

var currentFlap = 0;
function setup() {
  // angle mode zetten (om in graden te kunnen rekenen)
  angleMode(DEGREES);
  // Plaatjes laden

  setInterval(function() {
    if(spelStatus === SPELEN || spelStatus === STARTMENU) {
      if(currentFlap < 2) {
        currentFlap++;
      } else {
        currentFlap = 0;
      }
    }
  }, 150)


  // Maak een canvas (rechthoek) waarin je je speelveld kunt tekenen
  createCanvas(canvasBreedte, canvasHoogte);
}


/**
 * draw
 * de code in deze functie wordt meerdere keren per seconde
 * uitgevoerd door de p5 library, nadat de setup functie klaar is
 */

function draw() {
  frame++;
  switch (spelStatus) {
    case STARTMENU:
      tekenVeld();
      tekenGrond();
      tekenSpeler();
      break;
    case SPELEN:
      tekenVeld();
      tekenSpeler();
      updateSpeler();

      var teVerwijderen;
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
        updateBuis(buis);
        if(buis[0] < -100) {
          teVerwijderen = i;
        }
        if(buis[2] == false && richting === 2 && buis[0] < 100) {
          score++;
          buis[2] = true;
        } else if(buis[2] == false && richting === -2 && buis[0] > 430) {
          score++;
          buis[2] = true;
        }
      })
      if(teVerwijderen) {
        buizen.splice(teVerwijderen, 1);
      }

      if(richting === -1) {
        if(spelerX >= 450) {
          var teVerwijderen = [];
          buizen.forEach(function(buis, i) {
            if(buis[0] > spelerX) {
              teVerwijderen.push(buis);
            } else {
              buis[2] = false;
            }
          })
          teVerwijderen.forEach(function(buis) {
            var index = array.indexOf(buis);
            if (index > -1) {
              array.splice(index, 1);
            }
          })
          richting = -2;
        } else {
          spelerX += snelheid;
        }
      } else if(richting === 1) {
        if(spelerX <= 120) {
          var teVerwijderen = [];
          buizen.forEach(function(buis, i) {
            if(buis[0] < spelerX) {
              teVerwijderen.push(buis);
            } else {
              buis[2] = false;
            }
          })
          teVerwijderen.forEach(function(buis) {
            var index = array.indexOf(buis);
            if (index > -1) {
              array.splice(index, 1);
            }
          })
          richting = 2;
        } else {
          spelerX -= snelheid;
        }
      }

      tekenGrond();
      tekenScore();

      if (checkGameOver()) {
        if(score > highScore) {
          highScore = score;
          newHighScore = true;
        } else {
          newHighScore = false;
        }
        spelStatus = GAMEOVER;
        spelerSnelheidY = 1;
      }
      break;
    case GAMEOVER:
      tekenVeld();
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
      })
      tekenGrond();
      spelerValt();
      if(spelerY > grondHoogte) {
        tekenGameoverMenu();
      }
      break;
  }
}

setInterval(function() {
  if(spelStatus === SPELEN) {
    if(richting === 2) {
      buizen.push([canvasBreedte, random(-50, 300), false]);
    } else if(richting === -2) {
      buizen.push([-buisBreedte, random(-50, 300), false]);
    }
  }
}, buisInterval * 2000 / snelheid);


var input = function() {
  if(spelStatus === SPELEN) {
    spelerSnelheidY = -20;
  } else if(spelStatus === STARTMENU) {
    spelerSnelheidY = -20;
    spelStatus = SPELEN;
  } else if(spelStatus === GAMEOVER) {
    resetSpel();
  }
}

function keyPressed() {
  if(keyCode === UP_ARROW || keyCode === 32) {
    input();
  }
  if(keyCode === RIGHT_ARROW) {
    richting = -1;
  }
  if(keyCode === LEFT_ARROW) {
    richting = 1;
  }
}
function mousePressed() {
  input();
}

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

const MENU = 0;
const WAITING = 1;
const SPELEN = 2;
const GAMEOVER = 3;

const canvasHoogte = 950;
const canvasBreedte = 600;
const buisInterval = 2; // interval voordat er weer een nieuwe buis spawnt
const grondHoogte = 200;

// speler variables
var spelerX = canvasBreedte / 2;
var spelerYStart = 360;
var spelerY = spelerYStart;
var spelerSnelheidY = 0;
var toetsAlIngedrukt = false;

// buizen
var buizen = []; // nested array, formaat = ["xPos", "yOffset", "scoreAdded"];
const hoogteTussenBuizen = 150;
const buisBreedte = 100;


// score
var scoreboardY = canvasHoogte + 199;
var gameoverOpacity = 0;
var score = 0; // aantal behaalde punten
var highScore = 0;
var flashOpacity = 255;
var countdownScore = -1;

// overig
var snelheid = 4;
var spelStatus = MENU;
var frame = 0;
var playButtonY = 500;
var menuButtonY = canvasHoogte + 42;
var homeModusButtonY = 600;
var gameoverFrame;
var mode = 0; // 0 = normal mode, 1 = home mode

// richting uitleg:
// -2 = reverse (naar links vliegen)
// -1 = naar links vliegen overgaan
// 1 = naar rechts vliegen overgaan
// 2 = normaal (naar rechts vliegen)
var richting = 2; // richting is aan het begin naar rechts vliegen (dus 2)


/* ********************************************* */
/*      functies die je gebruikt in je game      */
/* ********************************************* */


function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, img_angle){
  push();
  imageMode(CENTER);
  translate(img_x+img_width/2, img_y+img_width/2);
  rotate(img_angle);
  image(img, 0, 0, img_width, img_height);
  pop();
}

function resetSpel() {
  spelStatus = WAITING;
  spelerY = spelerYStart;
  spelerSnelheidY = 0;
  buizen = [];
  score = 0;
  countdownScore = -1;
  spelerX = 120;
  richting = 2;
  scoreboardY = canvasHoogte + 199;
  gameoverOpacity = 0;
  playButtonY = canvasHoogte + 87;
  menuButtonY = canvasHoogte + 42;
  flashOpacity = 255;
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

var tekenMenu = function() {
  push();
  imageMode(CENTER);
  image(playButton, canvasBreedte / 2, playButtonY, 156, 87);
  image(homeModusButton, canvasBreedte / 2, homeModusButtonY, 156, 87);
  image(flappyBirdText, canvasBreedte / 2, 200, 356, 96);
  pop();
}

var statePx = 0;
var tekenGrond = function() {
  var groundHeight = groundSprite.height / groundSprite.width * canvasBreedte;
  if(spelStatus !== GAMEOVER) {
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
  push();
  imageMode(CENTER);
  var digits = score.toString().length;
  var y = 90;
  if(digits === 1) {
    image(cijfers[score], canvasBreedte / 2, 90, 48, 72);
  } else if(digits === 2) {
    image(cijfers[score.toString()[0]], canvasBreedte / 2 - 25, y, 48, 72);
    image(cijfers[score.toString()[1]], canvasBreedte / 2 + 25, y, 48, 72);
  } else if(digits === 3) {
    image(cijfers[score.toString()[0]], canvasBreedte / 2 - 55, y, 48, 72);
    image(cijfers[score.toString()[1]], canvasBreedte / 2, y, 48, 72);
    image(cijfers[score.toString()[2]], canvasBreedte / 2 + 55, y, 48, 72);
  }
  if(mode === 1 && countdownScore >= 0) {
    digits = countdownScore.toString().length;
    y = 180;
    push();
    tint(0, 180, 0);
    if(digits === 1) {
      image(cijfers[countdownScore], canvasBreedte / 2, y, 48, 72);
    } else if(digits === 2) {
      image(cijfers[countdownScore.toString()[0]], canvasBreedte / 2 - 25, y, 48, 72);
      image(cijfers[countdownScore.toString()[1]], canvasBreedte / 2 + 25, y, 48, 72);
    } else if(digits === 3) {
      image(cijfers[countdownScore.toString()[0]], canvasBreedte / 2 - 55, y, 48, 72);
      image(cijfers[countdownScore.toString()[1]], canvasBreedte / 2, y, 48, 72);
      image(cijfers[countdownScore.toString()[2]], canvasBreedte / 2 + 55, y, 48, 72);
    }
    pop();
  }
  pop();
}

var tekenSpeler = function() {
  var sprite = birdUpflap;
  if(currentFlap === 1) {
    sprite = birdMidflap;
  } else if(currentFlap === 2) {
    sprite = birdDownflap;
  }
  rotate_and_draw_image(sprite, spelerX - 35, spelerY - 35, sprite.width * 2, sprite.height * 2, spelerSnelheidY);
  if(spelStatus === MENU) {
    spelerY = sin(frame * 4) * 10 + spelerYStart;
  } else if(spelStatus === WAITING) {
    spelerY = sin(frame * 7) * 10 + spelerYStart;
  }
}

var spelerValt = function() {
  if(spelerY < canvasHoogte - grondHoogte) {
    spelerSnelheidY += 0.4;
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
  if(frame - gameoverFrame > 40) {
    // 40 frames nadat de speler doodgaat komt het menu met een animatie in beeld
    push();
    imageMode(CENTER);
    // teken scorebord achtergrond
    var dy = scoreboardY - 440;
    scoreboardY -= dy * 0.05;
    if(gameoverOpacity < 255) {
      gameoverOpacity+= 5;
    }
    image(scoreboard, canvasBreedte / 2, scoreboardY, 395, 199);

    // teken speelknop
    if(scoreboardY < 500 && frame - gameoverFrame < 200) { // na 200 frames stopt de animatie
      var dy = playButtonY - 630;
      playButtonY -= dy * 0.07;
    }
    image(playButton, canvasBreedte / 2, playButtonY, 156, 87);

    // teken game over tekst
    push();
    tint(255, gameoverOpacity);
    image(gameover, canvasBreedte / 2, 200, 288, 63);
    pop();

    // teken menuknop
    if(frame - gameoverFrame > 100 && frame - gameoverFrame < 200) { // na 100 frames komt de animatie in beeld, na 200 frames stopt de animatie
      var dy = menuButtonY - 715;
      menuButtonY -= dy * 0.07;
    }
    image(menuButton, canvasBreedte / 2, menuButtonY, 120, 42);

    // teken score
    score = score.toString();
    var digits = score.length;
    if(digits === 1) {
      score =  "00" + score;
    } else if(digits == 2) {
      score =  "0" + score;
    }
    image(cijfers[score[0]], 410, scoreboardY - 25, 16, 24);
    image(cijfers[score[1]], 430, scoreboardY - 25, 16, 24);
    image(cijfers[score[2]], 450, scoreboardY - 25, 16, 24);

    // teken high score
    highScore = highScore.toString();
    var digits = highScore.length;
    if(digits === 1) {
      highScore =  "00" + highScore;
    } else if(digits == 2) {
      highScore =  "0" + highScore;
    }
    image(cijfers[highScore[0]], 410, scoreboardY + 45, 16, 24);
    image(cijfers[highScore[1]], 430, scoreboardY + 45, 16, 24);
    image(cijfers[highScore[2]], 450, scoreboardY + 45, 16, 24);

    // teken medaille
    var medal;
    if(score >= 100) {
      medal = platinumMedal;
    } else if(score >= 50) {
      medal = goldMedal;
    } else if(score >= 25) {
      medal = silverMedal;
    } else if(score >= 10) {
      medal = bronzeMedal;
    }
    if(medal) {
      image(medal, 188, scoreboardY + 12, 80, 80);
    }

    pop();
  } else {
    // flits bij het doodgaan
    if(flashOpacity > 0) {
      flashOpacity-= 5;
    }
    fill(255, 255, 255, flashOpacity);
    rect(0, 0, canvasBreedte, canvasHoogte);
  }
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
let groundSprite;
let background;
let scoreboard;
let gameover;
let playButton;
let homeModusButton;
let menuButton;
let flappyBirdText;
let getReadyText;
let tapToJump;
let bronzeMedal;
let silverMedal;
let goldMedal;
let platinumMedal;
let uitlegBord;
var cijfers = [];
function preload() {
  [0,1,2,3,4,5,6,7,8,9].forEach(function(num) {
    cijfers.push(loadImage("images/numbers/" + num + ".png"));
  });
  birdUpflap = loadImage('images/bird-upflap.png');
  birdMidflap = loadImage('images/bird-midflap.png');
  birdDownflap = loadImage('images/bird-downflap.png');
  pipeSprite = loadImage('images/pipe.png');
  groundSprite = loadImage('images/ground.png');
  background = loadImage('images/background.png');
  scoreboard = loadImage('images/scoreboard.png');
  gameover = loadImage('images/GameOver.png');
  playButton = loadImage('images/play.png');
  homeModusButton = loadImage('images/homeModusButton.png');
  menuButton = loadImage('images/menuButton.png');
  flappyBirdText = loadImage('images/FlappyBird.png');
  getReadyText = loadImage('images/GetReady.png');
  tapToJump = loadImage('images/tap.png');
  bronzeMedal = loadImage("images/medals/bronze.png");
  silverMedal = loadImage("images/medals/silver.png");
  goldMedal = loadImage("images/medals/gold.png");
  platinumMedal = loadImage("images/medals/platinum.png");
  uitlegBord = loadImage('images/uitlegBord.png')
}

var currentFlap = 0;
function setup() {
  // angle mode zetten (om in graden te kunnen rekenen)
  angleMode(DEGREES);
  // Plaatjes laden

  setInterval(function() {
    if(spelStatus === SPELEN || spelStatus === MENU) {
      if(currentFlap < 2) {
        currentFlap++;
      } else {
        currentFlap = 0;
      }
    }
  }, 150)


  // Maak een canvas (rechthoek) waarin je je speelveld kunt tekenen
  let canvasElement = createCanvas(canvasBreedte, canvasHoogte).elt;
  // Dit volgende stukje code zorgt ervoor dat de browser voor het groter maken van de plaatjes het 'nearest neighbour' algoritme gebruikt
  // zodat de plaatjes er niet vaag uitzien (bron: )
  let context = canvasElement.getContext('2d');
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
}


/**
 * draw
 * de code in deze functie wordt meerdere keren per seconde
 * uitgevoerd door de p5 library, nadat de setup functie klaar is
 */

function draw() {
  frame++;
  switch (spelStatus) {
    case MENU:
      tekenVeld();
      tekenGrond();
      tekenSpeler();
      tekenMenu();
      break;
    case WAITING:
      tekenVeld();
      tekenGrond();
      tekenSpeler();
      push();
      imageMode(CENTER);
      image(tapToJump, canvasBreedte / 2, 400, 228, 196);
      if(mode === 0) {
        image(getReadyText, canvasBreedte / 2, 150, 276, 75);
      } else if(mode === 1) {
        image(uitlegBord, canvasBreedte / 2, 150);
      }
      pop();
      break;
    case SPELEN:
      tekenVeld();
      tekenSpeler();
      updateSpeler();
      var teVerwijderen = [];
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
        updateBuis(buis);
        if(richting === 2 && buis[0] < -buisBreedte) {
          teVerwijderen.push(buis);
        } else if(richting === -2 && buis[0] > canvasBreedte) {
          teVerwijderen.push(buis);
        }
        if(buis[2] == false && richting === 2 && buis[0] < 100) {
          score++;
          buis[2] = true;
        } else if(buis[2] == false && richting === -2 && buis[0] > 430) {
          countdownScore--;
          buis[2] = true;
        }
      })
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
          richting = -2;
        } else {
          spelerX += snelheid;
        }
      }
      teVerwijderen.forEach(function(buis) {
        var index = buizen.indexOf(buis);
        if (index > -1) {
          buizen.splice(index, 1);
        }
      })
      tekenGrond();
      tekenScore();
      if (checkGameOver()) {
        gameoverFrame = frame;
        playButtonY = canvasHoogte + 87;
        menuButtonY = canvasHoogte + 42;
        spelStatus = GAMEOVER;
        if(score > highScore) {
          highScore = score;
        }
      }
      break;
    case GAMEOVER:
      tekenVeld();
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]);
      })
      tekenGrond();
      spelerValt();
      tekenGameoverMenu();
      break;
  }
}

setInterval(function() {
  if(spelStatus === SPELEN) {
    if(richting === 2) {
      buizen.push([canvasBreedte, random(-50, 300), false]);
    } else if(richting === -2) {
      var buizenLinksVanSpeler = 0;
      buizen.forEach(function(buis) {
        if(buis[0] < spelerX) {
          buizenLinksVanSpeler++;
        }
      })
      if(buizenLinksVanSpeler < countdownScore) {
        buizen.push([-buisBreedte, random(-50, 300), false]);
      }
    }
  }
}, buisInterval * 2000 / snelheid);


var input = function() {
  if(spelStatus === WAITING) {
    spelStatus = SPELEN;
    spelerSnelheidY = -20;
  } else if(spelStatus === SPELEN) {
    spelerSnelheidY = -20;
  }
}

function keyPressed() {
  if(keyCode === UP_ARROW) {
    input();
  }
  if(spelStatus === SPELEN && mode === 1 && keyCode === 32) {
    countdownScore = score;
    richting = -1;
  }
}
var clickedOnPlay = false;
var clickedOnHomeModus = false;
var clickedOnMenu = false;
function mousePressed() {
  input();
  if(spelStatus === MENU || spelStatus === GAMEOVER) {
    // Check of er op de speel knop wordt geklikt (kan zowel in het menu als game over scherm)
    var clickedX = mouseX > canvasBreedte / 2 - 78 && mouseX < canvasBreedte / 2 + 78;
    var clickedY = mouseY > playButtonY - 44 && mouseY < playButtonY + 44;
    if(clickedX && clickedY) {
      if(spelStatus === MENU || (spelStatus === GAMEOVER && frame - gameoverFrame >= 195)) {
        clickedOnPlay = true;
        playButtonY += 10;
      }
    }
  } else {
    clickedOnPlay = false;
  }
  if(spelStatus === MENU) {
    // Check of er op de home modus knop wordt geklikt (kan alleen in het menu)
    var clickedX = mouseX > canvasBreedte / 2 - 78 && mouseX < canvasBreedte / 2 + 78;
    var clickedY = mouseY > homeModusButtonY - 44 && mouseY < homeModusButtonY + 44;
    if(clickedX && clickedY) {
      clickedOnHomeModus = true;
      homeModusButtonY += 10;
    }
  } else {
    clickedOnHomeModus = false;
  }
  if(spelStatus === GAMEOVER) {
    // Check of er op de menuknop wordt geklikt (kan alleen in het game over scherm)
    var clickedX = mouseX > canvasBreedte / 2 - 60 && mouseX < canvasBreedte / 2 + 60;
    var clickedY = mouseY > menuButtonY - 21 && mouseY < menuButtonY + 21;
    if(clickedX && clickedY) {
      clickedOnMenu = true;
      menuButtonY += 10;
    }
  } else {
    clickedOnMenu = false;
  }
}
function mouseReleased() {
  if(clickedOnPlay) {
    if(spelStatus === MENU) {
      spelerX = 120;
      spelStatus = WAITING;
      mode = 0;
    } else if(spelStatus === GAMEOVER) {
      resetSpel();
    }
  } else if(clickedOnHomeModus) {
    spelerX = 120;
    spelStatus = WAITING;
    mode = 1;
  } else if(clickedOnMenu) {
    resetSpel();
    spelerX = canvasBreedte / 2;
    spelStatus = MENU;
    playButtonY = 500;
    // spelerSnelheidY = 0;
  }
}

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
const grondHoogte = 200;

// speler variables
var spelerX = canvasBreedte / 2;
var spelerYStart = 360; // begin Y-positie van de speler
var spelerY = spelerYStart;
var spelerSnelheidY = 0;
var currentFlap = 0; // huidige flap fase, voor de animatie van de vogel

// buizen
var buizen = []; // nested array, formaat = ["xPos (int)", "yOffset (int, van het midden)", "scoreAdded (boolean)"];
const hoogteTussenBuizen = 150;
const buisBreedte = 100;
const buisInterval = 2; // interval voordat er weer een nieuwe buis spawnt

// score
var scoreboardY = canvasHoogte + 199; // voor de animatie van het scorebord als je doodgaat
var headerOpacity = 0; // voor de animatie van de titel als je doodgaat (fade in)
var score = 0; // aantal behaalde punten
var highScore = 0;
var flashOpacity = 255; // voor de "flash" als je doodgaat, de flash wordt zichtbaar zodra je doodgaat en verandert snel naar 0
var countdownScore = -1; // de reverse score voor de home modus, deze wordt steeds kleiner naarmate je je score "terughaalt"

// overig
var snelheid = 4;
var spelStatus = MENU;
var frame = 0;
var playButtonY = 500; // Y-positie van de speelknop
var menuButtonY = canvasHoogte + 42; // Y-positie van de menuknop
var homeModusButtonY = 600; // Y-positie van de home modus knop
var gameoverFrame;
var mode = 0; // 0 = normal mode, 1 = home mode
var aantalFramesNaGewonnen = 0; // begint op 0 als de speler doodgaat en komt 1 bij per frame, dit wordt gebruikt voor een aantal animaties

// richting uitleg:
// -2 = reverse (naar links vliegen)
// -1 = naar links vliegen overgaan
// 1 = naar rechts vliegen overgaan
// 2 = normaal (naar rechts vliegen)
var richting = 2; // richting is aan het begin naar rechts vliegen (dus 2)


/* ********************************************* */
/*      functies die je gebruikt in je game      */
/* ********************************************* */


// BRON: https://stackoverflow.com/a/61434034/9497123 (is een beetje aangepast naar onze voorkeur)
function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, img_angle){
  push();
  imageMode(CENTER);
  translate(img_x+img_width/2, img_y+img_width/2);
  rotate(img_angle);
  image(img, 0, 0, img_width, img_height);
  pop();
}

// Als het spel opnieuw begint wordt deze functie opgeroepen en worden
// alle variables weer op de standaardwaarden gezet
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
  headerOpacity = 0;
  playButtonY = canvasHoogte + 87;
  menuButtonY = canvasHoogte + 42;
  flashOpacity = 255;
  aantalFramesNaGewonnen = 0;
  countdownScore = -1;
}


// Tekent het speelveld (achtergrond)
var tekenVeld = function() {
  var groundHeight = groundSprite.height / groundSprite.width * canvasBreedte;
  var backgroundHeight = canvasHoogte - groundHeight;
  var backgroundWidth = background.width / backgroundHeight * canvasBreedte;
  image(background, 0, 0, canvasBreedte, backgroundHeight);
};


var statePx = 0; // variable om de beweging van de grond goed te laten verlopen
// Tekent de grond (dit is een aparte functie omdat de layers anders niet goed over elkaar heen konden)
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

// Tekent het hoofdmenu
var tekenMenu = function() {
  push();
  imageMode(CENTER);
  image(playButton, canvasBreedte / 2, playButtonY, 156, 87);
  image(homeModusButton, canvasBreedte / 2, homeModusButtonY, 156, 87);
  image(flappyBirdText, canvasBreedte / 2, 200, 356, 96);
  pop();
}

// Tekent de score
var tekenScore = function() {
  push();
  imageMode(CENTER); // om de score in het midden te krijgen
  var digits = score.toString().length; // aantal cijfers van de score
  var y = 90; // y-postiie van de score
  if(digits === 1) {
    // bij 1 cijfer in de score hoeft er maar 1 plaatje getekend
    image(cijfers[score], canvasBreedte / 2, 90, 48, 72);
  } else if(digits === 2) {
    // bij 2 cijfers in de score moeten er 2 plaatjes getekend worden
    image(cijfers[score.toString()[0]], canvasBreedte / 2 - 25, y, 48, 72);
    image(cijfers[score.toString()[1]], canvasBreedte / 2 + 25, y, 48, 72);
  } else if(digits === 3) {
    // bij 3 cijfers in de score moeten er 3 plaatjes getekend worden
    image(cijfers[score.toString()[0]], canvasBreedte / 2 - 55, y, 48, 72);
    image(cijfers[score.toString()[1]], canvasBreedte / 2, y, 48, 72);
    image(cijfers[score.toString()[2]], canvasBreedte / 2 + 55, y, 48, 72);
  }
  // dus de maximale score die je kunt halen is 999 ;)

  if(mode === 1 && countdownScore >= 0) {
    // als de speler in de home modus zit en op dit moment terug aan het keren is
    // naar huis, tekent het spel ook de groene "countdown score", dit houdt in hoeveel
    // punten de speler nog moet halen om naar huis terug te keren
    // Hier zelfde verhaal als bij de normale score qua tekentechniek
    digits = countdownScore.toString().length;
    y = 160;
    push();
    tint(0, 180, 0); // maakt de countdown score groen
    if(digits === 1) {
      image(cijfers[countdownScore], canvasBreedte / 2, y, 24, 36);
    } else if(digits === 2) {
      image(cijfers[countdownScore.toString()[0]], canvasBreedte / 2 - 25, y, 24, 36);
      image(cijfers[countdownScore.toString()[1]], canvasBreedte / 2 + 25, y, 24, 36);
    } else if(digits === 3) {
      image(cijfers[countdownScore.toString()[0]], canvasBreedte / 2 - 55, y, 24, 36);
      image(cijfers[countdownScore.toString()[1]], canvasBreedte / 2, y, 24, 36);
      image(cijfers[countdownScore.toString()[2]], canvasBreedte / 2 + 55, y, 24, 36);
    }
    pop();
  }
  pop();
}

// Tekent de speler
var tekenSpeler = function() {
  // op basis van de vogel "fase" wordt er een sprite getekend voor de animatie van de vogel
  var sprite = birdUpflap;
  if(currentFlap === 1) {
    sprite = birdMidflap;
  } else if(currentFlap === 2) {
    sprite = birdDownflap;
  }
  // de rotatie staat gelijk aan de snelheid van de speler, daardoor wordt de vogel
  // naar beneden gekanteld als de speler naar beneden valt en omhoog als de speler omhoog gaat
  rotate_and_draw_image(sprite, spelerX - 35, spelerY - 35, sprite.width * 2, sprite.height * 2, spelerSnelheidY);
  if(spelStatus === MENU) {
    // dit zorgt ervoor dat de speler smooth op en neer beweegt in het menu met een sinus functie
    spelerY = sin(frame * 4) * 10 + spelerYStart;
  } else if(spelStatus === WAITING) {
    // bij de "waiting" status (als je moet klikken om te beginnen) beweegt de vogel sneller op en neer
    spelerY = sin(frame * 7) * 10 + spelerYStart;
  }
}

// Als de speler game over is, wordt deze functie elk frame uitgevoerd. Deze functie
// zorgt voor de val-animatie van de vogel.
var spelerValt = function() {
  if(spelerY < canvasHoogte - grondHoogte) {
    spelerSnelheidY += 0.4;
    spelerY += spelerSnelheidY;
  }
  rotate_and_draw_image(birdMidflap, spelerX - 40, spelerY - 40, birdMidflap.width * 2, birdMidflap.height * 2, 70);
}

// Update de speler
var updateSpeler = function() {
  spelerSnelheidY += 1; // hierdoor valt de vogel naar beneden (positieve Y-snelheid = naar beneden vallen)
  spelerY += spelerSnelheidY; // hierdoor beweegt de speler, op basis van de snelheid variable
}

// Tekent een buis (wordt dus voor elke buis uitgevoerd)
var tekenBuis = function(x, yOffset) {
  var imgHoogte = pipeSprite.height / pipeSprite.width * buisBreedte
  // pijp boven
  var y = canvasHoogte / 2 - yOffset - hoogteTussenBuizen;
  rotate_and_draw_image(pipeSprite, x, y - 355, buisBreedte, imgHoogte, 180, 0);
  // pijp onder
  var y2 = canvasHoogte / 2 - yOffset + hoogteTussenBuizen;
  rotate_and_draw_image(pipeSprite, x, y2 + 255, buisBreedte, imgHoogte);
}

// Beweegt de buizen (op basis van de richting en snelheid variables)
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


// Zoekt uit of de speler game over is
var checkGameOver = function() {
  var gameOver = false;
  if(spelerY > canvasHoogte - grondHoogte) {
    // als de speler de grond raakt
    gameOver = true;
  }
  buizen.forEach(function(buis) {
    // loop door alle buizen, en bepaal of de speler deze buis raakt
    var raaktBuisX = spelerX + 20 > buis[0] && spelerX - 20 < buis[0] + buisBreedte;
    var raaktBuisBoven = spelerY < canvasHoogte / 2 - buis[1] - hoogteTussenBuizen + 20; // lager = minder snel botsing
    var raaktBuisOnder = spelerY > canvasHoogte / 2 - buis[1] + hoogteTussenBuizen - 15; // lager = minder snel botsing
    if(raaktBuisX && (raaktBuisBoven || raaktBuisOnder)) {
      // Als de speler de buis boven OF onder raakt is hij/zij game over
      gameOver = true;
    }
  })
  return gameOver;
};

// Tekent het game over menu
var tekenGameoverMenu = function() {
  if(frame - gameoverFrame > 40) {
    // 40 frames nadat de speler doodgaat komt het menu met een animatie in beeld
    push();
    imageMode(CENTER); // om alle plaatjes makkelijk in het midden te tekenen
    // teken scorebord achtergrond
    var dy = scoreboardY - 440; // afstand tussen scoreboard en de uiteindelijke Y-positie
    scoreboardY -= dy * 0.05; // vermenigvuldigen met 0,05 voor een smooth animatie (hoe hoger, hoe sneller)
    image(scoreboard, canvasBreedte / 2, scoreboardY, 395, 199);

    // teken speelknop
    if(scoreboardY < 500 && frame - gameoverFrame < 200) { // na 200 frames stopt de animatie
      var dy = playButtonY - 630; // afstand tussen speelknop en de uiteindelijke Y-positie
      playButtonY -= dy * 0.07; // vermenigvuldigen met 0,07 voor een smooth animatie (hoe hoger, hoe sneller)
    }
    image(playButton, canvasBreedte / 2, playButtonY, 156, 87);

    // teken hoofdtekst ("game over" of "gefeliciteerd")
    if(headerOpacity < 255) {
      headerOpacity += 5;
      // voor een "fade in" van de hoofdtekst
    }
    push();
    tint(255, headerOpacity); // de opacity toepassen
    if(mode === 0) {
      // bij normale modus
      image(gameover, canvasBreedte / 2, 200, 288, 63);
    } else if(countdownScore > 0 || countdownScore === -1 || score === 0) {
      // bij home modus, maar als de speler nog niet levend is teruggekeerd
      image(gameover, canvasBreedte / 2, 200, 288, 63);
      image(nietLevendTeruggekeerd, canvasBreedte / 2, 270, 296, 57);
    } else {
      // bij home modus als de speler het heeft gehaald
      image(gefeliciteerd, canvasBreedte / 2, 200, 360, 142);
    }
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

    // teken medaille (bij >= 10 bronze, bij >= 25 zilver, bij >= 50 goud, en bij >= 100 platinum)
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
    if(medal) { // als er een medaille getekend moet worden ...
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


// alle plaatjes variables
let birdUpflap;
let birdMidflap;
let birdDownflap;
let pipeSprite;
let groundSprite;
let background;
let scoreboard;
let gameover;
let gefeliciteerd;
let nietLevendTeruggekeerd;
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
var cijfers = []; // cijfers plaatjes komen in een array om regels te besparen
function preload() {
  // alle plaatjes laden
  [0,1,2,3,4,5,6,7,8,9].forEach(function(num) {
    // de cijfers in 1 keer laden om regels te besparen
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
  gefeliciteerd = loadImage('images/Gefeliciteerd.png')
  nietLevendTeruggekeerd = loadImage('images/NietLevendTeruggekeerd.png');
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

// setup (wordt 1 keer uitgevoerd aan het begin)
function setup() {
  // angle mode zetten (om in graden te kunnen rekenen)
  angleMode(DEGREES);

  // elke 150ms (0,15s) de vogel "fase" veranderen, voor de vlieganimatie van de vogel
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
  // zodat de plaatjes er niet vaag uitzien (bron: https://github.com/processing/p5.js/issues/1845#issuecomment-365419633)
  let context = canvasElement.getContext('2d');
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
}


// draw (wordt elk frame uitgevoerd)
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
      // loop door alle buizen heen
      buizen.forEach(function(buis, i) {
        tekenBuis(buis[0], buis[1]); // tekent de buis
        updateBuis(buis); // updatet / beweegt de buis
        if(richting === 2 && buis[0] < -buisBreedte) {
          // als de buis uit het canvas is
          teVerwijderen.push(buis);
        } else if(richting === -2 && buis[0] > canvasBreedte) {
          // als de buis uit het canvas is
          teVerwijderen.push(buis);
        }
        if(buis[2] == false && richting === 2 && buis[0] < 100) {
          // als er nog GEEN score is toegevoegd door deze buis, voeg dan score toe
          // en zet de variable dat er al score toegevoegd is op true
          score++;
          buis[2] = true;
        } else if(buis[2] == false && richting === -2 && buis[0] > 430) {
          // zelfde verhaal als hiervoor, maar dan voor de "reverse" score voor de
          // home modus, er wordt dus elke keer score afgehaald totdat de speler 0 bereikt
          countdownScore--;
          buis[2] = true;
        }
      })
      if(richting === -1) {
        if(spelerX >= 450) {
          // na de overgang van naar rechts vliegen naar naar links vliegen
          // moeten een aantal buizen verwijderd worden omdat er anders te veel
          // buizen in beeld komen
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
          // tijdens de overgang van richting wordt de snelheid aan de X-positie van de speler toegevoegd
          spelerX += snelheid;
        }
      }
      // loop door alle "te verwijderen" buizen en verwijder ze met de splice functie
      teVerwijderen.forEach(function(buis) {
        var index = buizen.indexOf(buis); // vind de buis
        if (index > -1) { // als de buis in de array is
          buizen.splice(index, 1); // verwijder de buis
        }
      })
      tekenGrond();
      tekenScore();
      if(countdownScore === 0) {
        // als de speler in home modus zit en de eindscore heeft bereikt
        aantalFramesNaGewonnen++;
      }
      if (checkGameOver() || aantalFramesNaGewonnen > 50) {
        // bij game over (of gewonnen)
        gameoverFrame = frame;
        playButtonY = canvasHoogte + 87;
        menuButtonY = canvasHoogte + 42;
        spelStatus = GAMEOVER;
        if(score > highScore && (mode === 0 || countdownScore === 0)) {
          // als de score hoger is dan de highscore
          // (en de speler veilig is teruggekeerd, indien hij/zij in home modus zit)
          highScore = score;
        }
        if(mode === 1 && countdownScore !== 0) {
          // als de speler in home modus zit moet hij/zij wel weer teruggekeerd zijn,
          // anders is de score 0
          score = 0;
        }
      }
      break;
    case GAMEOVER:
      tekenVeld();
      buizen.forEach(function(buis, i) {
        // loop door alle buizen heen en teken ze
        tekenBuis(buis[0], buis[1]);
      })
      tekenGrond();
      spelerValt(); // zorgt voor de val animatie van de speler
      tekenGameoverMenu();
      break;
  }
}

setInterval(function() {
  // elke buisInterval aantal seconden wordt er een nieuwe buis getekend
  // (als de spelstatus spelen is)
  if(spelStatus === SPELEN) {
    if(richting === 2) {
      // voeg een nieuwe buis toe aan de array als de richting naar rechts is
      buizen.push([canvasBreedte, random(-50, 300), false]); // de Y-offset is random tussen de -50 en 300
    } else if(richting === -2) {
      // alsde richting naar links is (bij home modus)
      var buizenLinksVanSpeler = 0; // houdt het aantal buizen links van de speler bij
      buizen.forEach(function(buis) {
        if(buis[0] < spelerX) {
          // check voor elke buis of de buisX kleiner is dan de spelerX
          buizenLinksVanSpeler++;
        }
      })
      if(buizenLinksVanSpeler < countdownScore) {
        // als er bijv. 3 buizen links van de speler zijn en de countdownScore
        // is al 3 moeten er geen nieuwe buizen meer bijkomen. Dus alleen als het aantal
        // buizen links van de speler kleiner is dan de countdown score, spawnt er een nieuwe buis
        buizen.push([-buisBreedte, random(-50, 300), false]); // de Y-offset is random tussen de -50 en 300
      }
    }
  }
}, buisInterval * 2000 / snelheid);

// input functie, als er op de linkermuisknop of pijltje omhoog is gedrukt
var input = function() {
  if(spelStatus === WAITING) {
    // als de status WAITING is begint het spel (en springt de speler gelijk)
    spelStatus = SPELEN;
    spelerSnelheidY = -20;
  } else if(spelStatus === SPELEN) {
    // als de spelstatus SPELEN is springt de speler door de Y snelheid negatief te zetten
    spelerSnelheidY = -20;
  }
}

function keyPressed() {
  if(keyCode === UP_ARROW) {
    input(); // voert de input functie uit bij pijltje omhoog
  }
  if(spelStatus === SPELEN && mode === 1 && keyCode === 32 && score > 0) {
    // als de speler in home modus op spatie drukt, verandert de richting. Ook wordt
    // de countdownScore op de huidige score gezet, deze moet de speler dus naar 0 zien te krijgen
    countdownScore = score;
    richting = -1;
  }
}

// deze variables bepalen voor elke knop of de speler erop heeft geklikt
var clickedOnPlay = false;
var clickedOnHomeModus = false;
var clickedOnMenu = false;
function mousePressed() {
  input(); // voert de input functie uit bij klikken
  if(spelStatus === MENU || spelStatus === GAMEOVER) {
    // Check of er op de speel knop wordt geklikt (kan zowel in het menu als game over scherm)
    var clickedX = mouseX > canvasBreedte / 2 - 78 && mouseX < canvasBreedte / 2 + 78;
    var clickedY = mouseY > playButtonY - 44 && mouseY < playButtonY + 44;
    if(clickedX && clickedY) {
      if(spelStatus === MENU || (spelStatus === GAMEOVER && frame - gameoverFrame >= 195)) {
        // als er geklikt is, gaat de Y positie van de knop + 10 om de knop naar beneden te bewegen
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
      // als er geklikt is, gaat de Y positie van de knop + 10 om de knop naar beneden te bewegen
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
      // als er geklikt is, gaat de Y positie van de knop + 10 om de knop naar beneden te bewegen
      clickedOnMenu = true;
      menuButtonY += 10;
    }
  } else {
    clickedOnMenu = false;
  }
}
function mouseReleased() {
  if(clickedOnPlay) {
    // als de speler op de play knop heeft geklikt
    if(spelStatus === MENU) {
      spelerX = 120; // zet de speler links op het veld
      spelStatus = WAITING; // zet de status op WATIING
      mode = 0; // zet de modus op 0 (normal mode)
    } else if(spelStatus === GAMEOVER) {
      resetSpel();
    }
  } else if(clickedOnHomeModus) {
    // als de speler op de home modus knop heeft geklikt
    spelerX = 120; // zet de speler links op het veld
    spelStatus = WAITING; // zet de status op WATIING
    mode = 1; // zet de modus op 1 (home mode)
  } else if(clickedOnMenu) {
    // als de speler op de menuknop heeft geklikt
    resetSpel(); // reset het spel
    spelerX = canvasBreedte / 2; // zet de speler weer in het midden
    spelStatus = MENU; // zet de spelstatus op MENU
    playButtonY = 500; // zet de playButtonY op 500, zodat deze weer naar boven komt
  }
}

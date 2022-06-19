// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

// preload images
var img1 = new Image();
var img2 = new Image();
var img3 = new Image();

img1.src = "/assets/images/american_flag_hover.png";
img2.src = "/assets/images/canadian_flag_hover.png";
img3.src = "/assets/images/bieber_header_hover.png";

// load audio
var snd = new Audio("/assets/audios/blip.wav");
var snd2 = new Audio("/assets/audios/blip2.wav");
var gameOverSnd = new Audio("/assets/audios/Bieber_Never-say.mp3");
var ohohSnd = new Audio("/assets/audios/Bieber_Oh-oh.mp3");

// image info class
function ImageInfo(width, height, imgReady) {
  this.width = width;
  this.height = height;
  this.imgReady = imgReady;
};

var americanPaddleInfo = new ImageInfo(10, 78, false);
var americanPaddleImage = new Image();
americanPaddleImage.onload = function () {
  americanPaddleInfo.imgReady = true;
}
americanPaddleImage.src = "/assets/images/american_paddle.png"

var canadianPaddleInfo = new ImageInfo(10, 78, false);
var canadianPaddleImage = new Image();
canadianPaddleImage.onload = function () {
  canadianPaddleInfo.imgReady = true;
}
canadianPaddleImage.src = "/assets/images/canadian_paddle.png"

var bieberHeadInfo = new ImageInfo(50, 78, false);
var bieberHeadImage = new Image();
bieberHeadImage.onload = function () {
  bieberHeadImage.imgReady = true;
}
bieberHeadImage.src = "/assets/images/BieberHead-natural.png"

var renderHighscores = function (data) {
  var stage = $('#stage');
  stage.empty();
  stage.removeClass('game-on');
  var highScoresDiv = $('#high-scores');
  highScoresDiv.append('<div id="games-played">Games Played: ' + data.count + '</div>')
  var table = $('<table>');
  var thead = '<thead><tr><th>Rank</th><th>Name</th><th>Country</th><th>Score</th></tr></thead>';
  var tbody = $('<tbody>');
  table.append(thead);
  table.append(tbody);
  highScoresDiv.append(table);
  html = ""
  for (var i = 0; i < data.highscores.length; i++) {
    rank = i + 1;
    html += '<tr>';
    html += '<td>' + rank + '</td>'
    html += '<td>' + data.highscores[i].name + '</td>';
    html += '<td>' + data.highscores[i].country + '</td>';
    html += '<td>' + data.highscores[i].score + '</td>';
    html += '</tr>';
  }
  tbody.append(html);
  var playButton = $("<div id='play-again-button'><a>Replay</a></div>")
  table.after(playButton)
  playButton.on('click', firstScreen)
}

var endGame = function (score, country) {
  if (country == "USA") {
    var gameOverMessage = "So sorry about that, America.<br><br>The Biebz belongs to you.";
  } else {
    var gameOverMessage = "Oh, Canada. His home and native land.<br><br>You'd better belieb-it.";
  }
  gameOverSnd.play();
  var stage = $('#stage');
  stage.removeClass('game-on');
  stage.empty();
  stage.append('<div id="game-over">Game Over</div>');
  stage.append('<div id="game-over-message">' + gameOverMessage + '</div>');
  stage.append('<div id="game-over-score">Score: ' + score + '</div>');
  var nameDiv = $('<div id="game-over-name">');
  var form = $('<form id="submit">');
  form.append($('<label>').append('Name: '))
  name_input = $('<input id="name" type="text">');
  form.append(name_input);
  form.append($('<input type="submit" value="Submit">'));
  nameDiv.append(form);
  stage.append(nameDiv);
  name_input.focus();
  $('#submit').on("submit", function (e) {
    e.preventDefault();
    var name = $('#name').val();
    if (name == undefined || name == "") {
      alert("Name can't be blank.")
      return;
    }
    if (name.length > 11) {
      alert("Name must be less than 12 characters.")
      return;
    }
    var highscore = {
      name: name,
      score: score,
      country: country
    }
    $.ajax({
      dataType: 'json',
      type: 'POST',
      url: 'game/create_highscore',
      data: { highscore: highscore }
    }).done(function (data) {
      renderHighscores(data);
      // window.location = "/scores"
    }).fail(function (jqXHR, textStatus) {
      alert("Request failed: " + textStatus);
    })
  })
}

// initialize globals
var startGame = function (country) {
  $('#stage').addClass('game-on');

  var WIDTH = 600;
  var HEIGHT = 400;
  var SCORE1 = 0;
  var SCORE2 = 0;
  var PAD_WIDTH = 10;
  var PAD_HEIGHT = 78;
  var HALF_PAD_WIDTH = PAD_WIDTH / 2;
  var HALF_PAD_HEIGHT = PAD_HEIGHT / 2;
  var PLAYER_POWER = 2.0
  var PLAYER_ANGLE = 2.0
  var PLAYER_SOFT = 1.5
  var PLAYER_CORNER_HIT_BOX = 30
  var PLAYER_SOFT_ANGLE = 1.2
  var PLAYER_SPEED = 400
  var COMPUTER_POWER = .8
  var COMPUTER_SOFT = 0.6
  var COMPUTER_ANGLE = 1
  var COMPUTER_CORNER_HIT_BOX = 10
  var COMPUTER_SOFT_ANGLE = 0.5
  var COMPUTER_SPEED = 150
  var gameInterval;

  // create the canvas
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.getElementById("stage").appendChild(canvas);

  // game objects
  var ball = {
    x: 0,
    y: 0,
    velx: 0,
    vely: 0,
    radius: 20,
    ang: 0,
    ang_vel: 1
  };

  var paddle1 = {
    vely: 256,
    y: HEIGHT / 2 - HALF_PAD_HEIGHT
  };

  var paddle2 = {
    vely: 256,
    y: HEIGHT / 2 - HALF_PAD_HEIGHT
  };

  if (country == "Canada") {
    var controller1 = paddle1
    var controller2 = paddle2
    var paddle1Power = COMPUTER_POWER
    var paddle1Angle = COMPUTER_ANGLE
    var paddle1Soft = COMPUTER_SOFT
    var paddle1CornerHitBox = COMPUTER_CORNER_HIT_BOX
    var paddle1SoftAngle = COMPUTER_SOFT_ANGLE
    paddle1.vely = COMPUTER_SPEED
    var paddle2Power = PLAYER_POWER
    var paddle2Angle = PLAYER_ANGLE
    var paddle2Soft = PLAYER_SOFT
    var paddle2CornerHitBox = PLAYER_CORNER_HIT_BOX
    var paddle2SoftAngle = PLAYER_SOFT_ANGLE
    paddle2.vely = PLAYER_SPEED
    var SCORE1 = "CPU"
  } else {
    var controller1 = paddle2
    var controller2 = paddle1
    var paddle1Power = PLAYER_POWER
    var paddle1Angle = PLAYER_ANGLE
    var paddle1Soft = PLAYER_SOFT
    var paddle1CornerHitBox = PLAYER_CORNER_HIT_BOX
    var paddle1SoftAngle = PLAYER_SOFT_ANGLE
    paddle1.vely = PLAYER_SPEED
    var paddle2Power = COMPUTER_POWER
    var paddle2Angle = COMPUTER_ANGLE
    var paddle2Soft = COMPUTER_SOFT
    var paddle2CornerHitBox = COMPUTER_CORNER_HIT_BOX
    var paddle2SoftAngle = COMPUTER_SOFT_ANGLE
    paddle2.vely = COMPUTER_SPEED
    var SCORE2 = "CPU"
  }

  // handle keyboard controls
  var keysDown = {};

  addEventListener("keydown", function (e) {
    keysDown[e.which] = true;
    switch (e.which) {
      case 37: case 39: case 38: case 40: // arrow keys
      case 32: e.preventDefault(); break; // space
      default: break; // do not block other keys
    }
  }, false);

  addEventListener("keyup", function (e) {
    delete keysDown[e.which];
  }, false);

  // spawns a ball
  var ball_init = function (right) {
    var plus_or_minus = Math.random() < 0.5 ? -1 : 1;
    var ang_vel = Math.random() * 5 * plus_or_minus;
    var vely = Math.floor(plus_or_minus * (Math.random() * 200 + 100));
    var velx = Math.floor(Math.random() * 150 + 150);

    if (right === false) {
      velx *= -1;
    }

    ball.x = 300;
    ball.y = 200;
    ball.velx = velx;
    ball.vely = vely;
    ball.ang_vel = ang_vel;
  };

  // reset the game
  var reset = function () {
    if (country == 'USA') {
      ball_init(true);
    } else {
      ball_init(false);
    }
  };

  var scoring = function (scorer) {
    if (scorer == 'USA') {
      ball_init(true);
      SCORE1 += 1;
    }

    if (scorer == 'Canada') {
      ball_init(false);
      SCORE2 += 1;
    }

    // end game if scorer not equal to country
    if (scorer != country) {
      if (country == 'USA') {
        var finalScore = SCORE1;
      }

      if (country == 'Canada') {
        var finalScore = SCORE2;
      }

      clearInterval(gameInterval);
      endGame(finalScore, country);
    }
  }

  var paddle1Shot = function () {
    // soft shot in center of paddle
    if (ball.y >= paddle1.y + paddle1CornerHitBox && ball.y <= paddle1.y + PAD_HEIGHT - paddle1CornerHitBox) {
      ball.x = PAD_WIDTH + ball.radius + 1;
      ball.velx *= -paddle1Soft;
      ball.vely *= paddle1SoftAngle
      ball.ang_vel = -ball.ang_vel;
      snd.play();
    } else {
      // hard shot in corner of paddle
      ball.x = PAD_WIDTH + ball.radius + 1;
      ball.velx *= -paddle1Power;
      ball.vely *= paddle1Angle;
      ball.ang_vel = -ball.ang_vel;
      snd.play();
    }
  }

  var paddle2Shot = function () {
    // soft shot in center of paddle
    if (ball.y >= paddle2.y + paddle2CornerHitBox && ball.y <= paddle2.y + PAD_HEIGHT - paddle2CornerHitBox) {
      ball.x = WIDTH - PAD_WIDTH - ball.radius - 1;
      ball.velx *= -paddle2Soft;
      ball.vely *= paddle2SoftAngle
      ball.ang_vel = -ball.ang_vel;
      snd.play();
    } else {
      // hard shot in corner of paddle
      ball.x = WIDTH - PAD_WIDTH - ball.radius - 1;
      ball.velx *= -paddle2Power;
      ball.vely *= paddle2Angle;
      ball.ang_vel = -ball.ang_vel;
      snd.play();
    }
  }

  // update game objects
  var update = function (modifier) {


    // update paddle2 based on ball position
    // move paddle down
    if (ball.y > controller1.y) {
      if (controller1.y < HEIGHT - PAD_HEIGHT) {
        controller1.y += controller1.vely * modifier;
      }
    }

    // move paddle up
    if (ball.y < controller1.y) {
      if (controller1.y > 0) {
        controller1.y -= controller1.vely * modifier;
      }
    }

    if (38 in keysDown) { // player holding up
      if (controller2.y > 0) {
        controller2.y -= controller2.vely * modifier;
      }
    }
    if (40 in keysDown) { // player holding down
      if (controller2.y < HEIGHT - PAD_HEIGHT) {
        controller2.y += controller2.vely * modifier;
      }
    }
    // ball bounces off paddle2
    if (ball.x + ball.radius >= WIDTH - PAD_WIDTH) {
      if (ball.y >= paddle2.y && ball.y <= paddle2.y + PAD_HEIGHT) {
        paddle2Shot();
      } else {
        scoring('USA');
      }
    } else if (ball.x - ball.radius <= PAD_WIDTH) {// ball bounces off paddle1
      if (ball.y >= paddle1.y && ball.y <= paddle1.y + PAD_HEIGHT) {
        paddle1Shot();
      } else {
        scoring('Canada');
      }
    }
    if (ball.y <= ball.radius) {
      ball.y = ball.radius + 1;
      ball.vely = -ball.vely;
      snd2.play();
    } else if (ball.y >= HEIGHT - ball.radius) {
      ball.y = HEIGHT - ball.radius - 1;
      ball.vely = -ball.vely;
      snd2.play();
    }
    // update the ball angle based on angle velocity
    ball.ang += ball.ang_vel * modifier;

    // update ball
    ball.x += ball.velx * modifier;
    ball.y += ball.vely * modifier;
  };

  // draw everything
  var render = function () {

    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw mid line
    ctx.fillStyle = "rgb(0, 255, 255)";
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);

    // save ctx so we can restore later
    ctx.save();

    // move origin to the x and y position of ball
    ctx.translate(ball.x, ball.y);

    // draw ball
    ctx.rotate(ball.ang);
    ctx.drawImage(bieberHeadImage, 0, 0, 50, 78, -25, -39, 50, 78)

    // restore ctx
    ctx.restore();

    // draw paddles
    ctx.fillStyle = "red";
    ctx.drawImage(americanPaddleImage, 0, 0, PAD_WIDTH, PAD_HEIGHT, 0, paddle1.y, PAD_WIDTH, PAD_HEIGHT)
    ctx.drawImage(canadianPaddleImage, 0, 0, PAD_WIDTH, PAD_HEIGHT, WIDTH - PAD_WIDTH, paddle2.y, PAD_WIDTH, PAD_HEIGHT)

    // draw score
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.font = "24px minecraft_peregular";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(SCORE1, 32, 32);
    ctx.fillText(SCORE2, 500, 32);
  };

  // the main game loop
  var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;
  };

  // let's play this game!
  reset();
  var then = Date.now();
  gameInterval = setInterval(main, 16); // execute as fast as possible
}

var removeKeyListeners = function () {
  $(document).off('keydown');
  $(document).off('keyup');
}

var secondScreen = function (country) {
  stage = $('#stage');
  stage.empty();
  stage.addClass('game-on');
  stage.append("<div id='instructions'><p>Use up/down arrow keys.</p><p>Press spacebar to begin.</p></div>");
  $(document).on('keydown', function (e) {
    if (e.which == 32) {
      stage.empty();
      startGame(country);
      $(document).off('keydown');
    }
  })
}

var firstScreen = function () {

  var stage = $('#stage');
  $('#high-scores').empty()
  stage.empty();
  stage.append("<div id='slogan'>America wants its rematch. Loser keeps Bieber for <span>real</span>.</div>")
  stage.append("<div id='choose-team'>Choose your team</div>")
  stage.append("<div id='team-selection'><div id='usa'><a></a></div><div id='vs'>VS</div><div id='canada'><a></a></div></div>")
  var usa = $('#usa a')
  var canada = $('#canada a')
  usa.on('click', function () {
    secondScreen("USA");
  });
  usa.on('mouseenter', function () {
    ohohSnd.play();
  });
  canada.on('click', function () {
    secondScreen("Canada");
  });
  canada.on('mouseenter', function () {
    ohohSnd.play();
  });
}

$(document).ready(function () {
  stage = $('#stage');
  if (stage.length > 0) {
    firstScreen();
  }
});

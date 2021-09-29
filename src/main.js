import kaboom from "https://unpkg.com/kaboom@next/dist/kaboom.mjs";
const FLOOR_HEIGHT = 90;
const JUMP_FORCE = 800;
const SPEED = 480;

// initialize context
kaboom();

// load assets

loadSpriteAtlas("sprites/liss-map.png", {
  liss: {
    x: 0,
    y: 0,
    width: 832,
    height: 1344,
    sliceX: 13,
    sliceY: 21,
    anims: {
      jumpU: { from: 0, to: 6 },
      jumpL: { from: 13, to: 19 },
      jumpD: { from: 26, to: 32 },
      jumpR: { from: 39, to: 45 },
      thrustU: { from: 52, to: 59 },
      thrustL: { from: 65, to: 72 },
      thrustD: { from: 78, to: 85 },
      thrustR: { from: 91, to: 98 },
      walkU: { from: 104, to: 112 },
      walkL: { from: 117, to: 125 },
      walkD: { from: 130, to: 138 },
      walkR: { from: 143, to: 151 },
      hitU: { from: 156, to: 161 },
      hitL: { from: 169, to: 174 },
      hitD: { from: 182, to: 187 },
      hitR: { from: 195, to: 200 },
      castU: { from: 208, to: 220 },
      castL: { from: 221, to: 233 },
      castD: { from: 234, to: 246 },
      castR: { from: 247, to: 259 },
      die: { from: 260, to: 265 },
    },
  },
});
loadSpriteAtlas("sprites/shin.png", {
  shin: {
    x: 0,
    y: 0,
    width: 562,
    height: 900,
    sliceX: 4,
    sliceY: 6,
    anims: {
      ass: { from: 0, to: 0 },
    },
  },
});

scene("game", () => {
  let playing = false;
  // define gravity
  gravity(500);

  // add a game object to screen
  const player = add([
    // list of components
    sprite("liss"),
    pos(200, 40),
    area(),
    body(),
    "liss",
  ]);
  player.play("jumpD", { loop: true });
  // floor
  add([
    rect(width(), FLOOR_HEIGHT),
    outline(4),
    pos(0, height()),
    origin("botleft"),
    area(),
    solid(),
    color(127, 200, 255),
    cleanup(),
    "floor",
  ]);

  function jump() {
    if (player.grounded()) {
      player.play("jumpR");
      player.jump(JUMP_FORCE);
    }
  }

  // jump when user press space
  keyPress("space", jump);
  mouseClick(jump);

  function spawnSheen() {
    if (playing) {
      add([
        area({ scale: 0.6 }),
        pos(width(), height() - FLOOR_HEIGHT * 3),
        origin("center"),
        move(LEFT, SPEED),
        sprite("shin", { anim: "ass" }),
        scale(rand(0.5, 0.8)),
        body(),
        "shin",
      ]);
    }
    wait(rand(0.8, 1.5), spawnSheen);
  }

  // start spawning trees
  spawnSheen();

  // lose if player collides with any game obj with tag "tree"
  player.collides("shin", () => {
    go("lose",score);
  });
  player.collides("floor", () => {
    player.play("walkR", { loop: true });
    if (!playing) {
      shake();
      playing = true;
      gravity(2000);
    }
  });

  // keep track of score
  let score = 0;

  const scoreLabel = add([text(score), pos(24, 24)]);

  // increment score every frame
  action(() => {
    if (!playing) {
      return;
    }
    score++;
    scoreLabel.text = score;
  });
  keyPress("scape", () => go("game"));
});

scene("lose", (score) => {
  add([
    sprite("liss", {
      anim: "die",
    }),
    pos(width() / 2, height() / 2 - 80),
    scale(2),
    origin("center"),
  ]);

  // display score
  add([
    text(score),
    pos(width() / 2, height() / 2 + 80),
    scale(2),
    origin("center"),
  ]);

  // go back to game with space is pressed
  keyPress("space", () => go("game"));
  mouseClick(() => go("game"));
  shake();
});

go("game");

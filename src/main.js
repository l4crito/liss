import kaboom from "https://unpkg.com/kaboom@next/dist/kaboom.mjs";
const FLOOR_HEIGHT = 90;
const JUMP_FORCE = 800;
const SPEED = 480;
const HEALTH = 30;
const MOVE_SPEED = 200;

// initialize context
kaboom();
debug.paused = false;

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
  let direction = "r";
  let canChangeSprite = true;
  let score = 0;
  // define gravity
  gravity(500);

  const healthbar = add([
    rect(width(), 24),
    pos(0, 0),
    color(127, 255, 127),
    fixed(),
    layer("ui"),
    {
      max: HEALTH,
      set(hp) {
        this.width = (width() * hp) / this.max;
        this.flash = true;
      },
    },
  ]);
  healthbar.action(() => {
    if (healthbar.flash) {
      const t = time() * 10;
      healthbar.color.r = wave(127, 255, t);
      healthbar.color.g = wave(127, 255, t + 1);
      healthbar.color.b = wave(127, 255, t + 2);
      healthbar.opacity = 1;
      healthbar.color = rgb(255, 255, 255);
      healthbar.flash = false;
    } else {
      healthbar.opacity = 1;
      healthbar.color = rgb(127, 255, 127);
    }
  });

  // add a game object to screen
  const player = add([
    // list of components
    sprite("liss"),
    pos(200, 40),
    area({ scale: 0.9 }),
    body(),
    health(HEALTH),
    "liss",
    origin("center"),
    scale(1.5),
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
      if (direction == "l") {
        player.play("jumpL");
      } else {
        player.play("jumpR");
      }
      player.jump(JUMP_FORCE);
    }
  }

  // jump when user press space
  keyPress("enter", () => (debug.paused = !debug.paused));
  keyPress(["up", "space", "w"], jump);
  keyDown(["left", "a"], () => {
    player.move(-MOVE_SPEED, 0);
    direction = "l";
    setSprite("walkL");
  });

  keyDown(["right", "d"], () => {
    player.move(MOVE_SPEED, 0);
    direction = "r";
    setSprite("walkR");
  });

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

  function setSprite(sprite = "walkR") {
    if (!player.grounded()) {
      return;
    }
    player.play(sprite);
  }

  // lose if player collides with any game obj with tag "tree"
  player.collides("shin", (shin, position) => {
    if (position !== "bottom") {
      player.hurt(5);
      healthbar.set(player.hp());
     
      shake();
      healthbar.flash = true;
      if (player.hp() <= 0) {
        go("lose");
      }
      shin.destroy();
    }
  });

  player.on("ground", (l) => {
    if (l.is("shin")) {
      scoreLabel.text = "Culos mandados alv :" + score;
      score++;
      jump();
      destroy(l);
      addKaboom(player.pos);
    }
  });

  player.collides("floor", () => {
    // player.stop();
    if (!playing) {
      shake();
      playing = true;
      gravity(2000);
    }
  });

  // keep track of score

  const scoreLabel = add([
    text("culos mandados alv: 0"),
    pos(24, 24),
    scale(0.5),
  ]);
});

scene("lose", () => {
  add([
    sprite("liss", {
      anim: "die",
    }),
    pos(width() / 2, height() / 2 - 80),
    scale(3),
    origin("center"),
  ]);

  // display score
  add([
    text("perdiste mmv :c"),
    pos(width() / 2, height() / 2 + 80),
    scale(1.5),
    origin("center"),
  ]);

  // go back to game with space is pressed
  keyPress("space", () => go("game"));

  mouseClick(() => go("game"));
  shake();
});

go("game");

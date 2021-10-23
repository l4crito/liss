import kaboom from "https://unpkg.com/kaboom@2000.0.0/dist/kaboom.mjs";
const FLOOR_HEIGHT = 90;
const JUMP_FORCE = 800;
const SPEED = 480;
const HEALTH = 30;
const MOVE_SPEED = 200;
const BULLET_SPEED = 1200;


// initialize context
kaboom({
  background: [255, 255, 255,],
});
debug.paused = false;
// debug.inspect = true;

// load assets

loadSpriteAtlas("sprites/liss-map.png", {
  liss: {
    x: 0,
    y: 0,
    width: 830,
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
loadSpriteAtlas("sprites/chris-map.png", {
  chris: {
    x: 0,
    y: 0,
    width: 830,
    height: 1343,
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


function grow(rate) {
  return {
    update() {
      const n = rate * dt();
      this.scale.x += n;
      this.scale.y += n;
    },
  };
}


scene("game", () => {
  let playing = false;
  let animation = "r";
  let score = 0;
  gravity(500);

  function spawnBullet(p) {
    add([
      rect(10, 10),
      area(),
      pos(p),
      origin("center"),
      color(127, 127, 255),
      outline(4),
      move(RIGHT, BULLET_SPEED),
      cleanup(),
      // strings here means a tag
      "bullet",
    ]);
  }


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
      const t = time() * 40000000;
      healthbar.color.r = wave(127, 255, t);
      healthbar.color.g = wave(127, 255, t + 10);
      healthbar.color.b = wave(127, 255, t + 20);
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
  add([
    rect(width(), FLOOR_HEIGHT),
    outline(4),
    pos(0, height()),
    origin("botleft"),
    area(),
    solid(),
    color(127, 200, 255),
    "floor",
  ]);
  const wall = add([
    rect(1, height()),
    outline(0),
    pos(-30, 0),
    area(),
    solid(),
    "wall",
  ]);
  add([
    rect(1, height()),
    outline(0),
    pos(width() + 10, 0),
    area(),
    solid(),
    "wall",
  ]);

  function jump() {
    if (player.grounded()) {
      if (animation == "walkL") {
        player.play("jumpL");
      }
      else {
        player.play("jumpR");
      }
      animation = 'jump'
      player.jump(JUMP_FORCE);
    }
  }

  // jump when user press space


  mouseClick(jump);

  function spawnShin() {
    if (playing) {
      const shin = add([
        area({ scale: 0.6 }),
        pos(width(), height() - FLOOR_HEIGHT * 3),
        origin("center"),
        move(LEFT, SPEED),
        sprite("shin", { anim: "ass" }),
        scale(rand(0.5, 0.9)),
        body(),
        health(2),
        "shin",
      ]);
      shin.on("hurt",()=>{
        if(!shin.hp()){
          addKaboom(shin.pos)
          destroy(shin);
          incrementScore();
        }
      });
    }
    wait(rand(0.8, 1.5), spawnShin);
  }

  // start spawning trees
  spawnShin();

  function incrementScore() {
    score++;
    scoreLabel.text = "Culos mandados alv :" + score;
    if (score >= 30) {
      go("win");
    }
  }

  function setSprite(anim = "walkR") {

    if (anim == animation) {
      return;
    }
    animation = anim;
    player.play(anim, { loop: true });
  }

  // lose if player collides with any game obj with tag "tree"
  player.collides("shin", (shin, position) => {
    if (!position.isBottom()) {
      player.hurt(5);
      healthbar.set(player.hp());
      shake();
      healthbar.flash = true;
      if (player.hp() <= 0) {
        go("lose");
      }
    }
    shin.destroy();
  });
  wall.collides("shin", (shin) => {
    incrementScore();
    shin.destroy();
  });

  player.on("ground", (l) => {
    if (l.is("shin")) {
      incrementScore();
      jump();
      destroy(l);
      addKaboom(player.pos);
    }
  });

  player.collides("floor", () => {
    if (!playing) {
      player.stop();
      player.frame = 263;
      shake();
      playing = true;
      gravity(2000);
    }
  });

  const scoreLabel = add([
    text("culos mandados alv: 0"),
    pos(24, 24),
    scale(0.5),
  ]);



  function addExplode(p, n, rad, size) {
		for (let i = 0; i < n; i++) {
			wait(rand(n * 0.1), () => {
				for (let i = 0; i < 2; i++) {
					add([
						pos(p.add(rand(vec2(-rad), vec2(rad)))),
						rect(4, 4),
						outline(4),
						scale(1 * size, 1 * size),
						lifespan(0.1),
						grow(rand(48, 72) * size),
						origin("center"),
					]);
				}
			});
		}
	}

  collides("bullet", "shin", (b, e) => {
		destroy(b);
		e.hurt(1);
		addExplode(b.pos, 1, 13, 0.5);
	});

  keyPress("enter", () => (debug.paused = !debug.paused));
  keyPress(["up", "w"], jump);
  keyPress(["space"], () => {
    spawnBullet(player.pos)
  });
  keyDown(["left", "a"], () => {
    player.move(-MOVE_SPEED, 0);
    setSprite("walkL");
  });

  keyDown(["right", "d"], () => {
    player.move(MOVE_SPEED, 0);
    setSprite("walkR");
  });

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
    text("perdiste lisbru :c"),
    pos(width() / 2, height() / 2 + 80),
    scale(1.5),
    origin("center"),
  ]);

  // go back to game with space is pressed
  keyPress("space", () => go("game"));

  mouseClick(() => go("game"));
  shake();
});





scene("win", () => {
  let chrisAdded = false;
  let lisPosition = 'r'

  add([
    rect(width(), (height() / 2) - 80),
    pos(0, height()),
    origin("botleft"),
    area(),
    solid(),
    color(255, 255, 255),
    "floor",
  ]);
  add([
    rect(3, height()),
    pos(width() / 2, 0),
    area(),
    solid(),
    color(255, 255, 255),
    "wall",
  ]);
  const liss = add([
    area({ scale: 0.5 }),
    pos(0, 0),
    origin("center"),
    sprite("liss", { anim: "walkR" }),
    scale(2),
    body(),
    "liss",
  ]);

  liss.play("walkR", { loop: true });

  function addChris() {
    if (chrisAdded) {
      return;
    }
    chrisAdded = true;
    const chris = add([
      area({ scale: 0.5 }),
      pos(width(), 0),
      origin("center"),
      move(LEFT, 200),
      sprite("chris", { anim: "walkR" }),
      scale(2),
      body(),
      "chriss",

    ]);
    chris.play("walkL", { loop: true });
  }

  liss.collides('wall', (m) => {
    lisPosition = 'm'
    liss.stop();
    liss.frame = 260;
    spawnShin();
  });
  liss.action(() => {
    if (liss.grounded() && lisPosition == 'r') {
      liss.move(250, 0);
    }
  });


  let shinDestroyed = 0;
  function spawnShin() {
    if (shinDestroyed >= 3) {
      addChris();
      return;
    }

    const shin = add([
      area({ width: 150, height: 40 }),
      pos(width(), 0),
      origin("center"),
      move(LEFT, SPEED - 150),
      sprite("shin", { anim: "ass" }),
      scale(rand(0.5, 0.9)),
      health(rand(3,5)),
      body(),
      "shin",
    ]);
    shin.on('destroy', () => {
      shinDestroyed++;
      spawnShin();
    });

    shin.collides('wall', (l) => {
      destroy(shin);
      addKaboom(shin.pos);
      liss.play('hitD');
    });
  }





});

go("game");



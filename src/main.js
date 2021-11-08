import kaboom from "https://unpkg.com/kaboom@2000.0.0/dist/kaboom.mjs";
const FLOOR_HEIGHT = 90;
const JUMP_FORCE = 800;
const SPEED = 480;
const HEALTH = 30;
const MOVE_SPEED = 200;
const BULLET_SPEED = 1200;
const CHRIS = 'chris';
const LISS = 'liss';
const SCENE = '...';
const DESTROYED_CULOS = 25;
const MAX_BULLETS = 30;
let bullets = MAX_BULLETS;


// initialize context
export const k = kaboom({
  background: [255, 255, 255,],
});
debug.paused = false;
// debug.inspect = true;

// load assets
k.loadSpriteAtlas("sprites/liss-map.png", {
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
k.loadSpriteAtlas("sprites/chris-map.png", {
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
k.loadSpriteAtlas("sprites/shin.png", {
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
  let animation = "r";
  let score = 0;
  gravity(300);




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
  const bulletBar = add([
    rect(width(), 24),
    pos(0, 25),
    color(138, 43, 226),
    fixed(),
    layer("ui"),
    {
      max: MAX_BULLETS,
      set(hp) {
        this.width = (width() * hp) / this.max;
        this.flash = true;
      },
    },
  ]);
  bulletBar.action(() => {
    if (bulletBar.flash) {
      const t = time() * 40000000;
      bulletBar.color.r = wave(127, 255, t);
      bulletBar.color.g = wave(127, 255, t + 10);
      bulletBar.color.b = wave(127, 255, t + 20);
      bulletBar.opacity = 1;
      bulletBar.color = rgb(255, 255, 255);
      bulletBar.flash = false;
    } else {
      bulletBar.opacity = 1;
      bulletBar.color = rgb(138, 43, 226);
    }
  });

  // add a game object to screen
  const player = add([
    // list of components
    sprite(LISS),
    pos(200, 40),
    area({ scale: 0.9 }),
    body(),
    health(HEALTH),
    origin("center"),
    scale(1.5),
    LISS,
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

  function incrementBullets() {
    if (bullets >= MAX_BULLETS) {
      return;
    }

    bullets++;
    bulletBar.set(bullets)
  }



  // jump when user press space


  mouseClick(fire);

  function spawnShin() {
    if (playing) {
      const shin = createShin(randi(3, 7));
      shin.on("hurt", () => {
        if (shin.hp() <= 0) {
          addKaboom(shin.pos)
          destroy(shin);
          incrementScore();
          incrementBullets();
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
    if (score >= DESTROYED_CULOS) {
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
    // incrementScore()
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
    pos(24, 60),
    scale(0.5),
  ]);
  add([
    text("balas"),
    pos(24, 24),
    scale(0.4),
  ]);
  add([
    text("vida"),
    pos(24, 0),
    scale(0.4),
  ]);


function fire(){
  if(!playing){ return;}

  if (bullets <= 0) {
    return;
  }
  bullets--;
  bulletBar.set(bullets);
  spawnBullet(player.pos)
}

  collides("bullet", "shin", (b, e) => {
    destroy(b);
    e.hurt(1);
    addExplode(b.pos, 1, 13, 0.5);
  });

  keyPress("enter", () => (debug.paused = !debug.paused));
  keyPress(["up", "w"], jump);
  keyPress(["space"], () => {
  fire();
  });
  keyDown(["left", "a"], () => {
    if(!playing){ return;}
    player.move(-MOVE_SPEED, 0);
    setSprite("walkL");
  });

  keyDown(["right", "d"], () => {
    if(!playing){ return;}

    player.move(MOVE_SPEED, 0);
    setSprite("walkR");
  });

  k.loop(2, () => {
    incrementBullets();
  });

});

scene("lose", () => {
  add([
    sprite(LISS, {
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
  const dialog = addDialog();
  dialog.say("movimiento [w,a,s,d], disparar/empezar [espacio,click]")

});

scene("start", () => {
  const liss = add([
    sprite(LISS,),
    pos(width() / 2, height() / 2 - 80),
    scale(3),
    origin("center"),
  ]);
  liss.frame = 26;

  // display score
  add([
    text("Manda a la v a " + DESTROYED_CULOS + " culitos"),
    pos(width() / 2, height() / 2 + 80),
    scale(1.5),
    origin("center"),
  ]);

  // go back to game with space is pressed
  keyPress("space", () => go("game"));

  mouseClick(() => go("game"));
  const dialog = addDialog();
  dialog.say("movimiento [w,a,s,d], disparar/empezar [espacio,click]")
});





scene("win", () => {
  let lisPosition = 'r'
  let chrisPosition = 'l'
  let chrisSpawned = false
  // gravity(300);

  const messages = [
    {
      message: "Hola linda, que bonitas fotos tomas, pareces estudiada",
      wait: 3.5
    },
    {
      message: "Hola bonita, te doy haciendo la tesis perooo me pagas con besos",
      wait: 3.5
    },
    {
      message: "Muy linda la vista de abajo, solo falto yo encima",
      wait: 3.5
    },
    {
      message: "Hola perdida, parece que te has ido a otro pais por que ya ni escribes",
      wait: 3.5
    },
    {
      message: "Mira mi pack crees que tengo buen pito ?",
      wait: 3.5
    },
    {
      message: "Mira tengo pelos en el rabo",
      wait: 3.5
    },
    {
      message: "Y si me das una mucha, pero no le digas a mi novia",
      wait: 3.5
    },
  ]
  const chat = [
    {
      message: "Holaa",
      wait: 2,
      actor: CHRIS
    },
    {
      message: "...",
      wait: 1,
      actor: LISS
    },
    {
      message: "Hola",
      wait: 6,
      actor: LISS,
      brain: "*Este mmv sigue vivo*"
    },
    {
      message: "Quieres ir a shumar?",
      wait: 3,
      actor: CHRIS,

    },
    {
      message: "naa, solo par bielas nomas",
      wait: 5,
      actor: LISS,
      brain: "que se creera XD"

    },
    {
      message: "De una psss",
      wait: 3,
      actor: CHRIS
    },
    {
      message: "y los mmvs se vieron y pasiaron con par bielas",
      wait: 6,
      actor: SCENE
    },
    {
      message: "Tiempo despues...",
      wait: 3,
      actor: SCENE
    },
    {
      message: "Quieres ir a shumar again?",
      wait: 3,
      actor: CHRIS
    },
    {
      message: "frescoo",
      wait: 5,
      actor: LISS,
      brain: "este hp no se cansa ?? "
    },
    {
      message: "y empezaron a shumar  y a shumar y a shumar como si no hubiera un tomorrow",
      wait: 6,
      actor: SCENE
    },
    {
      message: "a veces comian",
      wait: 4,
      actor: SCENE
    },
    {
      message: "a veces solo shumaban",
      wait: 4,
      actor: SCENE
    },
    {
      message: "a veces comian y shumaban",
      wait: 4,
      actor: SCENE
    },
    {
      message: "a veces se mandaban a la verga",
      wait: 4,
      actor: SCENE
    },
    {
      message: "Chris sabia que liss tenia millon culos",
      wait: 5,
      actor: SCENE
    },
    {
      message: "Liss sabia que Chris tenia 0 culos",
      wait: 5,
      actor: SCENE
    },
    {
      message: "Ya ya par culos XD",
      wait: 4,
      actor: SCENE
    },
    {
      message: "en fin, se llegaron a conocer mejor",
      wait: 5,
      actor: SCENE
    },
    {
      message: "Creo que entendieron el porque de las cosas",
      wait: 6,
      actor: SCENE
    },
    {
      message: "el porque se conocieron de cierta circunstancia",
      wait: 5,
      actor: SCENE
    },
    {
      message: "el porque se volvieron a encontrar en otras circunstancias",
      wait: 5,
      actor: SCENE
    },
    {
      message: "y creo que ambos se quieren",
      wait: 6,
      actor: SCENE
    },
    {
      message: "Escuchame",
      wait: 4,
      actor: CHRIS
    },
    {
      message: "La verdad es que me gusta demasiado pasar mi tiempo contigo",
      wait: 7,
      actor: CHRIS
    },
    {
      message: "No se me ocurre nada que hacer el sabados si no es contigo",
      wait: 7,
      actor: CHRIS
    },
    {
      message: "Cuando me dijiste aquella vez que me aleje fue la muerte",
      wait: 7,
      actor: CHRIS
    },
    {
      message: "tengo muchisimo miedo ",
      wait: 4,
      actor: CHRIS
    },
    {
      message: "estoy aterrado ",
      wait: 4,
      actor: CHRIS
    },
    {
      message: "se por lo que pasaste",
      wait: 4,
      actor: CHRIS
    },
    {
      message: "por eso mismo no se como actuar cuando estoy a tu lado ",
      wait: 7,
      actor: CHRIS
    },
    {
      message: "no se si abrazarte",
      wait: 5,
      actor: CHRIS
    },
    {
      message: "no se si te gusta que abrace",
      wait: 5,
      actor: CHRIS
    },
    {
      message: "no se por que aun estamos hablando, si me pediste que me aleje esa vez ",
      wait: 8,
      actor: CHRIS
    },
    {
      message: "soy pesimo redactor XD",
      wait: 4,
      actor: CHRIS
    },
    {
      message: "el no saber nada es feo ",
      wait: 5,
      actor: CHRIS
    },
    {
      message: "asi que",
      wait: 3,
      actor: CHRIS
    },
    {
      message: "bueno creo que ya sabes para donde va esto ya basta de rodeos",
      wait: 7,
      actor: CHRIS
    },
    {
      message: "Liss, quieres ser mi novia ?",
      wait: 1000,
      actor: SCENE
    },

  ]
  const toAlv = [
    "Come verga",
    "Come pipi",
    "Andate alv",
    "Andate alv",
    "nel",
    "Claro mija",
    "Calla verga",
    ".i.",
  ];


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
    pos(width() / 4, 0),
    area(),
    solid(),
    color(255, 255, 255),
    "wall",
  ]);
  add([
    rect(3, height()),
    pos(width() - (width() / 4), 0),
    area(),
    solid(),
    color(255, 255, 255),
    "wall",
  ]);
  const liss = add([
    area({ scale: 0.5 }),
    pos(0, 0),
    origin("center"),
    sprite(LISS, { anim: "walkR" }),
    scale(2),
    body(),
    LISS,
  ]);

  const dialog = addDialog();
  const bigDialog = addBigDialog();
  liss.play("walkR", { loop: true });

  function addChris() {
    if (chrisSpawned) {
      return;
    }
    chrisSpawned = true;

    const chris = add([
      area({ scale: 0.5 }),
      pos(width(), 0),
      origin("center"),
      sprite(CHRIS, { anim: "walkR" }),
      scale(2),
      body(),
      CHRIS,

    ]);
    chris.play("walkL", { loop: true });
    chris.action(() => {
      if (chris.grounded() && chrisPosition == 'l') {
        chris.move(-250, 0);
      }
    });
    chris.collides('wall', (m) => {
      if (chrisPosition == 'm') {
        return;
      }
      chrisPosition = 'm'
      chris.stop();
      chris.frame = 125;
      liss.frame = 151;
      let w = 0;

      chat.forEach(message => {
        const pos = message.actor == CHRIS ? { x: chris.pos.x - 100, y: chris.pos.y } : { x: liss.pos.x + 100, y: liss.pos.y };

        wait(w, () => {

          if (message.actor == SCENE) {
            bigDialog.say(message.message, message.wait - .5);


          } else {
            bigDialog.dismiss();
            if (message.brain) {
              dialog.sayAndDismiss(message.actor + ": " + message.brain, message.wait);
            }
            showMessage(pos, message.message, message.actor == CHRIS ? LEFT : RIGHT, message.wait);
          }


        })
        w += message.wait;
      })
    });
  }


  liss.action(() => {
    if (liss.grounded() && lisPosition == 'r') {
      liss.move(250, 0);
    }
  });

  liss.collides('wall', (m) => {
    lisPosition = 'm'
    liss.stop();
    liss.frame = 151;
    spawnShin();
  });


  function spawnShin() {
    let bullettShoted = false;
    if (!messages.length) {
      addChris();
      return;
    }

    const shin = createShin(1, 0);
    shin.on('destroy', () => {
      ; wait(1, spawnShin);
    });

    shin.collides('wall', (l) => {
      if (!bullettShoted) {
        liss.frame = 151;
        bullettShoted = true;
        const msg = messages.splice(Math.floor(Math.random() * messages.length), 1)[0];
        dialog.say(msg.message);
        wait(msg.wait, fire);
      }


    });
    shin.collides("bullet", (b) => {
      b.destroy();
      shin.destroy();
      addKaboom(b.pos)

    });
  }
  function fire() {
    dialog.dismiss();
    liss.play('castR');
    wait(1, () => {
      spawnWords(liss.pos, toAlv[k.randi(0, toAlv.length)]);
    })
  }


});

go("start");



export function spawnBullet(p) {
  k.add([
    k.rect(10, 10),
    k.area(),
    k.pos(p),
    k.origin("center"),
    k.color(138, 43, 226),
    k.outline(4),
    k.move(RIGHT, BULLET_SPEED),
    k.cleanup(),
    // strings here means a tag
    "bullet",
  ]);
}

export function spawnWords(p, text = 'Come verga') {
  k.add([
    k.area(),
    k.pos(p),
    k.origin("botright"),
    k.color(10, 10, 10),
    k.move(RIGHT, 500),
    k.cleanup(),
    k.text(text, {
      size: 25, // 48 pixels tall
      // width: 320, // it'll wrap to next line when width exceeds this value
      font: "apl386", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
    }),
    // strings here means a tag
    "bullet",
  ]);
}
export function showMessage(p, text, dir = LEFT, lifespan = 2) {
  const message = k.add([
    k.area(),
    k.pos(p),
    k.origin("center"),
    k.color(10, 10, 10),
    k.move(RIGHT, 500),
    k.cleanup(),
    k.lifespan(lifespan, { fade: 0.5 }),
    k.move(dir, rand(60, 65)),
    k.text(text, {
      size: 25, // 48 pixels tall
      width: 320, // it'll wrap to next line when width exceeds this value
      font: "apl386", // there're 4 built-in fonts: "apl386", "apl386o", "sink", and "sinko"
    }),
    k.body(),
    // strings here means a tag
    "bullet",
  ]);
  message.jump(k.rand(320, 640));

}


export function addExplode(p, n, rad, size) {
  for (let i = 0; i < n; i++) {
    k.wait(k.rand(n * 0.1), () => {
      for (let i = 0; i < 2; i++) {
        k.add([
          k.pos(p.add(rand(vec2(-rad), vec2(rad)))),
          k.rect(4, 4),
          k.outline(4),
          k.scale(1 * size, 1 * size),
          k.lifespan(0.1),
          grow(rand(48, 72) * size),
          k.origin("center"),
        ]);
      }
    });
  }
}

export function grow(rate) {
  return {
    update() {
      const n = rate * k.dt();
      this.scale.x += n;
      this.scale.y += n;
    },
  };
}


export function addDialog() {
  const h = 160;
  const pad = 16;
  const bg = add([
    k.pos(0, k.height() - h),
    k.rect(k.width(), h),
    k.color(0, 0, 0),
    k.z(100),
  ]);
  const txt = add([
    k.text("", {
      width: k.width(),
    }),
    k.pos(0 + pad, k.height() - h + pad),
    k.z(100),
  ]);
  bg.hidden = true;
  txt.hidden = true;
  return {
    sayAndDismiss(t, time) {
      this.say(t);
      k.wait(time, () => {
        txt.text = "";
        bg.hidden = true;
        txt.hidden = true;
      })
    },
    say(t) {
      txt.text = t;
      bg.hidden = false;
      txt.hidden = false;
    },
    dismiss() {
      if (!this.active()) {
        return;
      }
      txt.text = "";
      bg.hidden = true;
      txt.hidden = true;
    },
    active() {
      return !bg.hidden;
    },
    destroy() {
      bg.destroy();
      txt.destroy();
    },
  };
}
export function addBigDialog() {
  const h = 160;
  const pad = 16;
  const bg = add([
    k.pos(0, 0),
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.z(100),
  ]);
  const txt = add([
    k.text("", {
      width: k.width(),
    }),
    k.z(100),
    k.pos(k.width() / 2, k.height() / 2 + 80),
    k.origin("center")

  ]);
  bg.hidden = true;
  txt.hidden = true;
  return {
    sayAndDismiss(t, time) {
      this.say(t);
      k.wait(time, () => {
        txt.text = "";
        bg.hidden = true;
        txt.hidden = true;
      })
    },
    say(t) {
      txt.text = t;
      bg.hidden = false;
      txt.hidden = false;
    },
    dismiss() {
      if (!this.active()) {
        return;
      }
      txt.text = "";
      bg.hidden = true;
      txt.hidden = true;
    },
    active() {
      return !bg.hidden;
    },
    destroy() {
      bg.destroy();
      txt.destroy();
    },
  };
}





//characters
export function createShin(hp = 7, y = k.height() - FLOOR_HEIGHT * 3) {
  return k.add([
    k.area({ scale: 0.6 }),
    k.pos(k.width(), y),
    k.origin("center"),
    k.move(LEFT, SPEED),
    k.sprite("shin", { anim: "ass" }),
    k.scale(k.rand(0.5, 0.9)),
    k.body(),
    k.health(hp),
    "shin",
  ]);
}
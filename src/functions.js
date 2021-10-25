// import k from './main'

// export function Win(){
//   let chrisAdded = false;
//   let lisPosition = 'r'

//   k.add([
//     k.rect(k.width(), (k.height() / 2) - 80),
//     k.pos(0, height()),
//     k.origin("botleft"),
//     k.area(),
//     k.solid(),
//     k.color(255, 255, 255),
//     "floor",
//   ]);
//   k.add([
//     k.rect(3, k.height()),
//     k.pos(k.width() / 2, 0),
//     k.area(),
//     k.solid(),
//     k.color(255, 255, 255),
//     "wall",
//   ]);
//   const liss = add([
//     area({ scale: 0.5 }),
//     pos(0, 0),
//     origin("center"),
//     sprite("liss", { anim: "walkR" }),
//     scale(2),
//     body(),
//     "liss",
//   ]);

//   liss.play("walkR", { loop: true });

//   function addChris() {
//     if (chrisAdded) {
//       return;
//     }
//     chrisAdded = true;
//     const chris = add([
//       area({ scale: 0.5 }),
//       pos(width(), 0),
//       origin("center"),
//       move(LEFT, 200),
//       sprite("chris", { anim: "walkR" }),
//       scale(2),
//       body(),
//       "chriss",

//     ]);
//     chris.play("walkL", { loop: true });
//   }

//   liss.collides('wall', (m) => {
//     lisPosition = 'm'
//     liss.stop();
//     liss.frame = 260;
//     spawnShin();
//   });
//   liss.action(() => {
//     if (liss.grounded() && lisPosition == 'r') {
//       liss.move(250, 0);
//     }
//   });


//   let shinDestroyed = 0;
//   function spawnShin() {
//     if (shinDestroyed >= 3) {
//       addChris();
//       return;
//     }

//     const shin = createShin(1, 0);
//     shin.on('destroy', () => {
//       shinDestroyed++;
//       spawnShin();
//     });

//     shin.collides('wall', (l) => {
//       destroy(shin);
//       addKaboom(shin.pos);
//       liss.play('hitD');
//     });
//   }
// }
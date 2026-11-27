# Turkey Run: Escape the Feast

[![make.fun](https://img.shields.io/badge/make.fun-turkey--run--game--01-orange)](https://make.fun/c/turkey-run-game-01) [![bounty](https://img.shields.io/badge/bounty-%24250-f5b73d)](https://make.fun/c/turkey-run-game-01) [![deadline](https://img.shields.io/badge/deadline-2026--11--29T02:00Z-4a90d9)](https://make.fun/c/turkey-run-game-01)

You are the turkey. Outrun the pitchfork farmer across the Farmyard, Orchard, and Kitchen stages, dodge carving knives, oven flame bursts, and roaming jack-o-lantern pumpkins, collect corn for score, and reach 6000 m to escape the feast.

## Play

```sh
node serve.ts
```

Open [http://localhost:8080](http://localhost:8080) in desktop Chrome. There is no build step and no network connection is required. All sounds are synthesised with the Web Audio API.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Run |
| Up | Jump; press a second time for a wing-flap double jump |
| Down | Slide |
| P | Pause |

## Features

- Farmer chase pressure with feather-hearts and a red danger vignette
- Caught and escaped endings with restart
- Three escalating stages with their own palettes and hazards
- Corn and golden corn pickups with speed boost and heart restore
- Run, jump, flap, and slide animation with feather and dust particles
- Procedural sound kit

## Source layout

| File | Job |
| --- | --- |
| `game/index.html` | Game page and canvas entry point |
| `game/css/style.css` | Game layout, typography, and visual styling |
| `game/js/main.js` | Browser bootstrap and input wiring |
| `game/js/engine.js` | Main loop, timing, and game state updates |
| `game/js/world.js` | Stage progression, scenery, and world drawing |
| `game/js/player.js` | Turkey movement, collisions, and animation |
| `game/js/farmer.js` | Chasing farmer behavior and rendering |
| `game/js/hazards.js` | Knives, flame bursts, pumpkins, and hazard logic |
| `game/js/pickups.js` | Corn pickup behavior, scoring, and boosts |
| `game/js/particles.js` | Feather, dust, and impact particle effects |
| `game/js/hud.js` | Distance, score, hearts, and stage HUD |
| `game/js/screens.js` | Start, pause, caught, and escaped screens |
| `game/js/audio.js` | Procedural Web Audio sound effects |

## Hand-in

```sh
node main.ts
```

This copies `game/` and `screenshots/` and writes `dossier.json` through `vendor/makefun-game.ts`. The screenshots are real renders captured from headless Chrome running the game itself.

## License

MIT License.

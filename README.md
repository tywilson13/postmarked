# Postmarked

A daily air-mail route run by the staff of a riverside sorting office. Each morning brings four deliveries:

1. **Chain Letter** (every day, with Dot the woodpecker): five links, no countdown. Each answer starts with any letter of the one before. Rarer answers are worth more, and each of the day's three bonus letters anywhere in an answer multiplies it. The prompt changes daily ("Name a dog breed", "Name a river"…).
2. **One rotating game**, in this order: Where's This From? → Cross Post → Return to Sender → repeat. (Return to Sender replaced Missorted from No. 19; back issues before that still play Missorted.)
3. **The Postal Scale** (every day, with Bramble the hedgehog): three questions with a number for an answer. Set the dial to your best guess, then bet on how close you are.
4. **Who Sent This?** (every day, with Pip the otter): an animal sent today's mail. Each delivery brings a clue. In the last round you can open the rest. Guess early for more.

Every game has a floor (anyone scores something) and a ceiling (room to shine). No "know it or you don't."

| Game | Host | Skill | What you do | Content |
|---|---|---|---|---|
| Chain Letter | Dot the woodpecker | Rarity | Five answers to a prompt; each starts with any letter of the one before. Common 8 · Scarce 12 · Rare 16 · Priceless 20. Three daily **bonus letters** (letters ranked 15th–22nd for that prompt by how many answers contain them, never J/Q/X/Z) multiply an answer that contains them anywhere: one ×1.5, two ×2, all three ×3. The chain total caps at 100. Dot shows how many answers fit, and how many have a bonus letter. Close spellings count ("millefioule" → Mille-feuille; Dot says what she read). On food days a flavor in front of a known answer counts as Common ("Espresso cake", "Elderflower lemonade"). Each flavor (or descriptor) and each base counts once per chain, and bonus letters only count in the base ("Funfetti bagel" scores the letters of bagel). The hint mentions flavors without giving an example. "Stuck?" gives a fresh word from Dot to chain from (−2) | 57 prompts: 52 in `js/data/chain/` (one file each, loaded on its day) plus animals, countries, foods, plants, jobs in `lexicon*.js` |
| Where's This From? | Gus the goose | Maps | Three postcards from real places. The front says what it is and roughly where, the postmark names the country, the message gives it away. Pin the spot: closer and earlier scores more. On reveal Gus flies from your pin to the real spot, the miles count up, and a stamp lands (Bullseye within 50 mi) | `bank/places-*.js` (240 places, 80 per level) |
| Cross Post | Hazel the owl | Words | A themed mini crossword of 5 words with a letter bank and no clues to start. Clues and letters for sale | `bank/themes-*.js` (90 themes × 12 words; the grid is built fresh each time) |
| Return to Sender | Mabel the pigeon | Hunches | Put five envelopes in order ("Oldest to newest"). Tap two to swap, then send: the ones in the right slot are delivered and lock, the rest bounce. Four sends: 100 / 75 / 55 / 40, or 7 per delivered envelope if it never comes right | `bank/order-*.js` |
| Missorted (retired after No. 18) | Mabel the pigeon | Puzzle | Three sacks packed wrong. Swap stamps until each holds a group | `bank/missorted.js` |
| The Postal Scale | Bramble the hedgehog | Estimation | Set a brass dial, then bet: Bullseye (±4% of the dial) pays 100, Close (±10%) 60, Ballpark (±20%) 30, a miss 0. The window shows as a band on the dial. `BETS` in `js/games.js` | `bank/scale*.js` (3 per day) |
| Who Sent This? | Pip the otter | Mystery | Name the animal from its clues | `bank/senders.js` |

- Each delivery is worth up to 100 postage, plus up to 20 for an **Express** bonus. The sender is worth up to 60.
- The day ends with a **grade** from S down to F (out of about 420: S is 350+, A is 305+, B is 245+, C is 185+, D is 125+). Thresholds are in `GRADES` in `js/app.js`.
- A delivery scoring 50+ sends its sender clue clear. Otherwise it arrives smudged, and wiping it costs 10.
- Guessing the sender adds that animal's stamp to your **stamp album**.
- The **menu** (top right) slides over whatever is on screen: today's mail, back issues, the stamp album, passport and head-to-head scores, how to play, your name, and sound. The meter pauses while it's open, and leaving a route half-played asks first.
- **Send your results** never names the sender: the message says only whether you guessed them, and on which clue.
- **Send your results** shares an emoji summary plus a link. Whoever opens it gets a head-to-head comparison and a running household scoreboard. No server needed.
- Instructions are skipped for a game once you've played it twice.

## How days are built

`js/daily.js` turns an issue number into a day. Issue 1 is Nov 7, 2026 (`EPOCH` in `js/app.js`). Every bank is walked in a fixed shuffled order, so everyone gets the same day, and each pass through a bank is shuffled differently.

| Bank | Size | Lasts about |
|---|---|---|
| Chain Letter prompts | 57 | 8 weeks before one repeats (with a different first word). Related prompts (fruits, vegetables…) never land on consecutive days |
| Scale questions | 400 | about 4 months (3 a day), then reshuffles |
| Sender animals | 65 | 65 days, then reshuffles |
| Places | 240 | 8 months (3 per map day, every 3rd day) |
| Cross Post themes | 90 | 9 months (1 per cross day, every 3rd day); the same theme comes out as a different grid next time |
| Return to Sender puzzles | 135 | 13 months (every 3rd day) |

**Scale dial window:** hand-written ranges tend to put the answer near the middle of the dial. Each day, `reframe()` slides the dial window so the answer lands anywhere from 10% to 90% of the dial, never near the middle. The window keeps the original width, so scoring doesn't change. The needle starts at zero, like a real scale.

**Spoiler guard:** if the sender's animal is today's chain start word or a Cross Post answer, the next sender is used instead.

To add content, append to any bank file. No other changes needed.

## Run it locally

```
cd postmarked
python -m http.server 8137
```

Open http://localhost:8137. For playtesting, `?day=3&replay` jumps to a day and lets you replay it. Add `?dev` to show the playtest links in the footer (they're hidden from players) and to open days that haven't come out yet; without it, a future `?day` shows today.

**Back issues:** the "Back issues" button (home and results screens) lists every past day. A past day plays and saves like any other and counts toward routes and best grade, but never touches the streak.

## Put it online (free)

It's plain HTML, CSS and JS with no build step. It's live on GitHub Pages at https://tywilson13.github.io/postmarked/ (public repo, `main` branch, root folder). Every push to `main` republishes it.

### On a phone

Open the link and use **Add to Home Screen** (Safari's Share menu, or Chrome's ⋮ menu). It opens full-screen with Pip's stamp as the icon, and after the first visit it works offline. On iPhone, the home-screen app keeps its scores separately from Safari, so always play from the icon.

**After changing the game**, bump the `?v=` numbers in `index.html` so phones pick up the new files. The offline copy (`sw.js`) always tries the network first, so updates arrive the next time the app opens with signal.
- **Netlify Drop:** drag the `postmarked` folder onto https://app.netlify.com/drop
- **GitHub Pages:** push this folder to a public repo and turn on Pages

## Content formats

- `places-*.js`: `{ name, country, lat, lon, kind: city|landmark|nature, level: 1–3, clues: [front, postmark, message], fact }`.
  - `country` must match the map's own country name (e.g. "United States of America", "Dem. Rep. Congo").
  - Clue 1 must not name the place or its country. Clue 2 names the country. Clue 3 names the place.
- `themes-*.js`: `{ theme, level: 1–3, words: [12 × { w, clue }] }`. Words are 3–8 letters, A–Z only. `crossFor()` in `js/daily.js` fits 5 of them into a grid of at most 9 × 9, seeded by the issue number.
- `scale*.js`: `{ q, answer, unit, min, max, log?, year?, fact, topic }`. Use `log: true` when the range spans powers of ten.
- `senders.js`: `{ name, emoji, tint, answers: "Koala|Koala bear", clues: [5, vague → easy], nope: { "Sloth": "nudge" } }`.
- `order-*.js`: `{ ask, top, bottom, level: 1–3, topic, items: [5 × { t, v, show }], fact }`. Items are listed in the right order, top first, and `v` must rise or fall strictly down the list. `t` ≤ 22 characters, `show` ≤ 18.
- `missorted.js` (retired game, still used by back issues 1–18): `{ groups: [3 × { name, items: [4] }], sneaky }`.
- Lexicon entries: `"Name|Alias"`, in tiers common / uncommon (Scarce) / rare / legendary (Priceless). `"Holland|same:Netherlands"` adds aliases to an existing entry.
  - Extra entries live in `lexicon-extra-*.js`, which push onto the base lists.
  - **Plurals** (s, es, ies, ves, oes) and small typos match automatically.
  - **Descriptors:** a known answer with a descriptor in front counts as Common ("russet potato", "Arctic fox", "head chef"). The lists are `DESCRIPTORS` in `js/games.js`.
  - **Unknown answers are rejected.** If Dot doesn't recognize an answer, the player has to try another. A real answer that keeps getting turned away belongs in the lists.
- **Chain Letter prompts** (`tools/chain-src/<id>.json`): `{ id, noun, plural, sources, starts, tiers: { common, uncommon, rare, legendary }, nope }`. Same entry format as the lexicon. After editing any of them, run `node tools/build-chain.js`, which cleans the lists (duplicates, notes in brackets, opening words that aren't Common) and writes `js/data/chain/`. Add a new prompt by dropping a new JSON file in that folder.
  - `node tools/chain-gaps.js <id>` shows where a list runs thin: letters many answers end in but few start with (that's where chains get stuck). `node tools/chain-gaps.js <id> E` lists every answer starting with E.
  - To add a batch, put new answers in `tools/chain-src/add/<id>.json` (`{ "tiers": { ... } }`), check with `node tools/chain-gaps.js <id> --check`, then `node tools/merge-chain-adds.js` folds them in.
  - Food prompts (desserts, baked goods, candy, drinks, snacks, dishes, sauces, pasta) also get a flavor list in the build (fruit, spice, vegetable and cheese names plus `SWEET`/`SAVORY` in `build-chain.js`). Lakes and mountains answer to the bare name too ("Hood" for Mount Hood).
  - Most lists were drafted from memory by AI agents, then given a second cleanup pass. Common answers are solid; a few Rare/Priceless entries may still be wrong. If you spot one, delete it from the JSON and rebuild.
  - Built from real data: `cities` (the hand list plus GeoNames towns: `node tools/make-cities.js cities1000.txt`), `girls-names` / `boys-names` (US Social Security data: `node tools/make-names.js baby-names.csv`), `pokemon` (PokéAPI: `node tools/make-pokemon.js species.json`). Download links are in each script.
- `bank/retired/` holds content from replaced games (the cryptic postcard, the country-letter Where's This From?, and the two-word Cross Post). Nothing loads it.

## Files

- `js/app.js`: route flow, meter, scoring, grades, share and compare, album, passport
- `js/daily.js`: builds each day from the banks
- `js/games.js`: the games, the host speech bubbles, and the sender envelope
- `js/art.js`: Pip and the other hosts (Gus, Dot, Mabel, Bramble, Hazel), icons, compass, postmarks. All hand-written SVG, with happy and worried faces.
- `js/data/bank/`: content banks
- `js/data/lexicon.js`, `lexicon-more.js`: the built-in Chain Letter categories (animals, countries, foods, plants, jobs) with rarity tiers. The animal list also checks Who Sent This? guesses.
- `js/data/chain/`: the narrow prompts, built by `tools/build-chain.js`. `index.js` (names and first words) always loads; each answer list loads only on its day. The app starts fetching it on the home screen.
- `tools/`: the build scripts and the editable source lists (`tools/chain-src/`). Not needed to run the game.
- `js/map.js`: zoomable chart. Low-res shapes always; 1:10m detail for whatever is on screen past 4× zoom. Cities (biggest first) and state/province lines appear as you zoom in.
- `js/data/map-extra.js`: those cities and lines, from Natural Earth (public domain). Loads only when the map game opens. State lines cover the 9 largest countries.
- `manifest.json`, `icons/`: the home-screen app name and icons. `node tools/make-icons.js` redraws the icons from Pip in `js/art.js` (needs Chrome or Edge).
- `sw.js`: offline support. Network first (4-second timeout), falling back to the copy saved last time.
- `js/sound.js`: synthesized sound effects (mute button in the header)
- `js/data/world.js`, `world-hi.js`: Natural Earth country shapes via world-atlas (1:50m and 1:10m)
- Fonts: Alfa Slab One, Libre Franklin, Special Elite and Gochi Hand from Google Fonts

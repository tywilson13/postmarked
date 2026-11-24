// Builds tools/chain-src/pokemon.json from the PokéAPI species list.
//
//   curl -o species.json "https://pokeapi.co/api/v2/pokemon-species?limit=2000"
//   node tools/make-pokemon.js species.json
//
// Tiers by generation (species number): a few famous ones are Common, the rest of the first 151
// Scarce, generations 2–3 Rare, everything after Priceless.
const fs = require('fs'), path = require('path');
const src = process.argv[2];
if (!src) { console.error('usage: node tools/make-pokemon.js species.json'); process.exit(1); }
const list = JSON.parse(fs.readFileSync(src, 'utf8')).results;

const FIX = {
  'nidoran-f': 'Nidoran|Nidoran F', 'nidoran-m': 'Nidoran M', 'mr-mime': 'Mr. Mime|Mr Mime', 'mime-jr': 'Mime Jr.|Mime Jr',
  'mr-rime': 'Mr. Rime|Mr Rime', 'ho-oh': 'Ho-Oh', 'porygon-z': 'Porygon-Z', 'type-null': 'Type: Null|Type Null',
  'jangmo-o': 'Jangmo-o', 'hakamo-o': 'Hakamo-o', 'kommo-o': 'Kommo-o', farfetchd: 'Farfetch’d|Farfetchd',
  sirfetchd: 'Sirfetch’d|Sirfetchd', flabebe: 'Flabébé|Flabebe', 'wo-chien': 'Wo-Chien', 'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu', 'chi-yu': 'Chi-Yu'
};
const FAMOUS = new Set(('pikachu charizard bulbasaur squirtle charmander jigglypuff meowth psyduck snorlax mewtwo mew eevee ' +
  'gengar magikarp gyarados onix geodude vulpix ditto lapras machamp slowpoke dragonite raichu pidgey rattata ' +
  'caterpie butterfree ninetales arcanine poliwag abra alakazam cubone togepi lucario').split(' '));
const title = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const tiers = { common: [], uncommon: [], rare: [], legendary: [] };
list.forEach((r, i) => {
  const n = i + 1;   // the list comes in species-number order
  const name = FIX[r.name] || title(r.name);
  const t = FAMOUS.has(r.name) ? 'common' : n <= 151 ? 'uncommon' : n <= 386 ? 'rare' : 'legendary';
  tiers[t].push(name);
});
const out = {
  id: 'pokemon', noun: 'Pokémon', plural: 'Pokémon', sources: ['PokéAPI species list (pokeapi.co)'],
  starts: ['Pikachu', 'Bulbasaur', 'Squirtle', 'Charmander', 'Eevee', 'Psyduck', 'Snorlax', 'Meowth', 'Vulpix', 'Onix', 'Abra', 'Togepi'],
  tiers,
  nope: { 'Ash|Ash Ketchum|Misty|Brock|Team Rocket|Jessie|James|Professor Oak': 'That’s a trainer, not a Pokémon!' }
};
fs.writeFileSync(path.join(__dirname, 'chain-src', 'pokemon.json'), JSON.stringify(out, null, 1));
console.log('pokemon', list.length, Object.entries(tiers).map(([k, v]) => `${k}:${v.length}`).join(' '));

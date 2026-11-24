// Loads the browser lexicon files into Node (they assign to window.PM_LEXICON).
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function loadLexicon(files) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  const dir = path.join(__dirname, '..', 'js', 'data');
  for (const f of files || ['lexicon.js', 'lexicon-more.js', 'lexicon-extra-foods.js', 'lexicon-extra-nature.js', 'lexicon-extra-places.js'])
    vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
  return ctx.window.PM_LEXICON;
};

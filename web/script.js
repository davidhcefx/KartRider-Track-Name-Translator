/**
 * Code for KartRider Rush+ Story Mode Formatter. Written by davidhcefx, 2021.12.15.
 */

let KART_DICTIONARY;

/**
 * Fetch tracklist and build Chinese to English name mappings.
 * @returns {Object.<String, String>}
 */
async function fetchDictionary() {
  if (typeof KART_DICTIONARY === 'object') {  // already fetched
    return KART_DICTIONARY;
  }
  KART_DICTIONARY = {};
  const url = 'https://raw.githubusercontent.com/davidhcefx/Tracks-in-KartRider-Rush-Story-Mode/main/Tracklist.md';
  const r = await fetch(url);
  (await r.text()).split('\n')
    .map((ln) => ln.split('|'))
    .filter((row) => row.length >= 4 && !row[1].includes('--') && !row[1].includes('[R]'))
    .forEach((row) => {
      KART_DICTIONARY[row[2].trim()] = row[1].trim();
    });

  return KART_DICTIONARY;
}

function hasSubsequence(str, sub) {
  let i = -1;
  for (const ch of sub) {
    i = str.indexOf(ch, i + 1);
    if (i === -1) {
      return false;
    }
  }
  return true;
}

/**
 * Find a key in d that contains name and return its value.
 * If not found, find a key that has subsequence of name.
 * @param {String} name
 * @param {Object} d: Dictionay mapping String -> String.
 * @returns {String}
 */
function findMatch(name, d) {
  const describe = (match) => {
    if (match.length > 1) return `MULTI MATCH (${match})`;
    // replace question mark with the Chinese name
    if (match.length === 1) return (d[match[0]] === '?') ? `(${match[0]})` : d[match[0]];
    return 'NOT FOUND!';
  };
  // substring match
  const keys = Object.keys(d);
  const res = describe(keys.filter((k) => k.includes(name)));
  if (res !== 'NOT FOUND!') return res;
  // fuzzy match
  return describe(keys.filter((k) => hasSubsequence(k, name)));
}

async function doTranslate() {
  const d = await fetchDictionary();
  const lines = document.getElementById('input').value.split('\n');
  const res = [];  // type: String[]
  let num = parseInt(lines[0], 10);
  let subNum = 1;
  if (Number.isNaN(num)) throw TypeError('The first line should be a number.');

  for (let i = 1; i < lines.length; i++) {
    const ln = lines[i].trim();
    if (ln.length > 0) {
      const [name, mode] = ln.split(/\s+/);
      if (mode === undefined) throw TypeError(`Input line ${i + 1} doesn't have a "mode".`);
      res.push(
        `- ${num}-${subNum++}: `
        + `${findMatch(name, d)} `
        + `(${mode[0].toUpperCase() + mode.substring(1)})`  // eslint-disable-line comma-dangle
      );
    } else {  // next paragraph
      res.push('');
      num++;
      subNum = 1;
    }
  }
  document.getElementById('output').value = res.join('\n');
}

async function run() {  // eslint-disable-line no-unused-vars
  try {
    await doTranslate();
  } catch (e) {
    alert(e);  // notify user errors
    console.error(e);
  }
}

async function autorun() {  // eslint-disable-line no-unused-vars
  if (document.getElementById('autorun').checked) {
    try {
      await doTranslate();
    } catch (e) {
      document.getElementById('output').value = e;
    }
  }
}

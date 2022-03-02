/**
 * Code for KartRider Rush+ Story Mode Formatter. Written by davidhcefx, 2021.12.15.
 */

let KART_DICTIONARY;

/**
 * Fetch tracklist and build Chinese to English name mappings.
 * @returns {Object}: Dictionay mapping String -> String.
 */
async function fetch_dictionary() {
  if (typeof KART_DICTIONARY === 'object') {  // already fetched
    return KART_DICTIONARY;
  } else {
    KART_DICTIONARY = {};
    const url = 'https://raw.githubusercontent.com/davidhcefx/KartRider-Rush-Story-Mode-Details/main/Tracklist_zh.md';
    const r = await fetch(url);
    (await r.text()).split('\n')
      .map((ln) => ln.split('|'))
      .filter((row) => row.length >= 4 && !row[1].includes('--'))
      .forEach((row) => {
        KART_DICTIONARY[row[1].trim()] = row[2].trim();
      });

    return KART_DICTIONARY;
  }
}

function has_subsequence(str, sub) {
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
function find_match(name, d) {
  const keys = Object.keys(d);
  const describe = (match) => {
    if (match.length > 1) return `MULTI MATCH (${match})`;
    // replace question mark with the Chinese name
    if (match.length === 1) return (d[match[0]] === '?') ? `(${match[0]})` : d[match[0]];
    return 'NOT FOUND!';
  };
  // substring match
  const s = describe(keys.filter((k) => k.includes(name)));
  if (s !== 'NOT FOUND!') return s;
  // fuzzy match
  return describe(keys.filter((k) => has_subsequence(k, name)));
}

async function do_translate() {
  const d = await fetch_dictionary();
  const lines = document.getElementById('input').value.split('\n');
  const res = [];  // type: String[]
  let num = parseInt(lines[0], 10);
  let sub_num = 1;
  if (Number.isNaN(num)) throw TypeError('The first line should be a number.');

  for (let i = 1; i < lines.length; i++) {
    const ln = lines[i].trim();
    if (ln.length > 0) {
      const [name, mode] = ln.split(/\s+/);
      if (mode === undefined) throw TypeError(`Input line ${i + 1} doesn't have a "mode".`);
      res.push(
        `- ${num}-${sub_num++}: `
        + `${find_match(name, d)} `
        + `(${mode[0].toUpperCase() + mode.substring(1)})`
      );
    } else {  // next paragraph
      res.push('');
      num++;
      sub_num = 1;
    }
  }
  document.getElementById('output').value = res.join('\n');
}

async function run() {
  try {
    await do_translate();
  } catch (e) {
    alert(e);  // notify user errors
    console.error(e);
  }
}

async function autorun() {
  if (document.getElementById('autorun').checked) {
    try {
      await do_translate();
    } catch (e) {
      document.getElementById('output').value = e;
    }
  }
}

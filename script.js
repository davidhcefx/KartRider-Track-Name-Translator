/**
 * Written by davidhcefx, 2021.12.15.
 **/

// comment out for node-js testing
//import fetch from 'node-fetch';

/**
 * Fetch tracklist and build Chinese to English name mappings.
 * @return: dict: String -> String
 **/
async function fetch_dictionary() {
  var d = {};
  const url = 'https://raw.githubusercontent.com/davidhcefx/KartRider-Rush-Story-Mode-Details/main/Tracklist_zh.md';
  const r = await fetch(url);
  (await r.text()).split('\n')
    .map(ln => ln.split('|'))
    .filter(row => row.length >= 4 && !row[1].includes('--')) 
    .forEach(row => {
      d[row[1].trim()] = row[2].trim();
    });

  return d;
}

/**
 * @return Boolean
 **/
function has_subsequence(str, sub) {
  var i = -1;
  for (var ch of sub) {
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
 * @name String
 * @d dict: String -> String
 * @return String
 **/
function find_match(name, d) {
  const keys = Object.keys(d);
  const describe = (match) => {
    if (match.length > 1) {
      return `MULTI MATCH (${match})`;
    } else if (match.length === 1) {
      // we don't want to output a question mark
      return (d[match[0]] === '?') ? `(${match[0]})` : d[match[0]];
    } else {
      return 'NOT FOUND!';
    }
  };
  // substring match
  const s = describe(keys.filter(k => k.includes(name)));
  if (s !== 'NOT FOUND!') {
    return s;
  } else {
    // fuzzy match
    return describe(keys.filter(k => has_subsequence(k, name)));
  }
}

async function run() {
  const d = await fetch_dictionary();
  const lines = document.getElementById('input').value.split('\n');
  var res = [];  // type: [String]
  var num = parseInt(lines[0]);
  var sub_num = 1;

  for (var i = 1; i < lines.length; i++) {
    const ln = lines[i].trim();
    if (ln.length > 0) {
      const [name, mode] = ln.split(' ');
      res.push(
        `- ${num}-${sub_num++}: `
        + `${find_match(name, d)} `
        + (${mode[0].toUpperCase() + mode.substring(1)})`
      );
    } else {
      res.push('');
      num++;
      sub_num = 1;
    }
  }
  document.getElementById('output').value = res.join('\n');
}

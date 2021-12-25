const http = require('http');
const fs = require('fs');

function createServer(idx, script, fav) {
  http.createServer((req, res) => {
    if (req.url === '/script.js') {
      res.writeHead(200, {
        'Content-Type': 'application/javascript'
      });
      res.end(script);
    } else if (req.url === '/favicon.ico') {
      res.writeHead(200, {
        'Content-Type': 'image/x-icon'
      });
      res.end(fav);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(idx);
    }
    console.log(req.url);
  }).listen(80);

  console.log('Server listening at port 80...');
}

// read files
// TODO: it's ugly, change to express
fs.readFile('index.html', (err, idx) => {
  if (err) throw err;
  fs.readFile('script.js', (e, script) => {
    if (err) throw err;
    fs.readFile('favicon.ico', (err, fav) => {
      if (err) throw err;
      createServer(idx, script, fav);
    });
  });
});

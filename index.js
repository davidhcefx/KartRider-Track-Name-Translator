const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

function _404(req, res) {
  res.status(404).end(`File ${req.path} not found!`);
}

function logRequest(req) {
  console.log([Date.now(), req.ip, req.originalUrl].join('\t'));
}

app.get('/', (req, res) => {
  res.sendFile(
    'index.html',
    {root: `${__dirname}/web`},
    (err) => {if (err) _404(req, res)}
  );
  logRequest(req);
});

app.get('/:name', (req, res) => {
  res.sendFile(
    req.params.name,
    {root: `${__dirname}/web`},
    (err) => {if (err) _404(req, res)}
  );
  logRequest(req);
});

const server = app.listen(PORT, () => {
  console.log(`Server listening at port ${server.address().port}...`);
});

const { createProxyMiddleware }  = require('http-proxy-middleware');
const URL = require('url').URL;
const chalk = require('chalk');
const dotenv = require('dotenv');
const express = require('express');
const unirest = require('unirest');

const app = express();
const PORT = 8005;

dotenv.config();

const { API_KEY, HOST } = process.env;

try {
  new URL(HOST);
} catch (exp) {
  throw Error('Please enter a valid URL for the HOST field in .env!');
}

if (!API_KEY) {
  throw Error('Please enter a value for the API_KEY field in .env!');
}

app.use(express.json())

app.use(function(req, res, next) {
  const origin = req.headers.origin;

  if (String(origin).includes('http://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    res.send();
    return;
  }

  return next();
});

// Entry point handler, which takes care of all incoming requests from client side.
app.get('/api/systemusers', (req, res) => {
  const request = unirest("GET", "https://console.jumpcloud.com/api/systemusers")

  //console.log('-->', req.body)
  console.log('-->', req.method)

  // Add the neccesary headers, as documented in the JumpCloud API, here: https://docs.jumpcloud.com/1.0/systemusers/list-all-system-users
  // NOTE: To trigger an error from backend, just modify the API_KEY
  //       In this case, response.error.status will be: 401
  //                     response.body will be:         Unauthorized: api key user not found
  request.headers({
    "content-type": "application/json",
    "accept-header": "application/json",
    "x-api-key": API_KEY,
  })

  request.end(function (response) {
    if (response.error) { // we got an error from backend
      console.log('Express Server: Got error with status code: ', response.error.status)
      console.log('Express Server: Got error with message:     ', response.body)
      // At this point, we don't want to: throw new Error(response.error)
      // because this express server is very simple and does not know how to handle it (e.g. retry the request, etc)
      // so as a result, the express server will crush
      // but rather let UI handle this error, because user needs some sort of feedback anyways...

      // Not sure if this is the proper way.
      // More examples here: https://www.robinwieruch.de/node-express-error-handling
      res.status(response.error.status).json({error: response.error, message: response.body})
      return
    }
    // If we get here, at least we don't have an error. 
    // But we still might need to check status code..
    //console.log('I got response from backend: ', response.body)
    res.json(response.body || {})
  })
})

app.get('/api/systemusers/:id', (req, res) => {
  const request = unirest("GET", "https://console.jumpcloud.com/api/systemusers/" + req.params.id)
  console.log('-->', req.method)

  request.headers({
    "content-type": "application/json",
    "accept-header": "application/json",
    "x-api-key": API_KEY,
  })

  request.end(function (response) {
    if (response.error) { // we got an error from backend
      console.log('Express Server: Got error with status code: ', response.error.status)
      console.log('Express Server: Got error with message:     ', response.body)

      res.status(response.error.status).json({error: response.error, message: response.body})
      return
    }

    res.json(response.body || {})
  })
})

app.post('/api/systemusers', (req, res) => {
  const request = unirest("POST", "https://console.jumpcloud.com/api/systemusers")
  console.log('-->', req.method)

  request.headers({
    "content-type": "application/json",
    "accept-header": "application/json",
    "x-api-key": API_KEY,
  })

  request.send({
    ...req.body
  })

  request.end(function (response) {
    if (response.error) { // we got an error from backend
      console.log('Express Server: Got error with status code: ', response.error.status)
      console.log('Express Server: Got error with message:     ', response.body)

      res.status(response.error.status).json({error: response.error, message: response.body})
      return
    }

    res.json(response.body || {})
  })
})

app.put('/api/systemusers/:id', (req, res) => {
  const request = unirest("PUT", "https://console.jumpcloud.com/api/systemusers/" + req.params.id)
  console.log('-->', req.method)

  request.headers({
    "content-type": "application/json",
    "accept-header": "application/json",
    "x-api-key": API_KEY,
  })

  request.send({
    ...req.body
  })

  request.end(function (response) {
    if (response.error) { // we got an error from backend
      console.log('Express Server: Got error with status code: ', response.error.status)
      console.log('Express Server: Got error with message:     ', response.body)

      res.status(response.error.status).json({error: response.error, message: response.body})
      return
    }

    res.json(response.body || {})
  })
})

app.delete('/api/systemusers/:id', (req, res) => {
  const request = unirest("DELETE", "https://console.jumpcloud.com/api/systemusers/" + req.params.id)
  console.log('-->', req.method)

  request.headers({
    "content-type": "application/json",
    "accept-header": "application/json",
    "x-api-key": API_KEY,
  })

  request.end(function (response) {
    if (response.error) { // we got an error from backend
      console.log('Express Server: Got error with status code: ', response.error.status)
      console.log('Express Server: Got error with message:     ', response.body)

      res.status(response.error.status).json({error: response.error, message: response.body})
      return
    }

    res.json(response.body || {})
  })
})

const handleError = (err, req, resp) => {
  const host = req.headers && req.headers.host;
  const code = err.code;

  if (code === 'SELF_SIGNED_CERT_IN_CHAIN') {
    console.error(`${chalk.red('WARNING:')} You will need to specify the NODE_EXTRA_CA_CERTS env var when running the proxy against a host with a self signed certificate!`);
    console.error(`${chalk.yellow('USAGE:')} NODE_EXTRA_CA_CERTS=/path/to/jumpcloud-workstation/pki/certs/ca.crt npm run start`);
  }

  resp.writeHead(500);
  resp.end(`Error occured while trying to proxy to: ${host} ${req.url}. Error: ${code}\n`);
};

const proxy = createProxyMiddleware({
  target: HOST,
  changeOrigin: true,
  headers: {
    'x-api-key': API_KEY,
  },
  onError: handleError,
});

app.use('/api', proxy);

app.listen(PORT, function() {
  console.log('Server started on port ' + PORT);
});

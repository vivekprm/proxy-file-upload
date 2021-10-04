const express = require('express')

const http = require('http');
const app = express()

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());

app.use(express.static('public', {
    etag: true, // Just being explicit about the default.
    lastModified: true,  // Just being explicit about the default.
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        // All of the project's HTML files end in .html
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }))

app.get('/health', (req, res) => {
    return res.send('ok')
})

app.post( '/upload', function ( req, res ) {
    const headers = JSON.parse(JSON.stringify(req.headers)); // create a copy of headers
    delete headers["content-length"]; // Without this node.js requests will set the content-length to null

    const options = {
        host: '127.0.0.1',
        port: 3001,
        method: 'POST',
        path: '/upload',
        body: req.rawBody,
        headers,
        json: false,
        resolveWithFullResponse: true
    };
    var proxyReq = http.request({
        options
    }, function(response) {
        response.resume();
    });
    proxyReq.on('error', e => {
        console.log(e);
    });
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
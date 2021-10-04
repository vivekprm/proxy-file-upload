const http = require('http');
Busboy = require('busboy')
const express = require('express')
const path = require('path')
var FormData = require('form-data');

const app = express()

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
// Disable cache
app.set('etag', false)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

app.get('/health', (req, res) => {
    return res.send('ok')
})
app.get('/data', (req,res) => {
    const count = 1;
    res.send(
        {
            country: 'India',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500075'
          }
      );
})

app.post( '/upload', function ( req, res ) {
    console.log("Request received by proxy");
    console.log(req);
    var busboy = new Busboy( { headers: req.headers } );
    var formData = new FormData();

    busboy.on('file', function(fieldname, file) {
        console.log(fieldname);
        console.log(file);
        formData.append('file', file);
        formData.append('fileName', fieldname);
        
        var proxyReq = http.request({
            headers: req.headers,
            host: '127.0.0.1',
            port: 3001,
            method: 'POST',
            path: '/upload'
        }, function(response) {
            response.resume();
        });
        proxyReq.on('error', e => {
            console.log(e);
        });
        file.pipe(proxyReq);
    });

    busboy.on( 'finish', function () {
        console.log('busboy finished');
        req.body = formData;
        res.send(formData)
    });

    busboy.end(req.rawBody);
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
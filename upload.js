const express = require('express')
const path = require('path');
const fs = require('fs-extra');   
Busboy = require('busboy')
const app = express()

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uploadPath = path.join(__dirname, 'mydir/'); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that he upload path exits

app.get('/health', (req, res) => {
  return res.send('ok')
})
// https://stackoverflow.com/questions/47630163/axios-post-request-to-send-form-data
app.post('/upload', (req, res) => {
    console.log("Request received by proxy");
    console.log(req);
    var busboy = new Busboy({
      headers: req.headers
    });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log(`Upload of '${filename}' started`);
 
      // Create a write stream of the new file
      const fstream = fs.createWriteStream(path.join(uploadPath, filename));
      // Pipe it trough
      file.pipe(fstream);

      // On finish of the upload
      fstream.on('close', () => {
          console.log(`Upload of '${filename}' finished`);
      });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!');
      res.end();
    });
    
    req.pipe(busboy);
});

app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
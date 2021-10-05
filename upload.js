var express = require("express");
var bodyParser = require("body-parser");
var multer = require('multer');
var app = express();

app.use('/public', express.static('public'));
app.get('/', function (req, res) {
    res.redirect('public/index.html');
});

app.use(bodyParser.json());

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
/**
 * Here rather than .single() we are using .array(selector,fileLimit) of Multer. 
 * Multer will accept array of files limiting to max 2 file at each time.
 */
var upload = multer({ storage : storage }).single('artifact');

app.post('/upload',function(req,res){
    upload(req,res,function(err) {
        console.log(req.body);
        console.log(req.file);
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
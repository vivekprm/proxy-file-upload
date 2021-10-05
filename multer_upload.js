var express = require("express");
var bodyParser = require("body-parser");
var multer = require('multer');
var app = express();

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
var upload = multer({ storage : storage }).array('userPhoto',2);

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index2.html");
});

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        console.log(req.body);
        console.log(req.files);
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.listen(3000,function(){
    console.log("Working on port 3000");
});
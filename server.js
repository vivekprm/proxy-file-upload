let express = require('express');
let app = express();
var multiparty = require("multiparty");
var request = require("request");
var FormData = require('form-data');

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

app.post( '/upload', function ( req, res, next ) {
    var form = new multiparty.Form();

    form.on("part", function(part){
        if(part.filename) {
            var form = new FormData();

            form.append("artifact", part, {filename: part.filename,contentType: part["content-type"]});

            var r = request.post("http://localhost:3001/upload", { "headers": {"transfer-encoding": "chunked"} }, function(err, res, body){
                httpResponse.send(res);
            });
           
            r._form = form
        }
    })

    form.on("error", function(error){
        console.log(error);
    })

    form.parse(req); 
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
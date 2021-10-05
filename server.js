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

    form.on("part", function(formPart){
        if(formPart.filename) {
            var contentType = formPart.headers['content-type'];

            var formData = {
                blob: {
                    value: formPart,
                    options: {
                        filename: formPart.filename,
                        contentType: contentType,
                        knownLength: formPart.byteCount
                    }
                }
            };

            request.post({url: "http://localhost:3001/upload", formData: formData});
        }
    })

    form.on("error", function(error){
        next(error);
    })

    form.on('close', function() {
        res.send('received upload');
    });

    form.parse(req); 
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
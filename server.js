let express = require('express');
let app = express();
var multiparty = require("multiparty");
var request = require("request");

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
            var formData = {
                thumbnail: {
                    value:  part,
                    options: {
                        filename: part.filename,
                        contentType: part["content-type"],
                        knownLength: 244
                    }
                }
            };

            request.post({url:'http://localhost:3001/upload', formData: formData}, function (err, httpResponse, body) {
                if(err) {
                    return console.error('upload failed:', err);
                }
                console.log('Upload successful!  Server responded with:');
            });
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
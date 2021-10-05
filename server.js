const multiparty = require('multiparty')
const request = require('request')
const express = require('express')
const app = express()

app.use('/public', express.static('public'));
app.get('/', function (req, res) {
    res.redirect('public/index.html');
});

app.post('/upload', (req, res, next) => {
    var count = 0;
    var form = new multiparty.Form();

    // Errors may be emitted
    // Note that if you are listening to 'part' events, the same error may be
    // emitted from the `form` and the `part`.
    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });

    // Parts are emitted when parsing the form
    form.on('part', function(part) {
        // You *must* act on the part by reading it
        // NOTE: if you want to ignore it, just call "part.resume()"

        if (!part.filename) {
            // filename is not defined when this is a field and not a file
            console.log('got field named ' + part.name);
            // ignore field's content
            part.resume();
        }

        if (part.filename) {
            // filename is defined when this is a file
            count++;
            console.log('got file named ' + part.name);
            var contentType = part.headers['content-type'];
    
            var formData = {
                artifact: {
                    value: part,
                    options: {
                        filename: part.filename,
                        contentType: contentType,
                        knownLength: part.byteCount
                    }
                }
            };
    
            request.post({url: "http://localhost:3001/upload", formData: formData});
            part.resume();
        }

        part.on('error', function(err) {
            // decide what to do
        });
    });

    // Close emitted after form parsed
    form.on('close', function() {
        console.log('Upload completed!');
        res.end('Received ' + count + ' files');
    });

    // Parse req
    form.parse(req);
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
let express = require('express');
let app = express();
var multiparty = require("multiparty");
var request = require("request");
var FormData = require('form-data');

app.use(express.static('public'));

app.get('/health', (req, res) => {
    return res.send('ok')
})

app.post( '/upload', function ( req, res, next ) {
    var count = 0;
    var form = new multiparty.Form();

    form.on("part", function(formPart){
        if (!formPart.filename) {
            // filename is not defined when this is a field and not a file
            console.log('got field named ' + part.name);
            // ignore field's content
            part.resume();
        }
        if(formPart.filename) {
            // filename is defined when this is a file
            count++;
            console.log('got file named ' + formPart.name);
            var contentType = formPart.headers['content-type'];
    
            var formData = {
                artifact: {
                    value: formPart,
                    options: {
                        filename: formPart.filename,
                        contentType: contentType,
                        knownLength: formPart.byteCount
                    }
                }
            };
    
            request.post({url: "http://localhost:3001/upload", formData: formData});
            formPart.resume();
        }
        formPart.on('error', function(err) {
            console.log("Error: " + err)
        });
    })

    form.on("error", function(error){
        console.log("Error: " + error)
        next(error);
    })

    // Close emitted after form parsed
    form.on('close', function() {
        console.log('Upload completed!');
        res.end('Received ' + count + ' files');
    });

    // Parse req
    form.parse(req);

    form.parse(req); 
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log( 'server is running on port ' + app.get('port'));
});
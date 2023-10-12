const express = require('express');
const app = express();
const fs = require('fs');
const shortid = require('shortid');

let _urls = fs.readFileSync('urls.json');
let urls = JSON.parse(_urls);

function validateUrl(value) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	    '(\\#[-a-z\\d_]*)?$','i');

      return !!urlPattern.test(value);
}

app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended : false}));

app.get('/', async (req, res) => {
    res.render('index', {urls: urls});
});

app.post('/shortUrl', async (req, res) => {
    let newUrl = {
        "full" : "",
        "short": ""
    };

    let found = false;
    if (validateUrl(req.body.fullUrl)) {
        try {
            for(let i = 0; i < urls.length; i++) {
                if(urls[i].full == req.body.fullUrl)
                found = true;
            }
            if (found) {
                //Exists, ignore and skip
                console.log('exists: ', req.body.fullUrl);
                res.redirect('/');
            } else {
                //Does not exist, add into json file
                newUrl.full = req.body.fullUrl
                newUrl.short = shortid.generate();
                urls.push(newUrl);
                var newUrlObj = JSON.stringify(urls);

                fs.writeFile('urls.json', newUrlObj, err => {
                    if(err) throw err;
                    console.log("New data added");
                });
                res.redirect('/');
            }
        } catch (err) {
          console.log(err);
          res.status(500).json('Server Error');
        }
      } else {
        res.status(400).json('Invalid Original Url');
      }
})

app.get('/:shortUrl', (req, res) => {
    for(let i = 0; i < urls.length; i++) {
        if(urls[i].short === req.params.shortUrl){
            res.redirect(urls[i].full);
        }
    }
})

app.listen(process.env.port || 5000);
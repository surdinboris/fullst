var express = require('express');
var app = express();
const {createReadStream} = require("fs");
const {stat, readdir} = require("fs").promises;
const {parse} = require("url");
const {join,resolve, sep, extname} = require("path");
const baseDirectory = process.cwd();

app.set("view options", {layout: false});
app.engine('html', require('ejs').renderFile);

function toFSpath(url) {
    let {pathname} = parse(url);
    let filepath = resolve(decodeURIComponent(pathname).slice(1));

    if (filepath != baseDirectory &&
        !filepath.startsWith(baseDirectory + sep)) {
        throw {status: 403, body: "Forbidden"};
    }
    return filepath;

}

app.get('/welcome', function (req, res) {
    console.log('welcome')
    res.send('<b>Hello</b> welcome to my http server made with express');
});

app.get('*', async function (request, res) {
    let filepath = toFSpath(request.url);
    // console.log('toFSpath',request.url,toFSpath(request.url))
    let stats;
    let isdir;
    try {
        stats = await stat(filepath);
        isdir=await stats.isDirectory()
    } catch (error) {
        //console.log(error);
        if (error.code == "ENOENT") throw error;
        // else res.send("File not found");
    }
    if (isdir) {
        //fullpath to enter to  subsub levels
        let urllist = await readdir(filepath);
        // let urllist = (await readdir(path)).map((c) => {
        //     //patch - avoid unnecessary '/' addidtions
        //     if (request.url == "/") {
        //         res.send( `<a href=${c}>${c}</a><br>`);
        //     }
        //      res.send( `<a href=${request.url + "/" + c}>${c}</a><br>`)
        // });
        let resp=urllist.map((u)=>{
            if (request.url == "/") {
                return (`<a href=${u}>${u}</a><br>`);
            }
                 return( `<a href=${request.url + "/" + u}>${u}</a><br>`)
             });
        resp=resp.join("\n");
        res.send(resp)
    }

    else {
        // console.log(extname(filepath),filepath);
        if (extname(filepath) == ".html"){
            res.render(filepath);
        }
        else{
            let readstream=createReadStream(filepath);
            readstream.pipe(res)}
    }
});

//


// app.use(function(req, res, next) {
//     res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
// });
app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});
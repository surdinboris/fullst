const {createReadStream} = require("fs");
const {stat, readdir,readFile} = require("fs").promises;
const {parse} = require("url");
const {join,resolve, sep, extname} = require("path");
const baseDirectory = process.cwd();
const mime = require('mime');
let http =require('http');

let server=http.createServer(async function (request,response) {
    let filepath = toFSpath(request.url);
    // console.log('toFSpath',request.url,toFSpath(request.url))
    let stats;
    let isdir;

    try {
        stats = await stat(filepath);
        isdir=await stats.isDirectory()
    } catch (error) {
        //console.log(error);
        if (error.code == "ENOENT") {
            response.writeHead(404, `resource not found ${error}`);
            response.end();
            console.log(error.toString().replace("\n"));
            return
        }
    }
    if (isdir) {
        //fullpath to enter to  subsub levels
        let filelist = await readdir(filepath);
        let filefront= await readFile('fileview.html');
        let json=JSON.stringify({"filelist":filelist});
        response.write(filefront);
        response.end(`<script type="text/javascript">let filelist= ${json}</script>`)
    }
    else {
        let mimeType=await mime.getType(filepath);
        console.log('getType',filepath,`{Content-Type:${mimeType}}`);
        response.setHeader("Content-Type",mimeType);
        response.end(await readFile(filepath))
    }
});


function toFSpath(url) {
    let {pathname} = parse(url);
    let filepath = resolve(decodeURIComponent(pathname).slice(1));
    if (filepath != baseDirectory &&
        !filepath.startsWith(baseDirectory + sep)) {
        throw {status: 403, body: "Forbidden"};
    }
    return filepath;
}

server.listen(3000);
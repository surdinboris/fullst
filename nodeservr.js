const {createReadStream} = require("fs");
const {stat, readdir,readFile} = require("fs").promises;
const {parse} = require("url");
const {join,resolve, sep, extname} = require("path");
const baseDirectory = process.cwd();
const mime = require('mime');
let http =require('http');

function isRestURL(requestUrl) {
    let idfilter = /\/restapi\//;
    let result =idfilter.exec(requestUrl);
    if(result && result != null){
        return result;}
    else return false
}
function toFSpath(url) {
    let {pathname} = parse(url);
    let filepath = resolve(decodeURIComponent(pathname).slice(1));
    if (filepath != baseDirectory &&
        !filepath.startsWith(baseDirectory + sep)) {
        throw {status: 403, body: "Forbidden"};
    }
    return filepath;
}

async function getfilelist(url){
    let filepath=toFSpath(url);
    let filelist = await readdir(filepath);

    let filelistobj = {};
    filelistobj.headers = {};
    filelistobj.headers.fullname = 'Name';
    filelistobj.headers.fsize = 'Size';
    filelistobj.headers.mtime = 'Modified';

    for (let i = 0; i < filelist.length; i++) {
        let filest = await stat(join(filepath, filelist[i]));
        // console.log(filest);
        filelistobj[filelist[i]] = {};
        filelistobj[filelist[i]].fullname = join(url, filelist[i]);
        filelistobj[filelist[i]].fsize = filest.size;
        filelistobj[filelist[i]].mtime = filest.mtime;
        filelistobj[filelist[i]]._isdir = filest.isDirectory();
    }
    console.log(filelistobj);
    return filelistobj
}

let server=http.createServer(async function (request,response) {

    if(request.method == 'GET'){
        let url = request.url;
        if(isRestURL(request.url)){
            url = request.url.replace(/\/restapi\//, '/')+'/';
            console.log('new url', url)
        }
        let filepath = toFSpath(url);

        // console.log('toFSpath',request.url,toFSpath(request.url))
        let stats;
        let isdir;
        try {
            stats = await stat(filepath);
            isdir = await stats.isDirectory()
        } catch (error) {
            //console.log(error);
            if (error.code == "ENOENT") {
                response.writeHead(404, `resource not found ${error}`);
                return
            }
        }
        if (isdir && isRestURL(request.url) == false) {
            let filefront = await readFile('fileview.html');
            let filelistobj = await getfilelist(url);
            filelistobj = JSON.stringify(filelistobj);
            response.write(filefront);
            response.end(`<script type="text/javascript">let filelist = ${filelistobj}</script>`)
        }
        if (isdir && isRestURL(request.url)){
            console.log('resttt',url)
            let filelistobj = await getfilelist(url);
            filelistobj = JSON.stringify(filelistobj);
            response.end(filelistobj)
        }
        if (isdir == false) {
            let mimeType = await mime.getType(filepath);
            response.setHeader("Content-Type", mimeType);
            response.end(await readFile(filepath))
        }

    }
// if(request.method == 'GET' && isRestURL(request.url)){
//     // response.setHeader("Content-Type", "text/html");
//     let filelistobj = await getfilelist(request);
//     filelistobj = JSON.stringify(filelistobj);
//     response.end(filelistobj)
// }

});




server.listen(3000);
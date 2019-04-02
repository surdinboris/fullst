const {createReadStream,createWriteStream} = require("fs");
const {stat, readdir,readFile, rename} = require("fs").promises;
const {parse} = require("url");
const {join,resolve, sep, extname} = require("path");
const urljoin =require('url-join');
const baseDirectory = process.cwd();
const mime = require('mime');
let http =require('http');
let formidable = require("formidable");
//constructing routing handler
let Router= function () {

    this.handlers=[]
};
Router.prototype.add = function (method, urls, callback) {
    for (let url of urls){
        let handler= {method:method, url:url, callback:callback};
        handler.validateurl= function(url) {
            console.log("url validation:",url.match(this.url));
            return url.match(this.url)};
        this.handlers.push(handler);
    }
 };


Router.prototype.proc = function (request,response) {
    let method = request.method;
    let url = request.url;
    for(let handler of this.handlers) {
        if (handler.method == method && handler.validateurl(url)){
            handler.callback(request,response);
            return
        }
    }
console.log('not handled');
response.end("404")
};


let router = new Router();

// router.add('post','www',function(){console.log('www')});
// router.add('put','www2',function(){console.log('www2')});

function isRestURL(requestUrl) {
    let idfilter = /\/restapi\//;
    let result =idfilter.exec(requestUrl);
    if(result && result != null){
        return result;}
    else return false
}


router.add("GET",[/style/,/js/,/node_modules/], async function (request,response) {
    let url = request.url;
    let filepath = toFSpath(url);
    let mimeType = await mime.getType(filepath);
    response.setHeader("Content-Type", mimeType);
    response.end(await readFile(filepath))
});


router.add("GET",[/\/restapi\//], async function (request,response) {
    //console.log('get url', request.url);
    //let url = request.url;

    let url = request.url.replace(/\/restapi\//, '/');
    console.log('rest request', url);

    let filepath = toFSpath(url);
    // console.log('toFSpath',request.url,toFSpath(request.url))
    let stats;
    let isdir;

    try {
        stats = await stat(filepath);
        isdir = await stats.isDirectory()
    }
    catch (error){
        console.log("satats error",error)
    }

    if (isdir && isRestURL(request.url)){
        let filelistobj = await getfilelist(url);
        filelistobj = JSON.stringify(filelistobj);
        response.end(filelistobj)
    }
});

router.add("GET",[/files/], async function (request,response) {
    //console.log('get url', request.url);
    let url = request.url;

    let filepath = toFSpath(url);
    // console.log('toFSpath',request.url,toFSpath(request.url))
    let stats;
    let isdir;

    try {
        stats = await stat(filepath);
        isdir = await stats.isDirectory()
    } catch (error) {
        //console.log(error);
        if (error.code == "ENOENT"){
            response.writeHead(404, `resource not found ${error}`);
            return
        }
    }
    if (isdir && isRestURL(request.url) == false) {
        let filefront = await readFile('fileview.html');
        let filelistobj = await getfilelist(url);
        filelistobj = JSON.stringify(filelistobj);
        console.log(filelistobj);
        response.write(filefront);
        response.end(`<script type="text/javascript">let filelist = ${filelistobj}</script>`)
    }

    if (isdir == false){
        let mimeType = await mime.getType(filepath);
        response.setHeader("Content-Type", mimeType);
        response.end(await readFile(filepath))
    }
});


router.add("PUT",[/.*/] ,async function (request,response) {
    //console.log('PUT',request.url, toFSpath(request.url))
    //let wrstream= createWriteStream(join(toFSpath(request.url),'inpstream'));
    // wrstream.on("error", function (error) {
    //     response.end(500, error.toString())
    // });
    // wrstream.on("finish", function () {
    //     response.end('204')
    // });
    //request.pipe(wrstream)
    let form = new formidable.IncomingForm();
    form.uploadDir=toFSpath(request.url);
    form.keepExtensions = true;
    form.on('file', function(field, file) {
        rename(file.path, form.uploadDir + "/" + file.name);
    });
    form.on('end',function (param) {
        console.log('>>>form.end',param);
        response.end('200')
    });
    form.parse(request)
});


function toFSpath(url){
    let {pathname} = parse(url);
    let filepath = resolve(decodeURIComponent(pathname).slice(1));
    if (filepath != baseDirectory &&
        !filepath.startsWith(baseDirectory + sep)){
        console.log('ahtung toFSpath restriction filepath',filepath);
        throw {status: 403, body: "Forbidden"};
    }
    return filepath;
}

//function that reads content of dir and returns object
async function getfilelist(url){
    let filepath=toFSpath(url);
    let filelist = await readdir(filepath);
    let filelistobj = {};
    filelistobj.headers = {};
    filelistobj.headers.fullname = 'Name';
    filelistobj.headers.fsize = 'Size';
    filelistobj.headers.mtime = 'Modified';
    //adding up shortcut
    let splitted= url.split(/(?=\/)/g);
    let uplink='';
    if(splitted[0] == '/'){
        uplink = '/'
    }
    else if (splitted.length > 1){
        splitted.pop();
        uplink=splitted.join('');
    }
    else{
        uplink = '/'
    }
    filelistobj['emptyrow'] = {};
    filelistobj['emptyrow'].fullname = uplink;
    filelistobj['emptyrow'].fsize = '';
    filelistobj['emptyrow'].mtime = '';
    filelistobj['emptyrow']._isdir = true;
    filelistobj['emptyrow']._meta = 'uplink';
    for (let i = 0; i < filelist.length; i++) {
        let filest = await stat(join(filepath, filelist[i]));
        filelistobj[filelist[i]] = {};
        filelistobj[filelist[i]].fullname = urljoin(url, filelist[i]);
        filelistobj[filelist[i]].fsize = filest.size;
        filelistobj[filelist[i]].mtime = filest.mtime;
        filelistobj[filelist[i]]._isdir = filest.isDirectory();
        filelistobj[filelist[i]]._meta = 'regular_record';
    }
    return filelistobj
}



let server=http.createServer(async function (request,response) {
    //console.log('new request retrieved', request.url, request.method);
router.proc(request,response)

});
server.listen(3000);
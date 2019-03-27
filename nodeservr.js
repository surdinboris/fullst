const {createReadStream,createWriteStream} = require("fs");
const {stat, readdir,readFile, rename} = require("fs").promises;
const {parse} = require("url");
const {join,resolve, sep, extname} = require("path");
const urljoin =require('url-join');
const baseDirectory = process.cwd();
const mime = require('mime');
let http =require('http');
let formidable = require("formidable");
let handlers={};
function isRestURL(requestUrl) {
    let idfilter = /\/restapi\//;
    let result =idfilter.exec(requestUrl);
    if(result && result != null){
        return result;}
    else return false
}

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

handlers['PUT']= async function (request,response) {
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
        console.log('>>>form.end',param)
    response.end(200)
    });
    //console.log(form)
    form.parse(request)
};

handlers['GET']=async function (request,response) {
    //console.log('get url', request.url);
    let url = request.url;
    if(isRestURL(request.url)){
        url = request.url.replace(/\/restapi\//, '/');
        console.log('new url', url)
    }
    else{
        console.log('notresturl')}
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
    if (isdir && isRestURL(request.url)){
        let filelistobj = await getfilelist(url);
        filelistobj = JSON.stringify(filelistobj);
        response.end(filelistobj)
    }
    if (isdir == false) {
        let mimeType = await mime.getType(filepath);
        response.setHeader("Content-Type", mimeType);
        response.end(await readFile(filepath))
    }
};
let server=http.createServer(async function (request,response) {
    //console.log('new request retrieved', request.url, request.method);
    if (request.method in handlers){
        handlers[request.method](request,response)
    }
});
server.listen(3000);
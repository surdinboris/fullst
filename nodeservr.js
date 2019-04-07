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
let etag = 90;
let waiting = [];
let Router= function () {

    this.handlers=[]
};


Router.prototype.add = function (method, urls, callback) {
    for (let url of urls){
        let handler= {method:method, url:url, callback:callback};
        handler.validateurl= function(url) {
            return url.match(this.url)};

        this.handlers.push(handler);
    }
 };


Router.prototype.proc = async function (request,response) {

    let method = request.method;
    let url = request.url;
    for(let handler of this.handlers) {
        if (handler.method == method && handler.validateurl(url) != null) {
            await handler.callback(request, response)
            break
        }
        else {

            console.log('not handled', request.url, request.method);
            sendresponse("Not found 404", response, '404', "text/plain")
            return
        }
}

    if(request.method == "PUT"){
        console.log('waiting before folderchange', waiting.length)
        // podssible improvement is to add request.headers['folerpath']
        //  register changes in specific folder and accordingly resolve requests only for
        // client looking into that folder
        etag = etag + 1;
        for (let waiter of waiting) {
            // waiting.forEach( function (waiter) {
            console.log('+++sending responses on folderchange', etag, waiter.clversion);
            sendresponse("updated pollingresponse sending", waiter.response, '201', "text/plain")
        }
        ;
        console.log('clearing waiting ', waiting.length, 'entries');
        waiting = [];
        console.log('waiting-length', waiting.length)
    }
    if(request.method == "PUT"){
        console.log('---------waiting after PUT proc', waiting.length)}
    console.log('*****request execution completed******', request.method,request.url)



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


router.add("GET",[/style/,/js/,/node_modules/],  function (request,response) {
    console.log('js handler started')
    let url = request.url;
    let filepath = toFSpath(url);
    let mimeType = mime.getType(filepath);


    response.setHeader("Content-Type", mimeType);
    readFile(filepath).then(rfile => {
        response.end(rfile);
        //response.setHeader("Content-Type", mimeType);

    });
});

    function sendresponse(data, response, status, type) {
        //console.log({"Content-Type": type || "text/plain", "etag":etag});
        response.writeHead(status, {"Content-Type": type || "text/plain", "etag": etag});
        response.end(data)
    }


    router.add("GET", [/\/restapi\//], async function (request, response) {
        //console.log('get url', request.url);
        //let url = request.url;
        let url = request.url.replace(/\/restapi\//, '/');
        let filepath = toFSpath(url);
        // console.log('toFSpath',request.url,toFSpath(request.url))
        let stats;
        let isdir;
        try {
            console.log('calculating stats')
            stats = await stat(filepath);
            isdir = await stats.isDirectory()
            console.log('is dir', isdir)
        }
        catch (error) {
            console.log("satats error", error)
        }
        if (isdir) {
            console.log('calc  filelist')
            getfilelist(url).then(filelistobj => sendresponse(JSON.stringify(filelistobj), response, "200"));
            // let filelistobj =  getfilelist(url);
            console.log('calced filelist sent')

            // filelistobj = JSON.stringify(filelistobj);
            // response.end(filelistobj)
        }
    });


    router.add("GET", [/pollver/], function (request, response) {
        //console.log('pollver request recieved')
        //let clversion = request.headers['clversion'];
        // let waiter = {clversion:clversion, response:response};
        let waiter = {response: response};
        waiting.push(waiter);
        console.log('waiter adding to pool', waiting.length)
        //console.log(waiting.length);

        setTimeout(function () {
            let found = waiting.indexOf(waiter);
            if (found > -1) {
                console.log('>>>', 'one was removed by timeout', waiting.length)


                sendresponse("not updated pollingresponse", response, '203', "text/plain")
                waiting.splice(found, 1);
            }
        }, 90 * 1000);


        ////or
        //sendresponse("updated pollingresponse", response, '203', "text/plain")
    });
    router.add("GET", [/files/], async function (request, response) {
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
            if (error.code == "ENOENT") {
                sendresponse("Resource not found 404", response, '404', "text/plain")
                return
            }
        }
        if (isdir) {
            let filefront = await readFile('fileview.html');
            let filelistobj = await getfilelist(url);
            filelistobj = JSON.stringify(filelistobj);
            let respdata = filefront + `<script type="text/javascript">let filelist = ${filelistobj}</script>`;
            sendresponse(respdata, response, "200", "text/html")
            // response.end(filefront +`<script type="text/javascript">let filelist = ${filelistobj}</script>`)
        }
        if (!isdir) {
            let mimeType = await mime.getType(filepath);
            //response.setHeader("Content-Type", mimeType);
            let respdata = await readFile(filepath);
            sendresponse(respdata, response, 200, mimeType)
            //response.end()
        }
    });


    router.add("PUT", [/.*/], function (request, response) {
        return new Promise( function (res, rej){
            res('done')

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
            form.uploadDir = toFSpath(request.url);
            form.keepExtensions = true;
            form.on('file',  function (field, file) {
                rename(file.path, form.uploadDir + "/" + file.name);
                //upadating etag and initiating clients updates via folderchanged
            });
            form.on('end',  function () {
                console.log('>>>form.end, file uploaded');
                sendresponse('ok', response, "200");

            });
            form.parse(request);

})
    });
    function toFSpath(url) {
        let {pathname} = parse(url);
        let filepath = resolve(decodeURIComponent(pathname).slice(1));
        if (filepath != baseDirectory &&
            !filepath.startsWith(baseDirectory + sep)) {
            console.log('ahtung toFSpath restriction filepath', filepath);
            // throw {status: 403, body: "Forbidden"};
        }
        return filepath;
    }

//function that reads content of dir and returns object
    async function getfilelist(url) {
        let filepath = toFSpath(url);
        let filelist = await readdir(filepath);
        let filelistobj = {};
        filelistobj.headers = {};
        filelistobj.headers.fullname = 'Name';
        filelistobj.headers.fsize = 'Size';
        filelistobj.headers.mtime = 'Modified';
        //adding up shortcut
        let splitted = url.split(/(?=\/)/g);
        let uplink = '';
        if (splitted[0] == '/') {
            uplink = '/'
        }
        else if (splitted.length > 1) {
            splitted.pop();
            uplink = splitted.join('');
        }
        else {
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
    let server = http.createServer( function (request, response) {
        console.log('*****request execution started******', request.method,request.url)
        console.log('---------waiting before proc', waiting.length)
        console.log('new request retrieved', request.url, request.method);
        router.proc(request, response)

    });
    server.listen(3000)
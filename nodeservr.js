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


Router.prototype.add = function (method, urls, callbk) {
    for (let url of urls){
        let handler= {method:method, url:url, callbk:callbk};
        handler.validateurl= function(url) {
            console.log(url, 'vs', this.url,url.match(this.url));
            return url.match(this.url)};
        this.handlers.push(handler);
    }
};

//huge effect when proc is called syncroniously!
Router.prototype.proc =  function (request,response) {
    return new Promise((res,rej) => {

        let method = request.method;
        let url = request.url;
        let handlerfound=false;
        for(handler of this.handlers){
            if (handler.method == method && handler.validateurl(url) != null) {
                console.log('trying handler', handler)
                handler.callbk(request, response).then(()=>console.log("/////////",request.method));
                // handlerfound = true;
                res()
            }
        }
        rej('no appropriate handler found')
    })

};

let router = new Router();

function isRestURL(requestUrl) {
    let idfilter = /^\/restapi\//;
    let result =idfilter.exec(requestUrl);
    if(result && result != null){
        return result;}
    else return false
}

router.add("GET",[/^\/style/,/^\/js/,/^\/node_modules/,/^\/favicon\.ico/],  function (request,response) {
    return new Promise(resolve => {
        console.log('js handler started');
        let url = request.url;
        let filepath = toFSpath(url);
        let mimeType = mime.getType(filepath);
        response.setHeader("Content-Type", mimeType);
        ///!implement via sendresponse asyncr
        readFile(filepath).then(rfile => {
            response.end(rfile);
            //response.setHeader("Content-Type", mimeType);

        });
        resolve()
    })
});

function sendresponse(data, response, status, type) {
    return new Promise(function (resolve) {
        //console.log({"Content-Type": type || "text/plain", "etag":etag});
        console.log('sendresp', status);
        response.writeHead(status, {"Content-Type": type || "text/plain", "etag": etag});
        response.end(data);
        resolve()
        // })
    })

}
router.add("GET", [/^\/restapi\//],  function(request, response){
    return new Promise(async function (res) {
        console.log('get url', request.url, 'restapi');
        //let url = request.url;
        let url = request.url.replace(/\/restapi\//, '/');
        let filepath = toFSpath(url);
        // console.log('toFSpath',request.url,toFSpath(request.url))
        let stats;
        let isdir;
        try {
            console.log('calculating stats');
            stats = await stat(filepath);
            isdir = await stats.isDirectory();
            console.log('is dir', isdir)
        }
        catch (error) {
            console.log("satats error", error)
        }
        if (isdir) {
            console.log('calc  filelist');
            getfilelist(url).then(filelistobj =>
                sendresponse(JSON.stringify(filelistobj), response, "200"));
            // let filelistobj =  getfilelist(url);
            console.log('calc-ed filelist sent')

            // filelistobj = JSON.stringify(filelistobj);
            // response.end(filelistobj)
        }
        res("GET restapi handler finished")
    })

});


router.add("GET", [/^\/pollver/], function (request, response) {
   return new Promise(res => {
       console.log("POLLVER init");
       //console.log('pollver request recieved')
       //let clversion = request.headers['clversion'];
       // let waiter = {clversion:clversion, response:response};
       //let waiter = {response: response};
       waiting.push(response);
       console.log('waiter adding to pool', waiting.length);
       //console.log(waiting.length);

       setTimeout(function () {
           let found = waiting.indexOf(response);
           if (found > -1) {
               console.log('>>>', 'one will be removed by timeout', waiting.length);
               sendresponse("not updated pollingresponse", response, '203', "text/plain").then
               (()=> {
                   waiting.splice(found, 1);
                   console.log('>>>', 'one will be removed by timeout', waiting.length)
               })
           }
       }, 90 * 100);
       res("GET pollver handler finished")//response.end()
   })
});


router.add("GET", [/^\/files/], async function (request, response) {

    console.log('get url', request.url);
    let url = request.url;

    let filepath = toFSpath(url);
    // console.log('toFSpath',request.url,toFSpath(request.url))
    let stats;
    let isdir;

    try {
        stats =  await  stat(filepath);
        isdir =  await stats.isDirectory()
    } catch (error) {
        //console.log(error);
        if (error.code == "ENOENT") {
            sendresponse("Resource not found 404", response, '404', "text/plain")

        }
    }

    if (isdir) {
        let filefront = await readFile('fileview.html');
        let filelistobj = await getfilelist(url);
        filelistobj = JSON.stringify(filelistobj);
        let respdata = filefront + `<script type="text/javascript">let filelist = ${filelistobj}</script>`;
        await sendresponse(respdata, response, "200", "text/html")
        // response.end(filefront +`<script type="text/javascript">let filelist = ${filelistobj}</script>`)
    }
    if (!isdir) {
        let mimeType = await mime.getType(filepath);
        //response.setHeader("Content-Type", mimeType);
        let respdata = await readFile(filepath);
        await sendresponse(respdata, response, 200, mimeType)

    }
    //res("GET files handler finished")//response.end()
});

function waitingAsyncSend(){
    return new Promise(resolve=>{
        waiting.forEach(function (inwaitresp) {
            console.log('--->>>resolving!? inwaitresp');
            sendresponse('ok', inwaitresp, 201).then((res)=>{
                console.log('sendresponse resolved', res)

            });
        });
        resolve()

    })
}
router.add("PUT", [/.*/], async function (request, response) {

    //res('done')
    //console.log('PUT',request.url, toFSpath(request.url))
    //let wrstream= createWriteStream(join(toFSpath(request.url),'inpstream'));
    // wrstream.on("error", function (error) {
    //     response.end(500, error.toString())
    // });
    // wrstream.on("finish", function () {
    //     response.end('204')
    // });
    //request.pipe(wrstream)
   // ___________
    let form = new formidable.IncomingForm();
    form.uploadDir = toFSpath(request.url);
    form.keepExtensions = true;

    form.on('file', function (field, file) {
        console.log('file written before', file._writeStream.closed);

        console.log('file written after', file._writeStream.closed);
        rename(file.path, form.uploadDir + "/" + file.name);
        // sendresponse('ok', response, "201")

        console.log('PUT handler finished')

        //upadating etag and initiating clients updates via                                     folderchanged)

    });
    form.on('end',  function () {

        console.log('>>>form.end, all files uploaded', waiting.length);

        etag = etag + 1;
        // waiting.forEach(function (inwaitresp) {
        //     console.log('--->>>resolving!? inwaitresp');
        //     sendresponse('ok', inwaitresp, 201).then((res)=>{
        //         console.log('sendresponse resolved', res)
        //
        //     });
        // });
        waitingAsyncSend().then(()=>
       waiting=[])
    });
    form.parse(request);
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

// let teswaiting = [];
// let setTimeoutAsync = function (response) {
//     setTimeout(function () {
//         let found = teswaiting.indexOf(response);
//         if (found > -1) {
//             sendresponse("not updated pollingresponse removing", response, '203', "text/plain");
//             teswaiting.splice(found, 1);
//             console.log('>>>', 'one was removed by timeout', teswaiting.length)
//         }
//
//     }, 90 * 550);
//     return 0
// };
//
// function resptest(request,response) {
//         // setTimeout(function () {
//         //     response.end('eend')
//         // }, 9900)
//         teswaiting.push(response);
//         console.log('waiting len', teswaiting.length)
//         setTimeoutAsync(response)
//     }

// for (let han of router.handlers){
//     console.log(han.validateurl.toString())
// }

let server = http.createServer(function (request, response){

    router.proc(request, response)
    // console.log('*****request execution started******', request.method,request.url);
    // console.log('---------waiting before proc', waiting.length);
    // console.log('new request retrieved', request.url, request.method);
    // //router.proc(request, response)
    // if ('/files/foldr2/' == request.url){
    //     resptest(request, response);
    // }
    // else {
    //     response.end('fast end')
    // }
    //
    // console.log('===server loop end===');

});
server.listen(3000);